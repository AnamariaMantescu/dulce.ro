<template>
  <div class="theme-card" @click="goToTheme">
    <div class="theme-card-image">
      <img :src="theme.image" :alt="theme.name">
      <div class="theme-overlay">
        <div class="theme-dates">
          {{ formatDateRange(theme.start_date, theme.end_date) }}
        </div>
        <div v-if="isActive" class="theme-status active">Activ acum</div>
        <div v-else-if="isUpcoming" class="theme-status upcoming">În curând</div>
        <div v-if="isNew" class="theme-badge new">Nou</div>
      </div>
    </div>
    <div class="theme-card-content">
      <h3 class="theme-name">{{ theme.name }}</h3>
      <p class="theme-description">{{ truncateDescription(theme.description) }}</p>
      <div class="theme-card-footer">
        <button class="theme-button">
          <span>Vezi detalii</span>
          <span class="button-arrow">→</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ThemeCard',
  props: {
    theme: {
      type: Object,
      required: true
    }
  },
  computed: {
    isActive() {
      const today = new Date();
      const startDate = new Date(this.theme.start_date);
      const endDate = new Date(this.theme.end_date);
      return today >= startDate && today <= endDate;
    },
    isUpcoming() {
      const today = new Date();
      const startDate = new Date(this.theme.start_date);
      return startDate > today;
    },
    isNew() {
      // Consider a theme "new" if it was created within the last 7 days
      const today = new Date();
      const startDate = new Date(this.theme.start_date);
      const daysDifference = Math.floor((startDate - today) / (1000 * 60 * 60 * 24));
      return daysDifference > 0 && daysDifference <= 7;
    }
  },
  methods: {
    formatDateRange(startDate, endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return `${start.toLocaleDateString('ro-RO')} - ${end.toLocaleDateString('ro-RO')}`;
    },
    truncateDescription(description) {
      return description.length > 120 ? description.substring(0, 120) + '...' : description;
    },
    goToTheme() {
      this.$router.push(`/themes/${this.theme.id}`);
    }
  }
}
</script>

<style scoped>
.theme-card {
  background-color: white;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  cursor: pointer;
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  position: relative;
}

.theme-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.12);
}

.theme-card-image {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.theme-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.theme-card:hover .theme-card-image img {
  transform: scale(1.05);
}

.theme-overlay {
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

.theme-dates {
  color: white;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  font-weight: 300;
  letter-spacing: 0.5px;
  font-family: 'Montserrat', sans-serif;
  text-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.theme-status {
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
}

.theme-status.active {
  background-color: rgba(231, 76, 60, 0.4);
  color: white;
}

.theme-status.upcoming {
  background-color: rgba(52, 152, 219, 0.4);
  color: white;
}

.theme-badge {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 400;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-family: 'Montserrat', sans-serif;
}

.theme-badge.new {
  background-color: rgba(46, 204, 113, 0.8);
  color: white;
  backdrop-filter: blur(8px);
}

.theme-card-content {
  padding: 2.5rem;
  position: relative;
}

.theme-card-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 1px;
  background-color: #eee;
}

.theme-name {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: 400;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
}

.theme-card:hover .theme-name {
  color: #e74c3c;
}

.theme-description {
  font-size: 1rem;
  color: #555;
  margin-bottom: 2rem;
  line-height: 1.6;
  font-weight: 300;
  font-family: 'Montserrat', sans-serif;
}

.theme-card-footer {
  display: flex;
  justify-content: flex-start;
}

.theme-button {
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

.theme-card:hover .theme-button {
  background-color: #333;
  color: white;
}

.theme-card:hover .button-arrow {
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .theme-card-image {
    height: 250px;
  }
  
  .theme-card-content {
    padding: 2rem;
  }
  
  .theme-name {
    font-size: 1.6rem;
  }
}

@media (max-width: 576px) {
  .theme-overlay {
    padding: 1rem;
  }
  
  .theme-status {
    top: 10px;
    right: 10px;
    padding: 0.4rem 0.8rem;
    font-size: 0.7rem;
  }
  
  .theme-badge {
    top: 10px;
    left: 10px;
    padding: 0.4rem 0.8rem;
    font-size: 0.7rem;
  }
  
  .theme-dates {
    font-size: 0.85rem;
  }
  
  .theme-card-content {
    padding: 1.8rem 1.5rem;
  }
  
  .theme-name {
    font-size: 1.4rem;
  }
  
  .theme-description {
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
  }
  
  .theme-button {
    padding: 0.8rem 1.4rem;
    font-size: 0.85rem;
  }
}
</style>