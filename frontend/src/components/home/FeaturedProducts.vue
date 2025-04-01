<template>
  <section class="featured-products" v-if="products && products.length">
    <div class="container">
      <h2 class="section-title">{{ sectionTitle }}</h2>
      
      <div v-if="loading" class="products-loading">
        <div class="loader-spinner"></div>
        <p>Se încarcă produsele...</p>
      </div>
      
      <div v-else class="products-grid">
        <div v-for="product in products" :key="product.id" class="product-card">
          <router-link :to="'/products/' + product.id" class="product-link">
            <div class="product-image-container">
              <img :src="getProductImage(product)" :alt="product.name" class="product-image">
              
              <!-- Badge-uri pentru produse speciale -->
              <div class="product-badges">
                <span v-if="product.isNew" class="product-badge badge-nou">Nou</span>
                <span v-if="product.discount" class="product-badge badge-promotie">-{{ product.discount }}%</span>
              </div>
            </div>
          </router-link>
          
          <div class="product-content">
            <router-link :to="'/products/' + product.id" class="product-name-link">
              <h3 class="product-name">{{ product.name }}</h3>
            </router-link>
            
            <p v-if="product.description" class="product-description">
              {{ truncateText(product.description, maxDescriptionLength) }}
            </p>
            
            <!-- Info produse (informații adiționale) -->
            <div class="product-info-icons" v-if="product.allergens || (product.tags && product.tags.includes('vegan'))">
              <span v-if="product.allergens && !product.allergens.includes('gluten')" class="info-icon" title="Fără gluten">
                <i class="fas fa-wheat-alt fa-slash"></i>
              </span>
              <span v-if="product.allergens && !product.allergens.includes('lactoza')" class="info-icon" title="Fără lactoză">
                <i class="fas fa-cheese fa-slash"></i>
              </span>
              <span v-if="product.tags && product.tags.includes('vegan')" class="info-icon" title="Vegan">
                <i class="fas fa-leaf"></i>
              </span>
            </div>
            
            <!-- Footer cu preț și buton de adăugare în coș -->
            <div class="product-footer">
              <div class="product-price-container">
                <p class="product-price" :class="{ 'has-discount': product.discountPrice }">
                  <span v-if="product.discountPrice" class="original-price">{{ formatPrice(product.price) }}</span>
                  <span class="current-price">{{ formatPrice(product.discountPrice || product.price) }}</span>
                </p>
              </div>
              
              <button 
                class="add-to-cart-button" 
                @click="addToCart(product)"
                :disabled="!product.inStock"
              >
                <i class="fas fa-shopping-cart"></i>
                <span>{{ product.inStock === false ? 'Indisponibil' : 'Adaugă' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="showSeeMore" class="see-more-container">
        <router-link :to="seeMoreLink" class="see-more-btn">
          {{ seeMoreText }}
        </router-link>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'FeaturedProducts',
  props: {
    products: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    sectionTitle: {
      type: String,
      default: 'Produse Recomandate'
    },
    maxDescriptionLength: {
      type: Number,
      default: 100
    },
    showSeeMore: {
      type: Boolean,
      default: true
    },
    seeMoreLink: {
      type: String,
      default: '/produse'  // Modificat din '/products' în '/produse'
    },
    seeMoreText: {
      type: String,
      default: 'Vezi toate produsele'
    },
    defaultImage: {
      type: String,
      default: 'https://via.placeholder.com/300'
    }
  },
  methods: {
    addToCart(product) {
      if (!product.inStock) return;
      
      this.$store.dispatch('cart/addToCart', { product, quantity: 1 });
      this.$emit('product-added', product);
      
      // Verifică dacă există metoda toast pentru notificări
      if (this.$toast) {
        this.$toast.success(`${product.name} a fost adăugat în coș!`);
      }
    },
    
    getProductImage(product) {
      if (product.image) {
        return product.image;
      } else if (product.imageUrl) {
        return product.imageUrl;
      } else if (product.gallery && product.gallery.length) {
        return product.gallery[0];
      } else {
        return this.defaultImage;
      }
    },
    
    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substr(0, maxLength) + '...';
    },
    
    formatPrice(price) {
      if (!price) return '0';
      return `${price}`;
    }
  }
}
</script>

<style scoped>
/* Importă fonturile dacă nu sunt deja importate global */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&display=swap');

/* Variables */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #fafafa;
  --text-primary: #000000;
  --text-secondary: #666666;
  --accent: #333333;
  --accent-light: #e0e0e0;
  --accent-hover: #000000;
  --light-border: #eeeeee;
  --accent-color: #e91e63;
}

.featured-products {
  font-family: 'Montserrat', sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  width: 100%;
  box-sizing: border-box;
}

.section-title {
  font-size: 2rem;
  font-weight: 300;
  text-align: center;
  margin-bottom: 3rem;
  color: var(--text-primary);
  letter-spacing: -0.5px;
  text-transform: uppercase;
}

.products-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

.loader-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--light-border);
  border-top: 3px solid var(--accent-color);
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Products Grid - În stilul din Category */
.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
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

.product-link {
  text-decoration: none;
  color: inherit;
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

.badge-nou {
  background-color: white;
  color: #2c2c2c;
}

.badge-promotie {
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
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.product-description {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0.5rem 0;
  line-height: 1.5;
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

.product-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.8rem;
}

.product-price-container {
  display: flex;
  align-items: baseline;
}

.product-price {
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--text-secondary);
  margin: 0;
}

.product-price::after {
  content: " lei";
}

.original-price {
  color: #999;
  font-size: 0.8rem;
  text-decoration: line-through;
  margin-right: 0.5rem;
}

.original-price::after {
  content: " lei";
}

.current-price {
  color: var(--accent-color);
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
  color: var(--accent-color);
}

.add-to-cart-button:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.see-more-container {
  text-align: center;
  margin-top: 3rem;
}

.see-more-btn {
  display: inline-block;
  padding: 0.8rem 2rem;
  background-color: transparent;
  color: var(--accent-color);
  border: 1px solid var(--accent-color);
  border-radius: 4px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.85rem;
}

.see-more-btn:hover {
  background-color: var(--accent-color);
  color: white;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .section-title {
    font-size: 1.75rem;
    margin-bottom: 2rem;
  }
}

@media (max-width: 768px) {
  .featured-products {
    padding: 3rem 0;
  }
  
  .section-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .products-grid {
    gap: 1.5rem;
  }
  
  .product-image-container {
    height: 240px;
  }
  
  .product-name {
    font-size: 0.8rem;
  }
  
  .product-description {
    font-size: 0.75rem;
  }
}

@media (max-width: 550px) {
  .featured-products {
    padding: 2rem 0;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .product-image-container {
    height: 280px;
  }
  
  .see-more-btn {
    padding: 0.7rem 1.5rem;
    font-size: 0.8rem;
  }
}
</style>