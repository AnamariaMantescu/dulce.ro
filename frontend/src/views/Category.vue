<template>
  <div class="category-page">
    <div v-if="loading" class="loading">
      <div class="loader-spinner"></div>
      <p>Se încarcă...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>
    
    <div v-else class="category-content">
      <!-- Headerul categoriei -->
      <div class="category-header">
        <h1>{{ isAllProducts ? 'Toate produsele' : category?.name }}</h1>
        <p v-if="category?.description">{{ category.description }}</p>
      </div>
      
      <!-- Bara de căutare -->
      <div class="search-bar-container">
        <SearchBar 
          :maxResults="5" 
          @search="handleSearchQuery" 
          ref="searchBar"
        />
      </div>
      
      <!-- Secțiunea de filtre -->
      <div class="filter-section" v-if="products.length > 0">
        <h2 class="filter-title">Filtrează produsele</h2>
        
        <div class="filter-container">
          <!-- Filtru categorie (doar pentru pagina "Toate produsele") -->
          <div class="filter-group" v-if="isAllProducts && categories.length > 0">
            <label for="category">Categorie</label>
            <select id="category" v-model="selectedCategory" @change="applyFilters">
              <option value="">Toate categoriile</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          
          <!-- Filtru subcategorie -->
          <div class="filter-group" v-if="subcategories.length > 0">
            <label for="subcategory">Subcategorie</label>
            <select id="subcategory" v-model="selectedSubcategory" @change="applyFilters">
              <option value="">Toate subcategoriile</option>
              <option v-for="subcategory in subcategories" :key="subcategory" :value="subcategory">
                {{ capitalizeFirstLetter(subcategory) }}
              </option>
            </select>
          </div>
          
          <!-- Filtru alergeni -->
          <div class="filter-group" v-if="showAllergensFilter">
            <label for="allergen">Alergeni</label>
            <select id="allergen" v-model="allergenFilter" @change="applyFilters">
              <option value="">Toate produsele</option>
              <option value="fara_gluten">Fără gluten</option>
              <option value="fara_lactoza">Fără lactoză</option>
              <option value="fara_oua">Fără ouă</option>
            </select>
          </div>
          
          <!-- Filtru sortare -->
          <div class="filter-group">
            <label for="sort">Sortare</label>
            <select id="sort" v-model="sortOption" @change="applyFilters">
              <option value="name_asc">Nume (A-Z)</option>
              <option value="name_desc">Nume (Z-A)</option>
              <option value="price_asc">Preț (Crescător)</option>
              <option value="price_desc">Preț (Descrescător)</option>
              <option value="newest">Cele mai noi</option>
            </select>
          </div>
        </div>
        
        <!-- Filtrul de tag-uri -->
        <div class="filter-group tags-filter" v-if="tags.length > 0">
          <div class="tags-header">
            <label>Cuvinte cheie</label>
          </div>
          <div class="tags-search" v-if="showAllTags">
            <input
              type="text"
              v-model="tagSearchQuery"
              placeholder="Caută cuvinte cheie..."
              class="tag-search-input"
            />
          </div>
          <div class="tags-container" :class="{ 'expanded': showAllTags }">
            <template v-if="!showAllTags">
              <button 
                v-for="tag in popularTags" 
                :key="tag"
                :class="['tag-button', selectedTags.includes(tag) ? 'active' : '']"
                @click="toggleTag(tag)"
              >
                <span class="tag-name">{{ capitalizeFirstLetter(tag) }}</span>
                <span v-if="selectedTags.includes(tag)" class="tag-remove">×</span>
              </button>
            </template>
            <template v-else>
              <button 
                v-for="tag in filteredTags" 
                :key="tag"
                :class="['tag-button', selectedTags.includes(tag) ? 'active' : '']"
                @click="toggleTag(tag)"
              >
                <span class="tag-name">{{ capitalizeFirstLetter(tag) }}</span>
                <span v-if="selectedTags.includes(tag)" class="tag-remove">×</span>
              </button>
            </template>
          </div>
          <div v-if="selectedTags.length > 0" class="selected-tags-summary">
            <span>Filtre active: {{ selectedTags.length }}</span>
            <button class="clear-tags-button" @click="clearTags">
              Șterge toate
            </button>
          </div>
        </div>
        <button class="toggle-tags-button" @click="showAllTags = !showAllTags" v-if="tags.length > 0">
          {{ showAllTags ? 'Arată mai puține' : 'Arată toate (' + tags.length + ')' }}
        </button>
        
        <div class="reset-filters-container" v-if="isFilterActive">
          <button class="reset-all-filters-button" @click="resetFilters">
            <i class="fas fa-times-circle"></i>
            Resetează toate filtrele
          </button>
        </div>
      </div>
      
      <!-- Indicatorul de căutare activă -->
      <div class="search-active-indicator" v-if="searchQuery">
        <span class="search-query-text">Rezultate pentru: "{{ searchQuery }}"</span>
        <button class="clear-search-button" @click="clearSearch">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <!-- Contorul de produse -->
      <div class="products-counter" v-if="filteredProducts.length > 0">
        <span class="counter-text">
          {{ filteredProducts.length }} {{ filteredProducts.length === 1 ? 'produs' : 'produse' }}
          <span v-if="isFilterActive || searchQuery" class="counter-filter-info">
            (filtrare aplicată)
          </span>
        </span>
      </div>
      
      <!-- Dacă avem produse, afișăm grila și, eventual, butonul "Încarcă mai multe" -->
      <div v-if="filteredProducts.length > 0">
        <div class="products-grid">
          <div v-for="product in visibleProducts" :key="product.id" class="product-card">
            <!-- Codul pentru produs -->
            <router-link :to="'/products/' + product.id" class="product-link">
              <div class="product-image-container">
                <img :src="product.image" :alt="product.name" class="product-image">
                <div class="product-badges" v-if="product.badges && product.badges.length">
                  <span 
                    v-for="badge in product.badges" 
                    :key="badge" 
                    :class="['product-badge', 'badge-' + badge.toLowerCase().replace(' ', '-')]">
                    {{ badge }}
                  </span>
                </div>
              </div>
            </router-link>
            <div class="product-content">
              <router-link :to="'/products/' + product.id" class="product-name-link">
                <h3 class="product-name">{{ product.name }}</h3>
              </router-link>
              <div class="product-info-icons">
                <span v-if="!hasAllergen(product, 'gluten')" class="info-icon" title="Fără gluten">
                  <i class="fas fa-wheat-alt fa-slash"></i>
                </span>
                <span v-if="!hasAllergen(product, 'lactoza')" class="info-icon" title="Fără lactoză">
                  <i class="fas fa-cheese fa-slash"></i>
                </span>
                <span v-if="product.tags && product.tags.includes('vegan')" class="info-icon" title="Vegan">
                  <i class="fas fa-leaf"></i>
                </span>
              </div>
              <div class="product-footer">
                <div class="product-price">{{ product.price }}</div>
                <button class="add-to-cart-button" @click.prevent="addToCart(product)">
                  <i class="fas fa-shopping-cart"></i>
                  <span>Adaugă</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Butonul "Încarcă mai multe" se afișează doar dacă există produse suplimentare -->
        <div v-if="filteredProducts.length > displayCount" class="load-more-container">
          <button class="load-more-button" @click="loadMore">
            Încarcă mai multe
          </button>
        </div>
      </div>
        
      <!-- Mesajul când nu sunt produse -->
      <div v-else class="no-products">
        <p>Nu am găsit produse care să corespundă criteriilor selectate.</p>
        <button class="reset-filters-button" @click="resetAllFiltersAndSearch">
          Resetează toate filtrele
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { mapActions, mapState } from 'vuex';
import SearchBar from '@/components/layout/SearchBar.vue';

export default {
  name: 'Category',
  components: { SearchBar },
  data() {
    return {
      category: null,
      allProducts: [],
      filteredProducts: [],
      loading: true,
      error: null,
      // Filtre
      sortOption: 'name_asc',
      selectedCategory: '',
      selectedSubcategory: '',
      allergenFilter: '',
      selectedTags: [],
      tags: [],
      subcategories: [],
      showAllTags: false,
      tagSearchQuery: '',
      // Stochează toate categoriile (pentru pagina "Toate produsele")
      categories: [],
      // Pentru căutare
      searchQuery: '',
      // Numarul de produse afișate la început (se va incrementa la click)
      displayCount: 9
    }
  },
  computed: {
    slug() {
      return this.$route.params.slug;
    },
    isAllProducts() {
      return this.$route.path === '/produse';
    },
    products() {
      return this.allProducts;
    },
    showAllergensFilter() {
      return this.allProducts.some(product => 
        product.allergens && product.allergens.length > 0
      );
    },
    sortedTags() {
      return [...this.tags].sort((a, b) => 
        this.capitalizeFirstLetter(a).localeCompare(this.capitalizeFirstLetter(b))
      );
    },
    isFilterActive() {
      return this.selectedCategory !== '' || 
             this.selectedSubcategory !== '' || 
             this.allergenFilter !== '' || 
             this.selectedTags.length > 0 ||
             this.sortOption !== 'name_asc';
    },
    popularTags() {
      return this.sortedTags.slice(0, 6);
    },
    filteredTags() {
      if (!this.tagSearchQuery) return this.sortedTags;
      const query = this.tagSearchQuery.toLowerCase();
      return this.sortedTags.filter(tag => 
        this.capitalizeFirstLetter(tag).toLowerCase().includes(query)
      );
    },
    // Returnează produsele ce vor fi afișate pe baza valorii displayCount
    visibleProducts() {
      return this.filteredProducts.slice(0, this.displayCount);
    }
  },
  created() {
    this.initialize();
  },
  mounted() {
    if (this.$route.query.search) {
      this.searchQuery = this.$route.query.search;
      if (this.$refs.searchBar) {
        this.$refs.searchBar.searchQuery = this.searchQuery;
      }
    }
  },
  watch: {
    '$route.path'() {
      this.initialize();
    },
    slug() {
      this.initialize();
    },
    '$route.query.search'(newValue) {
      if (newValue) {
        this.searchQuery = newValue;
        this.applySearchFilter();
      } else {
        this.searchQuery = '';
        this.applyFilters();
      }
    }
  },
  methods: {
    ...mapActions('notifications', ['add']),
    ...mapActions('cart', ['addToCart']),
    ...mapState('categories', ['categories']),
    
    async initialize() {
      this.loading = true;
      this.error = null;
      try {
        await this.fetchCategories();
        if (this.isAllProducts) {
          this.category = null;
          await this.fetchAllProducts();
        } else {
          await this.fetchCategory();
        }
        if (this.searchQuery) {
          this.applySearchFilter();
        } else {
          this.applyFilters();
        }
      } catch (error) {
        console.error('Eroare la inițializare:', error);
        this.error = 'A apărut o eroare la încărcarea datelor';
      } finally {
        this.loading = false;
      }
    },
    
    async fetchCategories() {
      try {
        const categoriesRef = collection(db, 'categories');
        const categoriesSnapshot = await getDocs(categoriesRef);
        const categoriesList = [];
        categoriesSnapshot.forEach(doc => {
          categoriesList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        this.categories = categoriesList;
      } catch (error) {
        console.error('Eroare la încărcarea categoriilor:', error);
      }
    },
    
    async fetchCategory() {
      try {
        const categoryId = this.slug;
        const categoryDocRef = doc(db, 'categories', categoryId);
        const categorySnapshot = await getDoc(categoryDocRef);
        if (categorySnapshot.exists()) {
          const categoryData = categorySnapshot.data();
          this.category = { id: categorySnapshot.id, ...categoryData };
          await this.fetchCategoryProducts(categorySnapshot.id);
        } else {
          console.error(`Nu s-a găsit nicio categorie cu ID-ul "${categoryId}"`);
          this.error = 'Categoria nu a fost găsită';
        }
      } catch (err) {
        console.error('Eroare la încărcarea categoriei:', err);
        this.error = 'A apărut o eroare la încărcarea categoriei';
      }
    },
    
   // Modificarea în metoda fetchCategoryProducts
async fetchCategoryProducts(categoryId) {
  try {
    const productsRef = collection(db, 'products');
    let q = query(
      productsRef, 
      where("category", "==", categoryId)
    );
    const querySnapshot = await getDocs(q);
    const products = [];
    const tagsSet = new Set();
    const subcategoriesSet = new Set();
    querySnapshot.forEach((doc) => {
      const productData = doc.data();
      // Aici este modificarea principală - folosim productId din date dacă există, 
      // altfel folosim doc.id ca fallback
      const product = { 
        id: productData.productId || doc.id, // Folosim productId dacă există
        docId: doc.id, // Păstrăm și id-ul documentului pentru referințe interne
        ...productData 
      };
      products.push(product);
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach(tag => tagsSet.add(tag));
      }
      if (product.subcategory) {
        subcategoriesSet.add(product.subcategory);
      }
    });
    products.sort((a, b) => a.name.localeCompare(b.name));
    this.allProducts = products;
    this.filteredProducts = [...products];
    this.tags = Array.from(tagsSet);
    this.subcategories = Array.from(subcategoriesSet);
  } catch (error) {
    console.error('Eroare la încărcarea produselor:', error);
    this.error = 'A apărut o eroare la încărcarea produselor';
  }
},

// Modificare similară pentru fetchAllProducts
async fetchAllProducts() {
  try {
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);
    const products = [];
    const tagsSet = new Set();
    const subcategoriesSet = new Set();
    productsSnapshot.forEach((doc) => {
      const productData = doc.data();
      const product = { 
        id: productData.productId || doc.id, // Folosim productId dacă există
        docId: doc.id, // Păstrăm și id-ul documentului pentru referințe interne
        ...productData 
      };
      products.push(product);
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach(tag => tagsSet.add(tag));
      }
      if (product.subcategory) {
        subcategoriesSet.add(product.subcategory);
      }
    });
    products.sort((a, b) => a.name.localeCompare(b.name));
    this.allProducts = products;
    this.filteredProducts = [...products];
    this.tags = Array.from(tagsSet);
    this.subcategories = Array.from(subcategoriesSet);
  } catch (error) {
    console.error('Eroare la încărcarea produselor:', error);
    this.error = 'A apărut o eroare la încărcarea produselor';
  }
},
    
    handleSearchQuery(query) {
      this.searchQuery = query;
      if (query) {
        this.$router.push({
          query: { ...this.$route.query, search: query }
        });
        this.applySearchFilter();
      } else {
        const newQuery = { ...this.$route.query };
        delete newQuery.search;
        this.$router.push({ query: newQuery });
        this.applyFilters();
      }
    },
    
    applySearchFilter() {
      if (!this.searchQuery.trim()) {
        this.applyFilters();
        return;
      }
      const searchTerms = this.searchQuery.trim().toLowerCase().split(/\s+/);
      const normalizedSearchTerms = searchTerms.map(term => this.removeDiacritics(term));
      let filtered = this.allProducts.filter(product => {
        const normalizedName = this.removeDiacritics(product.name.toLowerCase());
        const normalizedDescription = product.description ? this.removeDiacritics(product.description.toLowerCase()) : '';
        const normalizedTags = product.tags ? product.tags.map(tag => this.removeDiacritics(tag.toLowerCase())) : [];
        const normalizedIngredients = product.ingredients ? product.ingredients.map(ingredient => this.removeDiacritics(ingredient.toLowerCase())) : [];
        const normalizedSubcategory = product.subcategory ? this.removeDiacritics(product.subcategory.toLowerCase()) : '';
        const nameMatch = normalizedSearchTerms.some(term => normalizedName.includes(term));
        const descMatch = normalizedSearchTerms.some(term => normalizedDescription.includes(term));
        const tagMatch = normalizedTags.length > 0 && normalizedTags.some(tag => normalizedSearchTerms.some(term => tag.includes(term)));
        const ingredientMatch = normalizedIngredients.length > 0 && normalizedIngredients.some(ingredient => normalizedSearchTerms.some(term => ingredient.includes(term)));
        const subcategoryMatch = normalizedSubcategory && normalizedSearchTerms.some(term => normalizedSubcategory.includes(term));
        return nameMatch || descMatch || tagMatch || ingredientMatch || subcategoryMatch;
      });
      filtered = this.applyNormalFilters(filtered);
      filtered.sort((a, b) => {
        const normalizedQuery = this.removeDiacritics(this.searchQuery.toLowerCase());
        const aNormalizedName = this.removeDiacritics(a.name.toLowerCase());
        const bNormalizedName = this.removeDiacritics(b.name.toLowerCase());
        const aNameExactMatch = aNormalizedName.includes(normalizedQuery);
        const bNameExactMatch = bNormalizedName.includes(normalizedQuery);
        if (aNameExactMatch && !bNameExactMatch) return -1;
        if (!aNameExactMatch && bNameExactMatch) return 1;
        const aNameMatch = normalizedSearchTerms.some(term => aNormalizedName.includes(term));
        const bNameMatch = normalizedSearchTerms.some(term => bNormalizedName.includes(term));
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        return a.name.localeCompare(b.name);
      });
      this.filteredProducts = filtered;
    },
    
    applyNormalFilters(products) {
      let filtered = [...products];
      if (this.isAllProducts && this.selectedCategory) {
        filtered = filtered.filter(product => product.category === this.selectedCategory);
      }
      if (this.selectedSubcategory) {
        filtered = filtered.filter(product => product.subcategory === this.selectedSubcategory);
      }
      if (this.allergenFilter) {
        if (this.allergenFilter === 'fara_gluten') {
          filtered = filtered.filter(product => !this.hasAllergen(product, 'gluten'));
        } else if (this.allergenFilter === 'fara_lactoza') {
          filtered = filtered.filter(product => !this.hasAllergen(product, 'lapte'));
        } else if (this.allergenFilter === 'fara_oua') {
          filtered = filtered.filter(product => !this.hasAllergen(product, 'ouă'));
        }
      }
      if (this.selectedTags.length > 0) {
        filtered = filtered.filter(product => this.selectedTags.every(tag => product.tags && product.tags.includes(tag)));
      }
      return filtered;
    },
    
    applyFilters() {
      let filtered = this.applyNormalFilters(this.allProducts);
      switch (this.sortOption) {
        case 'name_asc':
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          filtered.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'price_asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          filtered.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
            return dateB - dateA;
          });
          break;
      }
      this.filteredProducts = filtered;
    },
    
    clearSearch() {
      this.searchQuery = '';
      if (this.$refs.searchBar) {
        this.$refs.searchBar.searchQuery = '';
      }
      const newQuery = { ...this.$route.query };
      delete newQuery.search;
      this.$router.push({ query: newQuery });
      this.applyFilters();
    },
    
    toggleTag(tag) {
      const index = this.selectedTags.indexOf(tag);
      if (index === -1) {
        this.selectedTags.push(tag);
      } else {
        this.selectedTags.splice(index, 1);
      }
      if (this.searchQuery) {
        this.applySearchFilter();
      } else {
        this.applyFilters();
      }
    },
    
    clearTags() {
      this.selectedTags = [];
      if (this.searchQuery) {
        this.applySearchFilter();
      } else {
        this.applyFilters();
      }
    },
    
    resetFilters() {
      this.sortOption = 'name_asc';
      this.selectedCategory = '';
      this.selectedSubcategory = '';
      this.allergenFilter = '';
      this.selectedTags = [];
      if (this.searchQuery) {
        this.applySearchFilter();
      } else {
        this.filteredProducts = [...this.allProducts];
      }
      this.tagSearchQuery = '';
      this.showAllTags = false;
    },
    
    resetAllFiltersAndSearch() {
      this.resetFilters();
      this.clearSearch();
    },
    
    hasAllergen(product, allergen) {
      return product.allergens && Array.isArray(product.allergens) && product.allergens.some(a => {
        if (allergen === 'lactoza' && a.toLowerCase() === 'lapte') {
          return true;
        }
        return a.toLowerCase().includes(allergen.toLowerCase());
      });
    },
    
    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },
    
    removeDiacritics(text) {
      if (!text) return '';
      const diacriticsMap = {
        'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't',
        'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ț': 'T',
        'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
        'á': 'a', 'à': 'a', 'â': 'a', 'ä': 'a',
        'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
        'ó': 'o', 'ò': 'o', 'ô': 'o', 'ö': 'o',
        'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
        'ý': 'y', 'ÿ': 'y'
      };
      return text.replace(/[ăâîșțĂÂÎȘȚéèêëáàâäíìîïóòôöúùûüýÿ]/g, match => diacriticsMap[match] || match);
    },
    
    capitalizeFirstLetter(string) {
      if (!string) return '';
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    
    // Metoda ce crește numărul de produse afișate
    loadMore() {
      this.displayCount += 9;
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&display=swap');

:root {
  --bg-primary: #ffffff;
  --bg-secondary: #fafafa;
  --text-primary: #000000;
  --text-secondary: #666666;
  --accent: #333333;
  --accent-light: #e0e0e0;
  --accent-hover: #000000;
  --light-border: #eeeeee;
  --shadow-soft: none;
  --shadow-hover: none;
  --font-serif: 'Playfair Display', serif;
  --font-sans: 'Work Sans', sans-serif;
}

.category-page {
  font-family: 'Montserrat', sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 3rem;
  text-align: center;
}

.category-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-bar-container {
  margin: 0.5rem 0 1.5rem;
  width: 100%;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
}

.search-active-indicator {
  background-color: var(--bg-secondary);
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.search-query-text {
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 500;
}

.clear-search-button {
  background-color: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.4rem;
  transition: color 0.2s ease;
}

.clear-search-button:hover {
  color: var(--accent);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.loader-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid var(--light-border);
  border-top: 3px solid var(--accent);
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading p {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  letter-spacing: 1px;
}

.error {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.error p {
  padding: 1.5rem 2rem;
  border: 1px solid var(--light-border);
  border-radius: 8px;
  color: #d85a77;
}

.category-header {
  text-align: center;
  padding-bottom: 1rem;
  position: relative;
}

.category-header h1 {
  font-family: var(--font-sans);
  font-size: 2rem;
  font-weight: 300;
  color: var(--text-primary);
  margin-bottom: 1rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.category-header p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  font-weight: 300;
}

.filter-section {
  border-top: 1px solid var(--light-border);
  border-bottom: 1px solid var(--light-border);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.filter-title {
  font-size: 1rem;
  font-weight: 400;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.filter-container {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  max-width: 900px;
}

.filter-group {
  min-width: 160px;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
}

.filter-group select {
  width: 100%;
  padding: 0.5rem 0;
  background-color: transparent;
  border: none;
  border-bottom: 1px solid var(--light-border);
  font-family: var(--font-sans);
  font-size: 0.85rem;
  color: var(--text-primary);
  cursor: pointer;
  outline: none;
  appearance: none;
  transition: border-color 0.3s ease;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23000000' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right center;
  padding-right: 1.5rem;
  text-align: left;
}

.filter-group select:focus {
  border-color: var(--accent);
}

.tags-filter {
  width: 100%;
  margin-top: 0.5rem;
}

.tags-header {
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.toggle-tags-button {
  background: transparent;
  border: none;
  color: var(--accent);
  font-size: 0.75rem;
  cursor: pointer;
  text-decoration: underline;
}

.tags-search {
  margin-bottom: 1rem;
}

.tag-search-input {
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  padding: 0.5rem;
  border: 1px solid var(--light-border);
  border-radius: 20px;
  font-size: 0.8rem;
  outline: none;
  transition: border-color 0.3s;
}

.tag-search-input:focus {
  border-color: var(--accent);
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 0.8rem;
  justify-content: center;
  max-height: 110px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.tags-container.expanded {
  max-height: 500px;
  overflow-y: auto;
}

.tags-container.expanded::-webkit-scrollbar {
  width: 6px;
}

.tags-container.expanded::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

.tags-container.expanded::-webkit-scrollbar-thumb {
  background: var(--light-border);
  border-radius: 3px;
}

.tags-container.expanded::-webkit-scrollbar-thumb:hover {
  background: var(--accent-light);
}

.tag-button {
  padding: 0.5rem 1rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--light-border);
  border-radius: 20px;
  font-size: 0.75rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none !important;
  outline: none !important;
}

.tag-button:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  color: var(--accent);
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.tag-button.active {
  background-color: rgba(212, 175, 55, 0.05);
  border-color: #d4af37;
  color: #d4af37;
  font-weight: 500;
  transform: translateY(0);
  box-shadow: none;
  -webkit-tap-highlight-color: transparent;
}

.tag-button.active:hover, 
.tag-button.active:focus, 
.tag-button.active:active {
  background-color: rgba(212, 175, 55, 0.05);
  border-color: #d4af37;
  color: #d4af37;
  transform: translateY(0);
  box-shadow: none;
  outline: none !important;
}

.tag-button.active .tag-remove {
  color: #d4af37;
}

.tag-button::-moz-focus-inner {
  border: 0;
}

.tag-button:focus {
  outline: none;
}

.tag-remove {
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 0.8;
}

.selected-tags-summary {
  margin-top: 1rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.clear-tags-button {
  background-color: transparent;
  border: none;
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.clear-tags-button:hover {
  color: #d4af37;
}

.reset-filters-container {
  margin-top: 1.5rem;
}

.reset-all-filters-button {
  padding: 0.6rem 1.2rem;
  background-color: transparent;
  border: 1px solid var(--light-border);
  border-radius: 20px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reset-all-filters-button:hover {
  border-color: #d4af37;
  color: #d4af37;
}

.reset-all-filters-button i {
  font-size: 0.9rem;
}

.products-counter {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  justify-content: center;
}

.counter-text {
  padding: 0.4rem 1rem;
  background-color: var(--bg-secondary);
  border-radius: 20px;
}

.counter-filter-info {
  font-style: italic;
  opacity: 0.8;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.product-card {
  background-color: white;
  overflow: hidden;
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  border: none;
  margin-bottom: 1rem;
}

.product-card:hover {
  transform: translateY(-4px);
}

.product-image-container {
  height: 300px;
  overflow: hidden;
  position: relative;
  background-color: #f9f9f9;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-image {
  transform: scale(1.03);
}

.product-badges {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 2;
}

.product-badge {
  padding: 4px 10px;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background-color: white;
  color: #2c2c2c;
}

.badge-nou,
.badge-popular,
.badge-promotie,
.badge-limitat {
  background-color: white;
  color: #2c2c2c;
}

.product-content {
  padding: 1.2rem 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.5rem;
}

.product-name-link {
  text-decoration: none;
  color: inherit;
}

.product-name {
  font-family: var(--font-sans);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.product-info-icons {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.info-icon {
  font-size: 0.8rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-icon i {
  color: var(--text-secondary);
}

.product-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-family: var(--font-sans);
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--text-secondary);
}

.product-price::after {
  content: " lei";
}

.add-to-cart-button {
  padding: 0;
  background-color: transparent;
  color: var(--text-primary);
  border: none;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.add-to-cart-button:hover {
  color: var(--accent);
}

.add-to-cart-button i {
  font-size: 0.9rem;
}

.no-products {
  background-color: white;
  border-radius: 10px;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: var(--shadow-soft);
}

.no-products p {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.reset-filters-button {
  padding: 0.8rem 1.8rem;
  background-color: var(--accent);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-filters-button:hover {
  background-color: var(--accent-hover);
  transform: translateY(-2px);
}

@media (max-width: 992px) {
  .category-page {
    padding: 3rem 2rem;
  }
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .category-page {
    padding: 2rem 1.5rem;
  }
  .category-content {
    gap: 0.5rem;
  }
  .filter-container {
    flex-wrap: wrap;
    gap: 1.5rem;
  }
  .filter-section {
    margin-bottom: 0;
  }
  .filter-group {
    min-width: 45%;
  }
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  .category-header {
    padding-bottom: 1rem;
  }
  .category-header h1 {
    font-size: 1.5rem;
  }
  .product-image-container {
    height: 240px;
  }
}

@media (max-width: 550px) {
  .products-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .filter-container {
    flex-direction: column;
  }
  .filter-group {
    width: 100%;
  }
  .product-image-container {
    height: 300px;
  }
}

.load-more-container {
  text-align: center;
  margin-top: 2rem;
}

.load-more-button {
  padding: 0.8rem 2rem;
  background-color: var(--accent);
  color: black;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.load-more-button:hover {
  background-color: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

</style>
