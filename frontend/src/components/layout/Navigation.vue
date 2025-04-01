<!-- components/layout/Navigation.vue -->
<template>
    <nav class="main-nav">
      <div class="container">
        <div class="nav-links">
  <router-link to="/" class="nav-link">Acasă</router-link>
  <router-link to="/produse" class="nav-link">Produse</router-link>
  <router-link to="/noutati" class="nav-link">Noutăți</router-link>
  <router-link to="/contacteaza-ne" class="nav-link">Contactează-ne</router-link>
  <router-link to="/cake-builder" class="nav-link">Construiește Tort</router-link>
  <router-link to="/themes" class="nav-link">Teme Speciale</router-link>
  <!-- Link pentru Zile Speciale -->
  <router-link to="/special-days" class="nav-link">Zile Speciale</router-link>
  <!-- Link pentru Săptămâni Tematice -->
  <router-link to="/saptamani-tematice" class="nav-link">Săptămâni Tematice</router-link>
</div>

        <div class="nav-actions">
          <router-link to="/quiz" class="nav-link">Quiz</router-link>
          <router-link to="/cart" class="nav-link">Coș</router-link>
          <router-link v-if="isAuthenticated" to="/account" class="nav-link">Cont</router-link>
          <router-link v-if="!isAuthenticated" to="/login" class="nav-link">Login</router-link>
        </div>
      </div>
    </nav>
  </template>
  
  <script>
  import { mapGetters } from 'vuex';
  
  export default {
    name: 'Navigation',
    computed: {
      ...mapGetters('user', ['isAuthenticated'])
    }
  }
  </script>
  
  <style scoped>
  .main-nav {
    background-color: #fff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 1rem 0;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  
  .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  .nav-links {
    display: flex;
    gap: 1.5rem;
  }
  
  .nav-actions {
    display: flex;
    gap: 1rem;
  }
  
  .nav-link {
    color: #333;
    text-decoration: none;
    padding: 0.5rem;
    transition: color 0.3s ease;
    font-weight: 500;
  }
  
  .nav-link:hover,
  .nav-link.router-link-active {
    color: #e91e63;
  }
  
  @media (max-width: 768px) {
    .container {
      flex-direction: column;
      gap: 1rem;
    }
    
    .nav-links,
    .nav-actions {
      flex-wrap: wrap;
      justify-content: center;
    }
  }
  </style>