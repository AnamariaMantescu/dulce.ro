<template>
  <div class="home-page">
    <!-- Banner Section using your BannerSection component -->
    <BannerSection 
      v-if="mainBanner" 
      :banner="mainBanner" 
    />
    
    <!-- Theme Banner - shows active theme or upcoming theme -->
    <section class="main-banner" v-else-if="activeTheme || upcomingTheme">
      <div class="banner-content">
        <h1 class="banner-title">{{ displayTheme.name }}</h1>
        <p class="banner-description">{{ displayTheme.description }}</p>
        
        <!-- Special label for upcoming themes -->
        <div class="theme-dates" v-if="isUpcomingTheme">
          <p class="upcoming-label">Începe în curând!</p>
          <p class="date-range">{{ formatDateRange(displayTheme.start_date, displayTheme.end_date) }}</p>
        </div>
        
        <router-link :to="'/themes/' + displayTheme.id" class="banner-button">
          {{ isUpcomingTheme ? 'Află mai multe' : 'Descoperă' }}
        </router-link>
      </div>
      <div class="banner-images">
        <div class="image-grid">
          <div v-for="(image, index) in displayThemeImages" 
               :key="index"
               class="image-item">
            <img :src="image" :alt="displayTheme.name + ' - Imagine ' + (index + 1)">
          </div>
        </div>
      </div>
    </section>
    
   <!-- Update this section in your Home.vue file -->
<CategoryGrid 
  :categories="categories"
  :active-theme="activeTheme"
  :upcoming-theme="upcomingTheme"
  :show-theme-week="!!displayTheme"
  :special-day-category="specialDayCategory"
/>
    
    <!-- Theme Highlight Section - for another theme -->
    <ThemeHighlight 
      v-if="alternateTheme" 
      :theme="alternateTheme" 
    />
    
    <!-- Secțiune produse recomandate -->
    <section class="featured-section">
      <div class="container">
        <FeaturedProducts 
          :products="featuredProducts"
          :loading="isLoadingProducts"
          :section-title="'Produse Recomandate'"
          :max-description-length="120"
          :show-see-more="true"
          :see-more-link="'/produse'"
          :see-more-text="'Vezi toate produsele'"
          :default-image="defaultImageUrl"
          @product-added="handleProductAdded"
        />
      </div>
    </section>
    
    
    <!-- Secțiune CTA pentru configuratorul de tort folosind CustomCakeCTA -->
    <!-- <CustomCakeCTA 
      title="Creează Tortul Tău Unic"
      description="Alege blaturile, cremele și decorațiunile preferate pentru a crea un tort personalizat exact pe gustul tău."
      buttonText="Construiește-ți Tortul"
      buttonLink="/cake-builder"
      image="https://images.unsplash.com/photo-1557308536-ee471ef2c390?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      backgroundColor="#f9f9f9"
    /> -->
    
    <!-- Secțiune Quiz -->
    <section class="quiz-section">
      <div class="container">
        <QuizRecommendations />
      </div>
    </section>

     <!-- Testimonials Section -->
     <section class="testimonials-wrapper">
      <div class="container">
        <TestimonialsSection 
          :testimonials="testimonials"
          v-if="testimonials.length > 0"
        />
      </div>
    </section>
    
    <!-- Loader pentru conținut -->
    <div class="page-loader" v-if="isLoading">
      <div class="loader-spinner"></div>
      <p>Se încarcă...</p>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import BannerSection from '../components/home/BannerSection.vue';
import CategoryGrid from '../components/home/CategoryGrid.vue';
import QuizRecommendations from '@/components/home/QuizRecommendations.vue';
import FeaturedProducts from '@/components/home/FeaturedProducts.vue';
import CustomCakeCTA from '@/components/home/CustomCakeCTA.vue';
import TestimonialsSection from '@/components/home/TestimonialsSection.vue';
import ThemeHighlight from '@/components/home/ThemeHighlight.vue';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default {
  name: 'Home',
  components: {
    BannerSection,
    CategoryGrid,
    QuizRecommendations,
    FeaturedProducts,
    CustomCakeCTA,
    TestimonialsSection,
    ThemeHighlight
  },
  data() {
    return {
      isLoading: true,
      isLoadingProducts: true,
      defaultImageUrl: 'https://via.placeholder.com/300',
      specialDayCategory: null,
      testimonials: [],
      alternateTheme: null
    }
  },
  computed: {
    ...mapState('themes', ['activeTheme', 'upcomingTheme']),
    ...mapGetters('themes', ['upcomingThemes', 'currentThemes']),
    ...mapGetters('products', ['getFeaturedProducts']),
    ...mapState('categories', ['categories']),
    ...mapGetters('banners', ['getMainBanner']),
    
    mainBanner() {
      return this.getMainBanner;
    },
    
    featuredProducts() {
      return this.getFeaturedProducts || [];
    },
    
    // Get the theme to display (active has priority over upcoming)
    displayTheme() {
      // Always prioritize active theme if available
      if (this.activeTheme) {
        return this.activeTheme;
      }
      // Fall back to upcoming theme if no active theme
      return this.upcomingTheme;
    },
    
    // Check if we're displaying an upcoming theme instead of active theme
    isUpcomingTheme() {
      return !this.activeTheme && !!this.upcomingTheme;
    },
    
    // Extract gallery images from displayTheme or fallback
    displayThemeImages() {
      if (!this.displayTheme) return [];
      
      if (this.displayTheme.gallery && this.displayTheme.gallery.length) {
        return this.displayTheme.gallery;
      } else if (this.displayTheme.image) {
        // If there's only one image, create an array with it
        return [this.displayTheme.image];
      } else if (this.mainBanner && this.mainBanner.images) {
        // Fallback to main banner images
        return this.mainBanner.images;
      }
      return [];
    }
  },
  methods: {
    ...mapActions('themes', ['fetchAllThemes', 'fetchAllThemes']),
    ...mapActions('products', ['fetchFeatured']),
    ...mapActions('categories', ['fetchCategories']),
    ...mapActions('banners', ['fetchMainBanner']),
    
    // Format date range for display
    formatDateRange(startDate, endDate) {
      if (!startDate || !endDate) return '';
      
      // Format dates as needed
      const start = new Date(startDate);
      const end = new Date(endDate);
      return `${start.toLocaleDateString('ro-RO')} - ${end.toLocaleDateString('ro-RO')}`;
    },
    
    // Handler pentru evenimentul emis când un produs este adăugat în coș
    handleProductAdded(product) {
      console.log(`Produsul '${product.name}' a fost adăugat în coș`);
    },
    
    async fetchSpecialDayCategory() {
      try {
        // Look for special day category like "ziua-prajiturii"
        const specialCategoryRef = collection(db, 'categories');
        const specialCategoryQuery = query(specialCategoryRef, where("id", "==", "ziua-prajiturii"));
        const querySnapshot = await getDocs(specialCategoryQuery);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          this.specialDayCategory = {
            id: doc.id,
            ...doc.data()
          };
          console.log('Special day category found:', this.specialDayCategory);
        } else {
          console.log('No special day category found');
          this.specialDayCategory = null;
        }
      } catch (error) {
        console.error('Error fetching special day category:', error);
        this.specialDayCategory = null;
      }
    },
    
    // Fetch testimonials
    async fetchTestimonials() {
      try {
        const reviewsRef = collection(db, 'reviews');
        const reviewsQuery = query(
          reviewsRef, 
          where('rating', '>=', 4), // Only show good reviews (4+ stars)
          orderBy('rating', 'desc'),
          orderBy('date', 'desc'),
          limit(3) // Show only 3 testimonials
        );
        
        const querySnapshot = await getDocs(reviewsQuery);
        
        if (!querySnapshot.empty) {
          const testimonialsList = [];
          querySnapshot.forEach(doc => {
            const reviewData = doc.data();
            testimonialsList.push({
              id: doc.id,
              name: reviewData.user_name,
              text: reviewData.comment,
              rating: reviewData.rating,
              date: reviewData.date,
              title: reviewData.title,
              verified: reviewData.verified_purchase || false
            });
          });
          
          this.testimonials = testimonialsList;
          console.log('Testimonials loaded:', this.testimonials);
        } else {
          console.log('No testimonials found');
          this.testimonials = [];
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        this.testimonials = [];
      }
    },
    
    // Find an alternate theme for ThemeHighlight section
    async findAlternateTheme() {
      try {
        if (this.activeTheme) {
          // If we have an active theme, try to find an upcoming theme for highlight
          const upcomingThemes = this.upcomingThemes;
          if (upcomingThemes && upcomingThemes.length > 0) {
            this.alternateTheme = upcomingThemes[0];
            console.log('Found upcoming theme for highlight:', this.alternateTheme);
            return;
          }
        } else if (this.upcomingTheme) {
          // If we're showing an upcoming theme as main, find another upcoming theme
          const otherUpcomingThemes = this.upcomingThemes.filter(theme => 
            theme.id !== this.upcomingTheme.id
          );
          
          if (otherUpcomingThemes && otherUpcomingThemes.length > 0) {
            this.alternateTheme = otherUpcomingThemes[0];
            console.log('Found another upcoming theme for highlight:', this.alternateTheme);
            return;
          }
        }
        
        // If no suitable alternate theme found
        console.log('No suitable alternate theme found for highlight section');
        this.alternateTheme = null;
      } catch (error) {
        console.error('Error finding alternate theme:', error);
        this.alternateTheme = null;
      }
    },
    
    // Check for special day
    async fetchSpecialDay() {
      try {
        const specialDaysRef = collection(db, 'special_days');
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
        
        const specialDayQuery = query(
          specialDaysRef,
          where('date', '==', today),
          limit(1)
        );
        
        const querySnapshot = await getDocs(specialDayQuery);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const specialDay = {
            id: doc.id,
            ...doc.data()
          };
          console.log('Special day found:', specialDay);
        }
      } catch (error) {
        console.error('Error fetching special day:', error);
      }
    },
    
    async loadData() {
      this.isLoading = true;
      this.isLoadingProducts = true;
      try {
        console.log('Încărcarea datelor pentru pagina principală...');
        
        // Încărcăm datele în paralel pentru performanță mai bună
        await Promise.all([
          this.fetchMainBanner(),
          this.fetchAllThemes(), // Fetches both active and upcoming themes
          this.fetchCategories(),
          this.fetchSpecialDayCategory(),
          this.fetchTestimonials(),
          this.fetchSpecialDay()
        ]);
        
        // Debug info
        console.log('Active theme:', this.activeTheme);
        console.log('Upcoming theme:', this.upcomingTheme);
        
        // Find an alternate theme to display in the highlight section
        await this.findAlternateTheme();
        
        // Încărcăm produsele separate pentru a controla starea de loading
        await this.fetchFeatured();
        this.isLoadingProducts = false;
        
        console.log('Date încărcate cu succes:');
        console.log('- Banner principal:', this.mainBanner);
        console.log('- Temă activă:', this.activeTheme);
        console.log('- Temă viitoare:', this.upcomingTheme);
        console.log('- Temă de afișat:', this.displayTheme);
        console.log('- Temă secundară pentru highlight:', this.alternateTheme);
        console.log('- Categorii:', this.categories);
        console.log('- Produse recomandate:', this.featuredProducts);
        console.log('- Categorie zi specială:', this.specialDayCategory);
        console.log('- Testimoniale:', this.testimonials);
        
        // Logare suplimentară pentru a verifica imaginile
        if (this.displayTheme && this.displayThemeImages) {
          console.log('Imaginile temei de afișat:', this.displayThemeImages);
        }
      } catch (error) {
        console.error('Eroare la încărcarea datelor pentru pagina principală:', error);
        this.isLoadingProducts = false;
      } finally {
        this.isLoading = false;
      }
    }
  },
  created() {
    this.loadData();
  },
  mounted() {
    // Verificare suplimentară pentru a vedea dacă datele sunt încărcate
    console.log("Banner principal în mounted:", this.mainBanner);
    console.log("Temă activă în mounted:", this.activeTheme);
    console.log("Temă viitoare în mounted:", this.upcomingTheme);
    console.log("Temă de afișat în mounted:", this.displayTheme);
    console.log("Categorii în mounted:", this.categories);
    console.log("Special day category în mounted:", this.specialDayCategory);
  }
}
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

/* Banner principal */
.main-banner {
  display: flex;
  /* min-height: calc(100vh - 80px); */
  background-color: #fff;
  margin-bottom: 120px; /* Increase from current 60px */
  min-height: 80vh;
}

.banner-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
}

.banner-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: #333;
}

.banner-description {
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 30px;
  color: #666;
  max-width: 600px;
}

/* New styles for upcoming theme dates */
.theme-dates {
  margin-bottom: 25px;
}

.upcoming-label {
  font-size: 1rem;
  font-weight: 600;
  color: #e91e63;
  margin-bottom: 5px;
}

.date-range {
  font-size: 0.9rem;
  color: #777;
}

.banner-button {
  display: inline-block;
  padding: 12px 30px;
  background-color: #e91e63;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  border-radius: 4px;
  transition: all 0.3s ease;
  align-self: flex-start;
}

.banner-button:hover {
  background-color: #c2185b;
  transform: translateY(-2px);
}

.banner-images {
  flex: 1;
  overflow: hidden;
}

.products-grid, .category-grid, .image-grid {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  height: 100%;
  gap: 10px;
}

.image-item {
  overflow: hidden;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.image-item:hover img {
  transform: scale(1.05);
}

/* Container and Sections */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
  overflow: hidden;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 40px;
  color: #333;
}

/* .featured-section {
  margin: 3rem 0;
} */
/* 
.testimonials-wrapper {
  margin: 0 0 3rem 0;
} */


.categories-section {
  padding: 60px 0;
  background-color: #f9f9f9;
}

.featured-section,
.testimonials-wrapper,
.quiz-section,
.categories-section {
  overflow: visible;
}

/* Loader */
.page-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loader-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #e91e63;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 992px) {
  .main-banner {
    min-height: auto;
    flex-direction: column;
    margin-bottom: 40px;
  }
  
  .banner-content {
    padding: 40px 20px;
    text-align: center;
  }
  
  .banner-button {
    margin: 0 auto;
  }
  
  .banner-images {
    height: 400px;
  }
  
  .image-grid {
    height: 100%;
  }
  
  .featured-section,
  .testimonials-wrapper,
  .quiz-section {
    margin: 2.5rem 0;
  }
}

@media (max-width: 768px) {
  .main-banner {
    margin-bottom: 30px;
  }
  
  .banner-content {
    padding: 30px 15px;
  }
  
  .banner-title {
    font-size: 1.75rem;
  }
  
  .banner-description {
    font-size: 1rem;
  }
  
  .banner-button {
    padding: 10px 25px;
    font-size: 0.9rem;
  }
  
  .banner-images {
    height: 300px;
  }
  
  .section-title {
    font-size: 1.75rem;
    margin-bottom: 30px;
  }
  
  .featured-section,
  .testimonials-wrapper,
  .quiz-section {
    margin: 2rem 0;
  }
}

@media (max-width: 480px) {
  .banner-title {
    font-size: 1.5rem;
  }
  
  .banner-images {
    height: 250px;
  }
  
  .section-title {
    font-size: 1.5rem;
    margin-bottom: 25px;
  }
  
  .featured-section,
  .testimonials-wrapper,
  .quiz-section {
    margin: 1.5rem 0;
  }
}
</style>