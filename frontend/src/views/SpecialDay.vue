<template>
  <div class="theme-detail-page">
    <!-- Hero Banner -->
    <div
      v-if="specialDay"
      class="page-hero"
      :style="{ backgroundImage: `url(${specialDay.image || specialDay.banner})` }"
    >
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <router-link to="/special-days" class="back-link">
          <span class="back-arrow">←</span>
          <span>Înapoi la toate zilele speciale</span>
        </router-link>
        <span class="theme-badge">Ziua Specială</span>
        <h1>{{ specialDay.name }}</h1>
        <p class="hero-description">{{ specialDay.description }}</p>
        <div class="hero-cta">
          <CountdownTimer
            v-if="isActive || isUpcoming"
            :targetDate="isActive ? specialDayEndDate : specialDay.date"
            :title="isActive ? 'Se termină în:' : 'Începe în:'"
            @countdown-finished="refreshSpecialDay"
          />
          <div class="theme-date-range">
            <span class="date-value">{{ specialDay.date }}</span>
          </div>
          <div v-if="specialDay.discount" class="discount-badge">
            <span>{{ specialDay.discount }}% REDUCERE</span>
          </div>
          <span>{{ specialDay.special_offer }}</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="loading-container">
      <div class="loader"></div>
      <p>Se încarcă detaliile zilei speciale...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <router-link to="/special-days" class="theme-button">
        Înapoi la toate zilele speciale
      </router-link>
    </div>

    <!-- Special Day Content -->
    <div v-if="specialDay" class="theme-content">
      <!-- Long Description Section -->
      <section class="theme-description-section">
        <div class="container">
          <h2 class="section-title">Despre {{ specialDay.name }}</h2>
          <div class="description-content">
            <p>{{ specialDay.long_description }}</p>
          </div>
        </div>
      </section>

<!-- Secțiunea pentru afișarea produselor zilei speciale -->
<section
  v-if="!loading && specialDayProducts && specialDayProducts.length > 0"
  class="featured-products-section"
>
  <div class="container">
    <h2 class="section-title">Produse Disponibile Doar Astăzi</h2>
    <div class="products-grid">
      <div
        v-for="(product, index) in specialDayProducts"
        :key="product.id"
        class="product-card"
      >
        <router-link :to="'/products/' + product.id" class="product-link">
          <div v-if="product.image" class="product-image">
            <img :src="product.image" :alt="product.name" class="product-img" />
          </div>
          <div
            v-else
            class="product-image-placeholder"
            :style="{ backgroundColor: generatePastelColor(index) }"
          >
            <span>{{ product.name.charAt(0) }}</span>
          </div>
        </router-link>
        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          <div class="product-tags" v-if="product.tags && product.tags.length">
            <span
              v-for="tag in product.tags.slice(0, 3)"
              :key="tag"
              class="product-tag"
            >
              {{ tag }}
            </span>
          </div>
          <div class="allergen-info" v-if="product.allergens">
            <span
              v-for="allergen in product.allergens"
              :key="allergen"
              class="allergen-badge"
            >
              {{ allergen }}
            </span>
          </div>
          <p v-if="product.price" class="product-price">
            <span :class="{ 'old-price': specialDay.discount }">
              {{ product.price }} lei
            </span>
            <span v-if="specialDay.discount" class="discounted-price">
              {{ calculateDiscountedPrice(product.price, specialDay.discount) }} lei
            </span>
          </p>
          <router-link
            :to="'/products/' + product.id"
            class="product-link-button"
          >
            Vezi produs
          </router-link>
        </div>
      </div>
    </div>
  </div>
</section>

      <!-- Fallback Featured Products Section (only if NOT loading and 0 products) -->
      <section
        v-else-if="!loading && specialDayProducts && specialDayProducts.length === 0"
        class="featured-products-section"
      >
        <div class="container">
          <h2 class="section-title">Produse Disponibile Doar Astăzi</h2>
          <div class="info-message">
            <p>Produsele pentru această zi specială se încarcă în curând...</p>
          </div>
          <div class="products-grid">
            <div
              v-for="index in 4"
              :key="index"
              class="product-card product-placeholder"
            >
              <div
                class="product-image-placeholder"
                :style="{ backgroundColor: generatePastelColor(index) }"
              >
                <span>{{ index }}</span>
              </div>
              <div class="product-info">
                <div
                  class="placeholder-line"
                  style="width: 80%; height: 24px; margin-bottom: 10px;"
                ></div>
                <div
                  class="placeholder-line"
                  style="width: 60%; height: 18px; margin-bottom: 15px;"
                ></div>
                <div
                  class="placeholder-line"
                  style="width: 40%; height: 20px; margin: 10px auto;"
                ></div>
                <div class="placeholder-button"></div>
              </div>
            </div>
          </div>
          <div class="debug-message">
            <p>
              Sugestie pentru dezvoltator: Asigură-te că produsele au ID-uri care încep
              cu prefixul zilei speciale sau că products_ids din ziua specială conține
              ID-urile corecte.
            </p>
          </div>
        </div>
      </section>

      <!-- Upcoming Special Days Section (optional) -->
      <!-- AICI am păstrat exact structura, dar am asigurat că folosim .theme-card, .theme-card-image, .theme-card-info -->
      <section
        v-if="upcomingSpecialDays.length > 0"
        class="recommended-themes-section"
      >
        <div class="container">
          <h2 class="section-title">Următoarele Zile Speciale</h2>
          <div class="themes-grid">
            <div
              v-for="day in upcomingSpecialDays"
              :key="day.id"
              class="theme-card"
              @click="goToSpecialDay(day.id)"
            >
              <div
                class="theme-card-image"
                :style="{ backgroundImage: `url(${day.image || day.banner})` }"
              ></div>
              <div class="theme-card-info">
                <h3>{{ day.name }}</h3>
                <p>{{ formatDate(day.date) }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import CountdownTimer from '@/components/themes/CountdownTimer.vue'

export default {
  name: 'SpecialDay',
  components: {
    CountdownTimer
  },
  data() {
    return {
      loading: true,
      error: null,
      specialDayProducts: []
    }
  },
  computed: {
    specialDayId() {
      return this.$route.params.id
    },
    specialDay() {
      return this.$store.getters['specialDays/getSpecialDayById'](this.specialDayId)
    },
    allSpecialDays() {
      return this.$store.getters['specialDays/getAllSpecialDays'] || []
    },
    specialDayEndDate() {
      return this.specialDay ? this.getTomorrowDate(this.specialDay.date) : null
    },
    isActive() {
      if (!this.specialDay) return false
      const today = new Date()
      const startDate = new Date(this.specialDay.date)
      const endDate = new Date(this.getTomorrowDate(this.specialDay.date))
      return today >= startDate && today < endDate
    },
    isUpcoming() {
      if (!this.specialDay) return false
      const today = new Date()
      const startDate = new Date(this.specialDay.date)
      return startDate > today
    },
    isPast() {
      if (!this.specialDay) return false
      const today = new Date()
      const endDate = new Date(this.getTomorrowDate(this.specialDay.date))
      return today >= endDate
    },
    upcomingSpecialDays() {
      const today = new Date().toISOString().split('T')[0]
      return this.allSpecialDays
        .filter(day => day.id !== this.specialDayId && day.date > today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3)
    }
  },
  methods: {
    formatDate(dateString) {
      const options = { day: 'numeric', month: 'long', year: 'numeric' }
      return new Date(dateString).toLocaleDateString('ro-RO', options)
    },
    getTomorrowDate(dateString) {
      const date = new Date(dateString)
      date.setDate(date.getDate() + 1)
      return date.toISOString().split('T')[0]
    },
    async refreshSpecialDay() {
      try {
        await this.$store.dispatch('specialDays/fetchSpecialDayById', this.specialDayId)
        await this.loadSpecialDayProducts()
      } catch (err) {
        this.error = 'Nu am putut actualiza informațiile despre ziua specială.'
      }
    },
    generatePastelColor(index) {
      const hue = (index * 60) % 360
      return `hsl(${hue}, 70%, 85%)`
    },
    calculateDiscountedPrice(price, discount) {
      if (!price || !discount) return price
      const discountedPrice = price - price * (discount / 100)
      return discountedPrice.toFixed(2)
    },
    goToSpecialDay(id) {
      this.$router.push({ name: 'special-day', params: { id } })
    },
    // Metoda de încărcare a produselor:
// Metoda de încărcare a produselor:
async loadSpecialDayProducts() {
  try {
    if (!this.specialDay) return;
    this.specialDayProducts = [];
    
    // 1) Dacă în specialDay avem products_ids, le folosim direct:
    if (this.specialDay.products_ids && this.specialDay.products_ids.length > 0) {
      console.log('Using explicit products_ids from special day:', 
        this.specialDay.products_ids
      );
      
      const fetchedProducts = await this.$store.dispatch(
        'products/fetchByIds',
        this.specialDay.products_ids
      );
      
      if (fetchedProducts && fetchedProducts.length > 0) {
        this.specialDayProducts = fetchedProducts;
        console.log(`Found ${fetchedProducts.length} products with explicit IDs`);
        return;
      }
    }
    
    // 2) Dacă avem keyword în ziua specială, căutăm produse după categorie
    if (this.specialDay.keyword) {
      console.log(`Looking for products with category: ${this.specialDay.keyword}`);
      
      const categoryProducts = await this.$store.dispatch(
        'products/fetchProductsByCategory',
        this.specialDay.keyword
      );
      
      if (categoryProducts.length > 0) {
        this.specialDayProducts = categoryProducts;
        console.log(`Found ${categoryProducts.length} products with category ${this.specialDay.keyword}`);
        return;
      } else {
        console.log(`No products found with category ${this.specialDay.keyword}`);
        
        // Fallback: încercăm să filtrăm direct produsele din store
        const allProducts = this.$store.getters['products/getAllProducts'];
        const filteredProducts = allProducts.filter(
          product => product.category === this.specialDay.keyword
        );
        
        if (filteredProducts.length > 0) {
          this.specialDayProducts = filteredProducts;
          console.log(`Found ${filteredProducts.length} products from cache with category ${this.specialDay.keyword}`);
          return;
        }
      }
    }
    
    // 3) Dacă nu avem keyword, încercăm cu prefix din route ID
    let productPrefix;
    const routeSpecialDayId = this.$route.params.id;
    if (routeSpecialDayId) {
      const specialDayPrefixMatch = routeSpecialDayId.match(/^([a-z]+)-/)
      productPrefix = specialDayPrefixMatch ? specialDayPrefixMatch[1] : null;
    }
    
    // 4) Dacă nu am găsit încă prefix, încercăm din specialDay.id
    if (!productPrefix && this.specialDay && this.specialDay.id) {
      const idPrefixMatch = this.specialDay.id.match(/^([a-z]+)-/);
      productPrefix = idPrefixMatch ? idPrefixMatch[1] : null;
    }
    
    if (!productPrefix) {
      console.log('Could not determine product prefix for special day:', this.specialDay.id);
      return;
    }
    
    console.log(`Looking for products with prefix: ${productPrefix}`);
    
    const prefixProducts = await this.$store.dispatch(
      'products/fetchProductsByPrefix',
      productPrefix
    );
    
    if (prefixProducts.length > 0) {
      this.specialDayProducts = prefixProducts;
      console.log(`Found ${prefixProducts.length} products with prefix ${productPrefix}`);
    } else {
      console.log(`No products found with prefix ${productPrefix}`);
      // Fallback: încercăm să filtrăm direct din store
      const allProducts = this.$store.getters['products/getAllProducts'];
      const filteredProducts = allProducts.filter(
        product => product.id && product.id.startsWith(productPrefix + '-')
      );
      
      if (filteredProducts.length > 0) {
        this.specialDayProducts = filteredProducts;
        console.log(`Found ${filteredProducts.length} products from cache with prefix ${productPrefix}`);
      }
    }
  } catch (error) {
    console.error('Error loading special day products:', error);
  }
}
  },
  watch: {
    '$route.params.id': async function (newId, oldId) {
      if (newId !== oldId) {
        this.loading = true
        try {
          await this.$store.dispatch('specialDays/fetchSpecialDayById', newId)
          await this.loadSpecialDayProducts()
        } catch (err) {
          this.error = 'Nu am putut încărca detaliile zilei speciale.'
        } finally {
          this.loading = false
        }
      }
    }
  },
  async created() {
    this.loading = true
    this.error = null
    try {
      if (!this.specialDayId) {
        this.error = 'ID-ul zilei speciale lipsește din URL.'
        this.loading = false
        return
      }
      await this.$store.dispatch('specialDays/fetchAllSpecialDays')
      await this.$store.dispatch('specialDays/fetchSpecialDayById', this.specialDayId)
      if (!this.specialDay) {
        this.error = 'Ziua specială căutată nu a fost găsită.'
        this.loading = false
        return
      }
      await this.$store.dispatch('products/fetchProducts')
      await this.loadSpecialDayProducts()
    } catch (err) {
      this.error = 'Nu am putut încărca detaliile zilei speciale.'
    } finally {
      this.loading = false
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
  padding: 2rem;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
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
  width: 100%;
  padding: 0 10px;
  word-wrap: break-word;
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
.special-offer {
  background-color: rgba(253, 126, 20, 0.8);
  color: white;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  letter-spacing: 0.5px;
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
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2.5rem;
  margin-bottom: 5rem;
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

/* -------------------------------------------
   Section - Upcoming Special Days
   (folosește aceleași stiluri ca "Alte teme")
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

/* Card styling pentru "următoarele zile speciale" - identic cu ThemeCard */
.theme-card {
  position: relative;
  cursor: pointer;
  border: 1px solid #eee;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}
.theme-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}
.theme-card-image {
  position: relative;
  padding-bottom: 56.25%; /* aspect ratio 16:9 */
  background-size: cover;
  background-position: center;
}
.theme-card-info {
  padding: 1rem;
  text-align: center;
}
.theme-card-info h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #333;
  font-family: 'Cormorant Garamond', serif;
}
.theme-card-info p {
  margin: 0;
  font-size: 1rem;
  font-family: 'Montserrat', sans-serif;
  color: #666;
}

/* -------------------------------------------
   Responsive Adjustments
------------------------------------------- */
@media (max-width: 768px) {
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
}
@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  .product-link {
    height: 240px;
  }
  .themes-grid {
    grid-template-columns: 1fr;
  }
}

/* Enhanced Media Queries for Hero Section */

/* Large screens (desktops) */
@media (min-width: 1200px) {
  .video-header {
    height: 85vh;
  }
  
  .main-title {
    font-size: 5.5rem;
    letter-spacing: 8px;
  }
  
  .tagline {
    font-size: 1.6rem;
  }
}

/* Medium screens (laptops, small desktops) */
@media (max-width: 1199px) {
  .video-header {
    height: 80vh;
  }
  
  .main-title {
    font-size: 4.5rem;
    letter-spacing: 6px;
  }
  
  .tagline {
    font-size: 1.5rem;
  }
}

/* Tablets and small laptops */
@media (max-width: 992px) {
  .video-header {
    height: 75vh;
    background-attachment: scroll; /* Fix for iOS */
  }
  
  .main-title {
    font-size: 4rem;
    letter-spacing: 5px;
    margin-bottom: 15px;
  }
  
  .tagline {
    font-size: 1.4rem;
    margin-bottom: 25px;
  }
  
  .header-content {
    max-width: 700px;
  }
}

/* Tablets (portrait) and large phones */
@media (max-width: 768px) {
  .video-header {
    height: 70vh;
  }
  
  .main-title {
    font-size: 3.2rem;
    letter-spacing: 4px;
    margin-bottom: 12px;
  }
  
  .tagline {
    font-size: 1.2rem;
    margin-bottom: 20px;
  }
  
  .header-content {
    max-width: 550px;
  }
}

/* Medium-sized phones */
@media (max-width: 576px) {
  .video-header {
    height: 60vh;
  }
  
  .main-title {
    font-size: 2.6rem;
    letter-spacing: 3px;
    margin-bottom: 10px;
  }
  
  .tagline {
    font-size: 1.1rem;
    margin-bottom: 18px;
    padding: 0 10px;
  }
  
  .header-content {
    width: 90%;
  }
  
  .overlay {
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0.45) 100%);
  }
}

/* Small phones */
@media (max-width: 480px) {
  .video-header {
    height: 50vh;
  }
  
  .main-title {
    font-size: 2.2rem;
    letter-spacing: 2px;
    margin-bottom: 8px;
  }
  
  .tagline {
    font-size: 1rem;
    margin-bottom: 15px;
    line-height: 1.4;
  }
}

/* Very small phones */
@media (max-width: 360px) {
  .video-header {
    height: 45vh;
    min-height: 300px;
  }
  
  .main-title {
    font-size: 1.8rem;
    letter-spacing: 1.5px;
  }
  
  .tagline {
    font-size: 0.9rem;
    padding: 0 5px;
  }
}

/* Height-based media queries for short screens */
@media (max-height: 600px) {
  .video-header {
    height: auto;
    min-height: 350px;
    padding: 50px 0;
  }
}

/* Ensure background image displays correctly */
@media (max-width: 768px) {
  .video-header {
    background-position: center center;
    background-size: cover;
  }
}
@media (max-width: 992px) {
  .page-hero {
    height: auto;
    min-height: 500px;
    padding: 80px 0;
  }
  
  .hero-content {
    padding: 2rem 1.5rem;
  }
  
  .hero-content h1 {
    font-size: 3.2rem;
    margin-bottom: 1rem;
  }
  
  .hero-description {
    font-size: 1.2rem !important;
  }
  
  .hero-cta {
    gap: 1.2rem;
  }
  
  .hero-cta :deep(.countdown-container) {
    padding: 1.5rem;
  }
}

/* Tablets (portrait) and large phones */
@media (max-width: 768px) {
  .page-hero {
    min-height: 450px;
    padding: 70px 0;
    margin-bottom: 3rem;
  }
  
  .hero-content {
    padding: 1.5rem 1rem;
  }
  
  .hero-content h1 {
    font-size: 2.8rem;
    letter-spacing: 0.5px;
    margin-bottom: 0.8rem;
  }
  
  .hero-description {
    font-size: 1.1rem !important;
    max-width: 500px;
    margin-bottom: 1.5rem !important;
  }
  
  .back-link {
    margin-bottom: 1.5rem;
    font-size: 0.8rem;
  }
  
  .hero-content .theme-badge {
    font-size: 0.8rem;
    padding: 0.5rem 1rem;
  }
  
  .hero-cta {
    gap: 1rem;
  }
  
  .hero-cta :deep(.countdown-container) {
    padding: 1.2rem;
    margin-bottom: 0.5rem;
  }
  
  .theme-date-range {
    padding: 0.8rem 1.5rem;
  }
  
  .discount-badge {
    padding: 0.7rem 1.2rem;
  }
}

/* Medium-sized phones */
@media (max-width: 576px) {
  .page-hero {
    min-height: auto; /* Remove fixed height */
    padding: 60px 0;
    margin-bottom: 2.5rem;
  }
  
  .hero-content {
    padding: 1rem;
  }
  
  .hero-content h1 {
    font-size: 2.2rem;
    margin-bottom: 0.7rem;
    word-break: break-word;
    hyphens: auto;
    width: 100%;
  }
  
  .hero-description {
    font-size: 1rem !important;
    line-height: 1.5 !important;
    margin-bottom: 1.2rem !important;
  }
  
  .back-link {
    font-size: 0.75rem;
    padding: 0.4rem 0.8rem;
    margin-bottom: 1.2rem;
  }
  
  .hero-content .theme-badge {
    font-size: 0.75rem;
    padding: 0.4rem 0.8rem;
    margin-bottom: 0.8rem;
  }
  
  .hero-cta {
    width: 100%;
    gap: 0.8rem;
  }
  
  .hero-cta :deep(.countdown-container) {
    padding: 1rem;
    width: 100%;
  }
  
  .theme-date-range {
    width: 100%;
    padding: 0.7rem 1rem;
  }
  
  .discount-badge {
    width: 100%;
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
}

/* Small phones */
@media (max-width: 480px) {
  .page-hero {
    padding: 50px 0;
    margin-bottom: 2rem;
  }
  
  .hero-content h1 {
    font-size: 1.8rem;
    letter-spacing: 0;
    margin-bottom: 0.6rem;
  }
  
  .hero-description {
    font-size: 0.9rem !important;
    margin-bottom: 1rem !important;
  }
  
  .back-link {
    font-size: 0.7rem;
    padding: 0.3rem 0.7rem;
    margin-bottom: 1rem;
  }
  
  .hero-content .theme-badge {
    font-size: 0.7rem;
    padding: 0.3rem 0.7rem;
    margin-bottom: 0.7rem;
  }
  
  .hero-cta {
    gap: 0.7rem;
  }
  
  .hero-cta :deep(.countdown-container) {
    padding: 0.8rem;
  }
  
  .hero-cta :deep(.countdown-title) {
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
  
  .hero-cta :deep(.time-value) {
    font-size: 1.2rem;
    width: 40px;
    height: 40px;
  }
  
  .theme-date-range {
    padding: 0.6rem 0.8rem;
    font-size: 0.8rem;
  }
  
  .discount-badge {
    padding: 0.5rem 0.8rem;
    font-size: 0.8rem;
  }
}

/* Very small phones */
@media (max-width: 360px) {
  .page-hero {
    padding: 40px 0;
  }
  
  .hero-content h1 {
    font-size: 1.6rem;
  }
  
  .hero-description {
    font-size: 0.85rem !important;
  }
  
  .hero-cta :deep(.time-value) {
    width: 35px;
    height: 35px;
    font-size: 1.1rem;
  }
  
  .hero-cta :deep(.time-label) {
    font-size: 0.6rem;
  }
}
/* Inline Countdown Timer Styling */

/* Main container */
.countdown-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 2rem;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

/* Countdown title */
.countdown-title {
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1.5rem;
  color: #fff;
  font-weight: 400;
}

/* Timer units container - horizontal layout */
.countdown-units {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

/* Each time unit block - horizontal */
.time-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 10px;
}

/* The actual number display */
.time-value {
  font-size: 2rem;
  font-weight: 500;
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  margin-bottom: 8px;
}

/* Time unit label */
.time-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #fff;
  font-weight: 400;
}

/* Separator between time units */
.time-separator {
  color: #fff;
  font-size: 1.5rem;
  margin: 0 5px;
  padding-bottom: 25px; /* Move down to align with numbers */
  opacity: 0.8;
}

/* Responsive styles */
@media (max-width: 576px) {
  .countdown-container {
    padding: 1.2rem;
  }
  
  .time-value {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
  
  .countdown-title {
    font-size: 1rem;
    margin-bottom: 1.2rem;
  }
  
  .time-label {
    font-size: 0.7rem;
  }
  
  .time-separator {
    font-size: 1.2rem;
    margin: 0 2px;
  }
}

@media (max-width: 400px) {
  .countdown-container {
    padding: 1rem 0.8rem;
  }
  
  .time-value {
    width: 45px;
    height: 45px;
    font-size: 1.3rem;
    margin-bottom: 5px;
  }
  
  .time-unit {
    padding: 0 5px;
  }
  
  .time-label {
    font-size: 0.65rem;
  }
  
  .time-separator {
    font-size: 1rem;
    padding-bottom: 22px;
  }
}
</style>
