<template>
  <section class="category-section">
    <div class="container">
      <h2 class="section-title">{{ sectionTitle }}</h2>
      
      <div class="category-grid">
        <!-- Standard categories -->
        <router-link 
          v-for="category in standardCategories" 
          :key="category.id" 
          :to="'/category/' + category.slug" 
          class="category-card"
        >
          <div class="category-image">
            <img :src="category.image" :alt="category.name" />
          </div>
          <div class="category-overlay">
            <h3 class="category-name">{{ category.name }}</h3>
          </div>
        </router-link>
        
        <!-- Special Day category - Always shown with badge -->
        <router-link 
          :to="currentSpecialDay ? '/special-day/' + currentSpecialDay.id : '/special-days'"
          class="category-card"
          :class="{
            'special-day': currentSpecialDay && currentSpecialDay.isToday, 
            'upcoming-special-day': currentSpecialDay && !currentSpecialDay.isToday,
            'default-special-day': !currentSpecialDay
          }"
        >
          <div class="category-image">
            <img :src="currentSpecialDay ? (currentSpecialDay.image || currentSpecialDay.banner) : defaultSpecialDayImage" 
                 :alt="currentSpecialDay ? currentSpecialDay.name : 'Ziua Dulce'" />
          </div>
          <!-- Corner Badge -->
          <div class="corner-badge" :class="{
            'today-badge': currentSpecialDay && currentSpecialDay.isToday,
            'upcoming-badge': currentSpecialDay && !currentSpecialDay.isToday,
            'default-badge': !currentSpecialDay
          }">
            {{ getBadgeText() }}
          </div>
          <div class="category-overlay">
            <h3 class="category-name">{{ currentSpecialDay ? currentSpecialDay.name : 'Ziua Dulce' }}</h3>
          </div>
        </router-link>
        
        <!-- Theme Week - Shows active theme or upcoming theme -->
        <router-link 
          v-if="showThemeWeek && displayTheme" 
          :to="'/themes/' + displayTheme.id" 
          class="category-card"
          :class="{'special-day': !isUpcomingTheme, 'upcoming-special-day': isUpcomingTheme}"
        >
          <div class="category-image">
            <img :src="displayTheme.image || displayTheme.banner" :alt="displayTheme.name" />
          </div>
          <!-- Corner Badge for Theme Week -->
          <div class="corner-badge" :class="{
            'today-badge': !isUpcomingTheme,
            'upcoming-badge': isUpcomingTheme
          }">
            {{ !isUpcomingTheme ? 'Săptămâna Tematică!' : upcomingThemeLabel }}
          </div>
          <div class="category-overlay">
            <h3 class="category-name">{{ displayTheme.name }}</h3>
          </div>
        </router-link>
        
        <!-- Quiz Card -->
        <router-link to="/quiz" class="category-card">
          <div class="category-image">
            <img :src="quizImage" alt="Quiz" />
          </div>
          <!-- Corner Badge -->
          <div class="corner-badge quiz-badge">
            Quiz
          </div>
          <div class="category-overlay">
            <h3 class="category-name">Quiz</h3>
          </div>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script>
import { db } from '@/firebase'; // Adjust the import based on your Firebase setup
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';

export default {
  name: 'CategoryGrid',
  props: {
    categories: {
      type: Array,
      required: true
    },
    activeTheme: {
      type: Object,
      default: () => null
    },
    upcomingTheme: {
      type: Object,
      default: () => null
    },
    showThemeWeek: {
      type: Boolean,
      default: false
    },
    sectionTitle: {
      type: String,
      default: 'Categorii'
    },
    quizCardText: {
      type: String,
      default: 'Descoperă ce ți se potrivește'
    },
    customCakeText: {
      type: String,
      default: 'Creează tortul tău'
    },
    upcomingThemeLabel: {
      type: String,
      default: 'Începe în curând!'
    }
  },
  data() {
    return {
      specialDays: [],
      currentSpecialDay: null,
      isLoading: true,
      defaultSpecialDayImage: '/img/default-special-day.jpg', // You can change this to a default image path
      todayDate: new Date().toISOString().split('T')[0],
      quizImage: 'https://kathyandcompany.com/wp-content/uploads/2021/03/Step-2-1024x711.jpg' // Fallback
    };
  },
  computed: {
    standardCategories() {
      // Filter out "ziua-prajiturii" and any inactive/invisible categories
      return this.categories.filter(category => 
        category.id !== 'ziua-prajiturii' && 
        category.active !== false &&
        category.visible !== false &&
        category.id !== 'quiz' // Exclude quiz from standard categories
      );
    },
    // Determine which theme to display (active has priority)
    displayTheme() {
      return this.activeTheme || this.upcomingTheme;
    },
    // Check if we're showing an upcoming theme
    isUpcomingTheme() {
      return !this.activeTheme && !!this.upcomingTheme;
    }
  },
  async created() {
    // Fetch special days from Firestore
    await this.fetchSpecialDays();
    
    // Find current or next special day
    this.setCurrentSpecialDay();
    
    // Get quiz image from Firebase
    await this.fetchQuizImage();
  },
  mounted() {
    console.log('Categories passed to CategoryGrid:', this.categories);
    console.log('Active theme:', this.activeTheme);
    console.log('Upcoming theme:', this.upcomingTheme);
    console.log('Display theme:', this.displayTheme);
    console.log('Is upcoming theme:', this.isUpcomingTheme);
    console.log('Today:', this.todayDate);
    console.log('Current special day:', this.currentSpecialDay);
    console.log('All special days loaded:', this.specialDays);
    console.log('Quiz image URL:', this.quizImage);
  },
  methods: {
    async fetchQuizImage() {
      try {
        // Prima dată verificăm dacă quiz există deja în lista de categorii
        const quizFromProps = this.categories.find(cat => cat.id === 'quiz');
        
        if (quizFromProps && quizFromProps.image) {
          console.log('Quiz image found in props:', quizFromProps.image);
          this.quizImage = quizFromProps.image;
          return;
        }
        
        // Dacă nu există în props, încercăm să-l obținem din Firebase
        const quizDocRef = doc(db, 'categories', 'quiz');
        const quizSnapshot = await getDoc(quizDocRef);
        
        if (quizSnapshot.exists()) {
          const quizData = quizSnapshot.data();
          if (quizData.image) {
            console.log('Quiz image found in Firestore:', quizData.image);
            this.quizImage = quizData.image;
          } else {
            console.log('Quiz found in Firestore but no image property');
          }
        } else {
          console.log('Quiz category not found in Firestore');
        }
      } catch (error) {
        console.error('Error fetching quiz image:', error);
      }
    },
    
    async fetchSpecialDays() {
      try {
        // Create a query to get all special days, sorted by date
        const specialDaysRef = collection(db, 'specialDays');
        const q = query(
          specialDaysRef,
          orderBy('date')
        );
        
        // Get the special days
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          console.log('No special days found in the database');
          this.specialDays = [];
          this.isLoading = false;
          return;
        }
        
        this.specialDays = snapshot.docs.map(doc => {
          return { id: doc.id, ...doc.data() };
        });
        
        this.isLoading = false;
        console.log('Fetched special days:', this.specialDays);
      } catch (error) {
        console.error('Error fetching special days:', error);
        this.isLoading = false;
      }
    },
    
    setCurrentSpecialDay() {
      if (this.specialDays.length === 0) {
        console.log('No special days available to set');
        return;
      }
      
      const today = this.todayDate;
      console.log('Today is:', today);
      
      // Check if there's a special day today - ignore the active status
      const todaySpecialDay = this.specialDays.find(day => day.date === today);
      
      if (todaySpecialDay) {
        // We have a special day today
        console.log('Found a special day for today:', todaySpecialDay);
        this.currentSpecialDay = {
          ...todaySpecialDay,
          isToday: true
        };
      } else {
        // Find the next upcoming special day - ignore the active status
        const upcomingSpecialDays = this.specialDays
          .filter(day => day.date > today)
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (upcomingSpecialDays.length > 0) {
          const nextSpecialDay = upcomingSpecialDays[0];
          const dateObj = new Date(nextSpecialDay.date);
          
          console.log('Found upcoming special day:', nextSpecialDay);
          
          // Format date in Romanian
          const formattedDate = dateObj.toLocaleDateString('ro-RO', {
            day: 'numeric',
            month: 'long'
          });
          
          this.currentSpecialDay = {
            ...nextSpecialDay,
            description: nextSpecialDay.description || `Disponibil pe ${formattedDate}`,
            isToday: false
          };
        } else {
          console.log('No upcoming special days found');
          this.currentSpecialDay = null;
        }
      }
      
      // Log which special day is being shown
      console.log('Current special day set to:', this.currentSpecialDay);
    },
    
    getBadgeText() {
      if (!this.currentSpecialDay) {
        return 'Ziua Specială';
      }
      
      if (this.currentSpecialDay.isToday) {
        return 'Doar Astăzi!';
      }
      
      // For upcoming special day
      if (this.currentSpecialDay.description) {
        return this.currentSpecialDay.description;
      }
      
      // Fallback to formatted date
      const dateObj = new Date(this.currentSpecialDay.date);
      const formattedDate = dateObj.toLocaleDateString('ro-RO', {
        day: 'numeric',
        month: 'long'
      });
      
      return `Disponibil pe ${formattedDate}`;
    }
  }
}
</script>

<style scoped>
/* Your existing styles remain the same */
.category-section {
  padding: 0 2rem 4rem;
  margin-top: 0;
  position: relative;
  z-index: 1;
}
.container {
  max-width: 1400px;
  margin: 0 auto;
}
.section-title {
  font-size: 2rem;
  font-weight: 300;
  text-align: center;
  margin-bottom: 3rem;
  color: #000;
  letter-spacing: -0.5px;
}
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}
.category-card {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  text-decoration: none;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}
.category-image {
  width: 100%;
  height: 100%;
}
.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(20%);
  transition: all 0.5s ease;
}
.category-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}
.category-name {
  color: #000;
  font-size: 1.5rem;
  font-weight: 400;
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(100%);
  transition: all 0.3s ease;
  width: 100%;
  margin: 0;
}
/* Corner Badge Styling */
.corner-badge {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.5rem 1rem;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
  z-index: 10; /* Higher than the name */
  border-bottom-left-radius: 8px;
  max-width: 80%;
  text-align: right;
}
.today-badge {
  background-color: rgba(233, 30, 99, 0.7);
}
.upcoming-badge {
  background-color: rgba(233, 30, 99, 0.6);
}
.default-badge {
  background-color: rgba(76, 175, 80, 0.9);
}
.category-card:hover .category-image img {
  transform: scale(1.05);
  filter: grayscale(0%);
}
.category-card:hover .category-overlay {
  background: rgba(0, 0, 0, 0.1);
}
.category-card:hover .category-name {
  transform: translateY(0);
}
/* Special categories styling - for both Special Day and Theme Week */
.special-day .category-name,
.upcoming-special-day .category-name {
  position: absolute;
  bottom: 20%;  /* Position it much higher than bottom */
  background-color: rgba(233, 30, 99, 0.7);
  color: #fff;
  font-weight: 400;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: none; /* Don't use transform for these */
}
/* Default special day styling */
.default-special-day .category-name {
  position: absolute;
  bottom: 30%;  /* Position it much higher than bottom */
  background-color: rgba(76, 175, 80, 0.8);
  color: #fff;
  font-weight: 400;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: none; /* Don't use transform for these */
}

/* QUIZ CARD SPECIFIC STYLING */
.quiz-badge {
  background-color: #e91e63;
}

/* Responsive styles */
@media (max-width: 768px) {
  .category-section {
    padding: 3rem 1rem;
  }
  
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  .category-name {
    font-size: 1.2rem;
    padding: 0.75rem;
  }
  
  .special-day .category-name,
  .upcoming-special-day .category-name,
  .default-special-day .category-name {
    height: 60px;
  }
  
  .special-day .category-overlay,
  .upcoming-special-day .category-overlay,
  .default-special-day .category-overlay {
    justify-content: flex-start;
    padding-top: 60%;
  }
  
  .special-day .category-name,
  .upcoming-special-day .category-name,
  .default-special-day .category-name {
    z-index: 5;
  }
}

@media (max-width: 480px) {
  .category-grid {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
  
  .category-card {
    aspect-ratio: 16/9;
  }
  
  .category-section {
    padding: 2rem 1rem;
  }
  
  .section-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .quiz-badge {
    padding: 0.3rem 0.8rem;
    font-size: 0.75rem;
  }
}
</style>