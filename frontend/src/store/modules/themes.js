import { db } from '@/firebase';
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, updateDoc, Timestamp, query, where } from 'firebase/firestore';

// Themes Store Module
const themesModule = {
  namespaced: true,
  
  state: {
    activeTheme: null,
    upcomingTheme: null,
    allThemes: [],
    loading: false,
    error: null
  },
  
  mutations: {
    SET_ACTIVE_THEME(state, theme) {
      state.activeTheme = theme;
    },
    SET_UPCOMING_THEME(state, theme) {
      state.upcomingTheme = theme;
    },
    SET_ALL_THEMES(state, themes) {
      state.allThemes = themes;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    ADD_OR_UPDATE_THEME(state, theme) {
      const index = state.allThemes.findIndex(t => t.id === theme.id);
      if (index !== -1) {
        // Update existing theme
        state.allThemes.splice(index, 1, theme);
      } else {
        // Add new theme
        state.allThemes.push(theme);
      }
    },
    REMOVE_THEME(state, id) {
      state.allThemes = state.allThemes.filter(theme => theme.id !== id);
      // If this was the active theme, reset it
      if (state.activeTheme && state.activeTheme.id === id) {
        state.activeTheme = null;
      }
      // If this was the upcoming theme, reset it
      if (state.upcomingTheme && state.upcomingTheme.id === id) {
        state.upcomingTheme = null;
      }
    }
  },
  
  actions: {
    // Fetch all themes from Firestore
    async fetchAllThemes({ commit }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const themesRef = collection(db, 'themes');
        const snapshot = await getDocs(themesRef);
        
        if (snapshot.empty) {
          console.log('No themes found in database');
          commit('SET_ALL_THEMES', []);
          return [];
        }
        
        const themes = snapshot.docs.map(doc => {
          const themeData = doc.data();
          
          // Parse dates properly
          let startDate, endDate;
          
          if (themeData.start_date instanceof Timestamp) {
            startDate = themeData.start_date.toDate();
          } else if (typeof themeData.start_date === 'string') {
            startDate = new Date(themeData.start_date);
          } else {
            startDate = new Date(themeData.start_date);
          }
          
          if (themeData.end_date instanceof Timestamp) {
            endDate = themeData.end_date.toDate();
          } else if (typeof themeData.end_date === 'string') {
            endDate = new Date(themeData.end_date);
          } else {
            endDate = new Date(themeData.end_date);
          }
          
          // Set time to end of day for end_date to include the full day
          endDate.setHours(23, 59, 59, 999);
          
          // Return processed theme with dates standardized
          return {
            id: doc.id,
            ...themeData,
            // Store the date objects for comparisons
            start_date_obj: startDate,
            end_date_obj: endDate,
            // Ensure dates are in string format for components
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0]
          };
        });
        
        commit('SET_ALL_THEMES', themes);
        
        // Find and set active theme
        const today = new Date();
        const activeThemes = themes.filter(theme => {
          return theme.active && today >= theme.start_date_obj && today <= theme.end_date_obj;
        });
        
        if (activeThemes.length > 0) {
          // Sort by start date (most recent first)
          activeThemes.sort((a, b) => b.start_date_obj - a.start_date_obj);
          commit('SET_ACTIVE_THEME', activeThemes[0]);
        } else {
          commit('SET_ACTIVE_THEME', null);
        }
        
        // Find and set upcoming theme
        const upcomingThemes = themes.filter(theme => {
          return theme.active && theme.start_date_obj > today;
        });
        
        if (upcomingThemes.length > 0) {
          // Sort by start date (earliest first)
          upcomingThemes.sort((a, b) => a.start_date_obj - b.start_date_obj);
          commit('SET_UPCOMING_THEME', upcomingThemes[0]);
        } else {
          commit('SET_UPCOMING_THEME', null);
        }
        
        return themes;
      } catch (error) {
        console.error('Error fetching themes:', error);
        commit('SET_ERROR', 'Nu am putut încărca temele.');
        return [];
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Fetch a specific theme by ID
    async fetchThemeById({ commit, state }, id) {
      // If we already have this theme in state, no need to fetch
      const existingTheme = state.allThemes.find(theme => theme.id === id);
      if (existingTheme) {
        console.log('Theme found in state, no need to fetch:', id);
        commit('SET_ACTIVE_THEME', existingTheme);
        return existingTheme;
      }
      
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        console.log('Fetching theme from Firestore:', id);
        const themeRef = doc(db, 'themes', id);
        const themeSnap = await getDoc(themeRef);
        
        if (themeSnap.exists()) {
          const themeData = themeSnap.data();
          
          // Parse dates properly
          let startDate, endDate;
          
          if (themeData.start_date instanceof Timestamp) {
            startDate = themeData.start_date.toDate();
          } else if (typeof themeData.start_date === 'string') {
            startDate = new Date(themeData.start_date);
          } else {
            startDate = new Date(themeData.start_date);
          }
          
          if (themeData.end_date instanceof Timestamp) {
            endDate = themeData.end_date.toDate();
          } else if (typeof themeData.end_date === 'string') {
            endDate = new Date(themeData.end_date);
          } else {
            endDate = new Date(themeData.end_date);
          }
          
          // Set time to end of day for end_date to include the full day
          endDate.setHours(23, 59, 59, 999);
          
          // Process theme with standardized dates
          const theme = {
            id: themeSnap.id,
            ...themeData,
            // Store the date objects for comparisons
            start_date_obj: startDate,
            end_date_obj: endDate,
            // Ensure dates are in string format for components
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0]
          };
          
          commit('ADD_OR_UPDATE_THEME', theme);
          
          return theme;
        } else {
          console.log('Theme not found in Firestore:', id);
          commit('SET_ERROR', 'Tema nu a fost găsită.');
          return null;
        }
      } catch (error) {
        console.error('Error fetching theme by ID:', error);
        commit('SET_ERROR', 'Nu am putut încărca detaliile temei.');
        return null;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Save a theme (create or update)
    async saveTheme({ commit }, theme) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        // Validate required fields
        if (!theme.id || !theme.name || !theme.start_date || !theme.end_date) {
          throw new Error('Lipsesc câmpuri obligatorii (id, nume, data început, data sfârșit).');
        }
        
        // Clean up any empty arrays
        const themeToSave = { ...theme };
        if (themeToSave.products_ids) {
          themeToSave.products_ids = themeToSave.products_ids.filter(id => id);
        } else {
          themeToSave.products_ids = [];
        }
        
        if (themeToSave.gallery) {
          themeToSave.gallery = themeToSave.gallery.filter(url => url);
        } else {
          themeToSave.gallery = [];
        }
        
        // Save to Firestore
        await setDoc(doc(db, 'themes', themeToSave.id), themeToSave);
        
        // Process the theme for the store
        let startDate = new Date(themeToSave.start_date);
        let endDate = new Date(themeToSave.end_date);
        endDate.setHours(23, 59, 59, 999);
        
        const processedTheme = {
          ...themeToSave,
          start_date_obj: startDate,
          end_date_obj: endDate
        };
        
        // Update state
        commit('ADD_OR_UPDATE_THEME', processedTheme);
        
        // Check if this is now the active or upcoming theme
        const today = new Date();
        if (processedTheme.active) {
          if (today >= startDate && today <= endDate) {
            commit('SET_ACTIVE_THEME', processedTheme);
          } else if (startDate > today) {
            // Check if this is the earliest upcoming theme
            const currentUpcoming = state.upcomingTheme;
            if (!currentUpcoming || startDate < currentUpcoming.start_date_obj) {
              commit('SET_UPCOMING_THEME', processedTheme);
            }
          }
        }
        
        return processedTheme;
      } catch (error) {
        console.error('Error saving theme:', error);
        commit('SET_ERROR', `Nu am putut salva tema: ${error.message}`);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Delete a theme
    async deleteTheme({ commit }, id) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        await deleteDoc(doc(db, 'themes', id));
        
        // Update state
        commit('REMOVE_THEME', id);
        
        return true;
      } catch (error) {
        console.error('Error deleting theme:', error);
        commit('SET_ERROR', `Nu am putut șterge tema: ${error.message}`);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Toggle active status for a theme
    async toggleThemeActive({ commit, state, dispatch }, id) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const theme = state.allThemes.find(theme => theme.id === id);
        if (!theme) {
          throw new Error('Tema nu a fost găsită.');
        }
        
        const newStatus = !theme.active;
        
        // Update in Firestore
        await updateDoc(doc(db, 'themes', id), { active: newStatus });
        
        // Refresh all themes to update active/upcoming
        await dispatch('fetchAllThemes');
        
        return newStatus;
      } catch (error) {
        console.error('Error toggling theme active status:', error);
        commit('SET_ERROR', `Nu am putut actualiza statusul temei: ${error.message}`);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  },
  
  getters: {
    activeTheme: state => state.activeTheme,
    upcomingTheme: state => state.upcomingTheme,
    allThemes: state => state.allThemes,
    isThemeActive: state => !!state.activeTheme,
    getThemeById: (state) => (id) => {
      return state.allThemes.find(theme => theme.id === id) || null;
    },
    isLoading: state => state.loading,
    error: state => state.error,
    
    // Get upcoming themes sorted by start date
    upcomingThemes: state => {
      const today = new Date();
      return state.allThemes
        .filter(theme => theme.active && theme.start_date_obj > today)
        .sort((a, b) => a.start_date_obj - b.start_date_obj);
    },
    
    // Get current active themes
    currentThemes: state => {
      const today = new Date();
      return state.allThemes.filter(theme => {
        return theme.active && today >= theme.start_date_obj && today <= theme.end_date_obj;
      });
    },
    
    // Get past themes
    pastThemes: state => {
      const today = new Date();
      return state.allThemes
        .filter(theme => today > theme.end_date_obj)
        .sort((a, b) => b.end_date_obj - a.end_date_obj); // Most recent first
    }
  }
};

export default themesModule;