// store/modules/products.js
import { db } from '@/firebase';
import { collection, getDocs, query, where, doc, getDoc, orderBy, limit } from 'firebase/firestore';

export default {
  namespaced: true,
  state: {
    products: [],
    featuredProducts: [],
    productsByCategory: {},
    currentProduct: null,
    loading: false,
    error: null
  },
  mutations: {
    SET_PRODUCTS(state, products) {
      state.products = products;
    },
    SET_FEATURED_PRODUCTS(state, products) {
      state.featuredProducts = products;
    },
    SET_PRODUCTS_BY_CATEGORY(state, { categoryId, products }) {
      state.productsByCategory = {
        ...state.productsByCategory,
        [categoryId]: products
      };
    },
    SET_CURRENT_PRODUCT(state, product) {
      state.currentProduct = product;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  actions: {
    async fetchProducts({ commit }) {
      commit('SET_LOADING', true);
      try {
        const productsRef = collection(db, 'products');
        const querySnapshot = await getDocs(productsRef);
        
        const products = [];
        querySnapshot.forEach((doc) => {
          products.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        commit('SET_PRODUCTS', products);
        console.log(`Încărcate ${products.length} produse`);
      } catch (error) {
        console.error('Eroare la încărcarea produselor:', error);
        commit('SET_ERROR', error.message);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchFeatured({ commit }) {
      commit('SET_LOADING', true);
      try {
        // Încercăm să obținem produsele marcate ca featured
        const productsRef = collection(db, 'products');
        let featuredQuery = query(
          productsRef,
          where("featured", "==", true),
          limit(6)
        );
        
        let querySnapshot = await getDocs(featuredQuery);
        
        // Dacă nu găsim produse cu featured=true, încărcăm primele 6 produse
        if (querySnapshot.empty) {
          console.log('Nu s-au găsit produse featured, încărcăm primele produse disponibile.');
          featuredQuery = query(
            productsRef,
            orderBy("name"),
            limit(6)
          );
          querySnapshot = await getDocs(featuredQuery);
        }
        
        const featuredProducts = [];
        querySnapshot.forEach((doc) => {
          featuredProducts.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        commit('SET_FEATURED_PRODUCTS', featuredProducts);
        console.log(`Încărcate ${featuredProducts.length} produse recomandate`);
      } catch (error) {
        console.error('Eroare la încărcarea produselor recomandate:', error);
        commit('SET_ERROR', error.message);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
// Adaugă această metodă în acțiunile store-ului de produse (products.js)

async fetchProductsByCategory({ commit, state }, categoryName) {
  if (!categoryName) {
    console.error('Nume de categorie invalid');
    return [];
  }
  
  // Verificăm dacă avem deja produse cu această categorie în store
  if (state.products.length > 0) {
    const existingCategoryProducts = state.products.filter(p => 
      p.category === categoryName
    );
    
    if (existingCategoryProducts.length > 0) {
      console.log(`Am găsit ${existingCategoryProducts.length} produse cu categoria '${categoryName}' în cache`);
      return existingCategoryProducts;
    }
  }
  
  commit('SET_LOADING', true);
  try {
    console.log(`Încărcăm produse cu categoria: ${categoryName}`);
    
    // Query Firestore direct pentru produse cu această categorie
    const productsRef = collection(db, 'products');
    const q = query(
      productsRef,
      where('category', '==', categoryName)
    );
    
    const querySnapshot = await getDocs(q);
    
    const categoryProducts = [];
    querySnapshot.forEach((doc) => {
      const productData = doc.data();
      categoryProducts.push({
        id: productData.productId || doc.id,  // Folosim productId dacă există
        docId: doc.id,                       // Păstrăm și id-ul documentului
        ...productData
      });
    });
    
    console.log(`Am încărcat ${categoryProducts.length} produse cu categoria '${categoryName}' din Firestore`);
    
    // Actualizăm store-ul cu produsele noi găsite
    if (categoryProducts.length > 0) {
      // Adăugăm doar produse unice în state
      const newProductsSet = new Set([...state.products.map(p => p.id)]);
      const productsToAdd = [];
      
      categoryProducts.forEach(product => {
        if (!newProductsSet.has(product.id)) {
          productsToAdd.push(product);
          newProductsSet.add(product.id);
        }
      });
      
      if (productsToAdd.length > 0) {
        commit('SET_PRODUCTS', [...state.products, ...productsToAdd]);
        console.log(`Am adăugat ${productsToAdd.length} produse noi în store`);
      }
    }
    
    return categoryProducts;
  } catch (error) {
    console.error(`Eroare la încărcarea produselor cu categoria ${categoryName}:`, error);
    commit('SET_ERROR', error.message);
    return [];
  } finally {
    commit('SET_LOADING', false);
  }
},
    
// Updated fetchProductById method for products.js
// Versiune îmbunătățită a metodei fetchProductById pentru products.js
async fetchProductById({ commit }, productId) {
  // Verificăm dacă ID-ul produsului este valid
  if (!productId) {
    console.error('ID produs invalid sau lipsă');
    commit('SET_ERROR', 'ID produs lipsă sau invalid');
    commit('SET_CURRENT_PRODUCT', null);
    return null;
  }
  
  // Verificăm cazul special pentru placeholder
  if (productId === 'unknown') {
    console.log('ID produs "unknown" detectat - se returnează un produs placeholder');
    // Returnăm un obiect placeholder fără a face cerere către Firestore
    const placeholderProduct = {
      id: 'unknown',
      name: 'Produs necunoscut',
      price: 0,
      description: 'Produs generic pentru recenzie',
      isPlaceholder: true
    };
    
    // Nu actualizăm starea, returnăm doar obiectul placeholder
    return placeholderProduct;
  }
  
  // Pentru ID-uri normale, continuăm cu logica existentă
  commit('SET_LOADING', true);
  try {
    const productRef = doc(db, 'products', productId);
    const docSnap = await getDoc(productRef);
    
    if (docSnap.exists()) {
      const product = {
        id: docSnap.id,
        ...docSnap.data()
      };
      
      commit('SET_CURRENT_PRODUCT', product);
      console.log(`Produs încărcat: ${product.name}`);
      return product;
    } else {
      console.log(`Produsul cu ID-ul ${productId} nu există`);
      commit('SET_CURRENT_PRODUCT', null);
      commit('SET_ERROR', 'Produsul nu a fost găsit');
      return null;
    }
  } catch (error) {
    console.error(`Eroare la încărcarea produsului ${productId}:`, error);
    commit('SET_ERROR', error.message);
    commit('SET_CURRENT_PRODUCT', null);
    return null;
  } finally {
    commit('SET_LOADING', false);
  }
},
    
    async searchProducts({ commit }, searchTerm) {
      if (!searchTerm || searchTerm.trim() === '') {
        return [];
      }
      
      commit('SET_LOADING', true);
      try {
        // Pentru căutare eficientă, folosim query-uri separate pentru diferite
        // câmpuri de căutare și apoi combinăm rezultatele
        const searchFields = ['name', 'description', 'tags'];
        const productsRef = collection(db, 'products');
        
        // Firebase nu permite căutare fuzzy sau LIKE, așa că vom încărca toate
        // produsele și vom face filtrarea pe client
        const querySnapshot = await getDocs(productsRef);
        
        const results = [];
        const searchTermLower = searchTerm.toLowerCase();
        
        querySnapshot.forEach((doc) => {
          const product = {
            id: doc.id,
            ...doc.data()
          };
          
          // Verificăm numele și descrierea
          if (product.name.toLowerCase().includes(searchTermLower) || 
              (product.description && product.description.toLowerCase().includes(searchTermLower))) {
            results.push(product);
            return;
          }
          
          // Verificăm tag-urile
          if (product.tags && Array.isArray(product.tags)) {
            for (const tag of product.tags) {
              if (tag.toLowerCase().includes(searchTermLower)) {
                results.push(product);
                return;
              }
            }
          }
          
          // Verificăm ingredientele
          if (product.ingredients && Array.isArray(product.ingredients)) {
            for (const ingredient of product.ingredients) {
              if (ingredient.toLowerCase().includes(searchTermLower)) {
                results.push(product);
                return;
              }
            }
          }
        });
        
        console.log(`S-au găsit ${results.length} rezultate pentru termenul "${searchTerm}"`);
        return results;
      } catch (error) {
        console.error(`Eroare la căutarea produselor pentru "${searchTerm}":`, error);
        commit('SET_ERROR', error.message);
        return [];
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    clearCurrentProduct({ commit }) {
      commit('SET_CURRENT_PRODUCT', null);
    },
// Modificări pentru store/modules/products.js
// Adaugă sau modifică această metodă fetchByIds în acțiunile store-ului de produse

async fetchByIds({ commit, state }, productIds) {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    console.error('Liste de ID-uri goală sau invalidă');
    return [];
  }
  
  commit('SET_LOADING', true);
  try {
    console.log('Încercăm să încărcăm produse după ID-uri:', productIds);
    
    // First check if all products are already in the store
    const existingProducts = state.products.filter(p => productIds.includes(p.id));
    if (existingProducts.length === productIds.length) {
      console.log('Toate produsele sunt deja în store, le folosim direct');
      return existingProducts;
    }
    
    // For missing products, fetch them from Firestore
    const missingIds = productIds.filter(id => 
      !state.products.some(p => p.id === id)
    );
    
    let fetchedProducts = [...existingProducts]; // Start with what we have
    
    // Now fetch missing products, handling Firestore 10 item limit
    const batches = [];
    for (let i = 0; i < missingIds.length; i += 10) {
      batches.push(missingIds.slice(i, i + 10));
    }
    
    for (const batch of batches) {
      if (batch.length === 0) continue;
      
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('__name__', 'in', batch));
      
      const querySnapshot = await getDocs(q);
      const batchResults = [];
      
      querySnapshot.forEach((doc) => {
        batchResults.push({ id: doc.id, ...doc.data() });
      });
      
      fetchedProducts = [...fetchedProducts, ...batchResults];
    }
    
    // Update store with new products
    if (fetchedProducts.length > 0) {
      const newProducts = [...state.products];
      fetchedProducts.forEach(fp => {
        if (!newProducts.some(p => p.id === fp.id)) {
          newProducts.push(fp);
        }
      });
      commit('SET_PRODUCTS', newProducts);
    }
    
    return fetchedProducts;
  } catch (error) {
    console.error('Eroare la încărcarea produselor după ID-uri:', error);
    commit('SET_ERROR', error.message);
    return [];
  } finally {
    commit('SET_LOADING', false);
  }
},
// Add this to your products.js store module actions

async fetchProductsByPrefix({ commit, state }, prefix) {
  if (!prefix) {
    console.error('Prefix invalid');
    return [];
  }
  
  commit('SET_LOADING', true);
  try {
    console.log(`Încărcăm produse cu prefixul: ${prefix}`);
    
    // First check if we have products already in the store
    if (state.products.length > 0) {
      // Filter existing products by prefix
      const existingPrefixProducts = state.products.filter(p => 
        p.id && p.id.startsWith(prefix + '-')
      );
      
      // If we found some, we might still need to check if there are more in Firestore
      if (existingPrefixProducts.length > 0) {
        console.log(`Am găsit ${existingPrefixProducts.length} produse cu prefixul ${prefix} în cache`);
      }
    }
    
    // Query Firestore directly for products with this prefix
    // Using startAt and endAt for prefix search
    const productsRef = collection(db, 'products');
    
    // We need to use startAt and endAt with the prefix
    // This gives us documents where the ID starts with the prefix
    // and ends with anything up to the prefix + 'z' (covers all possibilities)
    const q = query(
      productsRef,
      where('__name__', '>=', prefix + '-'),
      where('__name__', '<=', prefix + '-\uf8ff')
    );
    
    const querySnapshot = await getDocs(q);
    
    const prefixProducts = [];
    querySnapshot.forEach((doc) => {
      prefixProducts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Am încărcat ${prefixProducts.length} produse cu prefixul ${prefix} din Firestore`);
    
    // Update store with new products
    if (prefixProducts.length > 0) {
      // Add only unique products to state
      const newProductsSet = new Set([...state.products.map(p => p.id)]);
      const productsToAdd = [];
      
      prefixProducts.forEach(product => {
        if (!newProductsSet.has(product.id)) {
          productsToAdd.push(product);
          newProductsSet.add(product.id);
        }
      });
      
      if (productsToAdd.length > 0) {
        commit('SET_PRODUCTS', [...state.products, ...productsToAdd]);
        console.log(`Am adăugat ${productsToAdd.length} produse noi în store`);
      }
    }
    
    return prefixProducts;
  } catch (error) {
    console.error(`Eroare la încărcarea produselor cu prefixul ${prefix}:`, error);
    commit('SET_ERROR', error.message);
    return [];
  } finally {
    commit('SET_LOADING', false);
  }
}
  },
  getters: {
    getAllProducts: state => state.products,
    getFeaturedProducts: state => state.featuredProducts,
    getCurrentProduct: state => state.currentProduct,
    getProductsByCategory: state => categoryId => {
      return state.productsByCategory[categoryId] || [];
    },
    getProductById: state => productId => {
      return state.products.find(product => product.id === productId);
    },
    isProductLoading: state => state.loading,
    getProductError: state => state.error,
    getProductsByIds: (state) => (idsArray) => {
      if (!idsArray || !idsArray.length) return [];
      return state.products.filter(p => idsArray.includes(p.id));
    }
  }
};