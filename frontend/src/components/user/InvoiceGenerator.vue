<!-- components/invoice/InvoiceGenerator.vue -->
<template>
    <div class="invoice-generator">
      <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
        <p>Se generează factura...</p>
      </div>
    </div>
  </template>
  
  <script>
  import jsPDF from 'jspdf';
  import 'jspdf-autotable';
  
  export default {
    name: 'InvoiceGenerator',
    props: {
      order: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        loading: false,
        companyDetails: {
          name: 'Dulce Ro Cofetărie Artizanală',
          address: 'Strada Florilor nr. 12, București, România',
          regNumber: 'J40/12345/2020',
          cui: 'RO12345678',
          phone: '021 234 5678',
          email: 'contact@dulcero.ro'
        },
        vatRate: 9, // TVA 9%
      }
    },
    methods: {
      generateInvoice() {
        this.loading = true;
        
        // Create a new PDF document
        const doc = new jsPDF();
        
        // Set PDF metadata
        doc.setProperties({
          title: `Factura #${this.formatInvoiceNumber(this.order.id)}`,
          subject: 'Factura Dulce Ro',
          author: 'Dulce Ro Cofetărie Artizanală',
          creator: 'Dulce Ro'
        });
        
        // Generate a new invoice number
        const invoiceNumber = this.generateInvoiceNumber(this.order.id);
        
        // Set the current date for invoice issue
        const issueDate = new Date();
        
        // Add company logo/header
        this.addHeader(doc);
        
        // Add invoice title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('FACTURĂ', 105, 30, { align: 'center' });
        
        // Add invoice number and date
        doc.setFontSize(11);
        doc.text(`Număr factură: ${invoiceNumber}`, 150, 40, { align: 'right' });
        doc.text(`Data emitere: ${this.formatDate(issueDate)}`, 150, 45, { align: 'right' });
        
        // Add emitter details
        this.addEmitterDetails(doc, 40);
        
        // Add client details
        this.addClientDetails(doc, 40);
        
        // Add products table
        this.addProductsTable(doc, 90);
        
        // Add totals and payment information
        this.addTotalsAndPayment(doc, 180);
        
        // Add terms and conditions
        doc.text('Termeni și condiții: Produsele nu pot fi returnate.', 14, 250);
        
        // Save the PDF with order ID as part of the filename
        this.loading = false;
        
        const filename = `factura_${this.formatFilenameSafe(invoiceNumber)}.pdf`;
        
        // Save the PDF
        doc.save(filename);
      },
      
      addHeader(doc) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(this.companyDetails.name, 14, 15);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
      },
      
      addEmitterDetails(doc, startY) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Emitent:', 14, startY);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(this.companyDetails.name, 14, startY + 5);
        doc.text(this.companyDetails.address, 14, startY + 10);
        doc.text(`Nr. Reg. Com.: ${this.companyDetails.regNumber}`, 14, startY + 15);
        doc.text(`CUI: ${this.companyDetails.cui}`, 14, startY + 20);
        doc.text(`Tel: ${this.companyDetails.phone}`, 14, startY + 25);
        doc.text(`Email: ${this.companyDetails.email}`, 14, startY + 30);
      },
      
      addClientDetails(doc, startY) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Client:', 120, startY);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        const clientName = this.order.customerDetails?.name || 'N/A';
        doc.text(clientName, 120, startY + 5);
        
        // Format and add client address
        let clientAddress = 'N/A';
        if (this.order.customerDetails?.address) {
          const address = this.order.customerDetails.address;
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
        doc.text(splitAddress, 120, startY + 10);
      },
      
      addProductsTable(doc, startY) {
        // Extract products from order
        const products = this.order.products || this.order.items || [];
        
        // Calculate product prices excluding VAT
        const tableData = products.map((product, index) => {
          const priceWithoutVAT = this.calculatePriceWithoutVAT(product.price);
          const totalWithoutVAT = priceWithoutVAT * (product.quantity || 1);
          
          // Get proper unit based on product type (if available)
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
          startY: startY,
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
      },
      
      addTotalsAndPayment(doc, startY) {
        // Calculate total without VAT
        const totalWithoutVAT = this.calculateTotalWithoutVAT();
        
        // Calculate VAT amount
        const vatAmount = (totalWithoutVAT * this.vatRate) / 100;
        
        // Calculate total including VAT
        const totalWithVAT = totalWithoutVAT + vatAmount;
        
        // Determine payment method
        let paymentMethod = 'Necunoscut';
        if (this.order.paymentMethod) {
          paymentMethod = this.order.paymentMethod;
        } else if (this.order.paymentStatus && this.order.paymentStatus.toLowerCase() === 'paid') {
          paymentMethod = 'Card bancar';
        }
        
        // Add totals
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Total (fără TVA):`, 130, startY);
        doc.text(`${this.formatPrice(totalWithoutVAT)}`, 180, startY, { align: 'right' });
        
        doc.text(`TVA (${this.vatRate}%):`, 130, startY + 7);
        doc.text(`${this.formatPrice(vatAmount)}`, 180, startY + 7, { align: 'right' });
        
        doc.setFont('helvetica', 'bold');
        doc.text(`Total de plată:`, 130, startY + 14);
        doc.text(`${this.formatPrice(totalWithVAT)}`, 180, startY + 14, { align: 'right' });
        
        // Add payment method
        doc.setFont('helvetica', 'normal');
        doc.text(`Metoda de plată: ${paymentMethod}`, 14, startY + 25);
      },
      
      calculateTotalWithoutVAT() {
        const products = this.order.products || this.order.items || [];
        return products.reduce((total, product) => {
          const priceWithoutVAT = this.calculatePriceWithoutVAT(product.price);
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
      
      formatInvoiceNumber(orderId) {
        // Format invoice number: INV-{last 6 chars of orderId}-{current date in format YYMMDD}
        if (!orderId) return 'INV-000000-000000';
        
        const orderIdPart = orderId.substring(Math.max(0, orderId.length - 6)).toUpperCase();
        const date = new Date();
        const datePart = date.getFullYear().toString().substr(-2) + 
                        (date.getMonth() + 1).toString().padStart(2, '0') + 
                        date.getDate().toString().padStart(2, '0');
        
        return `INV-${orderIdPart}-${datePart}`;
      },
      
      generateInvoiceNumber(orderId) {
        // Use a sequential number based on the order ID or timestamp for simple demo purposes
        const orderPrefix = orderId ? orderId.substring(0, 4).toUpperCase() : 'AAAA';
        const timestamp = Date.now().toString().substring(6);
        return `${orderPrefix}-${timestamp}`;
      },
      
      formatFilenameSafe(str) {
        return str.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      }
    },
    mounted() {
      // Generate invoice automatically when component is mounted
      this.generateInvoice();
    }
  }
  </script>
  
  <style scoped>
  .invoice-generator {
    position: relative;
  }
  
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(181, 131, 141, 0.3);
    border-top-color: #b5838d;
    border-radius: 50%;
    animation: spin 1s infinite linear;
    margin-bottom: 15px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  </style>