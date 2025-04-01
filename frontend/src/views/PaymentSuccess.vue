<template>
  <div class="payment-success">
    <div v-if="isLoading" class="loading">
      <p>Se procesează comanda...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <div class="error-icon">!</div>
      <h1>A apărut o eroare</h1>
      <p>{{ error }}</p>
      <p>ID Tranzacție: {{ sessionId }}</p>
      <div class="action-buttons">
        <router-link to="/" class="continue-shopping">Continuă Cumpărăturile</router-link>
      </div>
    </div>
    
    <div v-else class="success-container">
      <div class="success-icon">✓</div>
      <h1>Plată Finalizată cu Succes!</h1>
      <p>Vă mulțumim pentru comandă. Veți primi în curând un email cu confirmarea comenzii.</p>
      
      <div v-if="sessionDetails && sessionDetails.customer_details" class="shipping-details">
        <h2>Detalii Livrare</h2>
        <div class="address-info">
          <p><strong>Nume:</strong> {{ sessionDetails.customer_details.name }}</p>
          <p><strong>Email:</strong> {{ sessionDetails.customer_details.email }}</p>
          <p v-if="sessionDetails.customer_details.phone"><strong>Telefon:</strong> {{ sessionDetails.customer_details.phone }}</p>
          
          <div v-if="sessionDetails.customer_details.address" class="address">
            <p><strong>Adresă:</strong> {{ sessionDetails.customer_details.address.line1 }}</p>
            <p v-if="sessionDetails.customer_details.address.line2"><strong>Adresă (continuare):</strong> {{ sessionDetails.customer_details.address.line2 }}</p>
            <p><strong>Oraș:</strong> {{ sessionDetails.customer_details.address.city }}</p>
            <p><strong>Cod Poștal:</strong> {{ sessionDetails.customer_details.address.postal_code }}</p>
          </div>
        </div>
      </div>
      
      <div v-if="orderId" class="order-info">
        <p>Comanda dumneavoastră a fost înregistrată cu ID-ul: <strong>{{ orderId }}</strong></p>
      </div>
      
      <p class="session-id" v-if="sessionId">ID Tranzacție: {{ sessionId }}</p>
      
      <div class="action-buttons">
        <router-link to="/" class="continue-shopping">Continuă Cumpărăturile</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import stripeService from '@/services/stripeService';
import { mapGetters } from 'vuex';

export default {
  name: 'PaymentSuccess',
  data() {
    return {
      sessionId: '',
      sessionDetails: null,
      orderSaved: false,
      orderId: '',
      isLoading: true,
      error: null,
      localCartItems: []
    };
  },
  computed: {
    ...mapGetters('cart', [
      'cartItems',
      'customCake'
    ]),
    ...mapGetters('user', [
      'currentUser',
      'isAuthenticated'
    ])
  },
  async created() {
    // Get session ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    this.sessionId = urlParams.get('session_id');
    
    if (this.sessionId) {
      try {
        // Store cart items before clearing cart
        this.localCartItems = JSON.parse(JSON.stringify(this.cartItems));
        
        // Clear cart since payment was successful
        this.$store.dispatch('cart/clearCart');
        
        // Get the session details first
        const sessionData = await stripeService.getSession(this.sessionId);
        this.sessionDetails = sessionData;
        
        // Get user ID if authenticated
        const userId = this.isAuthenticated ? this.currentUser.uid : null;
        
        // Save the order with cart items and user ID
        const response = await axios.post('http://localhost:5001/api/payment/save-order', {
          sessionId: this.sessionId,
          cartItems: this.localCartItems,
          customCake: this.customCake,
          userId: userId
        });
        
        if (response.data.success) {
          this.orderSaved = true;
          this.orderId = response.data.orderId;
        }
      } catch (error) {
        console.error('Error processing order:', error);
        this.error = 'A apărut o eroare la procesarea comenzii. Vă rugăm să contactați suportul.';
      } finally {
        this.isLoading = false;
      }
    } else {
      this.error = 'Nu am putut identifica tranzacția. Vă rugăm să contactați suportul.';
      this.isLoading = false;
    }
  }
};
</script>

<style scoped>
.payment-success {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
}

.success-container, .error-container, .loading {
  background-color: #fff;
  border-radius: 8px;
  padding: 3rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.error-container {
  border-top: 4px solid #e63946;
}

.success-icon, .error-icon {
  font-size: 3rem;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 2rem;
}

.success-icon {
  background-color: #2a9d8f;
  color: white;
}

.error-icon {
  background-color: #e63946;
  color: white;
}

h1 {
  margin-bottom: 1.5rem;
  color: #333;
}

h2 {
  margin: 1.5rem 0 1rem;
  color: #444;
  font-size: 1.3rem;
}

p {
  margin-bottom: 1rem;
  color: #555;
  font-size: 1.1rem;
}

.shipping-details {
  margin: 2rem 0;
  text-align: left;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.address-info p {
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.address {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.order-info {
  margin: 1.5rem 0;
  padding: 1rem;
  background-color: #e8f4f4;
  border-radius: 6px;
}

.session-id {
  font-size: 0.9rem;
  color: #777;
  margin-top: 2rem;
}

.action-buttons {
  margin-top: 2.5rem;
}

.continue-shopping {
  background-color: #2a9d8f;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  display: inline-block;
  transition: background-color 0.3s;
}

.continue-shopping:hover {
  background-color: #1d7d70;
}

.loading {
  padding: 2rem;
}

@media (max-width: 768px) {
  .success-container, .error-container, .loading {
    padding: 2rem;
  }
  
  .shipping-details {
    padding: 1rem;
  }
}
</style>