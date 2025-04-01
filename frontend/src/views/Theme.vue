<template>
  <div class="theme-detail-page">
    <!-- Hero Banner -->
    <div
      v-if="theme"
      class="page-hero"
      :style="{ backgroundImage: `url(${getBannerImage(theme)})` }"
    >
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <router-link to="/themes" class="back-link">
          <span class="back-arrow">←</span>
          <span>Înapoi la toate temele</span>
        </router-link>
        <span class="theme-badge" :class="theme.theme_type || 'week'">
          {{ theme.theme_type === 'day' ? 'Ziua tematică' : 'Săptămâna tematică' }}
        </span>
        <h1>{{ theme.name }}</h1>
        <p class="hero-description">{{ theme.description }}</p>
        <div class="hero-cta">
          <CountdownTimer 
            v-if="isActive || isUpcoming"
            :targetDate="isActive ? theme.end_date : theme.start_date" 
            :title="isActive ? 'Se termină în:' : 'Începe în:'"
            @countdown-finished="refreshTheme"
          />
          <div class="theme-date-range">
            <span class="date-label">Perioada:</span>
            <span class="date-value">{{ formatDateRange(theme.start_date, theme.end_date) }}</span>
          </div>
          <div v-if="theme.special_discount" class="discount-badge">
            <span>{{ theme.special_discount }}% REDUCERE</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-else-if="loading" class="loading-container">
      <div class="loader"></div>
      <p>Se încarcă detaliile temei...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <router-link to="/themes" class="theme-button">Înapoi la toate temele</router-link>
    </div>
    
    <!-- Theme Content (if theme exists) -->
    <div v-if="theme" class="theme-content">
      <!-- Long Description Section -->
      <section class="theme-description-section">
        <div class="container">
          <h2 class="section-title">Despre {{ theme.name }}</h2>
          <div class="description-content">
            <p>{{ theme.long_description }}</p>
          </div>
        </div>
      </section>
      
      <!-- Featured Products Section -->
      <section v-if="!loading && themeProducts && themeProducts.length > 0" class="featured-products-section">
        <div class="container">
          <h2 class="section-title">Produse în Evidență</h2>
          <div class="products-grid">
            <div v-for="(product, index) in themeProducts" :key="index" class="product-card">
              <router-link :to="`/products/${product.id}`" class="product-link">
                <!-- Product Image or Placeholder -->
                <div v-if="product.image" class="product-image">
                  <img :src="product.image" :alt="product.name" class="product-img">
                </div>
                
                <!-- Fallback with colored placeholder if no image -->
                <div v-else class="product-image-placeholder" :style="{ backgroundColor: generatePastelColor(index) }">
                  <span>{{ product.name.charAt(0) }}</span>
                </div>
              </router-link>
              
              <div class="product-info">
                <h3 class="product-name">{{ product.name }}</h3>
                
                <!-- Product tags/allergens display -->
                <div class="product-tags" v-if="product.tags && product.tags.length">
                  <span v-for="tag in product.tags.slice(0, 3)" :key="tag" class="product-tag">{{ tag }}</span>
                </div>
                
                <!-- Allergen information with icons -->
                <div class="allergen-info" v-if="product.allergens">
                  <span v-for="allergen in product.allergens" :key="allergen" class="allergen-badge">
                    {{ allergen }}
                  </span>
                </div>
                
                <p v-if="product.price" class="product-price">
                  <span :class="{ 'old-price': theme.special_discount }">{{ product.price }} lei</span>
                  <span v-if="theme.special_discount" class="discounted-price">
                    {{ calculateDiscountedPrice(product.price, theme.special_discount) }} lei
                  </span>
                </p>
                
                <router-link :to="`/products/${product.id}`" class="product-link-button">
                  Vezi produs
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Fallback Featured Products Section (only if NOT loading and 0 products) -->
      <section v-else-if="!loading && themeProducts && themeProducts.length === 0" class="featured-products-section">
        <div class="container">
          <h2 class="section-title">Produse în Evidență</h2>
          
          <!-- Mesaj de informare pentru utilizator -->
          <div class="info-message">
            <p>Produsele pentru această temă se încarcă în curând...</p>
          </div>
          
          <!-- Grid cu carduri placeholder pentru produse -->
          <div class="products-grid">
            <div v-for="index in 6" :key="index" class="product-card product-placeholder">
              <div class="product-image-placeholder" :style="{ backgroundColor: generatePastelColor(index) }">
                <span>{{ index }}</span>
              </div>
              <div class="product-info">
                <div class="placeholder-line" style="width: 80%; height: 24px; margin-bottom: 10px;"></div>
                <div class="placeholder-line" style="width: 60%; height: 18px; margin-bottom: 15px;"></div>
                <div class="placeholder-line" style="width: 40%; height: 20px; margin: 10px auto;"></div>
                <div class="placeholder-button"></div>
              </div>
            </div>
          </div>
          
          <!-- Sfat pentru administrator -->
          <div class="debug-message">
            <p>Sugestie pentru dezvoltator: Asigură-te că produsele au ID-uri care încep cu prefixul temei (ex: french-1, french-2) sau că products_ids din tema din Firestore conține ID-urile corecte.</p>
          </div>
        </div>
      </section>
      
      <!-- Recommended Themes Section -->
      <section v-if="recommendedThemes.length > 0" class="recommended-themes-section">
        <div class="container">
          <h2 class="section-title">Alte teme care te-ar putea interesa</h2>
          <div class="themes-grid">
            <ThemeCard 
              v-for="recTheme in recommendedThemes" 
              :key="recTheme.id" 
              :theme="recTheme" 
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import ThemeCard from '@/components/themes/ThemeCard.vue'
import CountdownTimer from '@/components/themes/CountdownTimer.vue'

export default {
  name: 'ThemeDetail',
  components: {
    ThemeCard,
    CountdownTimer
  },
  data() {
    return {
      loading: true,
      error: null,
      themeProducts: [] // Adăugat pentru a stoca produsele temei
    };
  },
  computed: {
    themeId() {
      // Always prioritize route params first
      const routeId = this.$route.params.id;
      if (routeId) return routeId;
      
      // Fallback to active theme from store
      const activeTheme = this.$store.getters['themes/activeTheme'];
      return activeTheme ? activeTheme.id : null;
    },
    theme() {
      // First try the direct ID lookup
      const themeById = this.$store.getters['themes/getThemeById'](this.themeId);
      if (themeById) {
        return themeById;
      }
      
      // If no direct match, try to find by prefix (for URLs like french-week)
      const routePrefix = this.themeId ? this.themeId.split('-')[0] : null;
      if (routePrefix) {
        const allThemes = this.$store.getters['themes/allThemes'];
        const matchByPrefix = allThemes.find(t => t.id.startsWith(routePrefix));
        if (matchByPrefix) {
          return matchByPrefix;
        }
      }
      
      // As a last resort, try to match by exact path (in case ID has been encoded)
      const route = this.$route.path.split('/').pop();
      if (route && route !== this.themeId) {
        const themeByRoute = this.$store.getters['themes/getThemeById'](route);
        if (themeByRoute) {
          return themeByRoute;
        }
      }
      
      // No theme found
      return null;
    },
    allThemes() {
      return this.$store.getters['themes/allThemes'];
    },
    isActive() {
      if (!this.theme) return false;
      const today = new Date();
      const startDate = new Date(this.theme.start_date);
      const endDate = new Date(this.theme.end_date);
      return today >= startDate && today <= endDate;
    },
    isUpcoming() {
      if (!this.theme) return false;
      const today = new Date();
      const startDate = new Date(this.theme.start_date);
      return startDate > today;
    },
    isPast() {
      if (!this.theme) return false;
      const today = new Date();
      const endDate = new Date(this.theme.end_date);
      return endDate < today;
    },
    recommendedThemes() {
      if (!this.theme || !this.allThemes.length) return [];
      
      // Filter out current theme and get up to 3 other themes
      return this.allThemes
        .filter(t => t.id !== this.themeId)
        .sort(() => 0.5 - Math.random()) // Simple shuffling
        .slice(0, 3);
    }
  },
  methods: {
    formatDateRange(startDate, endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return `${start.toLocaleDateString('ro-RO')} - ${end.toLocaleDateString('ro-RO')}`;
    },
    async refreshTheme() {
      try {
        await this.$store.dispatch('themes/fetchThemeById', this.themeId);
        // Actualizăm și produsele temei
        await this.loadThemeProducts();
      } catch (err) {
        this.error = 'Nu am putut actualiza informațiile temei.';
      }
    },
    generatePastelColor(index) {
      // Generate a soft pastel color based on the index
      const hue = (index * 60) % 360;
      return `hsl(${hue}, 70%, 85%)`;
    },
    getBannerImage(theme) {
      // Check both image and banner properties, and provide a fallback
      if (theme.banner && theme.banner.startsWith('http')) {
        return theme.banner;
      } else if (theme.image && theme.image.startsWith('http')) {
        return theme.image;
      } else if (theme.banner && !theme.banner.startsWith('http')) {
        // If banner exists but is not a full URL, it might be a relative path
        return `${process.env.VUE_APP_IMAGE_BASE_URL || ''}${theme.banner}`;
      } else if (theme.image && !theme.image.startsWith('http')) {
        // Same for image
        return `${process.env.VUE_APP_IMAGE_BASE_URL || ''}${theme.image}`;
      }
      // Fallback image
      return 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1526&auto=format&fit=crop';
    },
    calculateDiscountedPrice(price, discount) {
      if (!price || !discount) return price;
      const discountedPrice = price - (price * (discount / 100));
      return discountedPrice.toFixed(2);
    },
    
    // Check if a product has a specific allergen
    hasAllergen(product, allergenName) {
      if (!product.allergens || !Array.isArray(product.allergens)) {
        return false;
      }
      return product.allergens.some(allergen => 
        allergen.toLowerCase().includes(allergenName.toLowerCase())
      );
    },
    
    // Metoda loadThemeProducts pentru Theme.vue
    async loadThemeProducts() {
      try {
        console.log('Încărcare produse tematice pentru tema:', this.themeId);
        
        // Make sure we have theme data before proceeding
        if (!this.theme) {
          console.log('Nu avem tema încărcată, abandonăm încărcarea produselor');
          return;
        }
        
        // Clear existing products first to avoid confusion
        this.themeProducts = [];
        
        // PRIORITY 1: Use products_ids from theme
        if (this.theme.products_ids && this.theme.products_ids.length > 0) {
          console.log('Încărcăm produse folosind products_ids din temă:', this.theme.products_ids);
          
          // Fetch products directly by IDs - this will also update the store
          const fetchedProducts = await this.$store.dispatch('products/fetchByIds', this.theme.products_ids);
          
          if (fetchedProducts && fetchedProducts.length > 0) {
            this.themeProducts = fetchedProducts;
            console.log(`Încărcate ${fetchedProducts.length} produse prin fetchByIds`);
            return; // Exit if successful
          }
        }
        
        // PRIORITY 2: Try with prefix from URL
        const routeThemeId = this.$route.params.id;
        if (routeThemeId) {
          const themePrefixMatch = routeThemeId.match(/^([a-z]+)-/);
          const themePrefix = themePrefixMatch ? themePrefixMatch[1] : null;
          
          if (themePrefix) {
            console.log('Căutare produse după prefixul extras din URL:', themePrefix);
            const allProducts = this.$store.getters['products/getAllProducts'];
            const prefixProducts = allProducts.filter(product => 
              product.id && product.id.startsWith(themePrefix + '-'));
            
            if (prefixProducts.length > 0) {
              this.themeProducts = prefixProducts;
              console.log(`Găsite ${prefixProducts.length} produse folosind prefixul ${themePrefix}`);
              return; // Exit if successful
            }
          }
        }
        
        // PRIORITY 3: Try with prefix from theme ID
        if (this.theme && this.theme.id) {
          const themeIdParts = this.theme.id.split('-');
          const prefix = themeIdParts[0];
          
          if (prefix) {
            console.log('Încercăm cu prefixul din tema stocată:', prefix);
            const allProducts = this.$store.getters['products/getAllProducts'];
            const prefixProducts = allProducts.filter(product => 
              product.id && product.id.startsWith(prefix + '-'));
            
            if (prefixProducts.length > 0) {
              this.themeProducts = prefixProducts;
              console.log(`Găsite ${prefixProducts.length} produse folosind prefixul ${prefix}`);
              return; // Exit if successful
            }
          }
        }
        
        // PRIORITY 4: Try with featured_products names
        if (this.theme.featured_products && this.theme.featured_products.length > 0) {
          console.log('Încercăm să găsim produse după numele din featured_products');
          const allProducts = this.$store.getters['products/getAllProducts'];
          const productsByName = allProducts.filter(product => 
            this.theme.featured_products.includes(product.name));
          
          if (productsByName.length > 0) {
            this.themeProducts = productsByName;
            console.log(`Găsite ${productsByName.length} produse după nume`);
            return; // Exit if successful
          }
        }
        
        // No products found with any method
        console.log('REZULTAT FINAL: Nu s-au găsit produse pentru această temă.');
        
      } catch (error) {
        console.error('Error loading theme products:', error);
      }
    }
  },

  watch: {
    // Observăm schimbările de rută pentru a reîncărca produsele când utilizatorul navighează între teme
    '$route.params.id': async function(newId, oldId) {
      if (newId !== oldId) {
        console.log(`Rută schimbată de la ${oldId} la ${newId}, reîncărcăm tema și produsele`);
        this.loading = true;
        try {
          // Încarcă noua temă după ID
          await this.$store.dispatch('themes/fetchThemeById', newId);
          
          // Reîncarcă produsele pentru noua temă
          await this.loadThemeProducts();
        } catch (err) {
          console.error('Error loading theme on route change:', err);
          this.error = 'Nu am putut încărca detaliile temei.';
        } finally {
          this.loading = false;
        }
      }
    }
  },
  async created() {
    this.loading = true;
    this.error = null; // Clear any existing errors
    
    try {
      const themeId = this.themeId;
      console.log('ID-ul temei din URL:', themeId);
      
      if (!themeId) {
        this.error = 'ID-ul temei lipsește din URL.';
        this.loading = false;
        return;
      }
      
      // First make sure all themes are loaded (this helps with refreshing)
      await this.$store.dispatch('themes/fetchAllThemes');
      
      // Then try to fetch the specific theme
      await this.$store.dispatch('themes/fetchThemeById', themeId);
      
      // Double-check if theme was loaded through computed property
      if (!this.theme) {
        console.error('Tema nu a putut fi găsită după fetch:', themeId);
        this.error = 'Tema căutată nu a fost găsită.';
        this.loading = false;
        return;
      }
      
      console.log('Theme loaded:', this.theme);
      
      // Now load products
      await this.$store.dispatch('products/fetchProducts');
      await this.loadThemeProducts();
      
    } catch (err) {
      console.error('Error loading theme:', err);
      this.error = 'Nu am putut încărca detaliile temei.';
    } finally {
      this.loading = false;
    }
  }
}
</script>

<style scoped>
/* -------------------------------------------
   Overall Page & Typography
------------------------------------------- */
.theme-detail-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
  color: #3a3a3a;
  background-color: #fcfcfc;
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* -------------------------------------------
   Loading & Error States
------------------------------------------- */
.loading-container,
.error-container {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #333;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 2s linear infinite;
  margin-bottom: 2rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* -------------------------------------------
   Hero Section
------------------------------------------- */
.page-hero {
  position: relative;
  height: 80vh;
  min-height: 600px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5rem;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.3),
    rgba(0,0,0,0.6)
  );
}

.hero-content {
  text-align: center;
  color: #fff;
  max-width: 900px;
  padding: 0 2rem;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.back-link {
  align-self: flex-start;
  color: #fff;
  text-decoration: none;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  padding: 0.5rem 1rem;
  background-color: rgba(255,255,255,0.1);
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.back-link:hover {
  background-color: rgba(255,255,255,0.2);
}

.back-arrow {
  margin-right: 0.5rem;
}

.hero-content .theme-badge {
  margin-bottom: 1rem;
  background-color: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.9rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
}

.hero-content h1 {
  font-size: 3.8rem;
  font-weight: 300;
  letter-spacing: 1px;
  margin-bottom: 1.2rem;
  text-shadow: 0 2px 5px rgba(0,0,0,0.2);
  font-family: 'Cormorant Garamond', serif;
}

.hero-content .hero-description {
  font-size: 1.3rem;
  line-height: 1.4;
  max-width: 600px;
  margin-bottom: 2rem;
  text-shadow: 0 1px 4px rgba(0,0,0,0.3);
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
}

/* -------------------------------------------
   Hero CTA: Countdown + Date Range + Discount
------------------------------------------- */
.hero-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
}

.hero-cta :deep(.countdown-container) {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border-radius: 4px;
  padding: 2rem;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 600px;
}

.hero-cta :deep(.countdown-title) {
  color: #fff;
  margin-bottom: 1.5rem;
}

.hero-cta :deep(.time-value) {
  background-color: rgba(255, 255, 255, 0.9);
}

.hero-cta :deep(.time-label) {
  color: #fff;
}

.hero-cta :deep(.time-separator) {
  color: #fff;
}

.theme-date-range {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  padding: 1rem 2rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: 'Montserrat', sans-serif;
}

.date-label {
  font-weight: 500;
  letter-spacing: 1px;
}

.date-value {
  font-weight: 300;
}

.discount-badge {
  background-color: rgba(220, 53, 69, 0.8);
  color: white;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  letter-spacing: 1px;
  margin-top: 0.5rem;
}

/* -------------------------------------------
   Content Sections
------------------------------------------- */
.theme-content {
  margin-bottom: 5rem;
}

.section-title {
  text-align: center;
  margin: 5rem 0 3rem;
  color: #333;
  position: relative;
  font-size: 2.2rem;
  font-weight: 300;
  letter-spacing: 1px;
}

.section-title::after {
  content: '';
  display: block;
  width: 40px;
  height: 1px;
  background-color: #333;
  margin: 1.5rem auto 0;
}

.theme-description-section {
  margin-bottom: 4rem;
}

.description-content {
  max-width: 800px;
  margin: 0 auto;
  font-size: 1.2rem;
  line-height: 1.8;
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
  text-align: center;
}

/* -------------------------------------------
   Featured Products Section
------------------------------------------- */
.featured-products-section {
  margin-bottom: 5rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2.5rem;
  margin-bottom: 3rem;
}

.product-card {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border: 1px solid #eee;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.1);
}

.product-link {
  display: block;
  height: 280px;
  overflow: hidden;
  position: relative;
}

.product-image {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-img {
  transform: scale(1.05);
}

.product-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image-placeholder span {
  font-size: 3rem;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.product-info {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  text-align: center;
}

.product-name {
  font-size: 1.2rem;
  font-weight: 400;
  margin-bottom: 0.8rem;
  color: #333;
  font-family: 'Cormorant Garamond', serif;
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.product-tag {
  padding: 0.2rem 0.6rem;
  background-color: #f9f9f9;
  font-size: 0.7rem;
  border-radius: 12px;
  color: #666;
}

.allergen-info {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.allergen-badge {
  padding: 0.2rem 0.6rem;
  background-color: #fff4f4;
  border: 1px solid #ffe6e6;
  font-size: 0.7rem;
  border-radius: 12px;
  color: #d9534f;
}

.product-price {
  margin: 0.8rem 0;
  font-family: 'Montserrat', sans-serif;
  font-size: 1.1rem;
}

.product-price .old-price {
  text-decoration: line-through;
  color: #999;
  margin-right: 10px;
}

.product-price .discounted-price {
  color: #d9534f;
  font-weight: 600;
}

.product-link-button {
  display: inline-block;
  padding: 0.7rem 1.2rem;
  background-color: transparent;
  border: 1px solid #333;
  color: #333;
  text-decoration: none;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.9rem;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  margin-top: auto;
  align-self: center;
}

.product-link-button:hover {
  background-color: #333;
  color: #fff;
}

/* Placeholders styling */
.info-message {
  text-align: center;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 3rem;
  font-family: 'Montserrat', sans-serif;
}

.product-placeholder .placeholder-line {
  background-color: #f3f3f3;
  border-radius: 4px;
  margin: 0 auto;
}

.placeholder-button {
  width: 150px;
  height: 40px;
  background-color: #f3f3f3;
  border-radius: 4px;
  margin: 1rem auto 0;
}

.debug-message {
  padding: 1.5rem;
  background-color: #fff8e1;
  border-radius: 8px;
  margin-top: 3rem;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.9rem;
  color: #856404;
}

/* -------------------------------------------
   Recommended Themes Section
------------------------------------------- */
.recommended-themes-section {
  margin-bottom: 5rem;
}

.themes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 3rem;
  margin-bottom: 5rem;
}

/* Utilizăm stilizarea existentă pentru ThemeCard prin componenta importată */

/* -------------------------------------------
   Responsive Adjustments
------------------------------------------- */
@media (max-width: 992px) {
  .hero-content h1 {
    font-size: 3.2rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2.8rem;
  }
  
  .hero-content .hero-description {
    font-size: 1.1rem;
  }
  
  .section-title {
    font-size: 1.8rem;
    margin: 4rem 0 2.5rem;
  }
  
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  .product-link {
    height: 220px;
  }
  
  .product-name {
    font-size: 1rem;
  }
  
  .product-price {
    font-size: 0.9rem;
  }
  
  .themes-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
  }
}

@media (max-width: 576px) {
  .page-hero {
    min-height: 500px;
  }
  
  .hero-content h1 {
    font-size: 2.2rem;
  }
  
  .hero-content .hero-description {
    font-size: 1rem;
  }
  
  .theme-date-range {
    flex-direction: column;
    padding: 0.8rem 1.5rem;
  }
  
  .section-title {
    font-size: 1.6rem;
    margin: 3rem 0 2rem;
  }
  
  .description-content {
    font-size: 1rem;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .product-card {
    max-width: 320px;
    margin: 0 auto;
  }
  
  .product-link {
    height: 240px;
  }
  
  .themes-grid {
    grid-template-columns: 1fr;
  }
  
  .container {
    padding: 0 1.5rem;
  }
}
</style>