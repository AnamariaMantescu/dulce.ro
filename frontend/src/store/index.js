// store/index.js
import { createStore } from 'vuex'
import products from './modules/products'
import categories from './modules/categories'
import themes from './modules/themes'
import banners from './modules/banners'
import config from './modules/config'
import customCake from './modules/customCake'
import quiz from './modules/quiz'
import cart from './modules/cart' 
import user from './modules/user'
import stripe from './modules/stripe';
import specialDays from './modules/specialDays';
import testimonials from './modules/testimonials'

export default createStore({
  state: {
    loading: false,
    error: null,
    databaseInitialized: false
  },
  
  mutations: {
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_DATABASE_INITIALIZED(state, status) {
      state.databaseInitialized = status;
    }
  },
  
  actions: {
    async initializeApp({ commit, dispatch }) {
      commit('SET_LOADING', true);
      try {
        // Load configuration
        await dispatch('config/fetchSiteConfig');
        
        // Check if the banner needs to be initialized
        await dispatch('banners/fetchMainBanner');
        
        commit('SET_DATABASE_INITIALIZED', true);
        commit('SET_ERROR', null);
      } catch (error) {
        console.error('Error initializing app:', error);
        commit('SET_ERROR', error.message);
      } finally {
        commit('SET_LOADING', false);
      }
    }
  },
  
  modules: {
    products,
    categories,
    themes,
    banners,
    config,
    customCake,
    quiz,
    cart,
    user,
    stripe,
    specialDays,
    testimonials
  },
  
  getters: {
    isAppLoading: state => state.loading,
    appError: state => state.error,
    isDatabaseInitialized: state => state.databaseInitialized
  }
})