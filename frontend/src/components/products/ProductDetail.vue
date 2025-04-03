<template>
  <div class="product-detail-container" v-if="product">
    <div class="product-gallery">
      <div class="main-image">
        <img :src="selectedImage" :alt="product.name" class="product-image">
        <div v-if="product.isNew" class="product-badge new">Nou</div>
        <div v-if="productThemeInfo && !isThemeActive" class="product-badge limited">Indisponibil</div>
        <div v-if="productSpecialDayInfo && !isSpecialDayActive" class="product-badge limited">Indisponibil</div>
        <div v-if="isProductUnavailable" class="product-badge limited">Indisponibil</div>

      </div>
      <div class="thumbnail-gallery">
        <div 
          v-for="(image, index) in product.gallery" 
          :key="index" 
          @click="selectedImage = image"
          class="thumbnail-wrapper"
          :class="{ active: selectedImage === image }"
        >
          <img 
            :src="image" 
            :alt="`${product.name} - imagine ${index + 1}`"
            class="thumbnail"
          >
        </div>
      </div>
    </div>
    <div class="product-info">
      <div class="product-header">
        <h1 class="product-title">{{ product.name }}</h1>
        <div class="product-price">
          {{ product.price }} <span>lei</span>
          <span v-if="activeDiscountInfo" class="discount-label">
            -{{ activeDiscountInfo.discount }}%
          </span>
        </div>
      </div>
      
      <div class="product-description">{{ product.description }}</div>
      
      <!-- Themed Week Availability Notice -->
      <div v-if="productThemeInfo && !isThemeActive" class="availability-notice theme-week">
        <div class="notice-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <div class="notice-text">
          <h3>Produs disponibil doar în perioada {{ formatDate(productThemeInfo.start_date) }} - {{ formatDate(productThemeInfo.end_date) }}</h3>
          <p>Acest produs face parte din "{{ productThemeInfo.name }}" și va fi disponibil pentru comandă în perioada menționată.</p>
        </div>
      </div>
      
      <!-- Special Day Availability Notice -->
      <div v-if="productSpecialDayInfo && !isSpecialDayActive" class="availability-notice special-day">
        <div class="notice-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <div class="notice-text">
          <h3>Produs disponibil doar în data de {{ formatDate(productSpecialDayInfo.date) }}</h3>
          <p>Acest produs face parte din evenimentul "{{ productSpecialDayInfo.name }}" și va fi disponibil pentru comandă în data menționată.</p>
        </div>
      </div>
      
      <div class="product-meta">
        <div class="meta-item">
          <div class="meta-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div class="meta-content">
            <h3>Porții</h3>
            <p>{{ product.servings }}</p>
          </div>
        </div>
        <div class="meta-item">
          <div class="meta-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="3" x2="1" y2="3"></line><line x1="8" y1="21" x2="1" y2="21"></line><line x1="16" y1="3" x2="23" y2="3"></line><line x1="16" y1="21" x2="23" y2="21"></line></svg>
          </div>
          <div class="meta-content">
            <h3>Greutate</h3>
            <p>{{ product.weight }}g</p>
          </div>
        </div>
        <div class="meta-item">
          <div class="meta-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div class="meta-content">
            <h3>Valabilitate</h3>
            <p>{{ product.expiry_date }}</p>
          </div>
        </div>
      </div>
      
      <div class="product-tags">
        <span v-for="(tag, index) in product.tags" :key="index" class="tag">{{ tag }}</span>
        <span v-if="productThemeInfo" class="tag theme-tag">{{ productThemeInfo.name }}</span>
        <span v-if="productSpecialDayInfo" class="tag special-tag">{{ productSpecialDayInfo.name }}</span>
      </div>
      
      <div class="product-actions">
        <div class="quantity-selector">
          <button @click="decrementQuantity" :disabled="quantity <= 1 || isProductUnavailable" class="quantity-btn">
            <span class="quantity-symbol">−</span>
          </button>
          <input type="number" v-model.number="quantity" min="1" class="quantity-input" :disabled="isProductUnavailable">
          <button @click="incrementQuantity" :disabled="isProductUnavailable" class="quantity-btn">
            <span class="quantity-symbol">+</span>
          </button>
        </div>
        <button 
          class="add-to-cart-btn" 
          @click="addToCart"
          :disabled="isProductUnavailable"
          :class="{ 'disabled': isProductUnavailable }"
        >
          <span>{{ isProductUnavailable ? 'Indisponibil' : 'Adaugă în coș' }}</span>
          <svg v-if="!isProductUnavailable" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
        </button>
      </div>
    </div>
    
    <!-- Product Details Tabs -->
    <div class="product-details">
      <div class="details-tabs">
        <button 
          v-for="(tab, index) in tabs" 
          :key="index" 
          @click="activeTab = tab.id" 
          :class="{ active: activeTab === tab.id }"
          class="tab-button"
        >
          {{ tab.name }}
        </button>
      </div>
      
      <div class="details-content">
        <!-- Existing tabs content -->
        <div v-if="activeTab === 'ingredients'" class="tab-content">
          <h2>Ingrediente</h2>
          <ul class="ingredients-list">
            <li v-for="(ingredient, index) in product.ingredients" :key="index">{{ ingredient }}</li>
          </ul>
        </div>
        
        <div v-if="activeTab === 'allergens'" class="tab-content">
          <h2>Alergeni</h2>
          <div class="allergens">
            <span v-for="(allergen, index) in product.allergens" :key="index" class="allergen">{{ allergen }}</span>
          </div>
        </div>
        
        <div v-if="activeTab === 'nutrition'" class="tab-content">
          <h2>Valori nutriționale</h2>
          <div class="nutritional-table">
            <div class="nutritional-row">
              <span>Calorii</span>
              <span>{{ product.nutritional_values.calories }} kcal</span>
            </div>
            <div class="nutritional-row">
              <span>Grăsimi</span>
              <span>{{ product.nutritional_values.fat }}g</span>
            </div>
            <div class="nutritional-row">
              <span>Carbohidrați</span>
              <span>{{ product.nutritional_values.carbs }}g</span>
            </div>
            <div class="nutritional-row">
              <span>Proteine</span>
              <span>{{ product.nutritional_values.protein }}g</span>
            </div>
            <div class="nutritional-row">
              <span>Zahăr</span>
              <span>{{ product.nutritional_values.sugar }}g</span>
            </div>
          </div>
        </div>
        
        <div v-if="activeTab === 'storage'" class="tab-content">
          <h2>Condiții de păstrare</h2>
          <p>{{ product.storage_conditions }}</p>
        </div>
        
        <div v-if="activeTab === 'notes' && product.special_notes" class="tab-content">
          <h2>Note speciale</h2>
          <p>{{ product.special_notes }}</p>
        </div>
        
        <!-- Theme Availability Tab -->
        <div v-if="activeTab === 'availability' && (productThemeInfo || productSpecialDayInfo)" class="tab-content">
          <h2>Disponibilitate</h2>
          
          <!-- Theme Week Info -->
          <div v-if="productThemeInfo" class="availability-info">
            <h3>{{ productThemeInfo.name }}</h3>
            <p>{{ productThemeInfo.description || productThemeInfo.long_description }}</p>
            <div class="availability-dates">
              <div class="date-item">
                <span class="date-label">Data început:</span>
                <span class="date-value">{{ formatDate(productThemeInfo.start_date) }}</span>
              </div>
              <div class="date-item">
                <span class="date-label">Data sfârșit:</span>
                <span class="date-value">{{ formatDate(productThemeInfo.end_date) }}</span>
              </div>
              <div class="date-item" v-if="productThemeInfo.special_discount">
                <span class="date-label">Discount special:</span>
                <span class="date-value">{{ productThemeInfo.special_discount }}%</span>
              </div>
            </div>
          </div>
          
          <!-- Special Day Info -->
          <div v-if="productSpecialDayInfo" class="availability-info">
            <h3>{{ productSpecialDayInfo.name }}</h3>
            <p>{{ productSpecialDayInfo.description || productSpecialDayInfo.long_description }}</p>
            <div class="availability-dates">
              <div class="date-item">
                <span class="date-label">Data disponibilitate:</span>
                <span class="date-value">{{ formatDate(productSpecialDayInfo.date) }}</span>
              </div>
              <div class="date-item" v-if="productSpecialDayInfo.discount">
                <span class="date-label">Discount special:</span>
                <span class="date-value">{{ productSpecialDayInfo.discount }}%</span>
              </div>
            </div>
            <div v-if="productSpecialDayInfo.special_offer" class="special-offer">
              <p>{{ productSpecialDayInfo.special_offer }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading">
    <div class="loader"></div>
    <p>Se încarcă produsul...</p>
  </div>
</template>

<script>
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
  data() {
    return {
      product: null,
      selectedImage: null,
      quantity: 1,
      activeTab: 'ingredients',
      tabs: [
        { id: 'ingredients', name: 'Ingrediente' },
        { id: 'allergens', name: 'Alergeni' },
        { id: 'nutrition', name: 'Nutriție' },
        { id: 'storage', name: 'Păstrare' },
        { id: 'notes', name: 'Note' },
        { id: 'availability', name: 'Disponibilitate' }
      ],
      productThemeInfo: null,
      productSpecialDayInfo: null,
      loading: true
    };
  },
  
  computed: {
    ...mapState('products', ['error']),
    ...mapGetters('products', ['getCurrentProduct']),
    ...mapGetters('themes', ['allThemes', 'currentThemes']),
    ...mapGetters('specialDays', ['getAllSpecialDays']),
    
    isThemeActive() {
      if (!this.productThemeInfo) return true; // No theme association means product is always available from theme perspective
      
      const today = new Date();
      const startDate = new Date(this.productThemeInfo.start_date);
      const endDate = new Date(this.productThemeInfo.end_date);
      
      // Set to end of day for end date
      endDate.setHours(23, 59, 59, 999);
      
      return today >= startDate && today <= endDate && this.productThemeInfo.active !== false;
    },
    
    isSpecialDayActive() {
      if (!this.productSpecialDayInfo) return true; // No special day association means product is always available from special day perspective
      
      const today = new Date();
      const specialDayDate = new Date(this.productSpecialDayInfo.date);
      
      // Check if it's the same day (ignoring time)
      const isSameDay = 
        today.getFullYear() === specialDayDate.getFullYear() &&
        today.getMonth() === specialDayDate.getMonth() &&
        today.getDate() === specialDayDate.getDate();
      
      return isSameDay && this.productSpecialDayInfo.active !== false;
    },
    
    isProductUnavailable() {
      if (!this.product) return true;
      
      // If product has a theme association but the theme is not active
      if (this.productThemeInfo && !this.isThemeActive) return true;
      
      // If product has a special day association but the special day is not active
      if (this.productSpecialDayInfo && !this.isSpecialDayActive) return true;
      
      return false;
    },
    
    // Determines which discount to apply (theme or special day)
    activeDiscountInfo() {
      // Special day discount has higher priority if both are active
      if (this.productSpecialDayInfo && this.isSpecialDayActive && this.productSpecialDayInfo.discount) {
        return {
          type: 'special-day',
          discount: this.productSpecialDayInfo.discount,
          source: this.productSpecialDayInfo.name
        };
      }
      
      // Theme week discount if active
      if (this.productThemeInfo && this.isThemeActive && this.productThemeInfo.special_discount) {
        return {
          type: 'theme',
          discount: this.productThemeInfo.special_discount,
          source: this.productThemeInfo.name
        };
      }
      
      return null; // No active discount
    }
  },
  
  watch: {
    // Re-check theme and special day if the store data changes
    currentThemes: {
      handler() {
        this.checkAndAssociateTheme();
      },
      deep: true
    },
    
    'getAllSpecialDays': {
      handler() {
        this.checkAndAssociateSpecialDay();
      },
      deep: true
    }
  },
  
  async created() {
    const productId = this.$route.params.id;
    try {
      await this.fetchProductData(productId);
    } catch (error) {
      console.error("Eroare la preluarea datelor produsului:", error);
    }
  },
  
  methods: {
    ...mapActions('products', ['fetchProductById']),
    ...mapActions('themes', ['fetchAllThemes']),
    ...mapActions('specialDays', ['fetchAllSpecialDays']),
    ...mapActions('cart', ['addToCart']),
    
    async fetchProductData(productId) {
      this.loading = true;
      try {
        // First, fetch the product
        const productRef = doc(db, "products", productId);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
          const productData = productSnap.data();
          
          this.product = {
            id: productSnap.id,
            ...productData,
            isNew: this.isProductNew(productData.createdAt)
          };
          
          // Set the default selected image
          if (this.product.image) {
            this.selectedImage = this.product.image;
          } else if (this.product.gallery && this.product.gallery.length > 0) {
            this.selectedImage = this.product.gallery[0];
          }
          
          // Fetch all themes and special days to find matching ones for this product
          await Promise.all([
            this.$store.dispatch('themes/fetchAllThemes'),
            this.$store.dispatch('specialDays/fetchAllSpecialDays')
          ]);
          
          // Check if this product belongs to a theme or special day
          await this.checkAndAssociateTheme();
          await this.checkAndAssociateSpecialDay();
          
          // Update the tabs based on available data
          this.updateTabsVisibility();
          
          console.log("Product loaded successfully:", this.product.name);
        } else {
          console.error(`Produsul cu ID-ul ${productId} nu a fost găsit.`);
        }
      } catch (error) {
        console.error("Eroare la preluarea produsului:", error);
      } finally {
        this.loading = false;
      }
    },
    
    async checkAndAssociateTheme() {
      if (!this.product || !this.product.category) return;
      
      // Get all themes
      const themes = this.allThemes;
      
      if (!themes || themes.length === 0) {
        console.log("Nu există teme disponibile pentru a asocia produsul.");
        return;
      }
      
      // Look for any theme that has the same ID or name as the product's category
      const matchingTheme = themes.find(theme => {
        // Match by direct ID comparison
        if (theme.id === this.product.category) return true;
        
        // Match by prefix in ID (french-week matches product category "french")
        const themeIdPrefix = theme.id.split('-')[0];
        if (themeIdPrefix === this.product.category) return true;
        
        // Match by theme name containing the category (case insensitive)
        if (theme.name && theme.name.toLowerCase().includes(this.product.category.toLowerCase())) return true;
        
        // If there's a product_categories array in the theme, check if it includes this category
        if (theme.product_categories && Array.isArray(theme.product_categories)) {
          return theme.product_categories.includes(this.product.category);
        }
        
        // If theme has explicit product IDs, check if this product is included
        if (theme.products_ids && Array.isArray(theme.products_ids)) {
          return theme.products_ids.includes(this.product.id);
        }
        
        return false;
      });
      
      if (matchingTheme) {
        console.log(`Produs asociat cu tema: ${matchingTheme.name}`);
        this.productThemeInfo = matchingTheme;
      } else {
        // No match found - product is not theme-restricted
        this.productThemeInfo = null;
      }
    },
    
    async checkAndAssociateSpecialDay() {
      if (!this.product) return;
      
      // Get all special days
      const specialDays = this.getAllSpecialDays;
      
      if (!specialDays || specialDays.length === 0) {
        console.log("Nu există zile speciale disponibile pentru a asocia produsul.");
        return;
      }
      
      // Look for any special day that matches this product
      const matchingSpecialDay = specialDays.find(day => {
        // Direct special_day_id check if product has this field
        if (this.product.special_day_id && this.product.special_day_id === day.id) return true;
        
        // Check by category/keyword matching
        if (this.product.category && day.keyword === this.product.category) return true;
        
        // If the special day has a theme_id, check if it matches the product's category
        if (day.theme_id && this.product.category && day.theme_id.includes(this.product.category)) return true;
        
        // Check by prefix match (valentine-day and product valentine-choco-1)
        if (this.product.id) {
          const dayIdPrefix = day.id.split('-')[0];
          if (dayIdPrefix && this.product.id.startsWith(dayIdPrefix + '-')) return true;
        }
        
        // Check if product is in special day's products_ids array
        if (day.products_ids && Array.isArray(day.products_ids)) {
          return day.products_ids.includes(this.product.id);
        }
        
        return false;
      });
      
      if (matchingSpecialDay) {
        console.log(`Produs asociat cu ziua specială: ${matchingSpecialDay.name}`);
        this.productSpecialDayInfo = matchingSpecialDay;
      } else {
        // No match found - product is not special day restricted
        this.productSpecialDayInfo = null;
      }
    },
    
    updateTabsVisibility() {
      // Start with all available tabs
      this.tabs = [
        { id: 'ingredients', name: 'Ingrediente' },
        { id: 'allergens', name: 'Alergeni' },
        { id: 'nutrition', name: 'Nutriție' },
        { id: 'storage', name: 'Păstrare' }
      ];
      
      // Add Notes tab if product has special notes
      if (this.product.special_notes) {
        this.tabs.push({ id: 'notes', name: 'Note' });
      }
      
      // Add Availability tab if product is associated with a theme or special day
      if (this.productThemeInfo || this.productSpecialDayInfo) {
        this.tabs.push({ id: 'availability', name: 'Disponibilitate' });
      }
    },
    
    isProductNew(createdAt) {
      if (!createdAt) return false;
      
      let creationDate;
      if (typeof createdAt === 'string') {
        creationDate = new Date(createdAt);
      } else if (createdAt.toDate) {
        // Handle Firestore Timestamp
        creationDate = createdAt.toDate();
      } else {
        creationDate = new Date(createdAt);
      }
      
      const today = new Date();
      const daysDifference = Math.floor((today - creationDate) / (1000 * 60 * 60 * 24));
      return daysDifference <= 14; // New if added in the last 14 days
    },
    
    incrementQuantity() {
      this.quantity++;
    },
    
    decrementQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    
    addToCart() {
      // Check if product is available before adding to cart
      if (this.isProductUnavailable) {
        return;
      }
      
      // Apply discount if applicable (from theme or special day)
      let price = this.product.price;
      let discountApplied = false;
      let discountSource = null;
      
      if (this.activeDiscountInfo) {
        price = this.calculateDiscountedPrice(price, this.activeDiscountInfo.discount);
        discountApplied = true;
        discountSource = this.activeDiscountInfo.source;
      }
      
      // Prepare product info for cart with availability restrictions
      const productInfo = {
        ...this.product,
        price: price,
        originalPrice: discountApplied ? this.product.price : null
      };
      
      // Add theme/special day info if applicable
      if (this.productThemeInfo) {
        productInfo.themeInfo = {
          id: this.productThemeInfo.id,
          name: this.productThemeInfo.name,
          end_date: this.productThemeInfo.end_date
        };
      }
      
      if (this.productSpecialDayInfo) {
        productInfo.specialDayInfo = {
          id: this.productSpecialDayInfo.id,
          name: this.productSpecialDayInfo.name,
          date: this.productSpecialDayInfo.date
        };
      }
      
      // Add discount source information if a discount was applied
      if (discountApplied) {
        productInfo.discountInfo = {
          source: discountSource,
          percentage: this.activeDiscountInfo.discount,
          originalPrice: this.product.price
        };
      }
      
      this.$store.dispatch('cart/addToCart', {
        product: productInfo,
        quantity: this.quantity
      });
      
      if (this.$toast) {
        this.$toast.success(`${this.product.name} a fost adăugat în coș!`);
      } else {
        alert(`Produsul ${this.product.name} a fost adăugat în coș (${this.quantity} bucăți)`);
      }
    },
    
    calculateDiscountedPrice(price, discountPercentage) {
      return parseFloat((price * (100 - discountPercentage) / 100).toFixed(2));
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}.${month}.${year}`;
    }
  }
};
</script>

<style scoped>
/* Keep original styles and add new ones */
.product-detail-container {
  max-width: 1200px;
  margin: 4rem auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 4rem;
  font-family: 'Montserrat', sans-serif;
  color: #222;
}

/* Add new badge styles */
.product-badge.limited {
  background-color: #e53935;
  color: white;
}

/* Add new availability notice styles */
.availability-notice {
  margin: 1.5rem 0;
  padding: 1.2rem;
  border-radius: 4px;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.theme-week {
  background-color: rgba(245, 124, 0, 0.05);
  border-left: 3px solid #f57c00;
}

.special-day {
  background-color: rgba(156, 39, 176, 0.05);
  border-left: 3px solid #9c27b0;
}

.notice-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.notice-text h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

.notice-text p {
  margin: 0;
  font-size: 0.8rem;
  color: #666;
  line-height: 1.5;
}

/* Modify tag styles */
.tag.theme-tag {
  background-color: #fff3e0;
  color: #e65100;
}

.tag.special-tag {
  background-color: #f3e5f5;
  color: #6a1b9a;
}

/* Add disabled button styles */
.add-to-cart-btn.disabled {
  background-color: #e0e0e0;
  color: #9e9e9e;
  cursor: not-allowed;
}

/* Availability tab styles */
.availability-info {
  margin-bottom: 2rem;
}

.availability-info h3 {
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.6rem;
}

.availability-info p {
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: #555;
  line-height: 1.6;
}

.availability-dates {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  background-color: #f9f9f9;
  padding: 1.2rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.date-item {
  display: flex;
  justify-content: space-between;
}

.date-label {
  font-size: 0.85rem;
  color: #777;
}

.date-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

.special-offer {
  padding: 1rem;
  background-color: #e8f5e9;
  border-left: 3px solid #4caf50;
  border-radius: 0 4px 4px 0;
  margin-top: 1rem;
}

.special-offer p {
  margin: 0;
  font-size: 0.9rem;
  color: #2e7d32;
  font-weight: 500;
}

/* Add discount label styles */
.discount-label {
  background-color: #d50000;
  color: white;
  padding: 0.2rem 0.4rem;
  border-radius: 2px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-left: 8px;
}
.product-detail-container {
  max-width: 1200px;
  margin: 4rem auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 4rem;
  font-family: 'Montserrat', sans-serif;
  color: #222;
}

/* Gallery Section */
.product-gallery {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
}

.main-image {
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  position: relative;
  background-color: #fafafa;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.main-image:hover .product-image {
  transform: scale(1.02);
}

.product-badge {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 0.4rem 0.8rem;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  z-index: 10;
  font-family: 'Montserrat', sans-serif;
}

.product-badge.new {
  background-color: #222;
  color: white;
}

.thumbnail-gallery {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: thin;
}

.thumbnail-gallery::-webkit-scrollbar {
  height: 4px;
}

.thumbnail-gallery::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.thumbnail-gallery::-webkit-scrollbar-thumb {
  background: #ddd;
}

.thumbnail-wrapper {
  width: 75px;
  height: 75px;
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.thumbnail-wrapper:hover {
  opacity: 0.9;
}

.thumbnail-wrapper.active {
  opacity: 1;
  border: 1px solid #222;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Product Info Section */
.product-info {
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
}

.product-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 1.5rem;
}

.product-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 2.2rem;
  font-weight: 300;
  margin: 0 0 1rem 0;
  color: #111;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.product-price {
  font-size: 1.8rem;
  font-weight: 500;
  color: #111;
  display: flex;
  align-items: baseline;
}

.product-price span {
  font-size: 1.1rem;
  margin-left: 4px;
  font-weight: 400;
  color: #666;
}

.product-description {
  font-size: 1rem;
  color: #555;
  line-height: 1.8;
  font-weight: 300;
  letter-spacing: 0.2px;
}

.product-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 1.5rem;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.meta-item {
  flex: 1;
  min-width: 150px;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.meta-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 50%;
  color: #333;
}

.meta-content h3 {
  font-size: 0.7rem;
  margin: 0 0 0.3rem 0;
  color: #777;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
}

.meta-content p {
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  color: #222;
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin: 0.5rem 0;
}

.tag {
  background-color: #f4f4f4;
  color: #555;
  padding: 0.3rem 0.8rem;
  border-radius: 2px;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
}

.tag:hover {
  background-color: #eaeaea;
}

.product-actions {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  align-items: center;
}

.quantity-selector {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 2px;
  overflow: hidden;
}

.quantity-btn {
  width: 36px;
  height: 42px;
  border: none;
  background-color: #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #222;
}

.quantity-symbol {
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1;
}

.quantity-btn:hover {
  background-color: #f5f5f5;
}

.quantity-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.quantity-input {
  width: 50px;
  height: 42px;
  border: none;
  border-left: 1px solid #eee;
  border-right: 1px solid #eee;
  text-align: center;
  font-size: 1rem;
  color: #333;
  background-color: white;
  font-weight: 400;
}

.add-to-cart-btn {
  flex: 1;
  height: 42px;
  padding: 0 1.5rem;
  background-color: #222;
  color: white;
  border: none;
  border-radius: 2px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: 0.5px;
}

.add-to-cart-btn:hover {
  background-color: #000;
}

/* Product Details Section */
.product-details {
  margin-top: 1rem;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  grid-column: 1 / -1;
}

.details-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  background-color: #fcfcfc;
}

.details-tabs::-webkit-scrollbar {
  display: none;
}

.tab-button {
  padding: 1.2rem 1.8rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 0.85rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.tab-button:hover {
  color: #222;
}

.tab-button.active {
  color: #222;
  border-bottom: 2px solid #222;
  font-weight: 600;
}

.details-content {
  padding: 2.5rem;
}

.tab-content {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.tab-content h2 {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #222;
  font-weight: 300;
  position: relative;
  padding-bottom: 0.8rem;
  letter-spacing: -0.3px;
}

.tab-content h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 1px;
  background-color: #222;
}

.ingredients-list {
  padding-left: 1.2rem;
  margin: 0;
  list-style-type: square;
}

.ingredients-list li {
  margin-bottom: 0.7rem;
  color: #444;
  font-size: 0.95rem;
  line-height: 1.5;
}

.allergens {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.allergen {
  background-color: #f0f0f0;
  color: #444;
  padding: 0.4rem 0.8rem;
  border-radius: 2px;
  font-size: 0.85rem;
  font-weight: 400;
  border: 1px solid #e0e0e0;
}

.nutritional-table {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 500px;
}

.nutritional-row {
  display: flex;
  justify-content: space-between;
  padding: 0.9rem 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.95rem;
}

.nutritional-row:last-child {
  border-bottom: none;
}

.nutritional-row span:first-child {
  color: #555;
  font-weight: 400;
}

.nutritional-row span:last-child {
  color: #222;
  font-weight: 500;
}

/* Loading state */
.loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  gap: 1.5rem;
}

.loader {
  width: 40px;
  height: 40px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #222;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading p {
  font-size: 1rem;
  color: #666;
  letter-spacing: 0.5px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive styles */
@media (min-width: 768px) {
  .product-detail-container {
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
  }
  
  .product-details {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .product-detail-container {
    margin: 2rem auto;
    padding: 0 1.5rem;
    gap: 2.5rem;
  }
  
  .product-title {
    font-size: 1.8rem;
  }
  
  .product-price {
    font-size: 1.6rem;
  }
  
  .meta-item {
    flex-basis: 100%;
  }
  
  .tab-button {
    padding: 1rem 1.4rem;
    font-size: 0.8rem;
  }
  
  .details-content {
    padding: 2rem 1.5rem;
  }
}

/* Enhanced Mobile Cart Styling */

/* Modify the existing media query for mobile devices */
@media (max-width: 480px) {
  .product-actions {
    /* Keep the same horizontal layout */
    display: flex;
    gap: 10px;
    align-items: center;
  }
  
  .quantity-selector {
    /* Same elegant styling */
    height: 34px;
    min-width: unset; /* Remove any minimum width constraints */
  }
  
  .quantity-btn {
    width: 28px;
    height: 34px;
  }
  
  .quantity-input {
    width: 34px;
    height: 34px;
  }
  
  .add-to-cart-btn {
    height: 34px;
    /* Ensure text doesn't wrap */
    white-space: nowrap;
  }
}

/* For very small screens - adjustments that maintain elegance */
@media (max-width: 359px) {
  .quantity-selector {
    flex: 0 0 auto; /* Don't allow the selector to grow */
  }
  
  .add-to-cart-btn {
    padding: 0 10px; /* Slightly reduce padding */
  }
}
/* Minimalist Elegant Cart Design */

@media (max-width: 767px) {
  /* Product actions - clean horizontal layout */
  .product-actions {
    display: flex;
    gap: 10px;
    margin: 14px 0;
    align-items: center;
  }
  
  /* Minimalist quantity selector */
  .quantity-selector {
    display: flex;
    align-items: center;
    height: 34px;
    border: 1px solid #e5e5e5;
    border-radius: 5px;
    overflow: hidden;
    background-color: white;
  }
  
  .quantity-btn {
    width: 28px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: none;
    color: #777;
    font-weight: normal;
    padding: 0;
  }
  
  .quantity-symbol {
    font-size: 0.9rem;
  }
  
  .quantity-input {
    width: 34px;
    height: 34px;
    border: none;
    border-left: 1px solid #f0f0f0;
    border-right: 1px solid #f0f0f0;
    text-align: center;
    font-size: 0.85rem;
    color: #333;
    padding: 0;
    background-color: white;
  }
  
  /* Refined add to cart button */
  .add-to-cart-btn {
    flex: 1;
    height: 34px;
    border-radius: 5px;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.3px;
    text-transform: uppercase;
    background-color: #222;
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 0 12px;
  }
  
  .add-to-cart-btn svg {
    width: 14px;
    height: 14px;
  }
  
  /* Hide spinner on number input */
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  input[type="number"] {
    -moz-appearance: textfield;
  }
}


</style>