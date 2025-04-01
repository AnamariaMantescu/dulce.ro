// store/modules/banners.js
import { db } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default {
  namespaced: true,
  state: {
    main: null,
    loading: false,
    error: null
  },
  mutations: {
    SET_MAIN_BANNER(state, banner) {
      state.main = banner;
      console.log('Banner data set:', banner); // Debug log
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
      console.error('Banner error:', error); // Debug log
    }
  },
  actions: {
    async initializeMainBanner({ commit }) {
      const defaultBanner = {
        id: 'main-banner',
        title: 'Descoperă magia deserturilor artizanale!',
        subtitle: 'Comandă tortul perfect sau creează-l pe al tău!',
        buttonText: 'Construiește-ți tortul',
        buttonLink: '/custom-cake',
        layout: 'grid',
        images: [
          'https://firebasestorage.googleapis.com/v0/b/cofetarie-artizanala.appspot.com/o/banners%2Fchocolate-dream.jpg?alt=media',
          'https://firebasestorage.googleapis.com/v0/b/cofetarie-artizanala.appspot.com/o/banners%2Fvanilla-delight.jpg?alt=media',
          'https://firebasestorage.googleapis.com/v0/b/cofetarie-artizanala.appspot.com/o/banners%2Fforest-fruits.jpg?alt=media',
          'https://firebasestorage.googleapis.com/v0/b/cofetarie-artizanala.appspot.com/o/banners%2Fcaramel-fusion.jpg?alt=media'
        ]
      };

      try {
        const bannerRef = doc(db, 'banners', 'main-banner');
        await setDoc(bannerRef, defaultBanner);
        console.log('Default banner initialized successfully');
        return defaultBanner;
      } catch (error) {
        console.error('Error initializing default banner:', error);
        throw error;
      }
    },

    async fetchMainBanner({ commit, dispatch }) {
      commit('SET_LOADING', true);
      try {
        console.log('Fetching main banner...'); // Debug log
        const bannerRef = doc(db, 'banners', 'main-banner');
        const bannerDoc = await getDoc(bannerRef);
        
        if (bannerDoc.exists()) {
          const bannerData = bannerDoc.data();
          console.log('Banner data fetched:', bannerData); // Debug log
          commit('SET_MAIN_BANNER', {
            id: bannerDoc.id,
            ...bannerData
          });
        } else {
          console.log('Main banner not found, initializing default...'); // Debug log
          const defaultBanner = await dispatch('initializeMainBanner');
          commit('SET_MAIN_BANNER', defaultBanner);
        }
      } catch (error) {
        console.error('Error fetching main banner:', error); // Debug log
        commit('SET_ERROR', error.message);
      } finally {
        commit('SET_LOADING', false);
      }
    }
  },
  getters: {
    getMainBanner: state => state.main,
    isLoading: state => state.loading,
    getError: state => state.error
  }
}
