<template>
  <div class="cart-view">
    <h1>Coșul Meu</h1>
    <div v-if="isCartEmpty" class="empty-cart">
      <p>Coșul este gol.</p>
      <router-link to="/" class="continue-link">Continuă cumpărăturile</router-link>
    </div>
    <div v-else>
      <!-- Listă produse din coș -->
      <div class="cart-items">
        <CartItem 
          v-for="item in cartItems" 
          :key="item.product.id" 
          :item="item"
        />
      </div>

      <!-- Componentă pentru cod promoțional -->
      <PromoCodeInput />

      <!-- Sumarul comenzii -->
      <CartSummary 
        @checkout="proceedToStripeCheckout"
        @guestCheckout="proceedToStripeCheckout"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CartItem from '@/components/cart/CartItem.vue'
import PromoCodeInput from '@/components/cart/PromoCodeInput.vue'
import CartSummary from '@/components/cart/CartSummary.vue'

export default {
  name: 'Cart',
  components: {
    CartItem,
    PromoCodeInput,
    CartSummary
  },
  computed: {
    ...mapGetters('cart', ['cartItems', 'isCartEmpty']),
    ...mapGetters('user', ['isAuthenticated'])
  },
  methods: {
    // New method that takes users directly to Stripe checkout
    proceedToStripeCheckout() {
      console.log('Proceeding directly to Stripe checkout');
      this.$router.push({ name: 'StripeCheckout' });
    },
    
    // Keep these methods for backward compatibility, but both redirect to Stripe
    proceedToCheckout() {
      this.proceedToStripeCheckout();
    },
    
    proceedToCheckoutAsGuest() {
      this.proceedToStripeCheckout();
    }
  }
}
</script>

<style scoped>
.cart-view {
  /* Creștem lățimea maximă */
  max-width: 1200px; /* sau 1400px, după preferințe */
  margin: 0 auto;
  padding: 2rem;
}

.empty-cart {
  text-align: center;
}

.continue-link {
  color: #1d3557;
  font-weight: bold;
  text-decoration: none;
}

.cart-items {
  margin-bottom: 2rem;
}
</style>