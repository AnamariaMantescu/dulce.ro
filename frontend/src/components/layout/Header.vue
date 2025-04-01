<template>
  <header class="site-header" :class="{ 'scrolled': isScrolled }">
    <!-- Buton burger menu -->
    <button class="burger-menu-toggle" @click="toggleBurgerMenu">
      <span></span>
      <span></span>
      <span></span>
    </button>
    
    <!-- Logo -->
    <div class="logo-container">
      <router-link to="/">
        <img src="@/assets/images/dulce-logo.png" alt="Logo Dulce" class="site-logo" :class="{ 'scrolled': isScrolled }">
      </router-link>
    </div>
    
    <!-- Meniu dreapta - rămâne vizibil și când burger menu e activat -->
    <div class="nav-group nav-right">
      <!-- AccountMenu responsiv, afișat diferit pe mobile/desktop -->
      <div class="account-menu-wrapper">
        <AccountMenu />
      </div>
      
      <router-link to="/cart" class="cart-icon">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span class="cart-count" v-if="cartItemCount > 0">{{ cartItemCount }}</span>
      </router-link>
    </div>
    
    <!-- Meniul fullscreen cu fundal roz transparent -->
    <div class="fullscreen-menu" :class="{ 'is-active': isBurgerMenuOpen }">
      <button class="close-fullscreen-menu" @click="closeBurgerMenu">
        <span></span>
        <span></span>
      </button>
      
      <div class="fullscreen-menu-content">
        <div class="menu-items">
  <router-link to="/despre-noi" class="menu-link" @click="closeBurgerMenu">DESPRE NOI</router-link>
  <router-link to="/produse" class="menu-link" @click="closeBurgerMenu">PRODUSE</router-link>
  <!-- Noile link-uri -->
  <router-link to="/special-days" class="menu-link" @click="closeBurgerMenu">ZILE SPECIALE</router-link>
  <router-link to="/themes" class="menu-link" @click="closeBurgerMenu">SĂPTĂMÂNI TEMATICE</router-link>

          <!-- Opțiuni de autentificare în meniul fullscreen -->
          <div class="auth-section">
            <template v-if="isAuthenticated">
              <p class="greeting">Bine ai venit, <strong>{{ displayName }}</strong></p>
              <div class="account-links">
                <router-link to="/account" class="account-link" @click="closeBurgerMenu">Contul meu</router-link>
                <a href="#" @click.prevent="logout" class="account-link logout-link">Deconectare</a>
              </div>
            </template>
            <template v-else>
              <div class="auth-links">
                <router-link to="/login" class="auth-link" @click="closeBurgerMenu">Autentificare</router-link>
                <router-link to="/signup" class="auth-link" @click="closeBurgerMenu">Înregistrare</router-link>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { mapGetters } from 'vuex';
import AccountMenu from '../user/AccountMenu.vue';
import { useToast } from 'vue-toastification';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

export default {
  components: {
    AccountMenu
  },
  
  data() {
    return {
      isBurgerMenuOpen: false,
      isScrolled: false,
      toast: null,
      windowWidth: window.innerWidth
    }
  },
  
  created() {
    this.toast = useToast();
  },
  
  computed: {
    siteConfig() {
      return this.$store.state.config.siteConfig;
    },
    // Getter pentru numărul de produse din coș
    ...mapGetters('cart', ['cartItemCount']),
    // Getter-uri pentru starea utilizatorului
    ...mapGetters('user', [
      'isAuthenticated',
      'currentUser',
      'userProfile'
    ]),
    
    displayName() {
      if (!this.currentUser) return '';
      
      // Folosim mai întâi displayName din Firebase Auth
      if (this.currentUser.displayName) {
        return this.currentUser.displayName;
      }
      
      // Apoi verificăm în profilul Firestore
      if (this.userProfile && this.userProfile.displayName) {
        return this.userProfile.displayName;
      }
      
      // Ultima opțiune - prima parte a email-ului
      return this.currentUser.email ? this.currentUser.email.split('@')[0] : '';
    },
    
    // Calculăm dacă suntem pe un dispozitiv mobil
    isMobile() {
      return this.windowWidth <= 768;
    }
  },
  
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('resize', this.handleResize);
    this.handleResize(); // Set initial width
  },
  
  unmounted() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
  },
  
  methods: {
    handleScroll() {
      this.isScrolled = window.scrollY > 50;
    },
    
    handleResize() {
      this.windowWidth = window.innerWidth;
    },
    
    // Metode pentru burger menu fullscreen
    toggleBurgerMenu() {
      this.isBurgerMenuOpen = !this.isBurgerMenuOpen;
      document.body.style.overflow = this.isBurgerMenuOpen ? 'hidden' : '';
    },
    
    closeBurgerMenu() {
      this.isBurgerMenuOpen = false;
      document.body.style.overflow = '';
    },
    
    // Funcție pentru gestionarea clicului pe numele/iconul utilizatorului
    handleAccountClick() {
      if (this.isAuthenticated) {
        this.$router.push('/account');
      } else {
        this.$router.push('/login');
      }
    },
    
    async logout() {
      try {
        await signOut(auth);
        this.$store.commit('user/CLEAR_USER');
        this.toast.success('V-ați deconectat cu succes!');
        this.closeBurgerMenu();
        
        // Dacă suntem pe o pagină protejată, redirecționăm către pagina principală
        const requiresAuth = this.$route.meta.requiresAuth;
        if (requiresAuth) {
          this.$router.push('/');
        }
      } catch (error) {
        console.error('Eroare la deconectare:', error);
        this.toast.error('A apărut o eroare la deconectare.');
      }
    }
  }
}
</script>

<style scoped>
/* Stiluri pentru header */
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
  padding: 0 60px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  transition: all 0.3s ease;
}

.site-header.scrolled {
  height: 60px;
  background-color: rgba(255, 255, 255, 0.98);
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
}

/* Stiluri pentru logo */
.logo-container {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.site-logo {
  height: 70px;
  transition: all 0.3s ease;
  display: block;
}

.site-logo.scrolled {
  height: 45px;
}

/* Grupuri de navigație */
.nav-group {
  display: flex;
  gap: 50px;
  align-items: center;
}

.nav-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 30px;
}

/* Stiluri pentru cart icon */
.cart-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  position: relative;
  transition: background-color 0.3s;
  cursor: pointer;
}

.cart-icon:hover {
  transform: scale(1.05);
  stroke: #e9bdc2;
}

.cart-icon svg {
  stroke: #b5838d;
  stroke-width: 3px;
}

.cart-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e63946;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Stiluri pentru butonul burger menu */
.burger-menu-toggle {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 20px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1100; /* Peste meniul fullscreen */
}

.burger-menu-toggle span {
  display: block;
  width: 100%;
  height: 2px;
  background-color: #333;
}

/* Butonul burger rămâne neschimbat când meniul e deschis */

/* Meniul fullscreen */
.fullscreen-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(237, 188, 197, 0.95); /* Roz transparent */
  backdrop-filter: blur(5px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.5s ease;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.fullscreen-menu.is-active {
  opacity: 1;
  visibility: visible;
}

/* Buton închidere meniu fullscreen */
.close-fullscreen-menu {
  position: absolute;
  top: 30px;
  right: 60px;
  background: none;
  border: none;
  cursor: pointer;
  width: 40px;
  height: 40px;
  z-index: 1001;
}

.close-fullscreen-menu span {
  display: block;
  width: 100%;
  height: 2px;
  background-color: white;
  position: absolute;
  top: 50%;
}

.close-fullscreen-menu span:first-child {
  transform: rotate(45deg);
}

.close-fullscreen-menu span:last-child {
  transform: rotate(-45deg);
}

/* Conținutul meniului fullscreen */
.fullscreen-menu-content {
  width: 100%;
  max-width: 800px;
  text-align: center;
}

/* Elementele de meniu */
.menu-items {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
}

.menu-link {
  text-decoration: none;
  color: white;
  font-size: 24px;
  font-weight: 500;
  letter-spacing: 3px;
  position: relative;
  display: inline-block;
  padding: 10px 0;
  transition: all 0.3s ease;
}

.menu-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: white;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.menu-link:hover {
  transform: translateY(-3px);
}

.menu-link:hover::after {
  transform: scaleX(1);
}

/* Secțiunea de autentificare din meniul fullscreen */
.auth-section {
  margin-top: 50px;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  width: 100%;
  max-width: 400px;
}

.greeting {
  font-size: 18px;
  color: white;
  margin-bottom: 20px;
}

.account-links, .auth-links {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.account-link, .auth-link {
  text-decoration: none;
  color: white;
  font-size: 16px;
  opacity: 0.9;
  transition: all 0.3s ease;
}

.account-link:hover, .auth-link:hover {
  opacity: 1;
  text-decoration: underline;
}

.logout-link {
  color: #fff;
  opacity: 0.7;
}

.logout-link:hover {
  opacity: 1;
}

/* Stiluri pentru AccountMenu wrapper */
.account-menu-wrapper {
  display: flex;
}

/* Responsivitate */
@media (max-width: 1200px) {
  .site-header {
    padding: 0 40px;
  }
  
  .close-fullscreen-menu {
    right: 40px;
  }
  
  .menu-link {
    font-size: 22px;
  }
}

@media (max-width: 992px) {
  .site-header {
    padding: 0 20px;
  }
  
  .close-fullscreen-menu {
    right: 20px;
  }
  
  .logo-container {
    position: relative;
    left: 0;
    transform: none;
    margin: 0 auto 0 20px;
  }
}

@media (max-width: 768px) {
  .site-header {
    padding: 0 15px;
    height: 70px;
  }
  
  .site-header.scrolled {
    height: 60px;
  }
  
  .fullscreen-menu-content {
    max-width: 90%;
  }
  
  .account-links, .auth-links {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
  
  .menu-link {
    font-size: 20px;
  }
  
  /* Ascundem textul din AccountMenu pe mobile */
  :deep(.account-menu .user-name) {
    display: none;
  }
  
  :deep(.account-menu .user-icon) {
    margin-right: 0;
  }
  
  .nav-right {
    gap: 15px;
  }
  
  .logo-container {
    margin: 0 auto 0 15px;
  }
  
  .site-logo {
    height: 50px;
  }
  
  .site-logo.scrolled {
    height: 40px;
  }
}

@media (max-width: 576px) {
  .site-header {
    padding: 0 10px;
  }
  
  .menu-link {
    font-size: 18px;
  }
  
  .close-fullscreen-menu {
    top: 20px;
    right: 20px;
  }
  
  .burger-menu-toggle {
    width: 25px;
    height: 16px;
  }
  
  .cart-icon, :deep(.user-icon) {
    width: 32px;
    height: 32px;
  }
  
  .cart-icon svg, :deep(.user-icon svg) {
    width: 20px;
    height: 20px;
  }
  
  .site-logo {
    height: 40px;
  }
  
  .site-logo.scrolled {
    height: 35px;
  }
  
  .logo-container {
    margin: 0 auto 0 10px;
  }
}

@media (max-width: 360px) {
  .site-header {
    padding: 0 8px;
  }
  
  .menu-link {
    font-size: 16px;
    letter-spacing: 2px;
  }
  
  .auth-section {
    padding-top: 20px;
    margin-top: 30px;
  }
  
  .greeting {
    font-size: 16px;
  }
  
  .account-link, .auth-link {
    font-size: 14px;
  }
  
  .site-logo {
    height: 35px;
  }
  
  .site-logo.scrolled {
    height: 30px;
  }
}
</style>