<!-- SearchBar.vue -->
<template>
    <div class="search-container">
      <div class="search-input-wrapper">
        <input
          type="text"
          v-model="searchQuery"
          @input="handleSearch"
          @focus="isFocused = true"
          @blur="handleBlur"
          placeholder="Caută după prăjitură, ingredient sau alergen..."
          class="search-input"
        />
        <button v-if="searchQuery" class="clear-button" @click="clearSearch">
          <i class="fas fa-times"></i>
        </button>
        <button class="search-button" @click="handleSearch">
          <i class="fas fa-search"></i>
        </button>
      </div>
  
      <!-- Rezultate căutare -->
      <div v-if="isFocused && searchQuery && filteredProducts.length > 0" class="search-results">
        <div class="search-results-header">
          <p>{{ filteredProducts.length }} rezultate</p>
          <button class="search-close" @click="clearSearch">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="search-results-list">
          <router-link
            v-for="product in filteredProducts"
            :key="product.id"
            :to="'/products/' + product.id"
            class="search-result-item"
            @click="clearSearch"
          >
            <div class="search-result-image">
              <img :src="product.image" :alt="product.name" />
            </div>
            <div class="search-result-info">
              <h4 class="search-result-name">{{ product.name }}</h4>
              <p class="search-result-category">{{ getCategoryName(product.category) }}</p>
              <div class="search-result-tags">
                <span v-for="(tag, index) in product.tags.slice(0, 2)" :key="index" class="search-result-tag">
                  {{ capitalizeFirstLetter(tag) }}
                </span>
              </div>
              <div class="search-result-price">{{ product.price }} lei</div>
            </div>
          </router-link>
        </div>
        
        <div v-if="hasMoreResults" class="search-results-footer">
          <router-link 
            :to="{ path: '/produse', query: { search: searchQuery } }" 
            class="view-all-button"
            @click="clearFocus"
          >
            Vezi toate rezultatele
          </router-link>
        </div>
      </div>
      
      <!-- Niciun rezultat găsit -->
      <div v-if="isFocused && searchQuery && filteredProducts.length === 0" class="search-no-results">
        <p>Nu am găsit produse care să corespundă cu "{{ searchQuery }}"</p>
        <div class="search-suggestions">
          <p>Sugestii:</p>
          <ul>
            <li>Verifică dacă ai scris corect</li>
            <li>Încearcă termeni mai generali</li>
            <li>Încearcă alte cuvinte cheie</li>
          </ul>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
  import { db } from '@/firebase';
  import { mapState } from 'vuex';
  
  export default {
    name: 'SearchBar',
    props: {
      maxResults: {
        type: Number,
        default: 5
      }
    },
    data() {
      return {
        searchQuery: '',
        allProducts: [],
        isFocused: false,
        isLoading: false,
        debounceTimeout: null
      }
    },
    computed: {
      ...mapState('categories', ['categories']),
      
      filteredProducts() {
        if (!this.searchQuery.trim()) return [];
        
        const searchTerms = this.searchQuery.trim().toLowerCase().split(/\s+/);
        
        // Filtrarea produselor pe baza termenilor de căutare
        return this.allProducts.filter(product => {
          // Căutare în numele produsului - acordă un scor mai mare
          const nameMatch = searchTerms.some(term => 
            product.name.toLowerCase().includes(term)
          );
          
          // Căutare în descriere
          const descMatch = product.description && searchTerms.some(term => 
            product.description.toLowerCase().includes(term)
          );
          
          // Căutare în tag-uri
          const tagMatch = product.tags && product.tags.some(tag => 
            searchTerms.some(term => tag.toLowerCase().includes(term))
          );
          
          // Căutare în ingrediente
          const ingredientMatch = product.ingredients && product.ingredients.some(ingredient =>
            searchTerms.some(term => ingredient.toLowerCase().includes(term))
          );
          
          // Căutare în subcategorie
          const subcategoryMatch = product.subcategory && searchTerms.some(term =>
            product.subcategory.toLowerCase().includes(term)
          );
          
          return nameMatch || descMatch || tagMatch || ingredientMatch || subcategoryMatch;
        })
        .sort((a, b) => {
          // Prioritizează rezultatele care conțin termenul exact în nume
          const aNameExactMatch = a.name.toLowerCase().includes(this.searchQuery.toLowerCase());
          const bNameExactMatch = b.name.toLowerCase().includes(this.searchQuery.toLowerCase());
          
          if (aNameExactMatch && !bNameExactMatch) return -1;
          if (!aNameExactMatch && bNameExactMatch) return 1;
          
          // Apoi prioritizează potrivirile de nume
          const aNameMatch = this.searchQuery.toLowerCase().split(/\s+/).some(term => 
            a.name.toLowerCase().includes(term)
          );
          const bNameMatch = this.searchQuery.toLowerCase().split(/\s+/).some(term => 
            b.name.toLowerCase().includes(term)
          );
          
          if (aNameMatch && !bNameMatch) return -1;
          if (!aNameMatch && bNameMatch) return 1;
          
          // La final sortează alfabetic
          return a.name.localeCompare(b.name);
        })
        .slice(0, this.maxResults);
      },
      
      hasMoreResults() {
        // Verifică dacă există mai multe rezultate decât cele afișate
        if (!this.searchQuery.trim()) return false;
        
        const searchTerms = this.searchQuery.trim().toLowerCase().split(/\s+/);
        const totalResults = this.allProducts.filter(product => {
          return searchTerms.some(term => 
            product.name.toLowerCase().includes(term) ||
            (product.description && product.description.toLowerCase().includes(term)) ||
            (product.tags && product.tags.some(tag => tag.toLowerCase().includes(term))) ||
            (product.ingredients && product.ingredients.some(ingredient => ingredient.toLowerCase().includes(term))) ||
            (product.subcategory && product.subcategory.toLowerCase().includes(term))
          );
        }).length;
        
        return totalResults > this.maxResults;
      }
    },
    async created() {
      try {
        await this.fetchProducts();
      } catch (error) {
        console.error('Eroare la încărcarea produselor pentru căutare:', error);
      }
    },
    methods: {
      async fetchProducts() {
        this.isLoading = true;
        try {
          const productsRef = collection(db, 'products');
          const q = query(productsRef, orderBy('name'));
          const querySnapshot = await getDocs(q);
          
          const products = [];
          querySnapshot.forEach((doc) => {
            products.push({
              id: doc.id,
              ...doc.data()
            });
          });
          
          this.allProducts = products;
          console.log(`Încărcate ${products.length} produse pentru căutare`);
        } catch (error) {
          console.error('Eroare la încărcarea produselor:', error);
        } finally {
          this.isLoading = false;
        }
      },
      
      handleSearch() {
        // Implementează debounce pentru a evita prea multe apeluri
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => {
          // Aici putem adăuga logica suplimentară necesară
          this.$emit('search', this.searchQuery);
        }, 300);
      },
      
      clearSearch() {
        this.searchQuery = '';
        this.isFocused = false;
        this.$emit('search', '');
      },
      
      handleBlur() {
        // Întârziere pentru a permite click pe rezultate
        setTimeout(() => {
          this.isFocused = false;
        }, 200);
      },
      
      clearFocus() {
        this.isFocused = false;
      },
      
      getCategoryName(categoryId) {
        const category = this.categories.find(cat => cat.id === categoryId);
        return category ? category.name : 'Diverse';
      },
      
      capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
      }
    }
  }
  </script>
  
  <style scoped>
  .search-container {
    position: relative;
    max-width: 400px;
    margin: 0 auto;
    z-index: 1000;
  }
  
  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .search-input {
    width: 100%;
    padding: 0.5rem 2.8rem 0.5rem 1rem;
    border: 1px solid var(--light-border);
    border-radius: 20px;
    font-family: var(--font-sans);
    font-size: 0.8rem;
    transition: all 0.3s ease;
    background-color: var(--bg-secondary);
    color: black;
  }
  
  .search-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background-color: white;
  }
  
  .search-button {
    position: absolute;
    right: 0.7rem;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 0.8rem;
    color: var(--text-secondary);
    transition: color 0.2s ease;
    padding: 0.3rem;
  }
  
  .search-button:hover {
    color: var(--accent);
  }
  
  .clear-button {
    position: absolute;
    right: 2.2rem;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 0.75rem;
    color: var(--text-secondary);
    transition: color 0.2s ease;
    padding: 0.2rem;
  }
  
  .clear-button:hover {
    color: var(--accent);
  }
  
  /* Stiluri pentru rezultatele căutării */
  .search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 0.3rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    max-height: 60vh;
    overflow-y: auto;
    z-index: 1001;
  }
  
  .search-results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 0.8rem;
    border-bottom: 1px solid var(--light-border);
    background-color: var(--bg-secondary);
  }
  
  .search-results-header p {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 0;
    font-weight: 500;
  }
  
  .search-close {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--text-secondary);
    padding: 0.2rem;
  }
  
  .search-results-list {
    padding: 0.5rem 0;
  }
  
  .search-result-item {
    display: flex;
    padding: 0.6rem 0.8rem;
    text-decoration: none;
    color: inherit;
    transition: background-color 0.2s ease;
    border-bottom: 1px solid var(--light-border);
  }
  
  .search-result-item:last-child {
    border-bottom: none;
  }
  
  .search-result-item:hover {
    background-color: var(--bg-secondary);
  }
  
  .search-result-image {
    width: 50px;
    height: 50px;
    flex-shrink: 0;
    margin-right: 0.8rem;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .search-result-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .search-result-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .search-result-name {
    font-size: 0.8rem;
    font-weight: 600;
    margin: 0 0 0.2rem;
    color: var(--text-primary);
    line-height: 1.2;
  }
  
  .search-result-category {
    font-size: 0.7rem;
    color: var(--text-secondary);
    margin: 0 0 0.2rem;
  }
  
  .search-result-tags {
    display: flex;
    gap: 0.3rem;
    margin-bottom: 0.2rem;
    flex-wrap: wrap;
  }
  
  .search-result-tag {
    font-size: 0.65rem;
    padding: 0 0.4rem;
    background-color: var(--bg-secondary);
    border-radius: 8px;
    color: var(--text-secondary);
  }
  
  .search-result-price {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--accent);
  }
  
  .search-results-footer {
    padding: 0.6rem;
    text-align: center;
    border-top: 1px solid var(--light-border);
    background-color: var(--bg-secondary);
  }
  
  .view-all-button {
    display: inline-block;
    padding: 0.4rem 1rem;
    background-color: white;
    border: 1px solid var(--light-border);
    border-radius: 20px;
    font-size: 0.75rem;
    color: var(--text-primary);
    text-decoration: none;
    transition: all 0.3s ease;
  }
  
  .view-all-button:hover {
    background-color: var(--accent);
    color: white;
    border-color: var(--accent);
  }
  
  /* Stiluri pentru lipsa rezultatelor */
  .search-no-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 0.5rem;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    z-index: 1001;
  }
  
  .search-no-results p {
    font-size: 0.9rem;
    color: var(--text-primary);
    margin: 0 0 1rem;
    text-align: center;
  }
  
  .search-suggestions {
    background-color: var(--bg-secondary);
    padding: 1rem;
    border-radius: 8px;
  }
  
  .search-suggestions p {
    font-size: 0.85rem;
    font-weight: 500;
    margin: 0 0 0.5rem;
    text-align: left;
  }
  
  .search-suggestions ul {
    margin: 0;
    padding-left: 1.5rem;
  }
  
  .search-suggestions li {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-bottom: 0.3rem;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .search-container {
      max-width: 100%;
    }
    
    .search-results {
      max-height: 70vh;
    }
  }
  </style>