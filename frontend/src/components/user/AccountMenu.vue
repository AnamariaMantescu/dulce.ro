<template>
  <div class="account-menu">
    <!-- Utilizator autentificat -->
    <div v-if="currentUser" class="user-menu">
      <div class="user-menu-trigger" @click="toggleMenu">
        <!-- Numele utilizatorului este acum în dreapta iconului -->
        <div class="user-icon">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <span class="user-name">{{ displayName }}</span>
      </div>
      
      <div v-if="menuOpen" class="dropdown-menu">
        <div class="menu-header">
          <p>{{ currentUser.email }}</p>
        </div>
        
        <ul class="menu-items">
          <li>
            <router-link to="/account">Contul meu</router-link>
          </li>
          <li>
            <router-link to="/orders">Comenzile mele</router-link>
          </li>
          <li v-if="isAdmin">
            <router-link to="/admin">Administrare</router-link>
          </li>
          <li>
            <a href="#" @click.prevent="logout">Deconectare</a>
          </li>
        </ul>
      </div>
    </div>
    
    <!-- Utilizator neautentificat - cu icoană de profil -->
    <div v-else class="user-menu">
      <div class="user-menu-trigger" @click="toggleMenu">
        <div class="user-icon">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <!-- Opțional: puteți afișa "Contul meu" pentru utilizatorii neautentificați -->
        <span class="user-name">Contul meu</span>
      </div>
      
      <div v-if="menuOpen" class="dropdown-menu">
        <div class="menu-header">
          <p>Cont utilizator</p>
        </div>
        
        <ul class="menu-items">
          <li>
            <a href="#" @click.prevent="goToLogin">Autentificare</a>
          </li>
          <li>
            <a href="#" @click.prevent="goToSignup">Înregistrare</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useToast } from 'vue-toastification';

export default {
  name: 'AccountMenu',
  
  setup() {
    const store = useStore();
    const router = useRouter();
    const toast = useToast();
    const menuOpen = ref(false);
    
    const currentUser = computed(() => store.getters['user/currentUser']);
    const userProfile = computed(() => store.getters['user/userProfile']);
    const isAdmin = computed(() => store.getters['user/isAdmin']);
    
    const displayName = computed(() => {
      if (!currentUser.value) return '';
      
      if (currentUser.value.displayName) {
        return currentUser.value.displayName;
      } else if (userProfile.value && userProfile.value.displayName) {
        return userProfile.value.displayName;
      }
      
      // Folosim prima parte a email-ului ca fallback
      return currentUser.value.email.split('@')[0];
    });
    
    const toggleMenu = () => {
      menuOpen.value = !menuOpen.value;
    };
    
    const closeMenuOnClickOutside = (event) => {
      const menu = document.querySelector('.account-menu');
      if (menu && !menu.contains(event.target)) {
        menuOpen.value = false;
      }
    };
    
    const goToLogin = () => {
      router.push('/login');
      menuOpen.value = false;
    };
    
    const goToSignup = () => {
      router.push('/signup');
      menuOpen.value = false;
    };
    
    const logout = async () => {
      try {
        await signOut(auth);
        store.commit('user/CLEAR_USER');
        toast.info('V-ați deconectat cu succes');
        menuOpen.value = false;
        router.push('/');
      } catch (error) {
        console.error('Eroare la deconectare:', error);
        toast.error('A apărut o eroare la deconectare');
      }
    };
    
    onMounted(() => {
      document.addEventListener('click', closeMenuOnClickOutside);
    });
    
    onUnmounted(() => {
      document.removeEventListener('click', closeMenuOnClickOutside);
    });
    
    return {
      currentUser,
      isAdmin,
      displayName,
      menuOpen,
      toggleMenu,
      goToLogin,
      goToSignup,
      logout
    };
  }
};
</script>

<style scoped>
.account-menu {
  position: relative;
  display: flex;
  align-items: center;
}

.user-menu {
  position: relative;
}

.user-menu-trigger {
  display: flex;
  align-items: center;
  cursor: pointer;
  border-radius: 20px;
  transition: background-color 0.2s;
  transition: transform 0.3s ease-in;
}

.user-menu-trigger:hover {
  transform: scale(1.05);
}

.user-name {
  text-decoration: none;
  color: #333;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 1.5px;
}

/* Stiluri pentru iconița de utilizator */
.user-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #b5838d;
  margin-right: 2px; /* Adăugat spațiu între icon și nume */
}

.user-icon svg {
  width: 22px;
  height: 22px;
  stroke: #b5838d;
  stroke-width: 3px;
}


.user-name::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: #333;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}


.dropdown-menu {
  position: absolute;
  top: 45px;
  right: 0;
  width: 250px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
  animation: dropdown-fade 0.2s ease;
}

@keyframes dropdown-fade {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-header {
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.menu-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.menu-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-items li {
  padding: 0;
  margin: 0;
}

.menu-items li a {
  display: block;
  padding: 12px 15px;
  color: #333;
  text-decoration: none;
  transition: background-color 0.2s;
}

.menu-items li a:hover {
  background-color: #f5f5f5;
}
</style>