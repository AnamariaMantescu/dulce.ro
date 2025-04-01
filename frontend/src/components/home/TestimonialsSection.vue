<template>
  <div class="testimonials-section">
    <h2 class="section-title">Ce spun clienții noștri</h2>
    <div class="testimonials-grid">
      <div v-for="testimonial in testimonials" :key="testimonial.id" class="testimonial-card">
        <div class="testimonial-header">
          <div class="testimonial-rating">
            <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= testimonial.rating }">★</span>
          </div>
          <div class="testimonial-date">{{ formatDate(testimonial.date) }}</div>
        </div>
        
        <div class="testimonial-content">
          <h3 v-if="testimonial.title" class="testimonial-title">{{ testimonial.title }}</h3>
          <p class="testimonial-text">"{{ testimonial.text }}"</p>
        </div>
        
        <div class="testimonial-footer">
          <div class="testimonial-author">
            {{ testimonial.name }}
            <span v-if="testimonial.verified" class="verified-badge" title="Achiziție verificată">✓</span>
          </div>
          <div v-if="testimonial.product" class="testimonial-product">
            <span class="product-icon">🍰</span>
            {{ getProductName(testimonial.product) || 'Produs' }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Buton "Citește mai multe" care duce către pagina de testimoniale -->
    <div class="read-more-container">
      <router-link to="/testimoniale" class="read-more-button">
        Citește mai multe recenzii
        <span class="arrow-icon">→</span>
      </router-link>
    </div>
  </div>
</template>

<script>
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default {
  name: 'TestimonialsSection',
  props: {
    testimonials: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      productsCache: {} // Cache pentru numele produselor
    };
  },
  methods: {
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('ro-RO', options);
    },
    
    // Funcție pentru a obține numele produsului
    getProductName(productId) {
      return this.productsCache[productId] || productId;
    },
    
    // Fetch numele produselor pentru testimoniale
    async fetchProductNames() {
      const productIds = this.testimonials
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
    }
  },
  mounted() {
    // Încărcăm numele produselor după ce componenta este montată
    this.fetchProductNames();
  }
}
</script>

<style scoped>
.testimonials-section {
  margin: 3rem 0;
  padding: 3rem 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.section-title {
  text-align: center;
  color: #333;
  font-size: 2rem;
  margin-bottom: 2.5rem;
  font-weight: 300;
  position: relative;
}

.section-title::after {
  content: '';
  display: block;
  width: 40px;
  height: 1px;
  background-color: #555;
  margin: 1rem auto 0;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.testimonial-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
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

.testimonial-date {
  font-size: 0.85rem;
  color: #999;
}

.testimonial-content {
  flex-grow: 1;
  margin-bottom: 1.2rem;
}

.testimonial-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #444;
  margin-bottom: 0.7rem;
}

.testimonial-text {
  font-style: italic;
  color: #555;
  line-height: 1.6;
  font-size: 0.95rem;
  font-weight: 400;
}

.testimonial-footer {
  margin-top: auto;
  border-top: 1px solid #f0f0f0;
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.testimonial-author {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #444;
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

.testimonial-product {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: #666;
}

.product-icon {
  margin-right: 0.5rem;
  font-size: 0.9rem;
}

/* Stiluri pentru butonul "Citește mai multe" */
.read-more-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.read-more-button {
  display: inline-flex;
  align-items: center;
  padding: 0.8rem 1.6rem;
  background-color: #555;
  color: white;
  font-weight: 500;
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}

.read-more-button:hover {
  background-color: #333;
  transform: translateY(-2px);
}

.arrow-icon {
  margin-left: 0.5rem;
  transition: transform 0.3s ease;
}

.read-more-button:hover .arrow-icon {
  transform: translateX(3px);
}

@media (max-width: 992px) {
  .testimonials-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
}

@media (max-width: 768px) {
  .testimonials-grid {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
  
  .testimonials-section {
    margin: 2.5rem 0;
    padding: 2rem 1.5rem;
  }
  
  .section-title {
    font-size: 1.6rem;
    margin-bottom: 2rem;
  }
  
  .testimonial-card {
    padding: 1.3rem;
  }
  
  .star {
    font-size: 1rem;
  }
  
  .testimonial-text {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .testimonials-section {
    margin: 2rem 0;
    padding: 1.5rem 1.2rem;
  }
  
  .testimonial-card {
    padding: 1.2rem;
  }
  
  .read-more-button {
    padding: 0.7rem 1.2rem;
    font-size: 0.9rem;
  }
}
</style>