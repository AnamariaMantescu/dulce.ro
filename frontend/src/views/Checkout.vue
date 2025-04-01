<template>
  <div class="checkout-page">
    <h1>Finalizare Comandă</h1>
    
    <div class="checkout-container">
      <div class="checkout-summary">
        <h2>Rezumat Comandă</h2>
        
        <div class="items-summary">
          <h3>Produse</h3>
          <ul>
            <li v-for="item in cartItems" :key="item.product.id" class="checkout-item">
              <span>{{ item.product.name }} x{{ item.quantity }}</span>
              <span>{{ (item.product.price * item.quantity).toFixed(2) }} lei</span>
            </li>
          </ul>
          
          <div v-if="customCake" class="custom-cake">
            <h3>Tort Personalizat</h3>
            <div class="cake-price">
              <span>Total tort:</span>
              <span>{{ customCake.totalPrice.toFixed(2) }} lei</span>
            </div>
          </div>
          
          <div class="totals">
            <div class="totals-row">
              <span>Subtotal</span>
              <span>{{ subtotal.toFixed(2) }} lei</span>
            </div>
            <div class="totals-row">
              <span>Cost Livrare</span>
              <span v-if="shipping > 0">{{ shipping.toFixed(2) }} lei</span>
              <span v-else class="free">Gratuită</span>
            </div>
            <div class="totals-row" v-if="discountAmount > 0">
              <span>Discount</span>
              <span>-{{ discountAmount.toFixed(2) }} lei</span>
            </div>
            <div class="totals-row total">
              <span>Total</span>
              <span>{{ total.toFixed(2) }} lei</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="payment-actions">
        <button @click="proceedToPayment" class="payment-button" :disabled="isLoading">
          <span v-if="!isLoading">Plătește Acum</span>
          <span v-else>Se procesează...</span>
        </button>
        <router-link to="/cart" class="back-button">Înapoi la coș</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import stripeService from '@/services/stripeService';

export default {
  name: 'Checkout',
  data() {
    return {
      isLoading: false
    };
  },
  computed: {
    ...mapGetters('cart', [
      'cartItems',
      'subtotal',
      'shipping',
      'discountAmount',
      'total',
      'customCake'
    ])
  },
  methods: {
    async proceedToPayment() {
      try {
        this.isLoading = true;
        
        // Create a Stripe checkout session
        const session = await stripeService.createCheckoutSession(
          this.cartItems, 
          this.customCake, 
          this.total
        );
        
        // Redirect to Stripe Checkout
        window.location.href = session.url;
      } catch (error) {
        console.error('Payment error:', error);
        alert('A apărut o eroare la procesarea plății. Vă rugăm să încercați din nou.');
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style scoped>
.checkout-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}

.checkout-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.checkout-summary {
  margin-bottom: 2rem;
}

.items-summary ul {
  list-style: none;
  padding: 0;
}

.checkout-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.custom-cake {
  margin-top: 1.5rem;
}

.cake-price {
  display: flex;
  justify-content: space-between;
  font-weight: 500;
}

.totals {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
}

.totals-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.totals-row.total {
  font-size: 1.2rem;
  font-weight: bold;
  padding-top: 0.75rem;
  margin-top: 0.75rem;
  border-top: 1px solid #ddd;
}

.free {
  color: #2a9d8f;
  font-weight: 600;
}

.payment-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.payment-button {
  background-color: #e63946;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  max-width: 300px;
  transition: background-color 0.3s;
}

.payment-button:hover:not(:disabled) {
  background-color: #d32f2f;
}

.payment-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.back-button {
  color: #555;
  text-decoration: none;
  padding: 0.5rem 1rem;
}

.back-button:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .checkout-page {
    padding: 1rem;
  }
  
  .checkout-container {
    padding: 1rem;
  }
}
</style>