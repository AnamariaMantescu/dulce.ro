<template>
    <div class="stripe-checkout">
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Se încarcă formularul de plată...</p>
      </div>
      
      <div v-else>
        <div class="payment-form-container">
          <h3>Detalii plată</h3>
          <div id="payment-element"></div>
          
          <button 
            @click="handleSubmit" 
            :disabled="isProcessing || !stripe || !elements"
            class="pay-button">
            <span v-if="isProcessing">
              <div class="spinner-small"></div>
              Se procesează...
            </span>
            <span v-else>Plătește {{ formatPrice(amount) }}</span>
          </button>
          
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </div>
        
        <div class="payment-secure-info">
          <img src="@/assets/images/powered-by-stripe.svg" alt="Powered by Stripe" class="stripe-logo" />
          <p>Plata securizată prin Stripe. Datele dvs. sunt criptate și securizate.</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, defineEmits } from 'vue';
  import stripeService from '@/services/stripe';
  import { loadStripe, STRIPE_OPTIONS } from '@/services/stripeConfig';
  
  export default {
    name: 'StripeCheckout',
    props: {
      amount: {
        type: Number,
        required: true
      },
      currency: {
        type: String,
        default: 'ron'
      },
      metadata: {
        type: Object,
        default: () => ({})
      }
    },
    
    setup(props, { emit }) {
      const stripe = ref(null);
      const elements = ref(null);
      const loading = ref(true);
      const isProcessing = ref(false);
      const errorMessage = ref('');
      const clientSecret = ref('');
      
      const initializeStripe = async () => {
        try {
          // Obține client secret de la server
          clientSecret.value = await stripeService.createPaymentIntent(
            props.amount,
            props.currency,
            props.metadata
          );
          
          // Încarcă Stripe.js
          stripe.value = await loadStripe();
          
          // Creează elementele de plată
          elements.value = stripe.value.elements({
            clientSecret: clientSecret.value,
            ...STRIPE_OPTIONS
          });
          
          // Montează elementul de plată în DOM
          const paymentElement = elements.value.create('payment');
          paymentElement.mount('#payment-element');
          
          loading.value = false;
        } catch (error) {
          errorMessage.value = `Nu s-a putut inițializa formularul de plată: ${error.message}`;
          loading.value = false;
        }
      };
      
      const handleSubmit = async () => {
        if (!stripe.value || !elements.value) {
          return;
        }
        
        isProcessing.value = true;
        errorMessage.value = '';
        
        try {
          // Confirmă plata
          const { error, paymentIntent } = await stripe.value.confirmPayment({
            elements: elements.value,
            confirmParams: {
              return_url: `${window.location.origin}/payment-success`,
            },
            redirect: 'if_required'
          });
          
          if (error) {
            // Afișează eroarea
            errorMessage.value = error.message || 'A apărut o eroare la procesarea plății.';
            isProcessing.value = false;
          } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            // Plata a reușit fără redirectare
            emit('payment-success', {
              paymentIntentId: paymentIntent.id,
              paymentStatus: paymentIntent.status
            });
          }
        } catch (error) {
          errorMessage.value = error.message || 'A apărut o eroare la procesarea plății.';
          isProcessing.value = false;
        }
      };
      
      const formatPrice = (price) => {
        return new Intl.NumberFormat('ro-RO', {
          style: 'currency',
          currency: props.currency.toUpperCase(),
          minimumFractionDigits: 2
        }).format(price);
      };
      
      onMounted(() => {
        initializeStripe();
      });
      
      return {
        stripe,
        elements,
        loading,
        isProcessing,
        errorMessage,
        handleSubmit,
        formatPrice
      };
    }
  };
  </script>
  
  <style scoped>
  .stripe-checkout {
    margin: 20px 0;
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }
  
  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid #7b5e94;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-bottom: 10px;
  }
  
  .spinner-small {
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top: 2px solid #fff;
    width: 16px;
    height: 16px;
    animation: spin 1s linear infinite;
    display: inline-block;
    vertical-align: middle;
    margin-right: 8px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .payment-form-container {
    background-color: #f9f9f9;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .payment-form-container h3 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
    font-weight: 600;
  }
  
  #payment-element {
    margin-bottom: 24px;
  }
  
  .pay-button {
    background-color: #7b5e94;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 12px 16px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    transition: background-color 0.3s ease;
  }
  
  .pay-button:hover {
    background-color: #6a4f82;
  }
  
  .pay-button:disabled {
    background-color: #9d9d9d;
    cursor: not-allowed;
  }
  
  .error-message {
    margin-top: 16px;
    color: #df1b41;
    font-size: 14px;
  }
  
  .payment-secure-info {
    margin-top: 20px;
    text-align: center;
    color: #6b7280;
    font-size: 14px;
  }
  
  .stripe-logo {
    height: 24px;
    margin-bottom: 8px;
  }
  </style>