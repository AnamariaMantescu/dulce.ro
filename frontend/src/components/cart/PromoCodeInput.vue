<template>
  <div class="promo-code-container">
    <h3 class="promo-title">Ai un cod promoțional?</h3>
    <div class="promo-form">
      <input 
        type="text" 
        v-model="promoCode" 
        placeholder="Introdu codul promoțional" 
        :disabled="loading"
        class="promo-input"
      >
      <button 
        @click="applyCode" 
        :disabled="loading || !promoCode" 
        class="promo-btn"
      >
        {{ loading ? 'Se procesează...' : 'Aplică' }}
      </button>
    </div>
    <div v-if="discountCode" class="applied-code">
      <div class="code-info">
        <span class="code-label">Cod aplicat: </span>
        <span class="code-value">{{ discountCode }}</span>
        <span class="discount-value">-{{ discountAmount.toFixed(2) }} lei</span>
      </div>
      <button @click="removeCode" class="remove-code-btn">
        <span class="remove-icon">×</span>
      </button>
    </div>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
  name: 'PromoCodeInput',
  data() {
    return {
      promoCode: ''
    };
  },
  computed: {
    ...mapState('cart', ['loading', 'error', 'discountCode', 'discountAmount']),
    ...mapGetters('cart', ['discountAmount'])
  },
  methods: {
    ...mapActions('cart', ['applyDiscount', 'removeDiscount']),
    
    async applyCode() {
      if (!this.promoCode || this.loading) return;
      
      const success = await this.applyDiscount(this.promoCode);
      
      if (success) {
        this.promoCode = '';
      }
    },
    
    removeCode() {
      this.removeDiscount();
    }
  }
};
</script>

<style scoped>
.promo-code-container {
  background-color: #f8f9fa;
  padding: 1.2rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.promo-title {
  font-size: 1.1rem;
  margin-top: 0;
  margin-bottom: 0.8rem;
  color: #333;
}

.promo-form {
  display: flex;
  gap: 0.5rem;
}

.promo-input {
  flex: 1;
  padding: 0.7rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
}

.promo-input:focus {
  outline: none;
  border-color: #a8dadc;
  box-shadow: 0 0 0 2px rgba(168, 218, 220, 0.3);
}

.promo-btn {
  padding: 0 1.2rem;
  background-color: #1d3557;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.promo-btn:hover:not(:disabled) {
  background-color: #457b9d;
}

.promo-btn:disabled {
  background-color: #b8c2cc;
  cursor: not-allowed;
}

.applied-code {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding: 0.8rem;
  background-color: #e3f2fd;
  border-radius: 4px;
  border-left: 3px solid #1d3557;
}

.code-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.code-label {
  font-size: 0.9rem;
  color: #555;
}

.code-value {
  font-weight: 600;
  color: #1d3557;
}

.discount-value {
  font-weight: 600;
  color: #e63946;
  margin-left: 0.5rem;
}

.remove-code-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem;
}

.remove-code-btn:hover {
  color: #dc3545;
}

.error-message {
  margin-top: 0.8rem;
  padding: 0.8rem;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: 4px;
  font-size: 0.9rem;
}

@media (max-width: 480px) {
  .promo-form {
    flex-direction: column;
  }
  
  .promo-btn {
    width: 100%;
    padding: 0.7rem;
  }
  
  .applied-code {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .remove-code-btn {
    align-self: flex-end;
  }
}
</style>