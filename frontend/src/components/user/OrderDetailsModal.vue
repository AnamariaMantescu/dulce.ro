<!-- components/user/OrderDetailsModal.vue -->
<template>
  <div class="order-details-modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Detalii Comandă</h2>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>
      
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Se încarcă detaliile comenzii...</p>
      </div>
      
      <div v-else-if="!order" class="error-container">
        <p>Comanda nu a fost găsită. Vă rugăm să încercați din nou.</p>
        <button class="btn btn-primary" @click="$emit('close')">Închide</button>
      </div>
      
      <div v-else class="order-details">
        <div class="order-info-section">
          <div class="order-summary">
            <div class="summary-item">
              <span class="label">Comandă #:</span>
              <span class="value">{{ formatOrderId(order.id) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Data:</span>
              <span class="value">{{ formatDate(order.created) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Status:</span>
              <span class="value status-badge" :class="getStatusClass(order.status)">
                {{ getStatusText(order.status) }}
              </span>
            </div>
            <div class="summary-item">
              <span class="label">Total:</span>
              <span class="value price">{{ formatPrice(order.amount) }}</span>
            </div>
          </div>
        </div>
        
        <div class="section-divider"></div>
        
        <div class="shipping-billing-section">
          <div class="shipping-info">
            <h3>Detalii Livrare</h3>
            <address>
              {{ order.customerDetails?.name }}<br>
              {{ order.customerDetails?.address?.line1 }}<br>
              <span v-if="order.customerDetails?.address?.line2">
                {{ order.customerDetails.address.line2 }}<br>
              </span>
              {{ order.customerDetails?.address?.city }}, 
              {{ order.customerDetails?.address?.postal_code }}<br>
              {{ order.customerDetails?.address?.country }}
            </address>
            <div v-if="order.customerDetails?.phone" class="shipping-phone">
              <strong>Telefon:</strong> {{ order.customerDetails.phone }}
            </div>
            <div v-if="order.customerDetails?.email" class="shipping-email">
              <strong>Email:</strong> {{ order.customerDetails.email }}
            </div>
          </div>
          
          <div class="payment-info">
            <h3>Informații Plată</h3>
            <div class="payment-method">
              <div class="payment-status" :class="getPaymentStatusClass(order.paymentStatus)">
                <span class="status-icon">{{ getPaymentStatusIcon(order.paymentStatus) }}</span>
                <span>{{ getPaymentStatusText(order.paymentStatus) }}</span>
              </div>
              <div class="payment-currency">
                <strong>Valută:</strong> {{ order.currency?.toUpperCase() || 'RON' }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="section-divider"></div>
        
        <div class="order-items-section">
          <h3>Produse Comandate</h3>
          <div class="order-items-list">
            <div v-for="(product, index) in order.products" :key="index" class="order-item">
              <div class="item-details">
                <div class="item-name">{{ product.name }}</div>
                <div class="item-price">
                  {{ formatPrice(product.price) }} × {{ product.quantity }}
                </div>
                <div class="item-total">
                  {{ formatPrice(product.price * product.quantity) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="section-divider"></div>
        
        <div class="order-totals-section">
          <div class="order-total">
            <span>Total Comandă:</span>
            <span>{{ formatPrice(order.amount) }}</span>
          </div>
        </div>
        
        <div class="order-actions">
          <button class="btn btn-outline" @click="$emit('close')">Închide</button>

          <!-- Find this section in OrderDetailsModal.vue and update it -->
          <button 
            v-if="canReview(order)" 
            class="btn btn-primary" 
            @click="emitAddReview(order)"
          >
            Adaugă Recenzie
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderDetailsModal',
  props: {
    order: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    formatOrderId(id) {
      return id ? id.substring(0, 8).toUpperCase() : '';
    },
// Metodă îmbunătățită pentru OrderDetailsModal.vue
emitAddReview(order) {
  // Evităm eventuale erori dacă order este undefined
  if (!order) {
    console.error('Comanda nu este disponibilă pentru recenzie');
    this.$emit('add-review', { orderId: '' });
    return;
  }

  // Găsim primul produs pentru recenzie
  let productId = '';
  let productData = null;
  
  if (order.products && order.products.length > 0) {
    const product = order.products[0];
    productId = product.productId || product.id || '';
    productData = product;
  } else if (order.items && order.items.length > 0) {
    const item = order.items[0];
    productId = item.productId || item.id || '';
    productData = item;
  }
  
  // Dacă nu avem un ID valid pentru produs, nu îl transmitem deloc
  // pentru a evita încercarea de a-l căuta în Firestore
  const eventData = {
    orderId: order.id
  };
  
  // Adăugăm ID-ul produsului doar dacă există
  if (productId) {
    eventData.productId = productId;
  }
  
  // Adăugăm datele produsului dacă există
  if (productData) {
    eventData.productData = productData;
  }
  
  // Emitem evenimentul cu toate datele disponibile
  this.$emit('add-review', eventData);
  console.log('Emitting add-review event with data:', eventData);
},
    formatDate(timestamp) {
      if (!timestamp) return 'N/A';
      
      // Check if timestamp is a Firebase Timestamp object
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        timestamp = timestamp.toDate();
      } else if (typeof timestamp === 'string') {
        timestamp = new Date(timestamp);
      }
      
      // Format date as DD Month YYYY at HH:MM
      const options = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(timestamp).toLocaleDateString('ro-RO', options);
    },
    formatPrice(amount) {
      if (!amount && amount !== 0) return 'N/A';
      
      return new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency: 'RON',
        minimumFractionDigits: 2
      }).format(amount);
    },
    getStatusClass(status) {
      if (!status) return 'status-default';
      
      const statusMap = {
        'new': 'status-new',
        'processing': 'status-processing',
        'shipped': 'status-shipped',
        'delivered': 'status-delivered',
        'cancelled': 'status-cancelled'
      };
      
      return statusMap[status.toLowerCase()] || 'status-default';
    },
    getStatusText(status) {
      if (!status) return 'Necunoscut';
      
      const statusMap = {
        'new': 'Nouă',
        'processing': 'În procesare',
        'shipped': 'Expediată',
        'delivered': 'Livrată',
        'cancelled': 'Anulată'
      };
      
      return statusMap[status.toLowerCase()] || status;
    },
    getPaymentStatusClass(status) {
      if (!status) return 'payment-unknown';
      
      const statusMap = {
        'paid': 'payment-paid',
        'unpaid': 'payment-unpaid',
        'pending': 'payment-pending',
        'failed': 'payment-failed'
      };
      
      return statusMap[status.toLowerCase()] || 'payment-unknown';
    },
    getPaymentStatusText(status) {
      if (!status) return 'Necunoscut';
      
      const statusMap = {
        'paid': 'Plătită',
        'unpaid': 'Neplătită',
        'pending': 'În așteptare',
        'failed': 'Eșuată'
      };
      
      return statusMap[status.toLowerCase()] || status;
    },
    getPaymentStatusIcon(status) {
      if (!status) return '❓';
      
      const iconMap = {
        'paid': '✅',
        'unpaid': '❌',
        'pending': '⏳',
        'failed': '❗'
      };
      
      return iconMap[status.toLowerCase()] || '❓';
    },
    canReview(order) {
      // Check if order is delivered and hasn't been reviewed yet
      return order && 
             order.status && 
             (order.status.toLowerCase() === 'delivered' || 
              order.status.toLowerCase() === 'new') && // Temporarily include 'new' for testing
             order.products && 
             order.products.length > 0 &&
             !order.reviewed;
    }
  }
}
</script>

<style scoped>
/* The styles remain exactly the same as in the previous pasted component */
.order-details-modal {
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
  max-width: 800px;
  max-height: 90vh;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
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

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(181, 131, 141, 0.3);
  border-radius: 50%;
  border-top-color: #b5838d;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-container p {
  color: #e74c3c;
  margin-bottom: 20px;
}

.order-details {
  padding: 20px;
}

.order-info-section {
  margin-bottom: 20px;
}

.order-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.summary-item {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
}

.value {
  font-weight: 500;
  color: #333;
}

.status-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  width: fit-content;
  text-transform: capitalize;
}

.status-new {
  background-color: rgba(250, 219, 216, 0.2);
  color: #e84b3c;
  border: 1px solid rgba(250, 219, 216, 0.5);
}

.status-processing {
  background-color: rgba(255, 243, 224, 0.2);
  color: #f39c12;
  border: 1px solid rgba(255, 243, 224, 0.5);
}

.status-shipped {
  background-color: rgba(209, 236, 241, 0.2);
  color: #3498db;
  border: 1px solid rgba(209, 236, 241, 0.5);
}

.status-delivered {
  background-color: rgba(212, 239, 223, 0.2);
  color: #27ae60;
  border: 1px solid rgba(212, 239, 223, 0.5);
}

.status-cancelled {
  background-color: rgba(235, 237, 239, 0.2);
  color: #7f8c8d;
  border: 1px solid rgba(235, 237, 239, 0.5);
}

.status-default {
  background-color: rgba(236, 240, 241, 0.2);
  color: #95a5a6;
  border: 1px solid rgba(236, 240, 241, 0.5);
}

.price {
  color: #b5838d;
  font-weight: 600;
}

.section-divider {
  height: 1px;
  background-color: #eee;
  margin: 20px 0;
}

.shipping-billing-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-bottom: 20px;
}

.shipping-info h3, .payment-info h3, .order-items-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.2rem;
  color: #333;
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
}

address {
  font-style: normal;
  line-height: 1.6;
  color: #555;
}

.shipping-phone, .shipping-email {
  margin-top: 10px;
  color: #666;
}

.payment-method {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.payment-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.95rem;
}

.status-icon {
  font-size: 1.2rem;
}

.payment-paid { color: #27ae60; }
.payment-unpaid { color: #e74c3c; }
.payment-pending { color: #f39c12; }
.payment-failed { color: #c0392b; }
.payment-unknown { color: #7f8c8d; }

.order-items-section {
  margin-bottom: 20px;
}

.order-items-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #f0f0f0;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.item-details {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.item-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
  font-size: 1rem;
}

.item-price, .item-total {
  color: #666;
  font-size: 0.9rem;
}

.item-total {
  font-weight: 600;
  color: #b5838d;
  margin-top: 5px;
}

.order-totals-section {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.order-total {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
}

.order-actions {
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
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 0 10px;
  }

  .order-summary {
    grid-template-columns: 1fr;
  }

  .shipping-billing-section {
    grid-template-columns: 1fr;
  }

  .order-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .order-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>