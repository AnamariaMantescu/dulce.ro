<template>
    <div class="payment-form">
      <h2>Metoda de Plată</h2>
      
      <div class="payment-methods">
        <div 
          class="payment-method-option" 
          :class="{ active: selectedMethod === 'card' }"
          @click="selectPaymentMethod('card')"
        >
          <div class="payment-icon">
            <i class="fas fa-credit-card"></i> <!-- Assuming you're using Font Awesome -->
          </div>
          <div class="payment-info">
            <h3>Card de credit sau debit</h3>
            <p>Plată securizată prin Stripe</p>
          </div>
        </div>
        
        <div 
          class="payment-method-option"
          :class="{ active: selectedMethod === 'cash' }"
          @click="selectPaymentMethod('cash')"
        >
          <div class="payment-icon">
            <i class="fas fa-money-bill-wave"></i>
          </div>
          <div class="payment-info">
            <h3>Numerar la livrare</h3>
            <p>Plata se face când primiți produsele</p>
          </div>
        </div>
      </div>
      
      <!-- Card payment form (appears only when card method is selected) -->
      <div class="card-payment-form" v-if="selectedMethod === 'card'">
        <div class="form-group">
          <label for="cardName">Numele de pe card*</label>
          <input 
            id="cardName" 
            v-model="cardDetails.name" 
            type="text" 
            required
            placeholder="Ex: Ion Popescu"
          >
        </div>
        
        <div class="form-group">
          <label for="cardNumber">Număr card*</label>
          <input 
            id="cardNumber" 
            v-model="cardDetails.number" 
            type="text" 
            required
            placeholder="1234 5678 9012 3456"
            maxlength="19"
            @input="formatCardNumber"
          >
        </div>
        
        <div class="form-grid">
          <div class="form-group">
            <label for="expiryDate">Data expirare*</label>
            <input 
              id="expiryDate" 
              v-model="cardDetails.expiry" 
              type="text" 
              required
              placeholder="MM/AA"
              maxlength="5"
              @input="formatCardExpiry"
            >
          </div>
          
          <div class="form-group">
            <label for="cvv">Cod de securitate (CVV)*</label>
            <input 
              id="cvv" 
              v-model="cardDetails.cvv" 
              type="text" 
              required
              placeholder="123"
              maxlength="3"
            >
          </div>
        </div>
      </div>
      
      <div class="payment-summary">
        <h3>Sumar Plată</h3>
        <div class="summary-row">
          <span>Total de plată:</span>
          <span class="total-amount">{{ orderTotal.toFixed(2) }} RON</span>
        </div>
      </div>
      
      <div class="payment-terms">
        <label class="checkbox-container">
          <input type="checkbox" v-model="termsAccepted">
          <span class="checkmark"></span>
          <span class="terms-text">Am citit și sunt de acord cu <a href="#">termenii și condițiile</a> site-ului</span>
        </label>
      </div>
      
      <div class="form-actions">
        <button type="button" class="back-btn" @click="goBack">
          Înapoi
        </button>
        <button 
          type="button" 
          class="payment-btn" 
          :disabled="!canProceed"
          @click="processPayment"
        >
          <span v-if="selectedMethod === 'card'">Plătește {{ orderTotal.toFixed(2) }} RON</span>
          <span v-else>Confirmă comanda</span>
        </button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'PaymentForm',
    
    props: {
      orderTotal: {
        type: Number,
        required: true
      },
      isLastStep: {
        type: Boolean,
        default: true
      }
    },
    
    data() {
      return {
        selectedMethod: 'card',
        termsAccepted: false,
        cardDetails: {
          name: '',
          number: '',
          expiry: '',
          cvv: ''
        }
      };
    },
    
    computed: {
      canProceed() {
        if (!this.termsAccepted) return false;
        
        if (this.selectedMethod === 'card') {
          return (
            this.cardDetails.name.trim() !== '' &&
            this.cardDetails.number.replace(/\s/g, '').length === 16 &&
            this.cardDetails.expiry.length === 5 &&
            this.cardDetails.cvv.length === 3
          );
        }
        
        return true;
      }
    },
    
    methods: {
      selectPaymentMethod(method) {
        this.selectedMethod = method;
      },
      
      formatCardNumber(e) {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = value.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        
        for (let i = 0; i < match.length; i += 4) {
          parts.push(match.substring(i, i + 4));
        }
        
        if (parts.length) {
          this.cardDetails.number = parts.join(' ');
        } else {
          this.cardDetails.number = value;
        }
      },
      
      formatCardExpiry(e) {
        let value = e.target.value.replace(/[^0-9]/g, '');
        
        if (value.length > 2) {
          this.cardDetails.expiry = value.substring(0, 2) + '/' + value.substring(2, 4);
        } else {
          this.cardDetails.expiry = value;
        }
      },
      
      goBack() {
        this.$emit('go-back');
      },
      
      async processPayment() {
        try {
          // In a real application, you would send this to your backend/Stripe
          // For now, we'll simulate a successful payment/order
          
          // Simulate processing for a moment
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Generate a reference number based on timestamp
          const reference = this.selectedMethod === 'card' 
            ? `pay_${Date.now()}` 
            : `cod_${Date.now()}`;
          
          // Emit the completed payment event
          this.$emit('payment-method-selected', this.selectedMethod);
          this.$emit('payment-completed', {
            method: this.selectedMethod,
            status: 'successful',
            reference: reference
          });
        } catch (error) {
          console.error('Payment processing error:', error);
          // Handle error (show message, etc.)
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .payment-form {
    background-color: #fff;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  
  h2 {
    color: #1d3557;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 0.5rem;
  }
  
  .payment-methods {
    margin-bottom: 2rem;
  }
  
  .payment-method-option {
    display: flex;
    align-items: center;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .payment-method-option:hover {
    border-color: #457b9d;
  }
  
  .payment-method-option.active {
    border-color: #2a9d8f;
    background-color: rgba(42, 157, 143, 0.05);
  }
  
  .payment-icon {
    font-size: 1.5rem;
    color: #1d3557;
    margin-right: 1rem;
    min-width: 2rem;
    text-align: center;
  }
  
  .payment-info h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
    color: #333;
  }
  
  .payment-info p {
    margin: 0;
    font-size: 0.9rem;
    color: #666;
  }
  
  .card-payment-form {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
  }
  
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
  }
  
  input, select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  input:focus, select:focus {
    outline: none;
    border-color: #457b9d;
    box-shadow: 0 0 0 2px rgba(69, 123, 157, 0.2);
  }
  
  .payment-summary {
    margin-top: 2rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;
  }
  
  .payment-summary h3 {
    margin-top: 0;
    color: #1d3557;
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .total-amount {
    font-weight: bold;
    font-size: 1.2rem;
    color: #e63946;
  }
  
  .payment-terms {
    margin: 2rem 0;
  }
  
  .checkbox-container {
    display: flex;
    align-items: center;
    position: relative;
    padding-left: 35px;
    cursor: pointer;
    user-select: none;
  }
  
  .checkbox-container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
  
  .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 20px;
    width: 20px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 3px;
  }
  
  .checkbox-container:hover input ~ .checkmark {
    border-color: #457b9d;
  }
  
  .checkbox-container input:checked ~ .checkmark {
    background-color: #2a9d8f;
    border-color: #2a9d8f;
  }
  
  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
  }
  
  .checkbox-container input:checked ~ .checkmark:after {
    display: block;
  }
  
  .checkbox-container .checkmark:after {
    left: 7px;
    top: 3px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
  
  .terms-text {
    font-size: 0.9rem;
    color: #555;
  }
  
  .terms-text a {
    color: #1d3557;
    text-decoration: underline;
  }
  
  .form-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
  }
  
  .back-btn, .payment-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-weight: 600;
    text-decoration: none;
    text-align: center;
    transition: all 0.3s ease;
  }
  
  .back-btn {
    background-color: #f1faee;
    color: #1d3557;
    border: 1px solid #1d3557;
  }
  
  .back-btn:hover {
    background-color: #e5f0e9;
  }
  
  .payment-btn {
    background-color: #2a9d8f;
    color: white;
    border: none;
    cursor: pointer;
    min-width: 200px;
  }
  
  .payment-btn:hover:not(:disabled) {
    background-color: #1d7d70;
  }
  
  .payment-btn:disabled {
    background-color: #a8dadc;
    cursor: not-allowed;
  }
  
  @media (max-width: 640px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
  }
  </style>