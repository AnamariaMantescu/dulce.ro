<template>
  <div class="special-days-page">
    <!-- Hero Banner Section -->
    <div class="page-hero" :style="{ backgroundImage: `url(${heroBannerImage})` }">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <span class="theme-badge">Zile Speciale</span>
        <h1>Zilele Dulci</h1>
        <p>Descoperă zilele noastre speciale dedicate prăjiturilor și torturilor preferate. 
          În fiecare zi specială, avem promoții, rețete unice și multe gusturi noi.</p>
        <div class="hero-cta" v-if="todaySpecialDay">
          <router-link :to="`/special-day/${todaySpecialDay.id}`" class="theme-button">
            <span>Vezi Oferta Zilei</span>
            <span class="button-arrow">→</span>
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loader"></div>
      <p>Se încarcă zilele speciale...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <router-link to="/" class="return-button">Înapoi la pagina principală</router-link>
    </div>
    
    <!-- Special Days Content -->
    <div v-else class="special-days-content">
      <!-- Debug Info (Development Only) -->
      <div v-if="isDebug" class="debug-info container">
        <p>Total special days: {{ allSpecialDays.length }}</p>
        <p>Today's date: {{ todayDateString }}</p>
        <p>Today's special day: {{ todaySpecialDay ? todaySpecialDay.name : 'None' }}</p>
        <p>Upcoming special days: {{ upcomingSpecialDays.length }}</p>
        <p>Past special days: {{ pastSpecialDays.length }}</p>
      </div>

      <!-- Today's Special Day (if exists) -->
      <section v-if="todaySpecialDay" class="today-special-section">
        <div class="container">
          <h2 class="section-title">Disponibil Astăzi</h2>
          
          <div class="today-special-card">
            <div class="today-special-image">
              <img :src="todaySpecialDay.image || todaySpecialDay.banner" :alt="todaySpecialDay.name">
              <div class="today-overlay">
                <div class="today-badge">Doar Astăzi!</div>
              </div>
            </div>
            <div class="today-special-content">
              <h3 class="today-special-name">{{ todaySpecialDay.name }}</h3>
              <p class="today-special-desc">{{ todaySpecialDay.description }}</p>
              <div class="today-special-details">
                <div v-if="todaySpecialDay.discount" class="discount-badge">
                  {{ todaySpecialDay.discount }}% REDUCERE
                </div>
                <div v-if="todaySpecialDay.special_offer" class="special-offer-badge">
                  {{ todaySpecialDay.special_offer }}
                </div>
                <router-link :to="`/special-day/${todaySpecialDay.id}`" class="view-button">
                  <span>Vezi detalii</span>
                  <span class="button-arrow">→</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Special Days Calendar -->
      <section class="special-days-calendar-section">
        <div class="container">
          <h2 class="section-title">Calendar Zile Speciale</h2>
          <SpecialDaysCalendar :specialDays="allSpecialDays" />
        </div>
      </section>
      
      <!-- Upcoming Special Days -->
      <section v-if="upcomingSpecialDays.length > 0" class="upcoming-section">
        <div class="container">
          <h2 class="section-title">{{ todaySpecialDay ? 'Următoarele Zile Speciale' : 'Zilele Speciale Viitoare' }}</h2>
          
          <div class="special-days-grid">
            <div 
              v-for="day in upcomingSpecialDays" 
              :key="day.id" 
              class="special-day-card"
              @click="goToSpecialDay(day.id)"
            >
              <div class="special-day-image">
                <img :src="day.image || day.banner" :alt="day.name">
                <div class="special-day-overlay">
                  <div class="date-badge">{{ formatDate(day.date) }}</div>
                  <div class="special-countdown">Peste {{ daysUntil(day.date) }} zile</div>
                </div>
              </div>
              <div class="special-day-content">
                <h3 class="special-day-name">{{ day.name }}</h3>
                <p class="special-day-desc">{{ day.description }}</p>
                <div class="special-day-footer">
                  <div v-if="day.discount" class="mini-discount-badge">
                    {{ day.discount }}% reducere
                  </div>
                  <button class="special-day-button">
                    <span>Vezi detalii</span>
                    <span class="button-arrow">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Past Special Days -->
      <!-- <section v-if="pastSpecialDays.length > 0" class="past-section">
        <div class="container">
          <h2 class="section-title">Zile Speciale Anterioare</h2>
          
          <div class="past-days-grid">
            <div 
              v-for="day in pastSpecialDays.slice(0, showAllPast ? pastSpecialDays.length : 6)" 
              :key="day.id" 
              class="past-day-card"
              @click="goToSpecialDay(day.id)"
            >
              <div class="past-day-image">
                <img :src="day.image || day.banner" :alt="day.name">
                <div class="past-overlay">
                  <div class="past-badge">Eveniment Trecut</div>
                  <div class="past-date">{{ formatDate(day.date) }}</div>
                </div>
              </div>
              <div class="past-day-content">
                <h3 class="past-day-name">{{ day.name }}</h3>
                <div v-if="day.discount" class="past-discount">{{ day.discount }}% reducere</div>
              </div>
            </div>
          </div>
          
          <div v-if="pastSpecialDays.length > 6" class="show-more">
            <button @click="showAllPast = !showAllPast" class="show-more-btn">
              {{ showAllPast ? 'Arată mai puțin' : 'Arată mai multe' }}
            </button>
          </div>
        </div>
      </section> -->
      
      <!-- No Special Days Message -->
      <div v-if="!todaySpecialDay && upcomingSpecialDays.length === 0 && pastSpecialDays.length === 0" class="no-data-message container">
        <p>Nu există zile speciale programate momentan. Reveniți curând pentru noutăți!</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import SpecialDaysCalendar from '@/components/themes/ThemeCalendar.vue'; // You'll need to create this component

export default {
  name: 'SpecialDaysList',
  components: {
    SpecialDaysCalendar
  },
  data() {
    return {
      loading: true,
      error: null,
      localSpecialDays: [],
      isDebug: false, // Set to false in production
      todayDateString: new Date().toISOString().split('T')[0],
      showAllPast: false,
      heroBannerImage: 'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?q=80&w=2070&auto=format&fit=crop'
    };
  },
  computed: {
    ...mapState('specialDays', ['specialDays']),
    ...mapGetters('specialDays', [
      'getTodaySpecialDay',
      'getUpcomingSpecialDays'
    ]),
    
    // Use either store data or local data
    allSpecialDays() {
      return this.specialDays.length > 0 ? this.specialDays : this.localSpecialDays;
    },
    
    // Get today's special day
    todaySpecialDay() {
      // Ignore active field - show all special days
      // Use the store getter if available
      if (this.getTodaySpecialDay) {
        return this.getTodaySpecialDay;
      }
      
      // Fallback to local calculation
      const today = this.todayDateString;
      return this.allSpecialDays.find(day => day.date === today);
    },
    
    // Get upcoming special days
    upcomingSpecialDays() {
      // Ignore active field - show all special days
      // Use the store getter if available
      if (this.getUpcomingSpecialDays && this.getUpcomingSpecialDays.length > 0) {
        return this.getUpcomingSpecialDays;
      }
      
      // Fallback to local calculation
      const today = this.todayDateString;
      return this.allSpecialDays
        .filter(day => day.date > today)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    
    // Get past special days
    pastSpecialDays() {
      // Ignore active field - show all special days
      const today = this.todayDateString;
      return this.allSpecialDays
        .filter(day => day.date < today)
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Most recent first
    }
  },
  methods: {
    ...mapActions('specialDays', ['fetchAllSpecialDays']),
    
    // Format date for display
    formatDate(dateString) {
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('ro-RO', options);
    },
    
    // Calculate days until the event
    daysUntil(dateString) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const targetDate = new Date(dateString);
      targetDate.setHours(0, 0, 0, 0);
      
      const differenceInTime = targetDate.getTime() - today.getTime();
      return Math.ceil(differenceInTime / (1000 * 3600 * 24));
    },
    
    // Navigate to special day detail page
    goToSpecialDay(id) {
      this.$router.push({ name: 'special-day', params: { id: id } });
    },
    
    // Fetch special days directly from Firestore if Vuex fails
    async fetchSpecialDaysDirectly() {
      try {
        console.log('Fetching special days directly from Firestore...');
        const specialDaysRef = collection(db, 'specialDays');
        const snapshot = await getDocs(specialDaysRef);
        
        if (snapshot.empty) {
          console.log('No special days found in database');
          this.localSpecialDays = [];
          return;
        }
        
        this.localSpecialDays = snapshot.docs.map(doc => {
          return { id: doc.id, ...doc.data() };
        });
        
        console.log(`Fetched ${this.localSpecialDays.length} special days directly from Firestore`);
      } catch (error) {
        console.error('Error fetching special days directly:', error);
        this.error = 'Nu am putut încărca zilele speciale. Vă rugăm încercați mai târziu.';
      }
    }
  },
  async created() {
    try {
      this.loading = true;
      this.error = null;
      
      // Try to fetch using Vuex first
      if (this.$store && this.$store.state.specialDays) {
        console.log('Vuex store found, fetching from there...');
        await this.fetchAllSpecialDays();
        
        // Check if we got any data from the store
        if (this.specialDays.length === 0) {
          console.log('No special days found in Vuex store, fetching directly...');
          await this.fetchSpecialDaysDirectly();
        }
      } else {
        // Vuex store not found or not properly set up, fetch directly
        console.log('Vuex store not available, fetching directly...');
        await this.fetchSpecialDaysDirectly();
      }
      
      console.log('Special days loaded:', this.allSpecialDays);
      
    } catch (error) {
      console.error('Error in SpecialDaysList component:', error);
      this.error = 'Nu am putut încărca zilele speciale. Vă rugăm încercați mai târziu.';
    } finally {
      this.loading = false;
    }
  }
}
</script>

<style>
/* -------------------------------------------
   Overall Page & Typography
------------------------------------------- */
.special-days-page {
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
  max-width: 900px;
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

.hero-cta {
  margin-top: 1rem;
}

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
}

.hero-cta .theme-button:hover {
  transform: translateX(4px);
}

.button-arrow {
  margin-left: 8px;
  transition: transform 0.3s ease;
}

.theme-button:hover .button-arrow {
  transform: translateX(4px);
}

/* -------------------------------------------
   Debug Info
------------------------------------------- */
.debug-info {
  margin: 1rem auto;
  padding: 1rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.85rem;
}

/* -------------------------------------------
   Loading & Error States
------------------------------------------- */
.loading-container,
.error-container {
  min-height: 40vh;
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

.return-button {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.7rem 1.5rem;
  background-color: #333;
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
  font-family: 'Montserrat', sans-serif;
  transition: background-color 0.3s ease;
}

.return-button:hover {
  background-color: #555;
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
   Today's Special Day
------------------------------------------- */
.today-special-section {
  margin-bottom: 5rem;
}

.today-special-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  margin-bottom: 4rem;
  background-color: #fff;
  transition: transform 0.3s ease;
  cursor: pointer;
}

.today-special-card:hover {
  transform: translateY(-5px);
}

.today-special-image {
  height: 400px;
  position: relative;
  overflow: hidden;
}

.today-special-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.today-special-card:hover .today-special-image img {
  transform: scale(1.02);
}

.today-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%);
}

.today-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: rgba(220, 53, 69, 0.85);
  color: white;
  padding: 0.7rem 1.5rem;
  border-radius: 30px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.today-special-content {
  padding: 2.5rem;
  text-align: center;
}

.today-special-name {
  font-size: 2.5rem;
  font-weight: 400;
  margin-bottom: 1rem;
  color: #333;
}

.today-special-desc {
  font-size: 1.2rem;
  line-height: 1.6;
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
  margin-bottom: 2rem;
  color: #555;
}

.today-special-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.discount-badge {
  background-color: rgba(220, 53, 69, 0.9);
  color: white;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  padding: 0.7rem 1.5rem;
  border-radius: 4px;
  letter-spacing: 1px;
  font-size: 1.1rem;
}

.special-offer-badge {
  background-color: rgba(253, 126, 20, 0.9);
  color: white;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  padding: 0.7rem 1.5rem;
  border-radius: 4px;
  letter-spacing: 0.5px;
  font-size: 1rem;
}

.view-button {
  display: inline-flex;
  align-items: center;
  margin-top: 1rem;
  padding: 0.8rem 2rem;
  background-color: #333;
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
  font-family: 'Montserrat', sans-serif;
  font-size: 1rem;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.view-button:hover {
  background-color: #555;
  transform: translateX(4px);
}

/* -------------------------------------------
   Special Days Calendar Section
------------------------------------------- */
.special-days-calendar-section {
  margin-bottom: 5rem;
  padding: 0 2rem;
}

/* -------------------------------------------
   Upcoming Special Days Grid - Stil nou
------------------------------------------- */
.special-days-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 3rem;
  margin-bottom: 4rem;
}

.special-day-card {
  background-color: white;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  cursor: pointer;
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  position: relative;
}

.special-day-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.12);
}

.special-day-image {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.special-day-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.special-day-card:hover .special-day-image img {
  transform: scale(1.05);
}

.special-day-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.5rem;
}

.date-badge {
  color: white;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  font-weight: 300;
  letter-spacing: 0.5px;
  font-family: 'Montserrat', sans-serif;
  text-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.special-countdown {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 400;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.3);
  font-family: 'Montserrat', sans-serif;
  background-color: rgba(52, 152, 219, 0.4);
  color: white;
}

.special-day-content {
  padding: 2.5rem;
  position: relative;
}

.special-day-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 1px;
  background-color: #eee;
}

.special-day-name {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: 400;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
}

.special-day-card:hover .special-day-name {
  color: #e74c3c;
}

.special-day-desc {
  font-size: 1rem;
  color: #555;
  margin-bottom: 2rem;
  line-height: 1.6;
  font-weight: 300;
  font-family: 'Montserrat', sans-serif;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.special-day-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mini-discount-badge {
  display: inline-block;
  background-color: rgba(220, 53, 69, 0.8);
  color: white;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-weight: 500;
}

.special-day-button {
  display: inline-flex;
  align-items: center;
  padding: 0.9rem 1.6rem;
  background-color: transparent;
  color: #333;
  border: 1px solid #333;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.9rem;
}

.button-arrow {
  margin-left: 8px;
  transition: transform 0.3s ease;
}

.special-day-card:hover .special-day-button {
  background-color: #333;
  color: white;
}

.special-day-card:hover .button-arrow {
  transform: translateX(4px);
}

/* -------------------------------------------
   Past Special Days
------------------------------------------- */
.past-days-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.past-day-card {
  position: relative;
  border-radius: 0;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  background-color: #fff;
  transition: transform 0.3s ease;
  cursor: pointer;
  filter: grayscale(20%);
}

.past-day-card:hover {
  transform: translateY(-5px);
  filter: grayscale(0%);
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
}

.past-day-image {
  height: 180px;
  position: relative;
  overflow: hidden;
}

.past-day-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.past-day-card:hover .past-day-image img {
  transform: scale(1.05);
}

.past-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.5rem;
}

.past-badge {
  align-self: flex-end;
  background-color: rgba(108, 117, 125, 0.8);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.7rem;
  font-weight: 500;
  margin-bottom: auto;
}

.past-date {
  color: white;
  font-size: 0.9rem;
  font-weight: 300;
  letter-spacing: 0.5px;
  font-family: 'Montserrat', sans-serif;
  text-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.past-day-content {
  padding: 1.5rem;
  text-align: center;
}

.past-day-name {
  font-size: 1.3rem;
  font-weight: 400;
  margin-bottom: 0.5rem;
  color: #333;
}

.past-discount {
  font-size: 0.9rem;
  color: #e74c3c;
  font-family: 'Montserrat', sans-serif;
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
   No Data Message
------------------------------------------- */
.no-data-message {
  text-align: center;
  padding: 4rem 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  font-family: 'Montserrat', sans-serif;
  font-size: 1.1rem;
  color: #555;
  margin: 2rem 0 4rem;
}

/* -------------------------------------------
   Responsive Adjustments
------------------------------------------- */
@media (min-width: 992px) {
  .today-special-card {
    flex-direction: row;
    height: 400px;
  }
  
  .today-special-image {
    width: 50%;
    height: auto;
  }
  
  .today-special-content {
    width: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: left;
  }
  
  .today-special-details {
    align-items: flex-start;
  }
}

@media (max-width: 992px) {
  .page-title {
    font-size: 3rem;
  }
  
  .today-special-name {
    font-size: 2.2rem;
  }
  
  .special-days-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media (max-width: 768px) {
  .page-hero {
    height: auto;
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
  
  .special-days-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  
  .today-special-image {
    height: 320px;
  }
  
  .special-day-image {
    height: 250px;
  }
  
  .special-day-content {
    padding: 2rem;
  }
  
  .special-day-name {
    font-size: 1.6rem;
  }
  
  .past-days-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 576px) {
  .container {
    padding: 0 1.5rem;
  }
  
  .page-hero {
    min-height: 450px;
  }
  
  .hero-content {
    padding: 0 1.5rem;
  }
  
  .hero-content h1 {
    font-size: 2.2rem;
  }
  
  .hero-content p {
    font-size: 1rem;
  }
  
  .special-days-grid {
    grid-template-columns: 1fr;
    padding: 0 1.5rem;
  }
  
  .past-days-grid {
    grid-template-columns: 1fr;
  }
  
  .special-day-card,
  .past-day-card {
    max-width: 350px;
    margin: 0 auto;
  }
  
  .today-special-name {
    font-size: 1.8rem;
  }
  
  .today-special-desc {
    font-size: 1rem;
  }
  
  .special-day-overlay {
    padding: 1rem;
  }
  
  .special-countdown {
    top: 10px;
    right: 10px;
    padding: 0.4rem 0.8rem;
    font-size: 0.7rem;
  }
  
  .date-badge {
    font-size: 0.85rem;
  }
  
  .special-day-content {
    padding: 1.8rem 1.5rem;
  }
  
  .special-day-name {
    font-size: 1.4rem;
  }
  
  .special-day-desc {
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
  }
  
  .special-day-button {
    padding: 0.8rem 1.4rem;
    font-size: 0.85rem;
  }
  
  .past-day-name {
    font-size: 1.2rem;
  }
  
  .show-more-btn {
    padding: 0.8rem 1.8rem;
    font-size: 0.85rem;
  }
}</style>