import { db } from '@/firebase';
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

// Special Days Store Module
const specialDaysModule = {
  namespaced: true,
  
  state: {
    specialDays: [],
    currentSpecialDay: null,
    loading: false,
    error: null
  },
  
  getters: {
    getAllSpecialDays: (state) => state.specialDays,
    
    getSpecialDayById: (state) => (id) => {
      return state.specialDays.find(day => day.id === id);
    },
    
    getCurrentSpecialDay: (state) => state.currentSpecialDay,
    
    getTodaySpecialDay: (state) => {
      const today = new Date().toISOString().split('T')[0];
      // Find an active special day for today
      return state.specialDays.find(day => day.date === today && day.active);
    },
    
    getUpcomingSpecialDays: (state) => {
      const today = new Date().toISOString().split('T')[0];
      // Find active upcoming special days
      return state.specialDays
        .filter(day => day.date > today && day.active)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    
    isLoading: (state) => state.loading,
    
    getError: (state) => state.error
  },
  
  mutations: {
    SET_SPECIAL_DAYS(state, specialDays) {
      state.specialDays = specialDays;
    },
    
    SET_CURRENT_SPECIAL_DAY(state, specialDay) {
      state.currentSpecialDay = specialDay;
    },
    
    SET_LOADING(state, status) {
      state.loading = status;
    },
    
    SET_ERROR(state, error) {
      state.error = error;
    },
    
    ADD_OR_UPDATE_SPECIAL_DAY(state, specialDay) {
      const index = state.specialDays.findIndex(day => day.id === specialDay.id);
      if (index !== -1) {
        // Update existing day
        state.specialDays.splice(index, 1, specialDay);
      } else {
        // Add new day
        state.specialDays.push(specialDay);
      }
    },
    
    REMOVE_SPECIAL_DAY(state, id) {
      state.specialDays = state.specialDays.filter(day => day.id !== id);
      // If this was the current special day, reset it
      if (state.currentSpecialDay && state.currentSpecialDay.id === id) {
        state.currentSpecialDay = null;
      }
    }
  },
  
  actions: {
    // Fetch all special days from Firestore
    async fetchAllSpecialDays({ commit }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const specialDaysRef = collection(db, 'specialDays');
        const snapshot = await getDocs(specialDaysRef);
        
        if (snapshot.empty) {
          console.log('No special days found in database');
          commit('SET_SPECIAL_DAYS', []);
          return [];
        }
        
        const specialDays = snapshot.docs.map(doc => {
          return { id: doc.id, ...doc.data() };
        });
        
        console.log(`Fetched ${specialDays.length} special days from Firestore`);
        commit('SET_SPECIAL_DAYS', specialDays);
        return specialDays;
      } catch (error) {
        console.error('Error fetching special days:', error);
        commit('SET_ERROR', 'Nu am putut încărca zilele speciale.');
        return [];
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Fetch a specific special day by ID
    async fetchSpecialDayById({ commit, state }, id) {
      // If we already have this special day in state, no need to fetch
      const existingDay = state.specialDays.find(day => day.id === id);
      if (existingDay) {
        console.log('Special day found in state, no need to fetch:', id);
        commit('SET_CURRENT_SPECIAL_DAY', existingDay);
        return existingDay;
      }
      
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        console.log('Fetching special day from Firestore:', id);
        const specialDayRef = doc(db, 'specialDays', id);
        const specialDaySnap = await getDoc(specialDayRef);
        
        if (specialDaySnap.exists()) {
          const specialDay = { id: specialDaySnap.id, ...specialDaySnap.data() };
          console.log('Special day fetched:', specialDay);
          
          // Add or update in our list of special days
          commit('ADD_OR_UPDATE_SPECIAL_DAY', specialDay);
          commit('SET_CURRENT_SPECIAL_DAY', specialDay);
          
          return specialDay;
        } else {
          console.log('Special day not found in Firestore:', id);
          commit('SET_ERROR', 'Ziua specială nu a fost găsită.');
          return null;
        }
      } catch (error) {
        console.error('Error fetching special day:', error);
        commit('SET_ERROR', 'Nu am putut încărca detaliile zilei speciale.');
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Add or update a special day
    async saveSpecialDay({ commit }, specialDay) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        // Make sure we have the required fields
        if (!specialDay.id || !specialDay.name || !specialDay.date) {
          throw new Error('Lipsesc câmpuri obligatorii (id, nume, data).');
        }
        
        // Clean up any empty product IDs
        if (specialDay.products_ids) {
          specialDay.products_ids = specialDay.products_ids.filter(id => id);
        }
        
        // Save to Firestore
        await setDoc(doc(db, 'specialDays', specialDay.id), specialDay);
        
        // Update state
        commit('ADD_OR_UPDATE_SPECIAL_DAY', specialDay);
        console.log('Special day saved successfully:', specialDay.id);
        
        return specialDay;
      } catch (error) {
        console.error('Error saving special day:', error);
        commit('SET_ERROR', `Nu am putut salva ziua specială: ${error.message}`);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Delete a special day
    async deleteSpecialDay({ commit }, id) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        await deleteDoc(doc(db, 'specialDays', id));
        
        // Update state
        commit('REMOVE_SPECIAL_DAY', id);
        console.log('Special day deleted successfully:', id);
        
        return true;
      } catch (error) {
        console.error('Error deleting special day:', error);
        commit('SET_ERROR', `Nu am putut șterge ziua specială: ${error.message}`);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Toggle active status for a special day
    async toggleSpecialDayActive({ commit, state }, id) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const specialDay = state.specialDays.find(day => day.id === id);
        if (!specialDay) {
          throw new Error('Ziua specială nu a fost găsită.');
        }
        
        const newStatus = !specialDay.active;
        
        // Update in Firestore
        await updateDoc(doc(db, 'specialDays', id), { active: newStatus });
        
        // Update in state
        const updatedDay = { ...specialDay, active: newStatus };
        commit('ADD_OR_UPDATE_SPECIAL_DAY', updatedDay);
        
        console.log(`Special day ${id} active status updated to: ${newStatus}`);
        return updatedDay;
      } catch (error) {
        console.error('Error toggling special day active status:', error);
        commit('SET_ERROR', `Nu am putut actualiza statusul zilei speciale: ${error.message}`);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Set the current special day (for home page display)
    setCurrentSpecialDay({ commit, state }) {
      const today = new Date().toISOString().split('T')[0];
      
      // First try to find an active special day happening today
      const todaySpecialDay = state.specialDays.find(day => day.date === today && day.active);
      
      if (todaySpecialDay) {
        // Found a special day for today
        const currentDay = {
          ...todaySpecialDay,
          isToday: true
        };
        commit('SET_CURRENT_SPECIAL_DAY', currentDay);
        return;
      }
      
      // If no special day today, find the next upcoming active one
      const upcomingDays = state.specialDays
        .filter(day => day.date > today && day.active)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      if (upcomingDays.length > 0) {
        const nextDay = {
          ...upcomingDays[0],
          isToday: false
        };
        commit('SET_CURRENT_SPECIAL_DAY', nextDay);
      } else {
        // No upcoming days found
        commit('SET_CURRENT_SPECIAL_DAY', null);
      }
    }
  }
};

export default specialDaysModule;