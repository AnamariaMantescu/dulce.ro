// store/modules/customCake.js
import { db } from '@/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export default {
  namespaced: true,
  state: {
    currentDesign: {
      size: null,
      flavor: null,
      filling: null,
      frosting: null,
      toppings: [],
      message: '',
      specialInstructions: ''
    },
    options: {
      sizes: [],
      flavors: [],
      fillings: [],
      frostings: [],
      toppings: []
    },
    loading: false,
    error: null
  },
  mutations: {
    UPDATE_DESIGN(state, payload) {
      state.currentDesign = { ...state.currentDesign, ...payload };
    },
    RESET_DESIGN(state) {
      state.currentDesign = {
        size: null,
        flavor: null,
        filling: null,
        frosting: null,
        toppings: [],
        message: '',
        specialInstructions: ''
      };
    },
    ADD_TOPPING(state, topping) {
      if (!state.currentDesign.toppings.some(t => t.id === topping.id)) {
        state.currentDesign.toppings.push(topping);
      }
    },
    REMOVE_TOPPING(state, toppingId) {
      state.currentDesign.toppings = state.currentDesign.toppings.filter(t => t.id !== toppingId);
    },
    SET_OPTIONS(state, { category, options }) {
      state.options[category] = options;
    },
    SET_ALL_OPTIONS(state, options) {
      state.options = options;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  actions: {
    updateDesign({ commit }, payload) {
      commit('UPDATE_DESIGN', payload);
    },
    resetDesign({ commit }) {
      commit('RESET_DESIGN');
    },
    addTopping({ commit }, topping) {
      commit('ADD_TOPPING', topping);
    },
    removeTopping({ commit }, toppingId) {
      commit('REMOVE_TOPPING', toppingId);
    },
    async fetchOptions({ commit }) {
      commit('SET_LOADING', true);
      
      try {
        console.log('Fetching cake customization options...');
        
        // Try to load options from Firebase first
        const optionsFromDB = await fetchOptionsFromDB();
        
        if (optionsFromDB && Object.keys(optionsFromDB).length > 0) {
          console.log('Using options from database');
          commit('SET_ALL_OPTIONS', optionsFromDB);
        } else {
          console.log('Using default options');
          // Use default options if database fetch fails or returns empty
          const defaultOptions = {
            sizes: [
              { id: 'small', name: 'Mic (6-8 porții)', price: 120 },
              { id: 'medium', name: 'Mediu (10-12 porții)', price: 180 },
              { id: 'large', name: 'Mare (14-16 porții)', price: 240 },
              { id: 'xl', name: 'Extra Mare (20+ porții)', price: 300 }
            ],
            flavors: [
              { id: 'vanilla', name: 'Vanilie', price: 0 },
              { id: 'chocolate', name: 'Ciocolată', price: 0 },
              { id: 'redvelvet', name: 'Red Velvet', price: 10 },
              { id: 'carrot', name: 'Morcov', price: 15 },
              { id: 'lemon', name: 'Lămâie', price: 5 }
            ],
            fillings: [
              { id: 'vanilla_cream', name: 'Cremă de vanilie', price: 0 },
              { id: 'chocolate_ganache', name: 'Ganache de ciocolată', price: 10 },
              { id: 'fruit_jam', name: 'Gem de fructe', price: 5 },
              { id: 'caramel', name: 'Caramel', price: 15 }
            ],
            frostings: [
              { id: 'buttercream', name: 'Cremă de unt', price: 0 },
              { id: 'fondant', name: 'Fondant', price: 20 },
              { id: 'whipped_cream', name: 'Frișcă', price: 5 },
              { id: 'cream_cheese', name: 'Cremă de brânză', price: 15 }
            ],
            toppings: [
              { id: 'fresh_fruit', name: 'Fructe proaspete', price: 15 },
              { id: 'chocolate_shavings', name: 'Fulgi de ciocolată', price: 10 },
              { id: 'nuts', name: 'Nuci', price: 12 },
              { id: 'edible_flowers', name: 'Flori comestibile', price: 18 },
              { id: 'sprinkles', name: 'Sprinkles', price: 5 }
            ]
          };
          
          commit('SET_ALL_OPTIONS', defaultOptions);
        }
        commit('SET_ERROR', null);
      } catch (error) {
        console.error('Error loading cake options:', error);
        commit('SET_ERROR', error.message);
        
        // Use default options in case of error
        const defaultOptions = {
          sizes: [
            { id: 'small', name: 'Mic (6-8 porții)', price: 120 },
            { id: 'medium', name: 'Mediu (10-12 porții)', price: 180 },
            { id: 'large', name: 'Mare (14-16 porții)', price: 240 },
            { id: 'xl', name: 'Extra Mare (20+ porții)', price: 300 }
          ],
          flavors: [
            { id: 'vanilla', name: 'Vanilie', price: 0 },
            { id: 'chocolate', name: 'Ciocolată', price: 0 },
            { id: 'redvelvet', name: 'Red Velvet', price: 10 },
            { id: 'carrot', name: 'Morcov', price: 15 },
            { id: 'lemon', name: 'Lămâie', price: 5 }
          ],
          fillings: [
            { id: 'vanilla_cream', name: 'Cremă de vanilie', price: 0 },
            { id: 'chocolate_ganache', name: 'Ganache de ciocolată', price: 10 },
            { id: 'fruit_jam', name: 'Gem de fructe', price: 5 },
            { id: 'caramel', name: 'Caramel', price: 15 }
          ],
          frostings: [
            { id: 'buttercream', name: 'Cremă de unt', price: 0 },
            { id: 'fondant', name: 'Fondant', price: 20 },
            { id: 'whipped_cream', name: 'Frișcă', price: 5 },
            { id: 'cream_cheese', name: 'Cremă de brânză', price: 15 }
          ],
          toppings: [
            { id: 'fresh_fruit', name: 'Fructe proaspete', price: 15 },
            { id: 'chocolate_shavings', name: 'Fulgi de ciocolată', price: 10 },
            { id: 'nuts', name: 'Nuci', price: 12 },
            { id: 'edible_flowers', name: 'Flori comestibile', price: 18 },
            { id: 'sprinkles', name: 'Sprinkles', price: 5 }
          ]
        };
        
        commit('SET_ALL_OPTIONS', defaultOptions);
      } finally {
        commit('SET_LOADING', false);
      }
    }
  },
  getters: {
    currentDesign: state => state.currentDesign,
    designOptions: state => state.options,
    totalPrice: state => {
      let total = 0;
      
      // Adaugă prețul pentru mărime
      if (state.currentDesign.size) {
        const selectedSize = state.options.sizes.find(s => s.id === state.currentDesign.size);
        if (selectedSize) total += selectedSize.price;
      }
      
      // Adaugă prețul pentru aromă
      if (state.currentDesign.flavor) {
        const selectedFlavor = state.options.flavors.find(f => f.id === state.currentDesign.flavor);
        if (selectedFlavor) total += selectedFlavor.price;
      }
      
      // Adaugă prețul pentru umplutură
      if (state.currentDesign.filling) {
        const selectedFilling = state.options.fillings.find(f => f.id === state.currentDesign.filling);
        if (selectedFilling) total += selectedFilling.price;
      }
      
      // Adaugă prețul pentru glazură
      if (state.currentDesign.frosting) {
        const selectedFrosting = state.options.frostings.find(f => f.id === state.currentDesign.frosting);
        if (selectedFrosting) total += selectedFrosting.price;
      }
      
      // Adaugă prețul pentru toppinguri
      state.currentDesign.toppings.forEach(topping => {
        total += topping.price;
      });
      
      return total;
    },
    isLoading: state => state.loading,
    error: state => state.error
  }
};

// Helper function to fetch options from Firebase
async function fetchOptionsFromDB() {
  try {
    // Try to fetch from cakeElements collection in Firestore
    const options = {};
    
    // Check if we have the marimi subcollection
    const marimiRef = doc(db, 'cakeElements', 'marimi');
    const marimiDoc = await getDoc(marimiRef);
    
    if (marimiDoc.exists()) {
      // Get the items subcollection
      const marimiItemsRef = collection(db, 'cakeElements', 'marimi', 'items');
      const marimiSnapshot = await getDocs(marimiItemsRef);
      
      const sizes = [];
      marimiSnapshot.forEach(doc => {
        const data = doc.data();
        sizes.push({
          id: doc.id,
          name: data.name,
          price: data.price_multiplier * 100 // Approximate price calculation
        });
      });
      
      if (sizes.length > 0) {
        options.sizes = sizes;
      }
    }
    
    // Check if we have the blat subcollection
    const blatRef = doc(db, 'cakeElements', 'blat');
    const blatDoc = await getDoc(blatRef);
    
    if (blatDoc.exists()) {
      // Get the items subcollection
      const blatItemsRef = collection(db, 'cakeElements', 'blat', 'items');
      const blatSnapshot = await getDocs(blatItemsRef);
      
      const flavors = [];
      blatSnapshot.forEach(doc => {
        const data = doc.data();
        flavors.push({
          id: doc.id,
          name: data.name,
          price: data.price_per_layer || 0
        });
      });
      
      if (flavors.length > 0) {
        options.flavors = flavors;
      }
    }
    
    // Check if we have the crema subcollection
    const cremaRef = doc(db, 'cakeElements', 'crema');
    const cremaDoc = await getDoc(cremaRef);
    
    if (cremaDoc.exists()) {
      // Get the items subcollection
      const cremaItemsRef = collection(db, 'cakeElements', 'crema', 'items');
      const cremaSnapshot = await getDocs(cremaItemsRef);
      
      const fillings = [];
      cremaSnapshot.forEach(doc => {
        const data = doc.data();
        fillings.push({
          id: doc.id,
          name: data.name,
          price: data.price_per_layer || 0
        });
      });
      
      if (fillings.length > 0) {
        options.fillings = fillings;
      }
    }
    
    // Check if we have the topping subcollection
    const toppingRef = doc(db, 'cakeElements', 'topping');
    const toppingDoc = await getDoc(toppingRef);
    
    if (toppingDoc.exists()) {
      // Get the items subcollection
      const toppingItemsRef = collection(db, 'cakeElements', 'topping', 'items');
      const toppingSnapshot = await getDocs(toppingItemsRef);
      
      const frostings = [];
      toppingSnapshot.forEach(doc => {
        const data = doc.data();
        frostings.push({
          id: doc.id,
          name: data.name,
          price: data.price || 0
        });
      });
      
      if (frostings.length > 0) {
        options.frostings = frostings;
      }
    }
    
    // Check if we have the decoratiuni subcollection
    const decorRef = doc(db, 'cakeElements', 'decoratiuni');
    const decorDoc = await getDoc(decorRef);
    
    if (decorDoc.exists()) {
      // Get the items subcollection
      const decorItemsRef = collection(db, 'cakeElements', 'decoratiuni', 'items');
      const decorSnapshot = await getDocs(decorItemsRef);
      
      const toppings = [];
      decorSnapshot.forEach(doc => {
        const data = doc.data();
        toppings.push({
          id: doc.id,
          name: data.name,
          price: data.price || 0
        });
      });
      
      if (toppings.length > 0) {
        options.toppings = toppings;
      }
    }
    
    return options;
  } catch (error) {
    console.error('Error fetching cake options from DB:', error);
    return {};
  }
}