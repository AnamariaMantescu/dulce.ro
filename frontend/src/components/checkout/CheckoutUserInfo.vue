<template>
  <div class="user-info-form">
    <h2>Informații Personale</h2>
    
    <form @submit.prevent="onContinue">
      <div class="form-grid">
        <div class="form-group">
          <label for="firstName">Prenume*</label>
          <input 
            id="firstName" 
            v-model="form.firstName" 
            type="text" 
            required
            placeholder="Introduceți prenumele"
          >
        </div>
        
        <div class="form-group">
          <label for="lastName">Nume*</label>
          <input 
            id="lastName" 
            v-model="form.lastName" 
            type="text" 
            required
            placeholder="Introduceți numele"
          >
        </div>
        
        <div class="form-group">
          <label for="email">Email*</label>
          <input 
            id="email" 
            v-model="form.email" 
            type="email" 
            required
            placeholder="exemplu@email.com"
          >
        </div>
        
        <div class="form-group">
          <label for="phone">Telefon*</label>
          <input 
            id="phone" 
            v-model="form.phone" 
            type="tel" 
            required
            placeholder="07xx xxx xxx"
          >
        </div>
      </div>
      
      <div class="form-actions">
        <router-link :to="{ name: 'Cart' }" class="back-btn">
          Înapoi la coș
        </router-link>
        <button type="submit" class="continue-btn">
          Continuă
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'CheckoutUserInfo',
  
  props: {
    userData: {
      type: Object,
      default: () => ({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      })
    }
  },
  
  data() {
    return {
      form: {
        firstName: this.userData.firstName || '',
        lastName: this.userData.lastName || '',
        email: this.userData.email || '',
        phone: this.userData.phone || ''
      }
    };
  },
  
  methods: {
    onContinue() {
      this.$emit('user-data-updated', { ...this.form });
      this.$emit('continue');
    }
  }
};
</script>

<style scoped>
.user-info-form {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

h2 {
  color: #1d3557;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #457b9d;
  box-shadow: 0 0 0 2px rgba(69, 123, 157, 0.2);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.back-btn, .continue-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s ease;
}

.back-btn {
  background-color: #f1faee;
  color: #1d3557;
  border: 1px solid #1d3557;
}

.back-btn:hover {
  background-color: #e5f0e9;
}

.continue-btn {
  background-color: #2a9d8f;
  color: white;
  border: none;
  cursor: pointer;
}

.continue-btn:hover {
  background-color: #1d7d70;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>