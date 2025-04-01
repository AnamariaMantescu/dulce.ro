// store/modules/categories.js
import { db } from '@/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

export default {
  namespaced: true,
  state: {
    categories: [],
    specialDayCategories: [],
    loading: false,
    error: null
  },
  mutations: {
    SET_CATEGORIES(state, categories) {
      state.categories = categories;
    },
    SET_SPECIAL_DAY_CATEGORIES(state, categories) {
      state.specialDayCategories = categories;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  actions: {
    async fetchCategories({ commit, dispatch }) {
      commit('SET_LOADING', true);
      try {
        console.log('Fetching categories...');
        
        // First, try to get categories from the categories collection
        const categoriesRef = collection(db, 'categories');
        const querySnapshot = await getDocs(categoriesRef);
        
        if (!querySnapshot.empty) {
          console.log('Found categories in database');
          const allCategories = [];
          const specialDayCategories = [];
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const category = {
              id: doc.id,
              name: data.name,
              description: data.description || '',
              image: data.image || data.imageUrl, // Try different possible field names
              slug: data.slug || doc.id.toLowerCase(),
              order: data.order || 0,
              active: data.active !== undefined ? data.active : true,
              visible: data.visible !== undefined ? data.visible : true,
              link: data.link || null
            };
            
            allCategories.push(category);
            
            // If it's a special day category, add it to the special categories array
            if (doc.id.includes('ziua-') || data.isSpecialDay) {
              specialDayCategories.push(category);
            }
          });
          
          // Sort categories manually
          allCategories.sort((a, b) => (a.order || 0) - (b.order || 0));
          
          console.log(`Loaded ${allCategories.length} categories`);
          console.log(`Loaded ${specialDayCategories.length} special day categories`);
          
          commit('SET_CATEGORIES', allCategories);
          commit('SET_SPECIAL_DAY_CATEGORIES', specialDayCategories);
        } else {
          console.log('No categories found, trying to extract from products');
          
          // Let's try to extract categories from products collection
          await dispatch('extractCategoriesFromProducts');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        commit('SET_ERROR', error.message);
        
        // In case of error, set empty arrays
        commit('SET_CATEGORIES', []);
        commit('SET_SPECIAL_DAY_CATEGORIES', []);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async extractCategoriesFromProducts({ commit }) {
      try {
        // Try to extract categories from products collection
        const productsRef = collection(db, 'products');
        const productsSnapshot = await getDocs(productsRef);
        
        if (!productsSnapshot.empty) {
          console.log('Extracting categories from products');
          const categoryMap = new Map();
          
          productsSnapshot.forEach((doc) => {
            const product = doc.data();
            if (product.category) {
              const categoryId = product.category;
              
              if (!categoryMap.has(categoryId)) {
                categoryMap.set(categoryId, {
                  id: categoryId,
                  name: product.category.charAt(0).toUpperCase() + product.category.slice(1), // Capitalize first letter
                  slug: categoryId.toLowerCase(),
                  description: '', // No description available
                  image: product.image || '', // Use first product's image as category image
                  order: categoryMap.size, // Order by insertion order
                  active: true,
                  visible: true
                });
              }
            }
          });
          
          const categories = Array.from(categoryMap.values());
          console.log(`Created ${categories.length} categories from products`);
          commit('SET_CATEGORIES', categories);
        } else {
          console.log('No products found to extract categories');
          commit('SET_CATEGORIES', []);
          commit('SET_SPECIAL_DAY_CATEGORIES', []);
        }
      } catch (error) {
        console.error('Error extracting categories from products:', error);
        commit('SET_CATEGORIES', []);
        commit('SET_SPECIAL_DAY_CATEGORIES', []);
      }
    },
    
    async fetchSpecialDayCategory({ commit, state }, specialDayId = 'ziua-prajiturii') {
      try {
        const specialCategoryRef = doc(db, 'categories', specialDayId);
        const docSnap = await getDoc(specialCategoryRef);
        
        if (docSnap.exists()) {
          const specialCategory = {
            id: docSnap.id,
            ...docSnap.data()
          };
          
          // Update the special day categories list
          const updatedSpecialDays = [...state.specialDayCategories];
          const existingIndex = updatedSpecialDays.findIndex(c => c.id === specialDayId);
          
          if (existingIndex >= 0) {
            updatedSpecialDays[existingIndex] = specialCategory;
          } else {
            updatedSpecialDays.push(specialCategory);
          }
          
          commit('SET_SPECIAL_DAY_CATEGORIES', updatedSpecialDays);
          return specialCategory;
        } else {
          console.log(`Special day category ${specialDayId} not found`);
          return null;
        }
      } catch (error) {
        console.error(`Error fetching special day category ${specialDayId}:`, error);
        return null;
      }
    }
  },
  getters: {
    getAllCategories: state => state.categories,
    getVisibleCategories: state => {
      return state.categories.filter(category => 
        category.visible !== false && category.active !== false
      );
    },
    getSpecialDayCategories: state => state.specialDayCategories,
    getCategoryBySlug: state => slug => {
      return state.categories.find(category => category.slug === slug);
    },
    getCategoryById: state => id => {
      return state.categories.find(category => category.id === id);
    },
    isLoading: state => state.loading,
    getError: state => state.error
  }
}