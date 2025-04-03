<!-- components/user/UserOrders.vue -->
<template>
  <div class="orders-container">
    <h2 class="section-title">Comenzile Mele</h2>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loader"></div>
      <p>Se încarcă comenzile...</p>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="orders.length === 0" class="empty-state">
      <div class="empty-icon">📦</div>
      <h3>Nu aveți comenzi</h3>
      <p>Nu ați plasat încă nicio comandă. Descoperiți produsele noastre delicioase!</p>
      <router-link to="/products" class="browse-btn">
        Explorați produsele
      </router-link>
    </div>
    
    <!-- Orders List -->
    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <div class="order-info">
            <span class="order-number">Comandă #{{ formatOrderId(order.id) }}</span>
            <span class="order-date">{{ formatDate(order.created) }}</span>
          </div>
          <div class="order-status" :class="getStatusClass(order.info)">
            {{ getStatusText(order.info) }}
          </div>
        </div>
        
        <!-- Order Details -->
        <div class="order-content">
          <div class="order-details">
            <div class="detail-group">
              <span class="detail-label">Destinatar:</span>
              <span class="detail-value">{{ order.customerDetails?.name }}</span>
            </div>
            
            <div class="detail-group">
              <span class="detail-label">Adresă:</span>
              <span class="detail-value">
                {{ formatAddress(order.customerDetails?.address) }}
              </span>
            </div>
            
            <div class="detail-group">
              <span class="detail-label">Telefon:</span>
              <span class="detail-value">{{ order.customerDetails?.phone }}</span>
            </div>
            
            <div class="detail-group">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ order.customerDetails?.email }}</span>
            </div>
          </div>
          
          <div class="payment-info">
            <div class="payment-status" :class="getPaymentStatusClass(order.paymentStatus)">
              <span class="status-icon">{{ getPaymentStatusIcon(order.paymentStatus) }}</span>
              <span>{{ getPaymentStatusText(order.paymentStatus) }}</span>
            </div>
            
            <div class="order-total">
              <span class="total-label">Total:</span>
              <span class="total-value">{{ formatPrice(order.amount) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Order Footer -->
        <div class="order-footer">
          <div class="order-actions">
            <button class="action-btn view" @click="$emit('view-order-details', order.id)">
              <span class="btn-icon">👁️</span>
              <span class="btn-text">Detalii</span>
            </button>
            
            <!-- Added Invoice Generation Button -->
            <button class="action-btn invoice" @click="generateInvoice(order)">
              <span class="btn-icon">📄</span>
              <span class="btn-text">Generează factură</span>
            </button>
            
            <button class="action-btn track" v-if="canTrack(order.info)">
              <span class="btn-icon">🚚</span>
              <span class="btn-text">Urmărire</span>
            </button>
            
            <button 
              class="action-btn review" 
              v-if="canReview(order)" 
              @click="$emit('add-review', {orderId: order.id, productId: getFirstProductId(order)})">
              <span class="btn-icon">⭐</span>
              <span class="btn-text">Recenzie</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Import the PDF library
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';



export default {
  name: 'UserOrders',
  props: {
    orders: {
      type: Array,
      default: () => []
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
    formatAddress(address) {
      if (!address) return 'N/A';
      
      const parts = [];
      if (address.line1) parts.push(address.line1);
      if (address.line2) parts.push(address.line2);
      if (address.city) parts.push(address.city);
      if (address.state) parts.push(address.state);
      if (address.postal_code) parts.push(address.postal_code);
      if (address.country) parts.push(address.country);
      
      return parts.join(', ');
    },
    getStatusClass(status) {
      if (!status) return 'status-default';
      
      const statusMap = {
        'în pregătire': 'status-processing',
        'la livrare': 'status-shipped',
        'livrat': 'status-delivered'
      };
      
      // Default to the original status if not found in the map
      return statusMap[status.toLowerCase()] || 'status-default';
    },
    getStatusText(status) {
      if (!status) return 'Necunoscut';
      
      const statusMap = {
        'în pregătire': 'În pregătire',
        'la livrare': 'La livrare',
        'livrat': 'Livrat'
      };
      
      // Return the mapped status or the original status
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
    canTrack(status) {
      return status && ['la livrare'].includes(status.toLowerCase());
    },
    canReview(order) {
      // Check if the order is delivered and contains products
      return order && 
             order.info && 
             (order.info.toLowerCase() === 'livrat' || 
              order.info.toLowerCase() === 'în pregătire') && // Temporarily include 'în pregătire' for testing
             ((order.products && order.products.length > 0) || 
              (order.items && order.items.length > 0));
    },
    getFirstProductId(order) {
      // Get first product ID from either products or items array
      if (order.products && order.products.length > 0) {
        return order.products[0].productId || '';
      } else if (order.items && order.items.length > 0) {
        return order.items[0].productId || '';
      }
      return '';
    },
    // New method to generate invoice PDF
    generateInvoice(order) {
      // Create PDF document
      const doc = new jsPDF();
      
      // Set font
      doc.setFont('helvetica', 'normal');
      
      // Add title
      doc.setFontSize(20);
      doc.text('Factura', 105, 20, { align: 'center' });
      
      // Add emitter details
      doc.setFontSize(12);
      doc.text('Emitent:', 20, 35);
      doc.setFontSize(10);
      doc.text('Dulce Cofetarie Artizanala', 20, 42);
      doc.text('Str. Florilor nr. 12,Bucuresti,RO', 20, 48);
      doc.text('Nr. Reg. Com.: J40/12345/2020', 20, 54);
      doc.text('CUI: RO12345678', 20, 60);
      doc.text('Tel: 021 234 5678', 20, 66);
      doc.text('Email: contact@dulcero.ro', 20, 72);
      
      // Add client details
      doc.text('Client:', 120, 35);
      if (order.customerDetails) {
        doc.text(order.customerDetails.name || 'N/A', 120, 42);
        doc.text(this.formatAddress(order.customerDetails.address) || 'N/A', 120, 48);
      } else {
        doc.text('Informatii client indisponibile', 120, 42);
      }
      
      // Add invoice number and date
      doc.text(`Număr factură: ${this.generateInvoiceNumber(order.id)}`, 20, 85);
      doc.text(`Data emitere: ${this.formatDate(order.created || new Date())}`, 20, 92);
      
      // Get products from order
      const products = order.products || order.items || [];
      
      // Prepare table data
      const tableColumn = ["Nr. crt.", "Descriere", "Cantitate", "Pret unitar (Fara TVA)", "Total (Fara TVA)"];
      const tableRows = [];
      
      let totalWithoutVAT = 0;
      
      // Add product rows
      products.forEach((product, index) => {
        const productName = product.name || `Produs ${index + 1}`;
        const quantity = product.quantity || 1;
        const unitPrice = (product.price / 1.09).toFixed(2); // Remove 9% VAT
        const totalPrice = (unitPrice * quantity).toFixed(2);
        
        totalWithoutVAT += parseFloat(totalPrice);
        
        tableRows.push([
          index + 1,
          productName,
          `${quantity} ${product.unit || 'buc'}`,
          `${unitPrice} RON`,
          `${totalPrice} RON`
        ]);
      });
      
      // Calculate VAT and total
      const vat = (totalWithoutVAT * 0.09).toFixed(2);
      const totalWithVAT = (totalWithoutVAT + parseFloat(vat)).toFixed(2);
      
      // Add table
      autoTable(doc,{
        head: [tableColumn],
        body: tableRows,
        startY: 100,
        theme: 'striped',
        headStyles: { fillColor: [181, 131, 141] },
        margin: { top: 100 }
      });
      
      // Get the final Y position after the table
      const finalY = doc.lastAutoTable.finalY + 10;
      
      // Add totals
      doc.text(`Total (fara TVA): ${totalWithoutVAT.toFixed(2)} RON`, 130, finalY);
      doc.text(`TVA (9%): ${vat} RON`, 130, finalY + 7);
      doc.setFontSize(12);
      doc.text(`Total de plata: ${totalWithVAT} RON`, 130, finalY + 14);
      
      // Add payment method
      doc.setFontSize(10);
      doc.text(`Metoda de plata: ${this.getPaymentMethod(order.paymentStatus)}`, 20, finalY + 25);
      
      // Add terms
      doc.text('Termeni si conditii: Produsele nu pot fi returnate.', 20, finalY + 35);
      
      // Save the PDF
      doc.save(`Factura_${this.formatOrderId(order.id)}.pdf`);
    },
    generateInvoiceNumber(orderId) {
      // Generate a simple invoice number based on order ID and date
      const date = new Date();
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const orderIdShort = orderId ? orderId.substring(0, 4).toUpperCase() : 'XXXX';
      
      return `${year}${month}-${orderIdShort}`;
    },
    getPaymentMethod(paymentStatus) {
      // Determine payment method based on payment status
      if (paymentStatus && paymentStatus.toLowerCase() === 'paid') {
        return 'Card bancar';
      } else {
        return 'Numerar la livrare';
      }
    }
  }
};
</script>

<style scoped>
/* Styles remain unchanged from original */
.orders-container {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.section-title {
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  font-size: 1.8rem;
  font-weight: 300;
  color: #333;
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 0.8rem;
}

.section-title:after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 40px;
  height: 2px;
  background-color: #b5838d;
  transition: width 0.3s ease;
}

.orders-container:hover .section-title:after {
  width: 60px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 2rem;
}

.loader {
  width: 48px;
  height: 48px;
  border: 5px solid rgba(181, 131, 141, 0.2);
  border-radius: 50%;
  border-top: 5px solid #b5838d;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 2rem;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 12px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  color: #ccc;
}

.empty-state h3 {
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #666;
}

.empty-state p {
  margin-bottom: 1.5rem;
  color: #888;
  max-width: 400px;
}

.browse-btn {
  background: linear-gradient(to right, #b5838d, #9c27b0);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(181, 131, 141, 0.3);
}

.browse-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 20px rgba(181, 131, 141, 0.4);
}

/* Orders List */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.order-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

/* Order Header */
.order-header {
  padding: 1.2rem 1.5rem;
  background-color: #f9f9f9;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.order-number {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.order-date {
  font-size: 0.85rem;
  color: #777;
}

/* Order Status */
.order-status {
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.5px;
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

/* Order Content */
.order-content {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.order-details {
  flex: 1;
  min-width: 280px;
}

.detail-group {
  margin-bottom: 0.8rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.detail-label {
  font-weight: 500;
  color: #666;
  min-width: 100px;
}

.detail-value {
  color: #333;
}

/* Payment Info */
.payment-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  min-width: 200px;
}

.payment-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.95rem;
}

.payment-paid {
  color: #27ae60;
}

.payment-unpaid {
  color: #e74c3c;
}

.payment-pending {
  color: #f39c12;
}

.payment-failed {
  color: #c0392b;
}

.payment-unknown {
  color: #7f8c8d;
}

.status-icon {
  font-size: 1.2rem;
}

.order-total {
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.total-label {
  font-weight: 500;
  color: #666;
}

.total-value {
  font-weight: 600;
  color: #b5838d;
}

/* Order Footer */
.order-footer {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.order-actions {
  display: flex;
  gap: 0.8rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.view {
  background-color: #f5f5f5;
  color: #666;
}

.action-btn.view:hover {
  background-color: #e9e9e9;
}

/* New Invoice Button Styles */
.action-btn.invoice {
  background-color: rgba(39, 174, 96, 0.1);
  color: #27ae60;
}

.action-btn.invoice:hover {
  background-color: rgba(39, 174, 96, 0.2);
}

.action-btn.track {
  background-color: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.action-btn.track:hover {
  background-color: rgba(52, 152, 219, 0.2);
}

.action-btn.review {
  background-color: rgba(181, 131, 141, 0.1);
  color: #b5838d;
}

.action-btn.review:hover {
  background-color: rgba(181, 131, 141, 0.2);
}

.btn-icon {
  font-size: 1.1rem;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .order-content {
    flex-direction: column;
  }
  
  .payment-info {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .order-actions {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
  
  .payment-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .action-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>