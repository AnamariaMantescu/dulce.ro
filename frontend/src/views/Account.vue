<!-- views/Account.vue -->
<template>
  <div class="account-container">
    <!-- Header with decorative background -->
    <div class="account-hero">
      <div class="overlay"></div>
      <div class="hero-content">
        <h1>Contul Meu</h1>
        <p v-if="user">{{ user.displayName }}</p>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="state-container">
      <div class="loader-ring">
        <div></div><div></div><div></div>
      </div>
      <p>Se încarcă informațiile contului...</p>
    </div>
    
    <!-- Not Logged In State -->
    <div v-else-if="!user" class="state-container">
      <div class="login-card">
        <div class="card-icon">🔐</div>
        <h2>Autentificare necesară</h2>
        <p>Trebuie să fiți autentificat pentru a accesa contul dumneavoastră</p>
        <div class="auth-buttons">
          <router-link to="/login" class="auth-btn primary">Autentificare</router-link>
          <router-link to="/signup" class="auth-btn secondary">Înregistrare</router-link>
        </div>
      </div>
    </div>
    
    <!-- Account Dashboard -->
    <div v-else class="account-dashboard">
      <!-- Tab Navigation -->
      <div class="tab-navigation">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="tab-button" 
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
        </button>
      </div>
      
      <!-- Tab Content Area -->
      <div class="tab-content">
        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'" class="tab-panel">
          <UserProfile :user="user" @edit-profile="showEditProfileModal = true" />
          
          <!-- Edit Profile Modal -->
          <div v-if="showEditProfileModal" class="modal-overlay" @click.self="showEditProfileModal = false">
            <EditProfileForm 
              :user="user" 
              @close="showEditProfileModal = false"
              @save-profile="updateProfile" 
              @error="handleError"
            />
          </div>
        </div>
        
        <!-- Orders Tab -->
        <div v-else-if="activeTab === 'orders'" class="tab-panel">
          <div v-if="loadingOrders" class="tab-loading">
            <div class="loader-dots">
              <div></div><div></div><div></div>
            </div>
            <p>Se încarcă comenzile...</p>
          </div>
          <UserOrders 
            v-else
            :orders="userOrders" 
            :loading="loadingOrders" 
            @view-order-details="viewOrderDetails"
            @add-review="showAddReviewModal"
          />
          
          <!-- Order Details Modal -->
          <div v-if="showOrderDetailsModal" class="modal-overlay" @click.self="showOrderDetailsModal = false">
            <OrderDetailsModal 
              :order="selectedOrder" 
              :loading="loadingOrderDetails"
              @close="showOrderDetailsModal = false"
              @add-review="showAddReviewModal"
            />
          </div>
        </div>
        
        <!-- Reviews Tab -->
        <div v-else-if="activeTab === 'reviews'" class="tab-panel">
          <div v-if="loadingReviews" class="tab-loading">
            <div class="loader-dots">
              <div></div><div></div><div></div>
            </div>
            <p>Se încarcă recenziile...</p>
          </div>
          <UserReviews 
            v-else
            :reviews="userReviews" 
            :loading="loadingReviews" 
            @edit-review="editReview"
            @delete-review="deleteReview"
          />
        </div>


        <!-- Logout Button -->
        <div v-else-if="activeTab === 'logout'" class="tab-panel">
          <div class="logout-confirm">
            <div class="confirm-card">
              <div class="confirm-icon">🚪</div>
              <h3>Deconectare</h3>
              <p>Sunteți sigur că doriți să vă deconectați din contul dumneavoastră?</p>
              <div class="confirm-actions">
                <button class="btn-secondary" @click="activeTab = 'profile'">Anulează</button>
                <button class="btn-primary danger" @click="logout">Deconectare</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add/Edit Review Modal -->
    <div v-if="showReviewModal" class="modal-overlay" @click.self="showReviewModal = false">
      <UserReviewForm 
        :order-id="selectedOrderId"
        :product="selectedProduct"
        :loading="loadingProductDetails"
        @close="showReviewModal = false"
        @submit-review="submitReview"
        @error="handleError"
      />
    </div>
    
    <!-- Toast Notifications -->
    <div v-if="notification.show" class="toast-notification" :class="notification.type">
      <div class="toast-content">
        {{ notification.message }}
      </div>
      <button class="toast-close" @click="closeNotification">&times;</button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import UserProfile from '@/components/user/UserProfile.vue';
import UserOrders from '@/components/user/UserOrders.vue';
import UserReviews from '@/components/user/UserReviews.vue';
import EditProfileForm from '@/components/user/EditProfileForm.vue';
import OrderDetailsModal from '@/components/user/OrderDetailsModal.vue';
import UserReviewForm from '@/components/user/UserReviewForm.vue';

export default {
  name: 'Account',
  
  components: {
    UserProfile,
    UserOrders,
    UserReviews,
    EditProfileForm,
    OrderDetailsModal,
    UserReviewForm
  },
  
  data() {
    return {
      activeTab: 'profile',
      loading: true,
      loadingOrders: false,
      loadingReviews: false,
      loadingOrderDetails: false,
      loadingProductDetails: false,
      showEditProfileModal: false,
      showOrderDetailsModal: false,
      showReviewModal: false,
      userOrders: [],
      userReviews: [],
      selectedOrder: null,
      selectedOrderId: null,
      selectedProduct: null,
      recentOrderProducts: [],
      notification: {
        show: false,
        message: '',
        type: 'info'
      },
      tabs: [
        { id: 'profile', label: 'Profil', icon: '👤' },
        { id: 'orders', label: 'Comenzi', icon: '📦' },
        { id: 'reviews', label: 'Recenzii', icon: '⭐' },
        { id: 'logout', label: 'Deconectare', icon: '🚪' }
      ]
    };
  },
  
  computed: {
    ...mapGetters('user', ['currentUser', 'userProfile', 'isAuthenticated']),
    
    user() {
      return this.userProfile || this.currentUser;
    },
    
    userInitials() {
      if (!this.user || !this.user.displayName) return '?';
      
      const nameParts = this.user.displayName.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return this.user.displayName.substring(0, 2).toUpperCase();
    }
  },
  
  watch: {
    activeTab(newTab) {
      if (newTab === 'orders' && !this.userOrders.length) {
        this.fetchUserOrders();
      } else if (newTab === 'reviews' && !this.userReviews.length) {
        this.fetchUserReviews();
      } else if (newTab === 'addReview') {
        this.loadRecentOrderProducts();
      }
    },
    
    isAuthenticated(isLoggedIn) {
      if (!isLoggedIn) {
        this.$router.push('/login');
      }
    }
  },
  
  created() {
    this.initializeAccount();
    
    // Check if we need to show a specific tab based on route
    if (this.$route.path === '/orders') {
      this.activeTab = 'orders';
    }
  },
  
  methods: {
    ...mapActions('user', ['updateUserProfile', 'fetchUserOrders', 'fetchUserReviews']),
    
    async initializeAccount() {
      this.loading = true;
      
      try {
        // Check if user is authenticated
        if (!this.isAuthenticated) {
          this.loading = false;
          return;
        }
        
        // Fetch initial data
        if (this.activeTab === 'orders') {
          await this.fetchUserOrders();
        } else if (this.activeTab === 'reviews') {
          await this.fetchUserReviews();
        } else if (this.activeTab === 'addReview') {
          await this.loadRecentOrderProducts();
        }
      } catch (error) {
        console.error('Error initializing account:', error);
        this.showNotification('Eroare la încărcarea datelor contului', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    async fetchUserOrders() {
      if (this.loadingOrders) return;
      
      this.loadingOrders = true;
      try {
        const orders = await this.$store.dispatch('user/fetchUserOrders');
        this.userOrders = orders;
      } catch (error) {
        console.error('Error fetching orders:', error);
        this.showNotification('Eroare la încărcarea comenzilor', 'error');
      } finally {
        this.loadingOrders = false;
      }
    },
    
    async loadRecentOrderProducts() {
      this.loadingOrders = true;
      
      try {
        // First, ensure we have the orders
        if (!this.userOrders || this.userOrders.length === 0) {
          await this.fetchUserOrders();
        }
        
        // Extract products from delivered orders that haven't been reviewed yet
        const eligibleProducts = [];
        
        for (const order of this.userOrders) {
          // Only include delivered orders
          if (order.status === 'delivered') {
            // Check if order has items/products
            if (order.items && order.items.length) {
              for (const item of order.items) {
                // Check if this product has already been reviewed
                const alreadyReviewed = this.userReviews.some(
                  review => review.product_id === item.id
                );
                
                if (!alreadyReviewed) {
                  eligibleProducts.push({
                    ...item,
                    orderId: order.id
                  });
                }
              }
            }
          }
        }
        
        this.recentOrderProducts = eligibleProducts;
      } catch (error) {
        console.error('Error loading products for review:', error);
        this.showNotification('Eroare la încărcarea produselor pentru recenzie', 'error');
      } finally {
        this.loadingOrders = false;
      }
    },
    
    async fetchUserReviews() {
      if (this.loadingReviews) return;
      
      this.loadingReviews = true;
      try {
        const reviews = await this.$store.dispatch('user/fetchUserReviews');
        this.userReviews = reviews;
      } catch (error) {
        console.error('Error fetching reviews:', error);
        this.showNotification('Eroare la încărcarea recenziilor', 'error');
      } finally {
        this.loadingReviews = false;
      }
    },
    
    formatOrderId(id) {
      return id ? id.substring(0, 8).toUpperCase() : '';
    },
    
    selectProductForReview(product) {
      this.selectedOrderId = product.orderId;
      this.selectedProduct = product;
      this.showReviewModal = true;
    },
    
    async updateProfile(profileData) {
      try {
        await this.updateUserProfile(profileData);
        this.showEditProfileModal = false;
        this.showNotification('Profil actualizat cu succes', 'success');
      } catch (error) {
        console.error('Error updating profile:', error);
        this.showNotification('Eroare la actualizarea profilului', 'error');
      }
    },
    
    async viewOrderDetails(orderId) {
      this.loadingOrderDetails = true;
      this.selectedOrder = null;
      
      try {
        // Fetch detailed order information
        const orderDetails = await this.$store.dispatch('user/fetchOrderDetails', orderId);
        this.selectedOrder = orderDetails;
        this.showOrderDetailsModal = true;
      } catch (error) {
        console.error('Error fetching order details:', error);
        this.showNotification('Eroare la încărcarea detaliilor comenzii', 'error');
      } finally {
        this.loadingOrderDetails = false;
      }
    },
    
// Varianta îmbunătățită pentru showAddReviewModal
async showAddReviewModal(data) {
  this.selectedOrderId = data.orderId;
  this.loadingProductDetails = true;
  
  try {
    // Dacă avem un product ID valid, folosim API-ul pentru a încărca detaliile
    if (data.productId && data.productId !== 'unknown') {
      console.log('Încărcăm detalii produs cu ID:', data.productId);
      try {
        const productDetails = await this.$store.dispatch('products/fetchProductById', data.productId);
        
        if (productDetails) {
          this.selectedProduct = productDetails;
          this.showReviewModal = true;
        } else {
          throw new Error(`Produsul cu ID ${data.productId} nu a fost găsit`);
        }
      } catch (error) {
        console.warn(`Nu am putut încărca produsul cu ID ${data.productId}, vom încerca să folosim comanda.`);
        // Continuăm cu căutarea în comandă dacă produsul nu poate fi încărcat
      }
      
      // Dacă am setat deja produsul, ieșim din funcție
      if (this.selectedProduct) {
        this.loadingProductDetails = false;
        return;
      }
    }
    
    console.log('Căutăm produse în comandă');
    
    // Încercăm să găsim comanda în starea locală
    let order = this.userOrders.find(o => o.id === data.orderId);
    
    // Dacă nu am găsit comanda în starea locală, o încărcăm din Firestore
    if (!order) {
      console.log('Comanda nu a fost găsită în starea locală, încercăm să o încărcăm');
      try {
        order = await this.$store.dispatch('user/fetchOrderDetails', data.orderId);
        
        // Dacă este o comandă nouă pe care am încărcat-o, o adăugăm în starea locală
        if (order && !this.userOrders.some(o => o.id === order.id)) {
          this.userOrders.push(order);
        }
      } catch (orderError) {
        console.error('Eroare la încărcarea comenzii:', orderError);
      }
    }
    
    // Dacă am găsit comanda, încercăm să extragem primul produs din ea
    if (order) {
      // Verificăm dacă comanda are produse în formatul 'items'
      if (order.items && order.items.length > 0) {
        const item = order.items[0];
        this.selectedProduct = {
          id: item.id || item.productId || 'unknown',
          name: item.name || 'Produs necunoscut',
          price: item.price || 0,
          image: item.image || '',
          // Nu facem un fetch după acest ID, folosim direct datele din comandă
        };
        
        console.log('Produs găsit în comandă:', this.selectedProduct);
      } 
      // Verificăm dacă comanda are produse în formatul 'products'
      else if (order.products && order.products.length > 0) {
        const product = order.products[0];
        this.selectedProduct = {
          id: product.productId || product.id || 'unknown',
          name: product.name || 'Produs necunoscut',
          price: product.price || 0,
          image: product.image || '',
          // Nu facem un fetch după acest ID, folosim direct datele din comandă
        };
        
        console.log('Produs găsit în comandă (structură alternativă):', this.selectedProduct);
      }
      // Dacă comanda nu conține produse, folosim un placeholder
      else {
        console.log('Comanda nu conține produse, folosim un placeholder');
        this.selectedProduct = {
          id: 'unknown',
          name: 'Produs din comanda #' + this.formatOrderId(data.orderId),
          price: 0
        };
      }
    } 
    // Dacă nu am găsit deloc comanda, folosim un placeholder generic
    else {
      console.warn('Comanda nu a putut fi încărcată, folosim un produs placeholder');
      this.selectedProduct = {
        id: 'unknown',
        name: 'Produs necunoscut',
        price: 0
      };
    }
    
    // Deschidem formularul de recenzie
    this.showReviewModal = true;
  } catch (error) {
    console.error('Eroare la pregătirea formularului de recenzie:', error);
    this.showNotification(
      'Nu am putut pregăti formularul de recenzie: ' + error.message,
      'error'
    );
  } finally {
    this.loadingProductDetails = false;
  }
},

    
// Updated submitReview method for Account.vue
async submitReview(reviewData) {
  try {
    console.log('Trimitem recenzie:', reviewData);
    
    // Ensure we have required fields
    if (!reviewData.product_id) {
      // If product_id is missing, use the selectedProduct.id
      if (this.selectedProduct && this.selectedProduct.id) {
        reviewData.product_id = this.selectedProduct.id;
      } else {
        throw new Error('ID-ul produsului este obligatoriu pentru recenzie');
      }
    }
    
    // Ensure we have order_id
    if (!reviewData.order_id && this.selectedOrderId) {
      reviewData.order_id = this.selectedOrderId;
    }
    
    // Add user information if missing
    if (!reviewData.user_id && this.user) {
      reviewData.user_id = this.user.uid;
    }
    
    if (!reviewData.user_name && this.user) {
      reviewData.user_name = this.user.displayName || 'Utilizator anonim';
    }
    
    // Set verified_purchase to true by default
    if (reviewData.verified_purchase === undefined) {
      reviewData.verified_purchase = true;
    }
    
    // Add date if missing
    if (!reviewData.date) {
      reviewData.date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    }
    
    // Check if this is a new review or an update
    const isUpdate = reviewData.id ? true : false;
    
    await this.$store.dispatch('user/submitReview', reviewData);
    this.showReviewModal = false;
    
    // Mark the order as reviewed in the local state
    if (this.selectedOrderId && !isUpdate) {
      const orderIndex = this.userOrders.findIndex(o => o.id === this.selectedOrderId);
      if (orderIndex !== -1) {
        this.userOrders[orderIndex].reviewed = true;
      }
    }
    
    // Refresh reviews and available products for review
    if (this.activeTab === 'reviews') {
      await this.fetchUserReviews();
    } else if (this.activeTab === 'addReview') {
      await this.loadRecentOrderProducts();
    }
    
    this.showNotification(
      isUpdate ? 'Recenzie actualizată cu succes' : 'Recenzie trimisă cu succes', 
      'success'
    );
  } catch (error) {
    console.error('Eroare la trimiterea recenziei:', error);
    this.showNotification('Eroare la trimiterea recenziei: ' + error.message, 'error');
  }
},
    
    async editReview(review) {
      this.selectedOrderId = review.order_id;
      this.loadingProductDetails = true;
      
      try {
        // Fetch product details
        const productDetails = await this.$store.dispatch('products/fetchProductById', review.product_id);
        this.selectedProduct = {
          ...productDetails,
          existingReview: review
        };
        this.showReviewModal = true;
      } catch (error) {
        console.error('Error editing review:', error);
        this.showNotification('Eroare la editarea recenziei', 'error');
      } finally {
        this.loadingProductDetails = false;
      }
    },
    
    async deleteReview(reviewId) {
      if (!confirm('Sigur doriți să ștergeți această recenzie?')) return;
      
      try {
        await this.$store.dispatch('user/deleteReview', reviewId);
        // Refresh reviews list
        await this.fetchUserReviews();
        this.showNotification('Recenzie ștearsă cu succes', 'success');
      } catch (error) {
        console.error('Error deleting review:', error);
        this.showNotification('Eroare la ștergerea recenziei', 'error');
      }
    },
    
    async logout() {
      try {
        await signOut(auth);
        this.$store.commit('user/CLEAR_USER');
        this.showNotification('V-ați deconectat cu succes');
        this.$router.push('/');
      } catch (error) {
        console.error('Error during logout:', error);
        this.showNotification('Eroare la deconectare', 'error');
      }
    },
    
    closeNotification() {
      this.notification.show = false;
    },
    
    showNotification(message, type = 'info') {
      this.notification = {
        show: true,
        message,
        type
      };
      
      // Automatically hide after 5 seconds
      setTimeout(() => {
        this.notification.show = false;
      }, 5000);
    },
    
    handleError(error) {
      this.showNotification(typeof error === 'string' ? error : 'A apărut o eroare', 'error');
    }
  }
};
</script>

<style scoped>
/* -------------------------------------------
   Main Container & Typography
------------------------------------------- */
.account-container {
  font-family: 'Montserrat', 'Helvetica Neue', sans-serif;
  color: #3a3a3a;
  line-height: 1.6;
  max-width: 100%;
  margin: 0 auto;
  overflow-x: hidden;
  min-height: 100vh;
  background-color: #fcfcfc;
}

/* -------------------------------------------
   Hero Header
------------------------------------------- */
.account-hero {
  position: relative;
  height: 280px;
  background-image: url('/api/placeholder/1400/400');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 2rem;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, #bf9099, rgba(102, 54, 54, 0.7));
}

.hero-content {
  z-index: 2;
  position: relative;
  color: white;
}

.hero-content h1 {
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  font-size: 3.5rem;
  font-weight: 300;
  letter-spacing: 2px;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 5px rgba(0,0,0,0.2);
  animation: fadeInDown 1s ease-out;
}

.hero-content p {
  font-size: 1.2rem;
  font-weight: 300;
  opacity: 0.9;
  animation: fadeInUp 1s ease-out;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* -------------------------------------------
   States (Loading, Not Logged In)
------------------------------------------- */
.state-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
}

/* Loading Ring Animation */
.loader-ring {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
}

.loader-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  margin: 8px;
  border: 6px solid #b5838d;
  border-radius: 50%;
  animation: loader-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #b5838d transparent transparent transparent;
}

.loader-ring div:nth-child(1) {
  animation-delay: -0.45s;
}

.loader-ring div:nth-child(2) {
  animation-delay: -0.3s;
}

.loader-ring div:nth-child(3) {
  animation-delay: -0.15s;
}

@keyframes loader-ring {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Login Card */
.login-card {
  background-color: white;
  border-radius: 12px;
  padding: 3rem;
  box-shadow: 0 15px 40px rgba(0,0,0,0.08);
  text-align: center;
  max-width: 500px;
  width: 100%;
  animation: fadeIn 0.5s ease;
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.login-card h2 {
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 400;
  margin-bottom: 1rem;
  color: #333;
}

.login-card p {
  margin-bottom: 2rem;
  color: #666;
  font-size: 1.1rem;
}

.auth-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.auth-btn {
  padding: 0.8rem 2rem;
  border-radius: 5px;
  font-weight: 500;
  text-decoration: none;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.auth-btn.primary {
  background-color: #b5838d;
  color: white;
  box-shadow: 0 4px 15px rgba(181, 131, 141, 0.3);
}

.auth-btn.primary:hover {
  background-color: #a07086;
  transform: translateY(-3px);
  box-shadow: 0 7px 20px rgba(181, 131, 141, 0.4);
}

.auth-btn.secondary {
  background-color: transparent;
  color: #b5838d;
  border: 1px solid #b5838d;
}

.auth-btn.secondary:hover {
  background-color: rgba(181, 131, 141, 0.05);
  transform: translateY(-3px);
}

/* -------------------------------------------
   Account Dashboard
------------------------------------------- */
.account-dashboard {
  max-width: 1200px;
  margin: 0 auto 3rem;
  padding: 0 1.5rem;
}

/* Tab Navigation */
.tab-navigation {
  display: flex;
  justify-content: center;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
  overflow: hidden;
}

.tab-button {
  border: none;
  background: none;
  padding: 1.2rem 2rem;
  font-weight: 500;
  font-size: 1rem;
  color: #666;
  display: flex;
  align-items: center;
  cursor: pointer;
  flex: 1;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.tab-button:hover {
  color: #b5838d;
  background-color: rgba(181, 131, 141, 0.05);
}

.tab-button.active {
  color: #b5838d;
  background-color: rgba(181, 131, 141, 0.1);
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #b5838d;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.tab-icon {
  margin-right: 0.8rem;
  font-size: 1.3rem;
}

/* Tab Content */
.tab-content {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  min-height: 500px;
}

.tab-panel {
  padding: 2rem;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Tab Loading State */
.tab-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.loader-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.loader-dots div {
  width: 12px;
  height: 12px;
  background-color: #b5838d;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loader-dots div:nth-child(1) {
  animation-delay: -0.32s;
}

.loader-dots div:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Add Review Section */
.add-review-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.review-intro {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 1rem;
}

.intro-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #b5838d;
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.review-intro h3 {
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  font-size: 1.8rem;
  font-weight: 400;
  margin-bottom: 1rem;
  color: #333;
}

.review-intro p {
  color: #666;
  font-size: 1.05rem;
  line-height: 1.6;
}

.purchase-selection h4 {
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  font-size: 1.3rem;
  font-weight: 400;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #333;
}

.no-products {
  text-align: center;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 12px;
}

.no-products p {
  margin-bottom: 1.5rem;
  color: #666;
}

.browse-btn {
  display: inline-block;
  background: linear-gradient(to right, #b5838d, #9c27b0);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(181, 131, 141, 0.3);
}

.browse-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 20px rgba(181, 131, 141, 0.4);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.product-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #f0f0f0;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  border-color: #b5838d;
}

.product-image {
  height: 180px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-info {
  padding: 1.2rem;
  text-align: center;
}

.product-name {
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  font-size: 1.2rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
  color: #333;
}

.product-order {
  font-size: 0.85rem;
  color: #777;
  margin: 0;
}

/* Logout Confirm */
.logout-confirm {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.confirm-card {
  background-color: white;
  border-radius: 12px;
  padding: 2.5rem;
  box-shadow: 0 15px 40px rgba(0,0,0,0.08);
  text-align: center;
  max-width: 500px;
  width: 100%;
  animation: fadeIn 0.5s ease;
}

.confirm-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  color: #d9534f;
}

.confirm-card h3 {
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 400;
  margin-bottom: 1rem;
  color: #333;
}

.confirm-card p {
  margin-bottom: 2rem;
  color: #666;
  font-size: 1.1rem;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-secondary {
  background-color: transparent;
  color: #666;
  border: 1px solid #ddd;
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background-color: #f5f5f5;
}

.btn-primary {
  background-color: #b5838d;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(181, 131, 141, 0.2);
}

.btn-primary:hover {
  background-color: #a07086;
  transform: translateY(-3px);
  box-shadow: 0 7px 20px rgba(181, 131, 141, 0.3);
}

.btn-primary.danger {
  background-color: #d9534f;
  box-shadow: 0 4px 15px rgba(217, 83, 79, 0.2);
}

.btn-primary.danger:hover {
  background-color: #c9302c;
  box-shadow: 0 7px 20px rgba(217, 83, 79, 0.3);
}

/* -------------------------------------------
   Modal Overlay
------------------------------------------- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.3s ease;
}

/* -------------------------------------------
   Toast Notifications
------------------------------------------- */
.toast-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  min-width: 280px;
  max-width: 350px;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2000;
  animation: slideInRight 0.3s ease;
  background-color: white;
  border-left: 4px solid #2196f3;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-notification.success {
  border-left-color: #4CAF50;
}

.toast-notification.error {
  border-left-color: #F44336;
}

.toast-notification.warning {
  border-left-color: #FFC107;
}

.toast-content {
  flex: 1;
  color: #333;
}

.toast-close {
  background: none;
  border: none;
  color: #999;
  font-size: 1.2rem;
  cursor: pointer;
  margin-left: 10px;
}

/* -------------------------------------------
   Responsive Adjustments
------------------------------------------- */
@media (max-width: 768px) {
  .account-hero {
    height: 220px;
  }
  
  .hero-content h1 {
    font-size: 2.5rem;
  }
  
  .tab-navigation {
    flex-wrap: wrap;
  }
  
  .tab-button {
    padding: 1rem;
    min-width: 120px;
  }
  
  .tab-panel {
    padding: 1.5rem;
  }
  
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .confirm-actions {
    flex-direction: column;
    gap: 0.8rem;
  }
}

@media (max-width: 480px) {
  .account-hero {
    height: 180px;
  }
  
  .hero-content h1 {
    font-size: 2rem;
  }
  
  .login-card,
  .confirm-card {
    padding: 2rem 1.5rem;
  }
  
  .auth-buttons {
    flex-direction: column;
  }
  
  .tab-button {
    flex: 1 0 100%;
  }
  
  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style>