<template>
  <div class="cart-summary">
    <h2 class="summary-title">Sumar Comandă</h2>
    
    <div class="summary-section">
      <h3>Produse în Coș</h3>
      <ul class="product-list">
        <li v-for="item in cartItems" :key="item.product.id" class="product-item">
          <span class="product-name">{{ item.product.name }} x{{ item.quantity }}</span>
          <span class="product-price">{{ (item.product.price * item.quantity).toFixed(2) }} lei</span>
        </li>
      </ul>
    </div>
    
    <div class="summary-section" v-if="customCake">
      <h3>Tort Personalizat</h3>
      <div class="custom-cake-info">
        <span class="cake-label">Tort:</span>
        <span class="cake-price">{{ customCake.totalPrice.toFixed(2) }} lei</span>
      </div>
    </div>
    
    <div class="summary-section totals">
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
    
    <div class="tax-info">
      <small>* Prețurile includ TVA</small>
    </div>
    
    <div class="summary-actions">
  <router-link :to="{ name: 'Checkout' }" class="checkout-btn">
    Continuă la checkout
  </router-link>
</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'CartSummary',
  computed: {
    ...mapGetters('cart', [
      'cartItems',
      'subtotal',
      'shipping',
      'discountAmount',
      'total',
      'customCake'
    ]),
    ...mapGetters('user', [
      'isAuthenticated'
    ])
  }
}
</script>

<style scoped>
.cart-summary {
  max-width: 1200px; 
  width: 100%;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.summary-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
}

.summary-section {
  margin-bottom: 1.5rem;
}

.product-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.product-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.product-name {
  font-weight: 500;
  color: #555;
}

.product-price {
  font-weight: 600;
  color: #e63946;
}

.custom-cake-info {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-weight: 500;
  color: #555;
}

.totals {
  border-top: 1px solid #ddd;
  padding-top: 1rem;
}

.totals-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.totals-row.total {
  font-size: 1.2rem;
  font-weight: bold;
  border-top: 1px solid #ddd;
  padding-top: 0.75rem;
  margin-top: 0.75rem;
}

.free {
  color: #2a9d8f;
  font-weight: 600;
}

.tax-info {
  text-align: right;
  font-size: 0.8rem;
  color: #777;
  margin-bottom: 1.5rem;
}

.summary-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  align-items: center;
}

.checkout-btn {
  background-color: #2a9d8f;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  text-align: center;
  transition: background-color 0.3s ease;
  min-width: 200px;
  display: block;
}

.checkout-btn:hover {
  background-color: #1d7d70;
}

/* Responsivitate */
@media (max-width: 768px) {
  .cart-summary {
    padding: 1rem;
    max-width: 100%; 
  }
}
</style>