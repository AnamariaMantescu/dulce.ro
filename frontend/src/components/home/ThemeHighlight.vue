<template>
  <section class="theme-highlight">
    <div class="theme-content">
      <div class="theme-info">
        <h2 class="theme-title">{{ theme.name }}</h2>
        <div class="theme-dates">
          <span class="dates-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </span>
          <span>{{ formatDateRange(theme.start_date, theme.end_date) }}</span>
        </div>
        <div class="theme-divider"></div>
        <p class="theme-description">{{ theme.description }}</p>
        <router-link :to="`/themes/${theme.id}`" class="theme-button">
          <span>Vezi mai multe</span>
          <span class="button-arrow">→</span>
        </router-link>
      </div>
      <div class="theme-image">
        <div class="image-container">
          <img :src="theme.image" :alt="theme.name">
          <div class="image-overlay"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    theme: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatDateRange(startDate, endDate) {
      // Format dates as needed
      const start = new Date(startDate);
      const end = new Date(endDate);
      return `${start.toLocaleDateString('ro-RO')} - ${end.toLocaleDateString('ro-RO')}`;
    }
  }
}
</script>
<style scoped>
.theme-highlight {
  background-color: #f8f3ea;
  margin: 4rem auto;
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.05);
  max-width: 1200px;
}

.theme-content {
  display: flex;
  align-items: center;
  position: relative;
  gap: 2rem;
  padding: 0;
}

.theme-info {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  z-index: 1;
  padding: 4rem;
}

.theme-title {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  font-weight: 500;
  margin-bottom: 1.2rem;
  color: #8B4513;
  line-height: 1.2;
}

.theme-dates {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #8B4513;
  margin-bottom: 1.5rem;
  font-weight: 400;
  letter-spacing: 0.5px;
  opacity: 0.8;
}

.dates-icon {
  display: flex;
  align-items: center;
  color: #8B4513;
  opacity: 0.7;
}

.theme-divider {
  width: 80px;
  height: 1px;
  background-color: #8B4513;
  margin-bottom: 1.5rem;
  opacity: 0.3;
}

.theme-description {
  font-size: 1.1rem;
  margin-bottom: 2.5rem;
  color: #5D4037;
  line-height: 1.8;
  font-weight: 300;
  max-width: 90%;
}

.theme-button {
  display: inline-flex;
  align-items: center;
  padding: 0.9rem 1.8rem;
  background-color: transparent;
  color: #8B4513;
  text-decoration: none;
  border: 1px solid #8B4513;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  letter-spacing: 1px;
  align-self: flex-start;
  text-transform: uppercase;
}

.button-arrow {
  margin-left: 10px;
  transition: transform 0.3s ease;
}

.theme-button:hover {
  background-color: #8B4513;
  color: white;
}

.theme-button:hover .button-arrow {
  transform: translateX(5px);
}

.theme-image {
  flex: 1;
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.image-container {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  aspect-ratio: 1;
  width: 100%;
  max-width: 400px;
}

.theme-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(139, 69, 19, 0.05);
  transition: background-color 0.3s ease;
}

/* Background elements */
.theme-highlight::before {
  content: '';
  position: absolute;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: #8B4513;
  opacity: 0.03;
  top: -50px;
  left: -50px;
}

.theme-highlight::after {
  content: '';
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #8B4513;
  opacity: 0.05;
  bottom: 40px;
  right: 10%;
}

/* Responsive styles */
@media (max-width: 992px) {
  .theme-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .theme-info {
    padding: 3rem 3rem 2rem;
    align-items: center;
    text-align: center;
    width: 100%;
  }
  
  .theme-description {
    max-width: 100%;
  }
  
  .theme-divider {
    margin-left: auto;
    margin-right: auto;
  }
  
  .theme-title {
    font-size: 2.2rem;
  }
  
  .theme-button {
    align-self: center;
  }
  
  .theme-image {
    width: 100%;
    padding: 0 3rem 3rem;
  }
  
  .image-container {
    max-width: 300px;
  }
}

@media (max-width: 768px) {
  .theme-highlight {
    margin: 3rem 1.5rem;
  }
  
  .theme-info {
    padding: 2.5rem 2rem 1.5rem;
  }
  
  .theme-title {
    font-size: 1.8rem;
  }
  
  .theme-description {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
  
  .theme-button {
    padding: 0.8rem 1.5rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .theme-highlight {
    margin: 2.5rem 1rem;
    border-radius: 15px;
  }
  
  .theme-info {
    padding: 2rem 1.5rem 1.5rem;
  }
  
  .theme-title {
    font-size: 1.6rem;
    margin-bottom: 1rem;
  }
  
  .theme-dates {
    margin-bottom: 1rem;
  }
  
  .theme-divider {
    margin-bottom: 1rem;
    width: 60px;
  }
  
  .theme-image {
    padding: 0 1.5rem 2rem;
  }
  
  .image-container {
    max-width: 220px;
  }
}
</style>