<template>
  <div class="themes-page">
    <!-- Dynamic Hero Banner (Based on Current or Upcoming Theme) -->
    <div v-if="bannerTheme" class="page-hero" :style="{ backgroundImage: `url(${bannerTheme.image})` }">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <span class="theme-badge" :class="bannerTheme.theme_type || 'week'">
          {{ bannerTheme.theme_type === 'day' ? 'Ziua tematică' : 'Săptămâna tematică' }}
        </span>
        <h1>{{ bannerTheme.name }}</h1>
        <p>{{ bannerTheme.description }}</p>
        <div class="hero-cta">
          <CountdownTimer 
            :targetDate="bannerTheme.end_date" 
            :title="isCurrentTheme ? 'Se termină în:' : 'Începe în:'"
            @countdown-finished="refreshThemes"
          />
          <router-link :to="`/themes/${bannerTheme.id}`" class="theme-button">
            <span>Vezi produsele</span>
            <span class="button-arrow">→</span>
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- Fallback Hero if No Theme is Available -->
    <div v-else class="page-hero" :style="{ backgroundImage: `url(${heroBackgroundImage})` }">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1>{{ heroTitle }}</h1>
        <p>{{ heroSubtitle }}</p>
      </div>
    </div>
    
    <!-- Theme Calendar -->
    <div class="theme-calendar-section">
      <h2 class="section-title">Calendar Tematic</h2>
      <ThemeCalendar :themes="allThemes" />
    </div>
    
    <!-- Upcoming Themes -->
    <div class="upcoming-themes-section" v-if="upcomingThemes.length > 0">
      <h2 class="section-title">Teme speciale viitoare</h2>
      <div class="themes-grid">
        <ThemeCard 
          v-for="theme in upcomingThemes.slice(0)" 
          :key="theme.id" 
          :theme="theme" 
        />
      </div>
    </div>
    
    <!-- Past Themes -->
    <div class="past-themes-section" v-if="pastThemes.length > 0">
      <h2 class="section-title">Teme anterioare</h2>
      <div class="themes-grid">
        <ThemeCard 
          v-for="theme in pastThemes.slice(0, showAllPast ? pastThemes.length : 3)" 
          :key="theme.id" 
          :theme="theme" 
        />
      </div>
      <div v-if="pastThemes.length > 3" class="show-more">
        <button @click="showAllPast = !showAllPast" class="show-more-btn">
          {{ showAllPast ? 'Arată mai puțin' : 'Arată mai multe' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import ThemeCard from '@/components/themes/ThemeCard.vue'
import CountdownTimer from '@/components/themes/CountdownTimer.vue'
import ThemeCalendar from '@/components/themes/ThemeCalendar.vue'

export default {
  name: 'Themes',
  components: {
    ThemeCard,
    CountdownTimer,
    ThemeCalendar
  },
  data() {
    return {
      showAllPast: false,
      heroTitle: 'Teme Speciale',
      heroSubtitle: 'Descoperă săptămânile și zilele noastre tematice cu produse exclusive și oferte speciale!',
      heroBackgroundImage: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1526&auto=format&fit=crop'
    };
  },
  computed: {
    allThemes() {
      return this.$store.getters['themes/allThemes'];
    },
    currentThemes() {
      return this.$store.getters['themes/currentThemes'];
    },
    upcomingThemes() {
      return this.$store.getters['themes/upcomingThemes'];
    },
    pastThemes() {
      const today = new Date();
      return this.allThemes
        .filter(theme => {
          const endDate = new Date(theme.end_date);
          return endDate < today;
        })
        .sort((a, b) => new Date(b.end_date) - new Date(a.end_date));
    },
    bannerTheme() {
      // If there's a current theme, show it first
      if (this.currentThemes.length > 0) {
        return this.currentThemes[0];
      }
      
      // If no current theme, show the next upcoming theme
      if (this.upcomingThemes.length > 0) {
        return this.upcomingThemes[0];
      }
      
      return null;
    },
    isCurrentTheme() {
      return this.currentThemes.length > 0;
    }
  },
  methods: {
    formatDateRange(startDate, endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return `${start.toLocaleDateString('ro-RO')} - ${end.toLocaleDateString('ro-RO')}`;
    },
    refreshThemes() {
      this.$store.dispatch('themes/fetchAllThemes');
    }
  },
  created() {
    this.refreshThemes();
  }
}
</script>

<style scoped>
/* -------------------------------------------
   Overall Page & Typography
------------------------------------------- */
.themes-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
  color: #3a3a3a;
  background-color: #fcfcfc;
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
}

/* -------------------------------------------
   Hero Section
------------------------------------------- */
.page-hero {
  position: relative;
  height: 80vh; /* Mărim înălțimea pentru a acomoda conținutul */
  min-height: 600px; /* Mărim min-height pentru conținut */
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4rem;
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
  max-width: 900px; /* Mărirea max-width pentru a oferi mai mult spațiu */
  padding: 0 2rem;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Theme Badge */
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
}

/* Headline */
.hero-content h1 {
  font-size: 3.8rem;
  font-weight: 300;
  letter-spacing: 1px;
  margin-bottom: 1.2rem;
  text-shadow: 0 2px 5px rgba(0,0,0,0.2);
  font-family: 'Cormorant Garamond', serif;
}

/* Description */
.hero-content p {
  font-size: 1.3rem;
  line-height: 1.4;
  max-width: 600px;
  margin-bottom: 2rem;
  text-shadow: 0 1px 4px rgba(0,0,0,0.3);
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
}

/* -------------------------------------------
   Hero CTA: Countdown + Button
------------------------------------------- */
.hero-cta {
  display: flex;
  flex-direction: column; /* Schimbăm în coloană pentru a asigura stacking vertical */
  align-items: center;
  gap: 2rem;
  width: 100%; /* Ocupăm întreaga lățime disponibilă */
}

/* Stiluri specifice pentru countdown timer în hero */
.hero-cta :deep(.countdown-container) {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border-radius: 4px;
  padding: 2rem;
  margin-bottom: 1.5rem;
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

/* Theme Button in the Hero */
.hero-cta .theme-button {
  display: inline-flex;
  align-items: center;
  padding: 0.9rem 1.6rem;
  background-color: #fff;
  color: #333;
  text-decoration: none;
  border: 1px solid #000;
  font-weight: 400;
  transition: all 0.3s ease;
  text-align: center;
  font-family: 'Montserrat', sans-serif;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-size: 0.9rem;
  margin-top: 1rem; /* Adăugăm un margin suplimentar */
}

.hero-cta .theme-button:hover {
  transform: translateX(4px);
}

.hero-cta .theme-button .button-arrow {
  margin-left: 8px;
  transition: transform 0.3s ease;
}

.hero-cta .theme-button:hover .button-arrow {
  transform: translateX(4px);
}

/* -------------------------------------------
   Section Titles
------------------------------------------- */
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

/* -------------------------------------------
   Theme Calendar Section
------------------------------------------- */
.theme-calendar-section {
  margin-bottom: 6rem;
  padding: 0 2rem;
}

/* -------------------------------------------
   Themes Grid
------------------------------------------- */
.themes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 3rem;
  margin-bottom: 4rem;
  padding: 0 2rem;
}

/* -------------------------------------------
   Show More Button
------------------------------------------- */
.show-more {
  text-align: center;
  margin: 4rem 0;
}

.show-more-btn {
  background-color: transparent;
  border: 1px solid #333;
  color: #333;
  padding: 0.9rem 2.2rem;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-family: 'Montserrat', sans-serif;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.show-more-btn:hover {
  background-color: #333;
  color: #fff;
}

/* -------------------------------------------
   Responsive Adjustments
------------------------------------------- */
@media (max-width: 992px) {
  .hero-content h1 {
    font-size: 3rem;
  }
  
  .themes-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media (max-width: 768px) {
  .page-hero {
    height: auto; /* Permitem înălțimii să se adapteze la conținut */
    min-height: 500px;
    padding: 3rem 0;
  }
  
  .hero-content h1 {
    font-size: 2.6rem;
  }
  
  .hero-content p {
    font-size: 1.1rem;
  }
  
  .section-title {
    font-size: 1.8rem;
    margin: 4rem 0 2.5rem;
  }
}

@media (max-width: 576px) {
  .hero-content {
    padding: 0 1.5rem;
  }
  
  .hero-content h1 {
    font-size: 2.2rem;
  }
  
  .hero-content p {
    font-size: 1rem;
  }
  
  .themes-grid {
    grid-template-columns: 1fr;
    padding: 0 1.5rem;
  }
  
  .hero-cta :deep(.countdown-container) {
    padding: 1.5rem 1rem;
  }
}
</style>