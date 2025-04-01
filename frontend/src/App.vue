<template>
  <div class="app-container">
    <Header />
    <main class="main-content">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Header from '@/components/layout/Header.vue';
import Footer from '@/components/layout/Footer.vue';

export default {
  components: {
    Header,
    Footer
  },
  setup() {
    const store = useStore();
    let unsubscribe;

    onMounted(() => {
      // Adăugăm un listener pentru starea de autentificare
      unsubscribe = onAuthStateChanged(auth, (user) => {
        // Actualizăm starea din Vuex când se schimbă starea de autentificare
        store.dispatch('user/setUser', user);
      });
    });

    onUnmounted(() => {
      // Curățăm listener-ul când componenta este demontată
      if (unsubscribe) {
        unsubscribe();
      }
    });
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  background-color: #fff;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  margin-top: 80px; /* Match the header height */
  padding-bottom: 40px; /* Adăugat spațiu între conținut și footer */
}

@media (max-width: 768px) {
  .main-content {
    margin-top: 60px;
    padding-bottom: 30px;
  }
}
</style>