<!-- components/invoice/InvoiceModal.vue -->
<template>
    <div class="invoice-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Generare Factură</h2>
          <button class="close-btn" @click="$emit('close')">&times;</button>
        </div>
        
        <div class="modal-body">
          <div v-if="generatingInvoice" class="generating-state">
            <div class="loader"></div>
            <p>Se generează factura pentru comanda #{{ formatOrderId(order.id) }}...</p>
          </div>
          
          <div v-else-if="invoiceGenerated" class="success-state">
            <div class="success-icon">✅</div>
            <h3>Factură generată cu succes!</h3>
            <p>Factura a fost descărcată în calculator.</p>
            <p class="invoice-info">Număr factură: {{ invoiceNumber }}</p>
          </div>
          
          <div v-else-if="error" class="error-state">
            <div class="error-icon">❌</div>
            <h3>Eroare la generarea facturii</h3>
            <p>{{ error }}</p>
          </div>
          
          <div v-else class="initial-state">
            <p>Sunteți pe cale să generați o factură pentru comanda <strong>#{{ formatOrderId(order.id) }}</strong>.</p>
            <p>Factura va include toate produsele comandate și va fi salvată automat în calculator.</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-outline" @click="$emit('close')">Închide</button>
          <button v-if="!invoiceGenerated && !generatingInvoice" class="btn btn-primary" @click="generateInvoice">
            Generează Factură
          </button>
          <button v-if="invoiceGenerated" class="btn btn-primary" @click="generateInvoice">
            Generează din nou
          </button>
        </div>
      </div>
      
      <!-- Hidden InvoiceGenerator component -->
      <div v-if="showGenerator" style="display: none;">
        <InvoiceGenerator :order="order" @invoice-generated="onInvoiceGenerated" @invoice-error="onInvoiceError" />
      </div>
    </div>
  </template>
  
  <script>
  import InvoiceGenerator from './InvoiceGenerator.vue';
  
  export default {
    name: 'InvoiceModal',
    components: {
      InvoiceGenerator
    },
    props: {
      order: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        generatingInvoice: false,
        invoiceGenerated: false,
        invoiceNumber: '',
        showGenerator: false,
        error: null
      }
    },
    methods: {
      formatOrderId(id) {
        return id ? id.substring(0, 8).toUpperCase() : '';
      },
      
      generateInvoice() {
        this.generatingInvoice = true;
        this.error = null;
        this.showGenerator = true;
        
        // The invoice generation happens in the InvoiceGenerator component
        // We'll use events to know when it's done or if there's an error
        
        // Simulate the generation process and completion for demo purposes
        setTimeout(() => {
          this.onInvoiceGenerated(this.generateInvoiceNumber(this.order.id));
        }, 2000);
      },
      
      onInvoiceGenerated(invoiceNumber) {
        this.generatingInvoice = false;
        this.invoiceGenerated = true;
        this.invoiceNumber = invoiceNumber;
        this.showGenerator = false;
      },
      
      onInvoiceError(error) {
        this.generatingInvoice = false;
        this.error = error || 'A apărut o eroare la generarea facturii.';
        this.showGenerator = false;
      },
      
      generateInvoiceNumber(orderId) {
        // Use a sequential number based on the order ID or timestamp for simple demo purposes
        const orderPrefix = orderId ? orderId.substring(0, 4).toUpperCase() : 'AAAA';
        const timestamp = Date.now().toString().substring(6);
        return `${orderPrefix}-${timestamp}`;
      }
    }
  }
  </script>
  
  <style scoped>
  .invoice-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-content {
    width: 90%;
    max-width: 500px;
    background-color: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
  
  .modal-header {
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
    font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  }
  
  .close-btn {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #999;
  }
  
  .close-btn:hover {
    color: #333;
  }
  
  .modal-body {
    padding: 30px 20px;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .generating-state,
  .success-state,
  .error-state,
  .initial-state {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  
  .loader {
    width: 50px;
    height: 50px;
    border: 5px solid rgba(181, 131, 141, 0.2);
    border-radius: 50%;
    border-top-color: #b5838d;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }
  
  .success-icon,
  .error-icon {
    font-size: 3rem;
    margin-bottom: 15px;
  }
  
  .success-icon {
    color: #27ae60;
  }
  
  .error-icon {
    color: #e74c3c;
  }
  
  .generating-state p,
  .initial-state p {
    color: #666;
    max-width: 400px;
    margin: 10px auto;
  }
  
  .success-state h3,
  .error-state h3 {
    margin: 0 0 15px;
    color: #333;
  }
  
  .success-state p,
  .error-state p {
    color: #666;
    margin: 5px 0;
  }
  
  .invoice-info {
    background-color: #f9f9f9;
    padding: 10px 15px;
    border-radius: 5px;
    font-weight: 500;
    color: #333;
    margin-top: 15px;
  }
  
  .modal-footer {
    padding: 15px 20px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  
  .btn {
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .btn-outline {
    background-color: transparent;
    border: 1px solid #b5838d;
    color: #b5838d;
  }
  
  .btn-outline:hover {
    background-color: rgba(181, 131, 141, 0.1);
  }
  
  .btn-primary {
    background-color: #b5838d;
    color: white;
    border: none;
  }
  
  .btn-primary:hover {
    background-color: #9c7082;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media (max-width: 480px) {
    .modal-content {
      width: 95%;
    }
    
    .modal-footer {
      flex-direction: column;
    }
    
    .btn {
      width: 100%;
    }
  }
  </style>