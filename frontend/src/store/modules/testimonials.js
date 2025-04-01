// store/modules/testimonials.js
import { db } from '@/firebase';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';

export default {
  namespaced: true,
  state: {
    list: [],
    loading: false,
    error: null,
    stats: {
      totalCount: 0,
      averageRating: 0,
      ratingDistribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      }
    }
  },
  mutations: {
    SET_TESTIMONIALS(state, testimonials) {
      state.list = testimonials;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_STATS(state, stats) {
      state.stats = stats;
    }
  },
  actions: {
    async fetch({ commit, dispatch }, options = {}) {
      commit('SET_LOADING', true);
      try {
        // Schimbat de la 'testimonials' la 'reviews'
        const reviewsRef = collection(db, 'reviews');
        let queryConstraints = [];
        
        // Add filter by rating if specified
        if (options.minRating) {
          queryConstraints.push(where('rating', '>=', options.minRating));
        }
        
        // Add order by parameter with direction
        const orderField = options.orderBy || 'date';
        const orderDirection = options.orderDirection || 'desc';
        queryConstraints.push(orderBy(orderField, orderDirection));
        
        // Add limit if specified
        if (options.limit) {
          queryConstraints.push(limit(options.limit));
        }
        
        const q = query(reviewsRef, ...queryConstraints);
        const querySnapshot = await getDocs(q);
        
        const testimonials = [];
        querySnapshot.forEach((doc) => {
          // Mapare pentru format comun folosit în interfață
          const data = doc.data();
          testimonials.push({
            id: doc.id,
            name: data.user_name || 'Anonim', // Folosește user_name în loc de name
            text: data.comment || '', // Folosește comment în loc de text
            rating: data.rating || 0,
            date: data.date || new Date().toISOString(),
            product: data.product_id || '', // Mapează product_id la product
            title: data.title || '',
            verified: data.verified_purchase || false,
            images: data.images || [],
            tags: data.tags || [],
            likes: data.likes || 0,
            response: data.response || null
          });
        });
        
        commit('SET_TESTIMONIALS', testimonials);
        dispatch('calculateStats', testimonials);
        return testimonials;
      } catch (error) {
        console.error('Error fetching reviews:', error);
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    async fetchTopTestimonials({ dispatch }) {
      return dispatch('fetch', { 
        orderBy: 'rating', 
        orderDirection: 'desc', 
        limit: 6 
      });
    },
    
    async fetchRecentTestimonials({ dispatch }) {
      return dispatch('fetch', { 
        orderBy: 'date', 
        orderDirection: 'desc', 
        limit: 10 
      });
    },
    
    calculateStats({ commit }, testimonials) {
      if (!testimonials || testimonials.length === 0) {
        return;
      }
      
      // Calculate total count
      const totalCount = testimonials.length;
      
      // Calculate average rating
      const totalRating = testimonials.reduce((sum, item) => sum + item.rating, 0);
      const averageRating = totalRating / totalCount;
      
      // Calculate rating distribution
      const ratingDistribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      };
      
      testimonials.forEach(item => {
        if (item.rating >= 1 && item.rating <= 5) {
          ratingDistribution[Math.floor(item.rating)]++;
        }
      });
      
      const stats = {
        totalCount,
        averageRating: parseFloat(averageRating.toFixed(1)),
        ratingDistribution
      };
      
      commit('SET_STATS', stats);
    }
  },
  getters: {
    getAllTestimonials: state => state.list,
    
    getTopTestimonials: state => {
      return [...state.list]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
    },
    
    getRecentTestimonials: state => {
      return [...state.list]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);
    },
    
    getTestimonialsByRating: (state) => (minRating) => {
      return state.list.filter(item => item.rating >= minRating);
    },
    
    getAverageRating: state => state.stats.averageRating,
    
    getTotalCount: state => state.stats.totalCount,
    
    getRatingDistribution: state => state.stats.ratingDistribution
  }
};