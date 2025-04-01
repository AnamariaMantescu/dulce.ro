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
    async logout({ commit }) {
      try {
        await signOut(auth);
        commit('CLEAR_USER');
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
    
    // Încarcă profilul utilizatorului din Firestore
    async fetchUserProfile({ commit }, uid) {
      try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          commit('SET_USER_PROFILE', docSnap.data());
          console.log('User profile fetched and set in store');
        } else {
          console.log('Nu există un profil pentru acest utilizator!');
          commit('SET_USER_PROFILE', null);
        }
      } catch (error) {
        console.error('Eroare la încărcarea profilului:', error);
        commit('SET_ERROR', 'Nu s-a putut încărca profilul utilizatorului.');
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
    async fetchOrderDetails({ state }, orderId) {
      if (!state.currentUser) {
        throw new Error('Utilizatorul nu este autentificat.');
      }
      
      try {
        const orderRef = doc(db, 'orders', orderId);
        const orderDoc = await getDoc(orderRef);
        
        if (!orderDoc.exists()) {
          throw new Error('Comanda nu a fost găsită.');
        }
        
        const orderData = orderDoc.data();
        
        // Verificăm dacă este comanda utilizatorului curent
        if (orderData.userId !== state.currentUser.uid) {
          throw new Error('Nu aveți acces la această comandă.');
        }
        
        return {
          id: orderDoc.id,
          ...orderData
        };
      } catch (error) {
        console.error('Eroare la încărcarea detaliilor comenzii:', error);
        throw new Error('Nu s-au putut încărca detaliile comenzii.');
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
    async submitReview({ commit, state, dispatch }, reviewData) {
      if (!state.currentUser) {
        throw new Error('Utilizatorul nu este autentificat.');
      }
      
      try {
        // Adăugăm detaliile utilizatorului
        const userId = state.currentUser.uid;
        const userName = state.currentUser.displayName || state.userProfile?.displayName || 'Utilizator Anonim';
        
        const newReview = {
          ...reviewData,
          user_id: userId,
          user_name: userName,
          date: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
          verified_purchase: true
        };
        
        // Adăugăm recenzia în Firestore
        const reviewRef = collection(db, 'reviews');
        const docRef = await addDoc(reviewRef, newReview);
        
        // Actualizăm lista de recenzii în store
        await dispatch('fetchUserReviews');
        
        return {
          id: docRef.id,
          ...newReview
        };
      } catch (error) {
        console.error('Eroare la adăugarea recenziei:', error);
        throw new Error('Nu s-a putut adăuga recenzia.');
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