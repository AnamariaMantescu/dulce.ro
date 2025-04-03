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
    
    <!-- Success Notification -->
    <div v-if="notification.show" 
         class="notification" 
         :class="notification.type" 
         @click="notification.show = false">
      {{ notification.message }}
      <span class="notification-close">×</span>
    </div>
  </div>
</template>

<script>
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Attach autoTable to jsPDF
jsPDF.API.autoTable = autoTable;

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
  data() {
    return {
      companyInfo: {
        name: 'Dulce Ro Cofetărie Artizanală',
        address: 'Strada Florilor nr. 12, București, România',
        regNumber: 'J40/12345/2020',
        cui: 'RO12345678',
        phone: '021 234 5678',
        email: 'contact@dulcero.ro'
      },
      notification: {
        show: false,
        message: '',
        type: 'success',
        timeout: null
      }
    };
  },
  methods: {
    formatOrderId(id) {
      return id ? id.substring(0, 8).toUpperCase() : '';
    },
    formatDate(timestamp) {
      if (!timestamp) return 'N/A';
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        timestamp = timestamp.toDate();
      } else if (typeof timestamp === 'string') {
        timestamp = new Date(timestamp);
      }
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
      return statusMap[status.toLowerCase()] || 'status-default';
    },
    getStatusText(status) {
      if (!status) return 'Necunoscut';
      const statusMap = {
        'în pregătire': 'În pregătire',
        'la livrare': 'La livrare',
        'livrat': 'Livrat'
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
    canTrack(status) {
      return status && ['la livrare'].includes(status.toLowerCase());
    },
    canReview(order) {
      return order &&
        order.info &&
        (order.info.toLowerCase() === 'livrat' || order.info.toLowerCase() === 'în pregătire') &&
        ((order.products && order.products.length > 0) ||
         (order.items && order.items.length > 0));
    },
    getFirstProductId(order) {
      if (order.products && order.products.length > 0) {
        return order.products[0].productId || '';
      } else if (order.items && order.items.length > 0) {
        return order.items[0].productId || '';
      }
      return '';
    },
    generateInvoice(order) {
      try {
        const doc = new jsPDF();
        doc.setFont('helvetica');
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('FACTURĂ', 105, 20, { align: 'center' });

        const invoiceNumber = `INV-${this.formatOrderId(order.id)}-${new Date().getFullYear()}`;
        const currentDate = this.formatInvoiceDate(new Date());

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Emitent:', 14, 40);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(this.companyInfo.name, 14, 45);
        doc.text(this.companyInfo.address, 14, 50);
        doc.text(`Nr. Reg. Com.: ${this.companyInfo.regNumber}`, 14, 55);
        doc.text(`CUI: ${this.companyInfo.cui}`, 14, 60);
        doc.text(`Tel: ${this.companyInfo.phone}`, 14, 65);
        doc.text(`Email: ${this.companyInfo.email}`, 14, 70);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Număr factură: ${invoiceNumber}`, 140, 40);
        doc.text(`Data emitere: ${currentDate}`, 140, 45);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Client:', 14, 85);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        if (order.customerDetails) {
          doc.text(order.customerDetails.name || 'N/A', 14, 90);
          doc.text(this.formatAddress(order.customerDetails.address) || 'N/A', 14, 95);
        } else {
          doc.text('Informații client indisponibile', 14, 90);
        }

        this.addProductsTable(doc, order);

        doc.setFontSize(10);
        doc.text(`Metoda de plată: ${this.getPaymentMethod(order.paymentMethod)}`, 14, doc.lastAutoTable.finalY + 20);
        doc.text('Termeni și condiții: Produsele nu pot fi returnate.', 14, doc.lastAutoTable.finalY + 25);

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.text(`${this.companyInfo.name} - Pagina ${i} din ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
        }

        doc.save(`Factura_${invoiceNumber}.pdf`);
        this.showNotification(`Factura ${invoiceNumber} a fost generată cu succes!`, 'success');
        return invoiceNumber;
      } catch (error) {
        console.error('Error generating invoice:', error);
        this.showNotification('A apărut o eroare la generarea facturii.', 'error');
      }
    },
    addProductsTable(doc, order) {
      const headers = [['Nr. crt.', 'Descriere', 'Cantitate', 'Preț unitar (fără TVA)', 'Total (fără TVA)']];
      const items = this.getOrderItems(order).map((item, index) => [
        index + 1,
        item.name,
        `${item.quantity} ${item.unit}`,
        `${item.unitPrice.toFixed(2)} RON/${item.unit}`,
        `${item.totalBeforeTax.toFixed(2)} RON`
      ]);

      autoTable(doc, {
  startY: 105,
  head: headers,
  body: items,
        theme: 'grid',
        headStyles: {
          fillColor: [181, 131, 141],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        margin: { top: 105 }
      });

      const totalBeforeTax = this.calculateTotalBeforeTax(order);
      const taxAmount = this.calculateTax(totalBeforeTax);
      const totalAmount = totalBeforeTax + taxAmount;

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 2,
        body: [
          ['', '', '', 'Total (fără TVA)', `${totalBeforeTax.toFixed(2)} RON`],
          ['', '', '', 'TVA (9%)', `${taxAmount.toFixed(2)} RON`],
          ['', '', '', 'Total de plată', `${totalAmount.toFixed(2)} RON`]
        ],
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        bodyStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { left: 14 }
      });
    },
    getOrderItems(order) {
      const orderItems = order.products || order.items || [];
      return orderItems.map(item => {
        const unit = this.getUnitByProductType(item.productType || 'piece');
        const unitPriceWithoutVAT = (item.price || 0) / 1.09;
        return {
          name: item.name || item.productName || 'Produs necunoscut',
          quantity: item.quantity || 1,
          unit: unit,
          unitPrice: unitPriceWithoutVAT,
          totalBeforeTax: unitPriceWithoutVAT * (item.quantity || 1)
        };
      });
    },
    calculateTotalBeforeTax(order) {
      const items = this.getOrderItems(order);
      return items.reduce((total, item) => total + item.totalBeforeTax, 0);
    },
    calculateTax(amount) {
      return amount * 0.09;
    },
    getPaymentMethod(method) {
      if (!method) return 'Card bancar';
      const methodMap = {
        'card': 'Card bancar',
        'cash': 'Numerar la livrare',
        'bank_transfer': 'Transfer bancar'
      };
      return methodMap[method.toLowerCase()] || method;
    },
    getUnitByProductType(type) {
      const unitMap = {
        'cake': 'kg',
        'pastry': 'buc',
        'piece': 'buc',
        'drink': 'ml',
        'box': 'buc'
      };
      return unitMap[type.toLowerCase()] || 'buc';
    },
    formatInvoiceDate(date) {
      if (!date) return 'N/A';
      const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      };
      return date.toLocaleDateString('ro-RO', options);
    },
    showNotification(message, type = 'success') {
      if (this.notification.timeout) {
        clearTimeout(this.notification.timeout);
      }
      this.notification = {
        show: true,
        message,
        type,
        timeout: setTimeout(() => {
          this.notification.show = false;
        }, 5000)
      };
    }
  }
};
</script>


<style scoped>
/* Existing styles remain unchanged */
.orders-container {
  animation: fadeIn 0.5s ease-out;
  position: relative;
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
.action-btn.invoice {
  background-color: rgba(241, 196, 15, 0.1);
  color: #f1c40f;
}
.action-btn.invoice:hover {
  background-color: rgba(241, 196, 15, 0.2);
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

/* Notification Styles */
.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease-out forwards;
  max-width: 400px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.notification.success {
  background-color: #e8f5e9;
  color: #1b5e20;
  border-left: 4px solid #4caf50;
}

.notification.error {
  background-color: #ffebee;
  color: #b71c1c;
  border-left: 4px solid #f44336;
}

.notification-close {
  margin-left: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>