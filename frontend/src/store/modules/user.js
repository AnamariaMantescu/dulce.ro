// store/modules/user.js
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc,
  addDoc,
  deleteDoc,
  orderBy
} from 'firebase/firestore';
import { auth, db } from '../../firebase';

export default {
  namespaced: true,
  state: {
    currentUser: null,
    userProfile: null,
    isAuthenticated: false,
    userOrders: [],
    userReviews: [],
    loading: false,
    error: null
  },
  mutations: {
    SET_CURRENT_USER(state, user) {
      state.currentUser = user;
      state.isAuthenticated = !!user;
      console.log('SET_CURRENT_USER mutation called, isAuthenticated now:', state.isAuthenticated);
    },
    SET_USER_PROFILE(state, profile) {
      state.userProfile = profile;
    },
    SET_USER_ORDERS(state, orders) {
      state.userOrders = orders;
    },
    SET_USER_REVIEWS(state, reviews) {
      state.userReviews = reviews;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_USER(state) {
      state.currentUser = null;
      state.userProfile = null;
      state.userOrders = [];
      state.userReviews = [];
      state.isAuthenticated = false;
      state.error = null;
      console.log('CLEAR_USER mutation called, isAuthenticated now:', state.isAuthenticated);
    }
  },
  actions: {
    // Acțiune apelată la autentificare
    async login({ commit, dispatch }, { email, password }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Make sure we update the state synchronously
        commit('SET_CURRENT_USER', user);
        
        // Încarcă profilul utilizatorului din Firestore
        await dispatch('fetchUserProfile', user.uid);
        
        console.log('Login successful, auth state is now:', user ? true : false);
        return user;
      } catch (error) {
        console.error('Eroare la autentificare:', error);
        let errorMessage;
        
        switch(error.code) {
          case 'auth/invalid-email':
            errorMessage = 'Adresa de email este invalidă.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'Acest cont a fost dezactivat.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'Nu există un cont asociat cu acest email.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Parolă incorectă.';
            break;
          default:
            errorMessage = 'A apărut o eroare la autentificare.';
        }
        
        commit('SET_ERROR', errorMessage);
        throw new Error(errorMessage);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Acțiune apelată la înregistrare
    async register({ commit, dispatch }, { name, email, password }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        // Creează utilizatorul în Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Adaugă displayName la profilul utilizatorului
        await updateProfile(user, {
          displayName: name
        });
        
        // Creăm documentul utilizatorului în Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          displayName: name,
          email: email,
          role: 'customer', // Rol implicit pentru utilizatorii noi
          createdAt: new Date().toISOString()
        });
        
        // Actualizăm starea din Vuex
        commit('SET_CURRENT_USER', user);
        await dispatch('fetchUserProfile', user.uid);
        
        return user;
      } catch (error) {
        console.error('Eroare la înregistrare:', error);
        let errorMessage;
        
        switch(error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Acest email este deja asociat unui cont.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Adresa de email este invalidă.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Parola este prea slabă.';
            break;
          default:
            errorMessage = 'A apărut o eroare la înregistrare.';
        }
        
        commit('SET_ERROR', errorMessage);
        throw new Error(errorMessage);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Acțiune apelată la delogare
   // Update the logout action in your user.js store module
async logout({ commit }) {
  try {
    await signOut(auth);
    commit('CLEAR_USER');
    
    // Clear localStorage authentication data
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isAdmin');
    console.log('User logged out, localStorage cleared');
  } catch (error) {
    console.error('Eroare la delogare:', error);
    commit('SET_ERROR', 'A apărut o eroare la delogare.');
    throw error;
  }
},
    
    // Actualizează starea utilizatorului când se schimbă starea de autentificare
    async setUser({ commit, dispatch }, user) {
      console.log('Setting user in store:', user ? user.uid : 'none');
      
      if (user) {
        // Ensure we set the current user immediately to update isAuthenticated
        commit('SET_CURRENT_USER', user);
        
        // Then fetch the profile asynchronously
        try {
          await dispatch('fetchUserProfile', user.uid);
          console.log('User profile fetched successfully');
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        commit('CLEAR_USER');
      }
    },
    
// Update the fetchUserProfile action in your user.js store module
async fetchUserProfile({ commit }, uid) {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const userData = docSnap.data();
      commit('SET_USER_PROFILE', userData);
      console.log('User profile fetched and set in store:', userData);
      
      // Store authentication and admin status in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('isAdmin', JSON.stringify(userData.role === 'admin'));
      
      console.log('Admin status stored in localStorage:', userData.role === 'admin');
    } else {
      console.log('Nu există un profil pentru acest utilizator!');
      commit('SET_USER_PROFILE', null);
      localStorage.setItem('isAuthenticated', 'false');
      localStorage.setItem('isAdmin', 'false');
    }
  } catch (error) {
    console.error('Eroare la încărcarea profilului:', error);
    commit('SET_ERROR', 'Nu s-a putut încărca profilul utilizatorului.');
    localStorage.setItem('isAuthenticated', 'false');
    localStorage.setItem('isAdmin', 'false');
  }
},
    
    // Actualizează profilul utilizatorului
    async updateUserProfile({ commit, state }, profileData) {
      if (!state.currentUser) {
        throw new Error('Utilizatorul nu este autentificat.');
      }
      
      try {
        const userId = state.currentUser.uid;
        const userRef = doc(db, 'users', userId);
        
        // Actualizăm doar câmpurile furnizate
        await updateDoc(userRef, profileData);
        
        // Actualizăm și în Authentication dacă s-a schimbat displayName
        if (profileData.displayName && profileData.displayName !== state.currentUser.displayName) {
          await updateProfile(state.currentUser, {
            displayName: profileData.displayName
          });
        }
        
        // Actualizăm starea din Vuex
        const updatedProfile = {
          ...state.userProfile,
          ...profileData
        };
        
        commit('SET_USER_PROFILE', updatedProfile);
        return updatedProfile;
      } catch (error) {
        console.error('Eroare la actualizarea profilului:', error);
        throw new Error('Nu s-a putut actualiza profilul utilizatorului.');
      }
    },
    
    // Încarcă comenzile utilizatorului
// Store module - user.js (actions section)

// Add this to your user store module
async fetchUserOrders({ commit, rootState }) {
  try {
    const userId = rootState.user.currentUser.uid; // Adjust this path if needed
    if (!userId) throw new Error('User not authenticated');
    
    // Replace with your actual Firestore collection reference
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', userId), orderBy('created', 'desc'));
    const snapshot = await getDocs(q);
    
    const orders = snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Map products array to a consistent format
      let orderProducts = [];
      if (data.products && Array.isArray(data.products)) {
        // Use existing products array
        orderProducts = data.products;
      }
      
      return {
        id: doc.id,
        ...data,
        // Ensure consistent structure for the component
        products: orderProducts
      };
    });
    
    return orders;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
},
    
    // Încarcă detaliile unei comenzi
// Enhanced fetchOrderDetails method for user.js
// Replace the existing fetchOrderDetails method with this one

async fetchOrderDetails({ commit, state }, orderId) {
  if (!orderId) {
    throw new Error('ID-ul comenzii este obligatoriu');
  }
  
  // First check if the order is already in state
  if (state.userOrders && state.userOrders.length > 0) {
    const cachedOrder = state.userOrders.find(order => order.id === orderId);
    if (cachedOrder) {
      console.log('Comanda a fost găsită în cache:', orderId);
      return cachedOrder;
    }
  }
  
  try {
    // If not in state, fetch from Firestore
    console.log('Încărcăm comanda din Firestore:', orderId);
    
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists()) {
      throw new Error('Comanda nu a fost găsită.');
    }
    
    const orderData = orderDoc.data();
    
    // Check if current user is authenticated
    if (state.currentUser) {
      // Verify if this order belongs to the current user, if user is logged in
      if (orderData.userId && orderData.userId !== state.currentUser.uid) {
        console.warn('Comandă găsită, dar nu aparține utilizatorului curent');
      }
    }
    
    const order = {
      id: orderDoc.id,
      ...orderData
    };
    
    // Cache the order in state
    if (!state.userOrders.some(o => o.id === order.id)) {
      commit('SET_USER_ORDERS', [...state.userOrders, order]);
    }
    
    return order;
  } catch (error) {
    console.error('Eroare la încărcarea detaliilor comenzii:', error);
    throw error;
  }
},
    
    // Încarcă recenziile utilizatorului
    async fetchUserReviews({ commit, state }) {
      if (!state.currentUser) {
        console.error('Nu există un utilizator autentificat pentru a încărca recenziile.');
        return [];
      }
      
      try {
        const userId = state.currentUser.uid;
        const reviewsRef = collection(db, 'reviews');
        const q = query(
          reviewsRef,
          where('user_id', '==', userId),
          orderBy('date', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const reviews = [];
        
        querySnapshot.forEach((doc) => {
          reviews.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log(`S-au încărcat ${reviews.length} recenzii pentru utilizatorul ${userId}`);
        commit('SET_USER_REVIEWS', reviews);
        return reviews;
      } catch (error) {
        console.error('Eroare la încărcarea recenziilor:', error);
        commit('SET_ERROR', 'Nu s-au putut încărca recenziile.');
        return [];
      }
    },
    
    // Adaugă o nouă recenzie
// Versiune îmbunătățită a acțiunii submitReview din user.js
async submitReview({ commit, state, dispatch }, reviewData) {
  try {
    // Verificăm autentificarea utilizatorului
    if (!state.currentUser) {
      throw new Error('Trebuie să fiți autentificat pentru a trimite o recenzie');
    }
    
    // Validare câmpuri obligatorii
    if (!reviewData.product_id) {
      throw new Error('ID-ul produsului este obligatoriu');
    }
    
    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error('Rating-ul trebuie să fie între 1 și 5');
    }
    
    if (!reviewData.title || !reviewData.comment) {
      throw new Error('Titlul și comentariul sunt obligatorii');
    }
    
    // Setăm datele utilizatorului dacă lipsesc
    if (!reviewData.user_id) {
      reviewData.user_id = state.currentUser.uid;
    }
    
    if (!reviewData.user_name) {
      reviewData.user_name = state.currentUser.displayName || 'Utilizator anonim';
    }
    
    // Asigurăm-ne că avem verificare achiziție
    if (reviewData.verified_purchase === undefined) {
      reviewData.verified_purchase = true;
    }
    
    // Asigurăm-ne că avem data
    if (!reviewData.date) {
      reviewData.date = new Date().toISOString().split('T')[0];
    }
    
    // Verificăm dacă este o actualizare sau o recenzie nouă
    let reviewRef;
    
    if (reviewData.id) {
      // Actualizăm o recenzie existentă
      reviewRef = doc(db, 'reviews', reviewData.id);
      
      // Eliminăm ID-ul din datele de actualizat
      const { id, ...updateData } = reviewData;
      
      // Actualizăm recenzia în Firestore
      await updateDoc(reviewRef, {
        ...updateData,
        updated_date: new Date().toISOString().split('T')[0]
      });
      
      console.log('Recenzie actualizată cu succes:', reviewData.id);
    } else {
      // Creăm o recenzie nouă
      
      // Creăm o referință nouă pentru recenzie
      const reviewsCollection = collection(db, 'reviews');
      
      // Eliminăm câmpurile care nu ar trebui să fie în baza de date
      const { isPlaceholderProduct, ...cleanData } = reviewData;
      
      // Adăugăm recenzia în Firestore
      const docRef = await addDoc(reviewsCollection, {
        ...cleanData,
        date: cleanData.date || new Date().toISOString().split('T')[0]
      });
      
      console.log('Recenzie adăugată cu succes. ID:', docRef.id);
      
      // Actualizăm comanda pentru a o marca ca recenzată dacă order_id este furnizat
      if (reviewData.order_id) {
        try {
          const orderRef = doc(db, 'orders', reviewData.order_id);
          await updateDoc(orderRef, {
            reviewed: true
          });
          console.log('Comandă marcată ca recenzată:', reviewData.order_id);
        } catch (orderError) {
          // Eroare non-critică, doar o logăm
          console.error('Eroare la marcarea comenzii ca recenzată:', orderError);
        }
      }
    }
    
    // Actualizăm recenziile în state
    await dispatch('fetchUserReviews');
    
    return true;
  } catch (error) {
    console.error('Eroare la trimiterea recenziei:', error);
    commit('SET_ERROR', error.message);
    throw error;
  }
},   
    // Add this function to your user.js store module actions
async promoteToAdmin({ commit, state }, userId) {
  try {
    if (!state.currentUser || !state.userProfile?.role === 'admin') {
      throw new Error('You do not have permission to perform this action');
    }
    
    // Update the user's role in Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: 'admin'
    });
    
    return true;
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    throw error;
  }
},
    // Editează o recenzie existentă
    async editReview({ state, dispatch }, { reviewId, reviewData }) {
      if (!state.currentUser) {
        throw new Error('Utilizatorul nu este autentificat.');
      }
      
      try {
        const reviewRef = doc(db, 'reviews', reviewId);
        const reviewDoc = await getDoc(reviewRef);
        
        if (!reviewDoc.exists()) {
          throw new Error('Recenzia nu a fost găsită.');
        }
        
        const existingReview = reviewDoc.data();
        
        // Verificăm dacă recenzia aparține utilizatorului curent
        if (existingReview.user_id !== state.currentUser.uid) {
          throw new Error('Nu aveți permisiunea de a edita această recenzie.');
        }
        
        // Actualizăm doar câmpurile permise (nu permitem schimbarea user_id, date, etc.)
        const allowedFields = ['rating', 'title', 'comment', 'tags', 'images'];
        const updateData = {};
        
        for (const field of allowedFields) {
          if (reviewData[field] !== undefined) {
            updateData[field] = reviewData[field];
          }
        }
        
        // Actualizăm ultima dată de modificare
        updateData.updated_at = new Date().toISOString();
        
        await updateDoc(reviewRef, updateData);
        
        // Reîncărcăm recenziile pentru a actualiza lista
        await dispatch('fetchUserReviews');
        
        return {
          id: reviewId,
          ...existingReview,
          ...updateData
        };
      } catch (error) {
        console.error('Eroare la editarea recenziei:', error);
        throw new Error('Nu s-a putut edita recenzia.');
      }
    },
    
    // Șterge o recenzie
    async deleteReview({ state, dispatch }, reviewId) {
      if (!state.currentUser) {
        throw new Error('Utilizatorul nu este autentificat.');
      }
      
      try {
        const reviewRef = doc(db, 'reviews', reviewId);
        const reviewDoc = await getDoc(reviewRef);
        
        if (!reviewDoc.exists()) {
          throw new Error('Recenzia nu a fost găsită.');
        }
        
        const existingReview = reviewDoc.data();
        
        // Verificăm dacă recenzia aparține utilizatorului curent
        if (existingReview.user_id !== state.currentUser.uid) {
          throw new Error('Nu aveți permisiunea de a șterge această recenzie.');
        }
        
        await deleteDoc(reviewRef);
        
        // Reîncărcăm recenziile pentru a actualiza lista
        await dispatch('fetchUserReviews');
        
        return true;
      } catch (error) {
        console.error('Eroare la ștergerea recenziei:', error);
        throw new Error('Nu s-a putut șterge recenzia.');
      }
    },
    
    // Resetează eroarea
    clearError({ commit }) {
      commit('SET_ERROR', null);
    }
  },
  getters: {
    isAuthenticated: state => {
      console.log('isAuthenticated getter called, returning:', state.isAuthenticated);
      return state.isAuthenticated;
    },
    currentUser: state => state.currentUser,
    userProfile: state => state.userProfile,
    userOrders: state => state.userOrders,
    userReviews: state => state.userReviews,
    isAdmin: state => state.userProfile && state.userProfile.role === 'admin',
    isLoading: state => state.loading,
    error: state => state.error
  }
}