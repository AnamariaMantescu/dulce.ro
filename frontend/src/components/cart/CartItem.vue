<template>
  <div class="cart-item">
    <div class="cart-item-image">
      <img :src="item.product.image" :alt="item.product.name">
    </div>
    <div class="cart-item-details">
      <div class="cart-item-info">
        <h3 class="cart-item-title">{{ item.product.name }}</h3>
        <p class="cart-item-price">{{ item.product.price }} lei</p>
        <p v-if="item.product.subcategory" class="cart-item-category">{{ item.product.subcategory }}</p>
      </div>
      <div class="cart-item-actions">
        <div class="quantity-selector">
          <button @click="decrementQuantity" :disabled="item.quantity <= 1">-</button>
          <input 
            type="number" 
            v-model.number="itemQuantity" 
            min="1" 
            @change="updateQuantity"
          >
          <button @click="incrementQuantity">+</button>
        </div>
        <button class="remove-btn" @click="removeItem">
          <span class="remove-icon">×</span>
        </button>
      </div>
      <div class="cart-item-subtotal">
        <span>Subtotal:</span>
        <strong>{{ (item.product.price * item.quantity).toFixed(2) }} lei</strong>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'CartItem',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      itemQuantity: this.item.quantity
    };
  },
  watch: {
    'item.quantity'(newVal) {
      this.itemQuantity = newVal;
    }
  },
  methods: {
    ...mapActions('cart', ['updateItemQuantity', 'removeFromCart']),
    
    incrementQuantity() {
      this.itemQuantity++;
      this.updateQuantity();
    },
    
    decrementQuantity() {
      if (this.itemQuantity > 1) {
        this.itemQuantity--;
        this.updateQuantity();
      }
    },
    
    updateQuantity() {
      this.updateItemQuantity({
        productId: this.item.product.id,
        quantity: this.itemQuantity
      });
    },
    
    removeItem() {
      this.removeFromCart(this.item.product.id);
    }
  }
};
</script>

<style scoped>
.cart-item {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 1rem;
}

.cart-item-image {
  width: 120px;
  height: 120px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.cart-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.cart-item-info {
  margin-bottom: 0.5rem;
}

.cart-item-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.3rem 0;
  color: #333;
}

.cart-item-price {
  font-size: 1.1rem;
  font-weight: 500;
  color: #e63946;
  margin: 0.3rem 0;
}

.cart-item-category {
  font-size: 0.9rem;
  color: #666;
  margin: 0.3rem 0;
}

.cart-item-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.8rem 0;
}

.quantity-selector {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.quantity-selector button {
  width: 32px;
  height: 32px;
  border: none;
  background-color: #f0f0f0;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background-color 0.2s;
}

.quantity-selector button:hover {
  background-color: #e0e0e0;
}

.quantity-selector button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-selector input {
  width: 45px;
  height: 32px;
  border: none;
  text-align: center;
  font-size: 0.95rem;
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background-color: white;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover {
  background-color: #f8d7da;
  color: #dc3545;
  border-color: #dc3545;
}

.remove-icon {
  font-size: 1.2rem;
  line-height: 1;
}

.cart-item-subtotal {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 1rem;
  color: #555;
}

.cart-item-subtotal strong {
  font-size: 1.1rem;
  color: #333;
}

@media (max-width: 600px) {
  .cart-item {
    flex-direction: column;
  }
  
  .cart-item-image {
    width: 100%;
    height: 200px;
  }
  
  .cart-item-actions {
    justify-content: space-between;
  }
  
  .cart-item-subtotal {
    justify-content: flex-end;
  }
}
</style>