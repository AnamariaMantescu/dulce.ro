// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import store from "/src/store/index.js";

const routes = [
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/Admin.vue'),
    // meta: { requiresAuth: true, admin: true } 
  },  
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('../views/Checkout.vue')
  },
  {
    path: '/payment-success',
    name: 'PaymentSuccess',
    component: () => import('../views/PaymentSuccess.vue')
  },
  {
    path: '/produse',
    name: 'Products',
    component: () => import('../views/Category.vue')
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: () => import('../components/products/ProductDetail.vue'),
    props: true
  },
  {
    path: '/despre-noi',
    name: 'DespreNoi',
    component: () => import('../views/DespreNoi.vue')
  },
  {
    path: '/account',
    name: 'Account',
    component: () => import('../views/Account.vue'),
    // meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('../views/Account.vue'),
    // meta: { requiresAuth: true }
  },
  {
    path: '/cake-builder',
    name: 'CakeBuilder',
    component: () => import('../views/CakeBuilder.vue')
  },
  {
    path: '/category/:slug',
    name: 'Category',
    component: () => import('../views/Category.vue'),
    props: true
  },
  {
    path: '/quiz',
    name: 'Quiz',
    component: () => import('../views/Quiz.vue')
  },
  {
    path: '/testimoniale',
    name: 'Testimonials',
    component: () => import('../views/Testimonials.vue')
  },
  {
    path: '/themes/:id',
    name: 'Theme',
    component: () => import('../views/Theme.vue'),
    props: true,
    beforeEnter: async (to, from, next) => {
      try {
        // Use the imported store directly
        await store.dispatch('themes/fetchAllThemes');
  
        const themeId = to.params.id;
        if (themeId) {
          await store.dispatch('themes/fetchThemeById', themeId);
        }
  
        next();
      } catch (err) {
        console.error('Navigation guard error:', err);
        next(); // Continue even if there's an error
      }
    }
  },
  
  {
    path: '/themes',
    name: 'Themes',
    component: () => import('../views/Themes.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../views/Signup.vue')
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../views/Cart.vue')
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('../views/Checkout.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/stripe-checkout',
    name: 'StripeCheckout',
    component: () => import('../components/checkout/StripeCheckout.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/payment-success/:reference?',
    name: 'PaymentSuccess',
    component: () => import('../views/PaymentSuccess.vue')
  },
  // Update existing special day route
  {
    path: '/special-day/:id',
    name: 'special-day',
    component: () => import('../views/SpecialDay.vue'),
    props: true,
    beforeEnter: async (to, from, next) => {
      try {
        // Access store directly instead of through router.app.$store
        if (!store) {
          console.log('Store not available in navigation guard');
          next(); // Continue if store isn't available
          return;
        }
        
        // Check if the specialDays module exists in the store
        if (store.hasModule && !store.hasModule('specialDays')) {
          console.warn('specialDays module not registered in store');
          next();
          return;
        }
        
        // Load all special days first
        await store.dispatch('specialDays/fetchAllSpecialDays');
        
        // Then try to load the specific special day
        const dayId = to.params.id;
        if (dayId) {
          await store.dispatch('specialDays/fetchSpecialDayById', dayId);
        }
        
        next();
      } catch (err) {
        console.error('Navigation guard error:', err);
        next(); // Continue and let component handle errors
      }
    }
  },
  {
    path: '/special-days',
    name: 'special-days',
    component: () => import('../views/SpecialDaysList.vue'),
    beforeEnter: async (to, from, next) => {
      try {
        // Load special days data before entering the route
        if (store) {
          await store.dispatch('specialDays/fetchAllSpecialDays');
        }
        next();
      } catch (err) {
        console.error('Navigation guard error:', err);
        next();
      }
    }
  },
  {
    path: '/quiz',
    name: 'Quiz',
    component: () => import('../views/Quiz.vue'),
    beforeEnter: async (to, from, next) => {
      try {
        if (store) {
          await store.dispatch('quiz/fetchAllQuestions');
        }
        next();
      } catch (err) {
        console.error('Navigation guard error:', err);
        next();
      }
    }
  },
  
  {
    path: '/custom-cake',
    name: 'CustomCake',
    component: () => import('../views/CustomCake.vue')
  },
  // Catch-all route for 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/Home.vue') // Or create a 404 view
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  // Get authentication state from store if possible, fallback to localStorage
  let isAuthenticated;
  
  try {
    isAuthenticated = store.getters['user/isAuthenticated'];
  } catch (e) {
    // Fallback to localStorage if store is not available
    isAuthenticated = JSON.parse(localStorage.getItem('isAuthenticated')) || false;
  }
  
  if (requiresAuth && !isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  } else if (to.path === '/checkout') {
    // Special case for checkout
    // If it's a guest checkout (has mode=guest query param), allow it
    if (to.query.mode === 'guest') {
      next();
    } 
    // If user is authenticated, allow it
    else if (isAuthenticated) {
      next();
    }
    // Otherwise redirect to login with redirect back to checkout
    else {
      next({
        path: '/login',
        query: { redirect: '/checkout' }
      });
    }
  } else {
    next();
  }
  
});

export default router;