import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default {
  namespaced: true,

  state: () => ({
    questions: [],
    loading: false,
    error: null
  }),

  getters: {
    getQuestions: state => state.questions,
    isLoading: state => state.loading,
    getError: state => state.error
  },

  mutations: {
    SET_QUESTIONS(state, questions) {
      state.questions = questions;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },

  actions: {
    async fetchAllQuestions({ commit }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const snapshot = await getDocs(collection(db, 'quizQuestions'));
        const questions = snapshot.docs.map(doc => doc.data());
        commit('SET_QUESTIONS', questions);
      } catch (error) {
        commit('SET_ERROR', error.message || 'Eroare la încărcarea întrebărilor.');
      } finally {
        commit('SET_LOADING', false);
      }
    }
  }
};
