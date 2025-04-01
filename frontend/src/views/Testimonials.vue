<template>
  <div class="testimonials-page">
    <!-- Header Section -->
    <div class="page-header">
      <div class="container">
        <h1>Testimoniale</h1>
        <p class="header-subtitle">Experiențele clienților noștri</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loader"></div>
      <p>Se încarcă testimonialele...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="fetchTestimonials" class="retry-button">Încearcă din nou</button>
    </div>

    <!-- Testimonials Content -->
    <div v-else class="testimonials-content">
      <!-- Filters Section -->
      <section class="testimonials-filters-section">
        <div class="container">
          <div class="filters-wrapper">
            <div class="filter-group">
              <label for="sort-by">Sortează după:</label>
              <select id="sort-by" v-model="sortOption" @change="applyFilters">
                <option value="date-desc">Cele mai recente</option>
                <option value="date-asc">Cele mai vechi</option>
                <option value="rating-desc">Nota (descrescător)</option>
                <option value="rating-asc">Nota (crescător)</option>
              </select>
            </div>

            <div class="filter-group">
              <label for="filter-rating">Filtrează după rating:</label>
              <select id="filter-rating" v-model="ratingFilter" @change="applyFilters">
                <option value="all">Toate</option>
                <option value="5">5 stele</option>
                <option value="4">4+ stele</option>
                <option value="3">3+ stele</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <!-- No Results Message -->
      <div v-if="filteredTestimonials.length === 0" class="no-results container">
        <p>Nu s-au găsit testimoniale care să corespundă criteriilor de filtrare.</p>
        <button @click="resetFilters" class="reset-button">Resetează filtrele</button>
      </div>

      <!-- Testimonials Grid -->
      <section v-else class="all-testimonials-section">
        <div class="container">
          <div class="testimonials-grid">
            <div 
              v-for="testimonial in filteredTestimonials" 
              :key="testimonial.id" 
              class="testimonial-card"
            >
              <div class="testimonial-user-product">
                <div class="testimonial-user">
                  <span class="user-icon">👤</span>
                  {{ testimonial.name }}
                  <span v-if="testimonial.verified" class="verified-badge" title="Achiziție verificată">✓</span>
                </div>
                <div class="testimonial-product" v-if="testimonial.product">
                  <span class="product-icon">🍰</span>
                  {{ getProductName(testimonial.product) || 'Produs' }}
                </div>
              </div>

              <div class="testimonial-header">
                <div class="testimonial-rating">
                  <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= testimonial.rating }">★</span>
                </div>
                <div class="testimonial-date">{{ formatDate(testimonial.date) }}</div>
              </div>

              <div class="testimonial-content">
                <h3 v-if="testimonial.title" class="testimonial-title">{{ testimonial.title }}</h3>
                <p class="testimonial-text">"{{ testimonial.text }}"</p>
                
                <!-- Afișează tag-uri dacă există -->
                <div v-if="testimonial.tags && testimonial.tags.length" class="testimonial-tags">
                  <span v-for="tag in testimonial.tags" :key="tag" class="testimonial-tag">{{ tag }}</span>
                </div>
              </div>

              <!-- Afișează răspunsul dacă există -->
              <div v-if="testimonial.response" class="testimonial-response">
                <p class="response-date">Răspuns ({{ formatDate(testimonial.response.date) }}):</p>
                <p class="response-text">{{ testimonial.response.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section v-if="filteredTestimonials.length > 0" class="testimonials-stats-section">
        <div class="container">
          <div class="stats-container">
            <div class="stats-box">
              <span class="stats-value">{{ getAverageRating }}</span>
              <span class="stats-label">Rating mediu</span>
              <div class="average-stars">
                <span v-for="i in 5" :key="i" class="star" 
                  :class="{ 'filled': i <= Math.floor(getAverageRating), 'half-filled': i === Math.ceil(getAverageRating) && getAverageRating % 1 >= 0.5 }">★</span>
              </div>
            </div>

            <div class="stats-box">
              <span class="stats-value">{{ filteredTestimonials.length }}</span>
              <span class="stats-label">Număr total de testimoniale</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default {
  name: 'Testimonials',
  data() {
    return {
      sortOption: 'date-desc',
      ratingFilter: 'all',
      filteredTestimonials: [],
      productsCache: {} // Cache pentru numele produselor
    };
  },
  computed: {
    ...mapState('testimonials', ['list', 'loading', 'error']),
    ...mapGetters('testimonials', ['getAllTestimonials']),
    
    getAverageRating() {
      if (this.filteredTestimonials.length === 0) return 0;
      
      const sum = this.filteredTestimonials.reduce((total, item) => {
        return total + item.rating;
      }, 0);
      
      return (sum / this.filteredTestimonials.length).toFixed(1);
    }
  },
  methods: {
    ...mapActions('testimonials', ['fetch']),
    
    fetchTestimonials() {
      return this.fetch().then(() => {
        this.applyFilters();
        // Preluăm numele produselor pentru toate testimonialele
        this.fetchProductNames();
      }).catch(error => {
        console.error("Eroare la încărcarea testimonialelor:", error);
      });
    },
    
    formatDate(dateString) {
      if (!dateString) return "";
      
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('ro-RO', options);
    },
    
    applyFilters() {
      let filtered = [...this.getAllTestimonials];
      
      // Apply rating filter
      if (this.ratingFilter !== 'all') {
        const minRating = parseInt(this.ratingFilter);
        filtered = filtered.filter(item => item.rating >= minRating);
      }
      
      // Apply sort
      switch (this.sortOption) {
        case 'date-desc':
          filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
          break;
        case 'date-asc':
          filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
          break;
        case 'rating-desc':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'rating-asc':
          filtered.sort((a, b) => a.rating - b.rating);
          break;
      }
      
      this.filteredTestimonials = filtered;
    },
    
    resetFilters() {
      this.sortOption = 'date-desc';
      this.ratingFilter = 'all';
      this.applyFilters();
    },
    
    // Funcție pentru a obține numele produsului
    getProductName(productId) {
      return this.productsCache[productId] || productId;
    },
    
    // Fetch numele produselor pentru toate testimonialele
    async fetchProductNames() {
      const productIds = this.filteredTestimonials
        .filter(item => item.product)
        .map(item => item.product);
        
      // Eliminăm duplicatele
      const uniqueProductIds = [...new Set(productIds)];
      
      // Pentru fiecare produs, verificăm dacă avem deja în cache
      for (const productId of uniqueProductIds) {
        if (!this.productsCache[productId]) {
          try {
            const productDoc = await getDoc(doc(db, 'products', productId));
            if (productDoc.exists()) {
              const productData = productDoc.data();
              this.productsCache[productId] = productData.name;
            }
          } catch (error) {
            console.error(`Eroare la încărcarea produsului ${productId}:`, error);
            // În caz de eroare, folosim ID-ul ca nume
            this.productsCache[productId] = productId;
          }
        }
      }
      
      // Forțăm re-renderarea
      this.filteredTestimonials = [...this.filteredTestimonials];
    }
  },
  created() {
    this.fetchTestimonials();
  }
};
</script>

<style scoped>
/* -------------------------------------------
   Overall Page & Typography
------------------------------------------- */
.testimonials-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
  color: #333;
  background-color: #fff;
  font-family: 'Montserrat', sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* -------------------------------------------
   Header Section
------------------------------------------- */
.page-header {
  text-align: center;
  padding: 3.5rem 0;
  margin-bottom: 2rem;
  background-color: #f8f9fa;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 300;
  margin-bottom: 0.5rem;
  color: #333;
}

.header-subtitle {
  font-size: 1.1rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

/* -------------------------------------------
   Loading & Error States
------------------------------------------- */
.loading-container,
.error-message {
  min-height: 40vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.loader {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #555;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1.5s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-button {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.6rem 1.4rem;
  background-color: #555;
  color: #fff;
  text-decoration: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.retry-button:hover {
  background-color: #333;
}

/* -------------------------------------------
   Filters Section
------------------------------------------- */
.testimonials-filters-section {
  margin-bottom: 3rem;
}

.filters-wrapper {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  background-color: #f8f9fa;
  padding: 1.2rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.filter-group {
  display: flex;
  align-items: center;
}

.filter-group label {
  margin-right: 0.5rem;
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
}

.filter-group select {
  padding: 0.5rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: white;
  color: #333;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.3s;
}

.filter-group select:focus {
  border-color: #aaa;
}

/* -------------------------------------------
   Testimonials Grid - 2 per row
------------------------------------------- */
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.5rem;
  margin-bottom: 4rem;
}

.testimonial-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.8rem;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  border: 1px solid #f0f0f0;
  height: 100%;
}

.testimonial-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.07);
}

/* User and Product Info at Top */
.testimonial-user-product {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 1rem;
}

.testimonial-user, .testimonial-product {
  display: flex;
  align-items: center;
  font-size: 0.95rem;
  margin-bottom: 0.3rem;
}

.user-icon, .product-icon {
  margin-right: 0.5rem;
  font-size: 0.9rem;
}

.testimonial-user {
  font-weight: 600;
  color: #444;
}

.testimonial-product {
  color: #666;
}

.verified-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background-color: #4CAF50;
  color: white;
  border-radius: 50%;
  font-size: 0.7rem;
  margin-left: 6px;
}

.testimonial-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.testimonial-rating {
  display: flex;
}

.star {
  color: #e0e0e0;
  font-size: 1.1rem;
  margin-right: 2px;
}

.star.filled {
  color: #ffb400;
}

.star.half-filled {
  position: relative;
  display: inline-block;
  color: #e0e0e0;
}

.star.half-filled::after {
  content: '★';
  position: absolute;
  left: 0;
  top: 0;
  width: 50%;
  overflow: hidden;
  color: #ffb400;
}

.testimonial-date {
  font-size: 0.85rem;
  color: #999;
}

.testimonial-content {
  flex-grow: 1;
  margin-bottom: 1.5rem;
}

.testimonial-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #444;
  margin-bottom: 0.7rem;
}

.testimonial-text {
  font-style: italic;
  color: #555;
  line-height: 1.6;
  font-size: 0.95rem;
  margin-bottom: 1rem;
  font-weight: 400;
}

.testimonial-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 0.8rem;
}

.testimonial-tag {
  background-color: #f8f9fa;
  color: #666;
  padding: 3px 10px;
  border-radius: 15px;
  font-size: 0.75rem;
  border: 1px solid #eee;
}

.testimonial-response {
  background-color: #f8f9fa;
  border-left: 2px solid #ddd;
  padding: 12px 15px;
  margin-top: 0.5rem;
  margin-bottom: 0;
  border-radius: 0 4px 4px 0;
}

.response-date {
  font-size: 0.75rem;
  color: #888;
  margin-bottom: 5px;
}

.response-text {
  font-style: italic;
  color: #666;
  font-size: 0.85rem;
}

/* -------------------------------------------
   No Results Message
------------------------------------------- */
.no-results {
  text-align: center;
  padding: 3rem 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: 2rem 0 4rem;
}

.no-results p {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 1.5rem;
}

.reset-button {
  display: inline-block;
  padding: 0.6rem 1.4rem;
  background-color: #555;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.reset-button:hover {
  background-color: #333;
}

/* -------------------------------------------
   Stats Section
------------------------------------------- */
.testimonials-stats-section {
  margin: 5rem 0;
  padding: 2.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.stats-container {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.stats-box {
  text-align: center;
  padding: 1rem;
  min-width: 200px;
}

.stats-value {
  display: block;
  font-size: 2.5rem;
  font-weight: 600;
  color: #444;
}

.stats-label {
  display: block;
  font-size: 1rem;
  color: #666;
  margin-top: 0.5rem;
}

.average-stars {
  margin-top: 0.5rem;
}

/* -------------------------------------------
   Responsive Adjustments
------------------------------------------- */
@media (max-width: 992px) {
  .testimonials-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 2.5rem 0;
  }
  
  .page-header h1 {
    font-size: 2.2rem;
  }
  
  .testimonials-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-wrapper {
    flex-direction: column;
    gap: 1rem;
  }
  
  .filter-group {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .container {
    padding: 0 1.2rem;
  }
  
  .page-header {
    padding: 2rem 0;
  }
  
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .testimonial-card {
    padding: 1.4rem;
  }
  
  .stats-value {
    font-size: 2rem;
  }
}
</style>