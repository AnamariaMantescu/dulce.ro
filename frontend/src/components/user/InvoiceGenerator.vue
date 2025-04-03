// In your main orders component (UserAccount.vue or similar)

<template>
  <!-- Add this to your template where you want to display the orders list -->
  <UserOrders 
    :orders="orders" 
    :loading="loading"
    @view-order-details="viewOrderDetails"
    @generate-invoice="generateInvoice"
    @add-review="showReviewModal"
  />
  
  <!-- Add this modal for invoice generation -->
  <div v-if="showInvoiceModal" class="invoice-modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Generare Factură</h2>
        <button class="close-btn" @click="showInvoiceModal = false">&times;</button>
      </div>
      
      <div class="modal-body">
        <div v-if="generatingInvoice" class="generating-state">
          <div class="loader"></div>
          <p>Se generează factura pentru comanda #{{ formatOrderId(selectedOrder.id) }}...</p>
        </div>
        
        <div v-else-if="invoiceGenerated" class="success-state">
          <div class="success-icon">✅</div>
          <h3>Factură generată cu succes!</h3>
          <p>Factura a fost descărcată în calculator.</p>
          <p class="invoice-info">Număr factură: {{ invoiceNumber }}</p>
        </div>
        
        <div v-else class="initial-state">
          <p>Sunteți pe cale să generați o factură pentru comanda <strong>#{{ formatOrderId(selectedOrder.id) }}</strong>.</p>
          <p>Factura va include toate produsele comandate și va fi salvată automat în calculator.</p>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-outline" @click="showInvoiceModal = false">Închide</button>
        <button v-if="!invoiceGenerated && !generatingInvoice" class="btn btn-primary" @click="createInvoicePdf">
          Generează Factură
        </button>
        <button v-if="invoiceGenerated" class="btn btn-primary" @click="createInvoicePdf">
          Generează din nou
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import UserOrders from '@/components/user/UserOrders.vue';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


export default {
  components: {
    UserOrders
  },
  data() {
    return {
      orders: [], // Your orders data
      loading: false,
      showInvoiceModal: false,
      selectedOrder: null,
      generatingInvoice: false,
      invoiceGenerated: false,
      invoiceNumber: '',
      companyDetails: {
        name: 'Dulce Ro Cofetărie Artizanală',
        address: 'Strada Florilor nr. 12, București, România',
        regNumber: 'J40/12345/2020',
        cui: 'RO12345678',
        phone: '021 234 5678',
        email: 'contact@dulcero.ro'
      },
      vatRate: 9 // TVA 9%
    };
  },
  methods: {
    // Show invoice modal
    generateInvoice(order) {
      this.selectedOrder = order;
      this.showInvoiceModal = true;
      this.invoiceGenerated = false;
    },
    
    // Format order ID
    formatOrderId(id) {
      return id ? id.substring(0, 8).toUpperCase() : '';
    },
    
    // Create PDF invoice
    createInvoicePdf() {
      this.generatingInvoice = true;
      
      // Create a new PDF document
      const doc = new jsPDF();
      
      // Generate a new invoice number
      const invoiceNumber = this.generateInvoiceNumber(this.selectedOrder.id);
      this.invoiceNumber = invoiceNumber;
      
      // Set the current date for invoice issue
      const issueDate = new Date();
      
      // Add company header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(this.companyDetails.name, 14, 15);
      
      // Add invoice title
      doc.setFontSize(18);
      doc.text('FACTURĂ', 105, 30, { align: 'center' });
      
      // Add invoice number and date
      doc.setFontSize(11);
      doc.text(`Număr factură: ${invoiceNumber}`, 150, 40, { align: 'right' });
      doc.text(`Data emitere: ${this.formatDate(issueDate)}`, 150, 45, { align: 'right' });
      
      // Add emitter details
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Emitent:', 14, 50);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(this.companyDetails.name, 14, 55);
      doc.text(this.companyDetails.address, 14, 60);
      doc.text(`Nr. Reg. Com.: ${this.companyDetails.regNumber}`, 14, 65);
      doc.text(`CUI: ${this.companyDetails.cui}`, 14, 70);
      doc.text(`Tel: ${this.companyDetails.phone}`, 14, 75);
      doc.text(`Email: ${this.companyDetails.email}`, 14, 80);
      
      // Add client details
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Client:', 120, 50);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      const clientName = this.selectedOrder.customerDetails?.name || 'N/A';
      doc.text(clientName, 120, 55);
      
      // Format client address
      let clientAddress = 'N/A';
      if (this.selectedOrder.customerDetails?.address) {
        const address = this.selectedOrder.customerDetails.address;
        const addressParts = [];
        
        if (address.line1) addressParts.push(address.line1);
        if (address.line2) addressParts.push(address.line2);
        if (address.city) addressParts.push(address.city);
        if (address.state) addressParts.push(address.state);
        if (address.postal_code) addressParts.push(address.postal_code);
        if (address.country) addressParts.push(address.country);
        
        clientAddress = addressParts.join(', ');
      }
      
      // Split long addresses into multiple lines if needed
      const splitAddress = doc.splitTextToSize(clientAddress, 70);
      doc.text(splitAddress, 120, 60);
      
      // Add products table
      const products = this.selectedOrder.products || this.selectedOrder.items || [];
      
      // Prepare table data
      const tableData = products.map((product, index) => {
        const priceWithoutVAT = this.calculatePriceWithoutVAT(product.price || 0);
        const totalWithoutVAT = priceWithoutVAT * (product.quantity || 1);
        
        // Get proper unit based on product type (if is available)
        let unit = 'buc';
        if (product.unit) {
          unit = product.unit;
        } else if (product.name && product.name.toLowerCase().includes('tort')) {
          unit = 'kg';
        }
        
        return [
          index + 1,
          product.name || 'Produs necunoscut',
          `${product.quantity || 1} ${unit}`,
          `${this.formatPrice(priceWithoutVAT)}/${unit}`,
          this.formatPrice(totalWithoutVAT)
        ];
      });
      
      // Add product table
      doc.autoTable({
        startY: 90,
        head: [['Nr. crt.', 'Descriere', 'Cantitate', 'Preț unitar (fără TVA)', 'Total (fără TVA)']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [181, 131, 141],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 5
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 60 },
          2: { cellWidth: 30 },
          3: { cellWidth: 40 },
          4: { cellWidth: 35 }
        }
      });
      
      // Get end position of the table
      const finalY = doc.lastAutoTable.finalY || 180;
      
      // Calculate total without VAT
      const totalWithoutVAT = this.calculateTotalWithoutVAT();
      
      // Calculate VAT amount
      const vatAmount = (totalWithoutVAT * this.vatRate) / 100;
      
      // Calculate total including VAT
      const totalWithVAT = totalWithoutVAT + vatAmount;
      
      // Determine payment method
      let paymentMethod = 'Necunoscut';
      if (this.selectedOrder.paymentMethod) {
        paymentMethod = this.selectedOrder.paymentMethod;
      } else if (this.selectedOrder.paymentStatus && this.selectedOrder.paymentStatus.toLowerCase() === 'paid') {
        paymentMethod = 'Card bancar';
      }
      
      // Add totals
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Total (fără TVA):`, 130, finalY + 10);
      doc.text(`${this.formatPrice(totalWithoutVAT)}`, 180, finalY + 10, { align: 'right' });
      
      doc.text(`TVA (${this.vatRate}%):`, 130, finalY + 17);
      doc.text(`${this.formatPrice(vatAmount)}`, 180, finalY + 17, { align: 'right' });
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Total de plată:`, 130, finalY + 24);
      doc.text(`${this.formatPrice(totalWithVAT)}`, 180, finalY + 24, { align: 'right' });
      
      // Add payment method
      doc.setFont('helvetica', 'normal');
      doc.text(`Metoda de plată: ${paymentMethod}`, 14, finalY + 35);
      
      // Add terms and conditions
      doc.text('Termeni și condiții: Produsele nu pot fi returnate.', 14, finalY + 45);
      
      // Create filename
      const filename = `factura_${this.formatFilenameSafe(invoiceNumber)}.pdf`;
      
      // Wait a bit to simulate processing (only for demo purposes)
      setTimeout(() => {
        // Save the PDF
        doc.save(filename);
        
        // Update state
        this.generatingInvoice = false;
        this.invoiceGenerated = true;
      }, 1000);
    },
    
    calculateTotalWithoutVAT() {
      const products = this.selectedOrder.products || this.selectedOrder.items || [];
      return products.reduce((total, product) => {
        const priceWithoutVAT = this.calculatePriceWithoutVAT(product.price || 0);
        return total + (priceWithoutVAT * (product.quantity || 1));
      }, 0);
    },
    
    calculatePriceWithoutVAT(price) {
      return price / (1 + (this.vatRate / 100));
    },
    
    formatPrice(amount) {
      if (!amount && amount !== 0) return '0 RON';
      
      return new Intl.NumberFormat('ro-RO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount) + ' RON';
    },
    
    formatDate(date) {
      if (!date) return 'N/A';
      
      const options = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      };
      
      return date.toLocaleDateString('ro-RO', options);
    },
    
    generateInvoiceNumber(orderId) {
      // Use a sequential number based on the order ID or timestamp
      const orderPrefix = orderId ? orderId.substring(0, 4).toUpperCase() : 'AAAA';
      const timestamp = Date.now().toString().substring(6);
      return `${orderPrefix}-${timestamp}`;
    },
    
    formatFilenameSafe(str) {
      return str.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }
  }
};
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

.success-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  color: #27ae60;
}

.generating-state p,
.initial-state p {
  color: #666;
  max-width: 400px;
  margin: 10px auto;
}

.success-state h3 {
  margin: 0 0 15px;
  color: #333;
}

.success-state p {
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