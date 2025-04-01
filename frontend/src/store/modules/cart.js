// store/modules/cart.js
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

const getDefaultState = () => ({
  items: [],
  customCake: null,
  subtotal: 0,
  shipping: 0,
  discountCode: null,
  discountAmount: 0,
  total: 0,
  loading: false,
  error: null
});

export default {
  namespaced: true,
  state: getDefaultState(),
  mutations: {
    ADD_ITEM(state, { product, quantity }) {
      const existingItem = state.items.find(item => item.product.id === product.id);
      if (existingItem) {
        // Actualizăm cantitatea pentru produsul existent
        existingItem.quantity += quantity;
      } else {
        // Adăugăm produsul nou în coș
        state.items.push({ product, quantity });
      }
      // Recalculăm valorile din coș
      this.commit('cart/RECALCULATE_TOTALS');
    },
    
    UPDATE_ITEM_QUANTITY(state, { productId, quantity }) {
      const item = state.items.find(item => item.product.id === productId);
      if (item) {
        if (quantity > 0) {
          item.quantity = quantity;
        } else {
          // Eliminăm produsul dacă cantitatea e 0 sau negativă
          const index = state.items.findIndex(item => item.product.id === productId);
          if (index !== -1) {
            state.items.splice(index, 1);
          }
        }
        this.commit('cart/RECALCULATE_TOTALS');
      }
    },
    
    REMOVE_ITEM(state, productId) {
      const index = state.items.findIndex(item => item.product.id === productId);
      if (index !== -1) {
        state.items.splice(index, 1);
        this.commit('cart/RECALCULATE_TOTALS');
      }
    },
    
    SET_CUSTOM_CAKE(state, customCake) {
      state.customCake = customCake;
      this.commit('cart/RECALCULATE_TOTALS');
    },
    
    CLEAR_CUSTOM_CAKE(state) {
      state.customCake = null;
      this.commit('cart/RECALCULATE_TOTALS');
    },
    
    SET_SHIPPING(state, shippingCost) {
      state.shipping = shippingCost;
      this.commit('cart/RECALCULATE_TOTALS');
    },
    
    APPLY_DISCOUNT(state, { code, amount }) {
      state.discountCode = code;
      state.discountAmount = amount;
      this.commit('cart/RECALCULATE_TOTALS');
    },
    
    REMOVE_DISCOUNT(state) {
      state.discountCode = null;
      state.discountAmount = 0;
      this.commit('cart/RECALCULATE_TOTALS');
    },
    
    CLEAR_CART(state) {
      Object.assign(state, getDefaultState());
      localStorage.removeItem('cart');
    },
    
    SET_LOADING(state, status) {
      state.loading = status;
    },
    
    SET_ERROR(state, error) {
      state.error = error;
    },
    
    // Mutație centralizată pentru recalcularea subtotal, shipping, discount și total
    RECALCULATE_TOTALS(state) {
      // Calculează subtotalul din produsele din coș
      let sum = state.items.reduce((total, item) => 
        total + (item.product.price * item.quantity), 0
      );
      
      // Adaugă prețul tortului personalizat, dacă există
      if (state.customCake && state.customCake.totalPrice) {
        sum += state.customCake.totalPrice;
      }
      state.subtotal = sum;
      
      // Logica pentru costul de livrare:
      // Dacă subtotalul este mai mic de 200 RON (și mai mare decât 0), costul de livrare este 15 RON,
      // altfel este gratuit.
      if (state.subtotal > 0 && state.subtotal < 200) {
        state.shipping = 15;
      } else {
        state.shipping = 0;
      }
      
      // Calculează totalul: subtotal + shipping - discount
      state.total = state.subtotal + state.shipping - state.discountAmount;
      
      // Salvăm coșul în localStorage
      this.commit('cart/SAVE_CART_TO_STORAGE');
    },
    
    SAVE_CART_TO_STORAGE(state) {
      const cartData = {
        items: state.items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        customCake: state.customCake,
        discountCode: state.discountCode,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('cart', JSON.stringify(cartData));
    },
    
    LOAD_CART_FROM_STORAGE(state, { items, customCake, discountCode }) {
      Object.assign(state, getDefaultState());
      state.items = items || [];
      state.customCake = customCake || null;
      state.discountCode = discountCode || null;
      
      state.subtotal = state.items.reduce((total, item) =>
        total + (item.product.price * item.quantity), 0
      );
      
      if (state.customCake && state.customCake.totalPrice) {
        state.subtotal += state.customCake.totalPrice;
      }
      
      state.total = state.subtotal + state.shipping - state.discountAmount;
    }
  },
  actions: {
    addToCart({ commit }, { product, quantity = 1 }) {
      commit('ADD_ITEM', { product, quantity });
    },
    
    updateItemQuantity({ commit }, { productId, quantity }) {
      commit('UPDATE_ITEM_QUANTITY', { productId, quantity });
    },
    
    removeFromCart({ commit }, productId) {
      commit('REMOVE_ITEM', productId);
    },
    
    addCustomCake({ commit }, customCake) {
      commit('SET_CUSTOM_CAKE', customCake);
    },
    
    removeCustomCake({ commit }) {
      commit('CLEAR_CUSTOM_CAKE');
    },
    
    setShipping({ commit }, shippingCost) {
      commit('SET_SHIPPING', shippingCost);
    },
    
    async applyDiscount({ commit, state }, code) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        // Verificăm dacă codul promoțional există și este activ
        const promotionsRef = collection(db, 'promotions');
        const promoQuery = query(promotionsRef, where("code", "==", code), where("active", "==", true));
        const promoSnapshot = await getDocs(promoQuery);
        
        if (promoSnapshot.empty) {
          commit('SET_ERROR', 'Codul promoțional nu există sau nu este valid.');
          return false;
        }
        
        const promotion = {
          id: promoSnapshot.docs[0].id,
          ...promoSnapshot.docs[0].data()
        };
        
        // Verificăm data de valabilitate
        const now = new Date();
        const startsAt = new Date(promotion.starts_at);
        const expiresAt = new Date(promotion.expires_at);
        
        if (now < startsAt || now > expiresAt) {
          commit('SET_ERROR', 'Codul promoțional nu este valid în această perioadă.');
          return false;
        }
        
        // Verificăm valoarea minimă a comenzii
        if (promotion.min_order && state.subtotal < promotion.min_order) {
          commit('SET_ERROR', `Valoarea minimă pentru acest cod promoțional este ${promotion.min_order} RON.`);
          return false;
        }
        
        // Calculăm valoarea discount-ului
        let discountAmount = 0;
        if (promotion.type === 'percent') {
          discountAmount = (state.subtotal * promotion.value) / 100;
          if (promotion.max_discount && discountAmount > promotion.max_discount) {
            discountAmount = promotion.max_discount;
          }
        } else if (promotion.type === 'fixed') {
          discountAmount = promotion.value;
        } else if (promotion.type === 'free_shipping') {
          discountAmount = state.shipping;
        }
        
        commit('APPLY_DISCOUNT', { code, amount: discountAmount });
        return true;
      } catch (error) {
        console.error('Eroare la aplicarea codului promoțional:', error);
        commit('SET_ERROR', 'A apărut o eroare la aplicarea codului promoțional.');
        return false;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    removeDiscount({ commit }) {
      commit('REMOVE_DISCOUNT');
    },
    
    clearCart({ commit }) {
      commit('CLEAR_CART');
    },
    
    async loadCartFromStorage({ commit, dispatch }) {
      const cartDataString = localStorage.getItem('cart');
      if (!cartDataString) {
        return;
      }
      
      try {
        const cartData = JSON.parse(cartDataString);
        const lastUpdated = new Date(cartData.lastUpdated);
        const now = new Date();
        const diffDays = Math.floor((now - lastUpdated) / (1000 * 60 * 60 * 24));
        if (diffDays > 3) {
          console.log('Coșul a expirat, a fost resetat.');
          localStorage.removeItem('cart');
          return;
        }
        
        const loadedItems = [];
        if (cartData.items && Array.isArray(cartData.items)) {
          for (const item of cartData.items) {
            if (item.productId) {
              try {
                const productRef = doc(db, 'products', item.productId);
                const productSnap = await getDoc(productRef);
                if (productSnap.exists()) {
                  const product = {
                    id: productSnap.id,
                    ...productSnap.data()
                  };
                  loadedItems.push({
                    product,
                    quantity: item.quantity
                  });
                }
              } catch (error) {
                console.error(`Eroare la încărcarea produsului ${item.productId}:`, error);
              }
            }
          }
        }
        
        commit('LOAD_CART_FROM_STORAGE', {
          items: loadedItems,
          customCake: cartData.customCake,
          discountCode: cartData.discountCode
        });
        
        if (cartData.discountCode) {
          dispatch('applyDiscount', cartData.discountCode);
        }
      } catch (error) {
        console.error('Eroare la încărcarea coșului din localStorage:', error);
        localStorage.removeItem('cart');
      }
    },
    
    async createOrder({ state, commit }, orderData) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const order = {
          user_id: orderData.userId || null,
          user_info: {
            name: orderData.name,
            email: orderData.email,
            phone: orderData.phone
          },
          status: 'în așteptare',
          products: state.items.map(item => ({
            product_id: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
            options: item.options || {}
          })),
          custom_cake: state.customCake,
          shipping_address: orderData.shippingAddress,
          payment: {
            method: orderData.paymentMethod,
            status: 'în așteptare'
          },
          delivery: {
            method: orderData.deliveryMethod,
            fee: state.shipping,
            requested_date: orderData.requestedDate,
            requested_time: orderData.requestedTime
          },
          subtotal: state.subtotal,
          shipping: state.shipping,
          discount: state.discountCode ? {
            code: state.discountCode,
            amount: state.discountAmount
          } : null,
          total: state.total,
          notes: orderData.notes || '',
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        };
        
        const orderRef = await addDoc(collection(db, 'orders'), order);
        commit('CLEAR_CART');
        return {
          success: true,
          orderId: orderRef.id
        };
      } catch (error) {
        console.error('Eroare la crearea comenzii:', error);
        commit('SET_ERROR', 'A apărut o eroare la plasarea comenzii.');
        return {
          success: false,
          error: error.message
        };
      } finally {
        commit('SET_LOADING', false);
      }
    }
  },
  getters: {
    cartItems: state => state.items,
    cartItemCount: state => state.items.reduce((count, item) => count + item.quantity, 0),
    subtotal: state => state.subtotal,
    shipping: state => state.shipping,
    discountCode: state => state.discountCode,
    discountAmount: state => state.discountAmount,
    total: state => state.total,
    customCake: state => state.customCake,
    isCartEmpty: state => state.items.length === 0 && !state.customCake,
    isLoading: state => state.loading,
    error: state => state.error
  }
};
