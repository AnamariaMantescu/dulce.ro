<template>
    <div class="products-container">
      <h2 class="panel-title">Gestionare Produse</h2>
      
      <!-- Operation selector -->
      <div class="operation-selector">
        <select v-model="selectedOperation" class="operation-select">
          <option value="list">Listă</option>
          <option value="add">Adaugă</option>
          <option value="edit">Editează</option>
          <option value="delete">Șterge</option>
        </select>
        <button @click="executeOperation" class="execute-btn">
          Execută
        </button>
      </div>
      
      <!-- Notification -->
      <div v-if="notification" class="notification" :class="notificationClass">
        {{ notification.message }}
        <button @click="notification = null" class="close-btn">&times;</button>
      </div>
      
      <!-- LIST OPERATION -->
      <div v-if="selectedOperation === 'list'" class="operation-panel">
        <div v-if="loading" class="loading-message">
          Se încarcă...
        </div>
        
        <div v-else-if="products.length === 0" class="empty-message">
          Nu există produse. Adăugați unul folosind operația "Adaugă".
        </div>
        
        <div v-else class="table-container">
          <table class="products-table">
            <thead>
              <tr>
                <th class="column-name">Nume</th>
                <th class="column-category">Categorie</th>
                <th class="column-price">Preț</th>
                <th class="column-status">Disponibilitate</th>
                <th class="column-actions">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id" class="table-row">
                <td class="column-name">
                  <div class="product-name">{{ product.name }}</div>
                  <div class="product-id">{{ product.id }}</div>
                </td>
                <td class="column-category">
                  {{ product.category || '-' }}
                  <span v-if="product.subcategory" class="text-xs text-gray-500">
                    / {{ product.subcategory }}
                  </span>
                </td>
                <td class="column-price">{{ product.price }} RON</td>
                <td class="column-status">
                  <span :class="['status-indicator', getAvailabilityClass(product.availability)]">
                    {{ product.availability || 'Nedefinit' }}
                  </span>
                </td>
                <td class="column-actions">
                  <div class="action-buttons">
                    <button @click="editItem(product)" class="action-btn edit-btn">
                      Editează
                    </button>
                    <button @click="deleteItem(product)" class="action-btn delete-btn">
                      Șterge
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- ADD OPERATION -->
      <div v-if="selectedOperation === 'add'" class="operation-panel">
        <AdminProductForm 
          @productSaved="handleProductSaved"
          @cancel="cancelAdd"
          @showNotification="showNotification"
        />
      </div>
      
      <!-- EDIT OPERATION -->
      <div v-if="selectedOperation === 'edit'" class="operation-panel">
        <div v-if="!selectedEditId" class="select-container">
          <label class="form-label">Selectează produsul de editat:</label>
          <select v-model="selectedEditId" class="product-select">
            <option value="">-- Selectează un produs --</option>
            <option v-for="product in products" :key="product.id" :value="product.id">
              {{ product.name }} ({{ product.price }} RON)
            </option>
          </select>
        </div>
        
        <div v-else>
          <div class="form-header mb-4">
            <h3 class="form-title">Editare: {{ getProductById(selectedEditId)?.name }}</h3>
            <button type="button" @click="selectedEditId = null" class="back-btn">
              ← Înapoi la selecție
            </button>
          </div>
          
          <AdminProductForm 
            :productId="selectedEditId"
            @productSaved="handleProductSaved"
            @cancel="cancelEdit"
            @showNotification="showNotification"
          />
        </div>
      </div>
      
      <!-- DELETE OPERATION -->
      <div v-if="selectedOperation === 'delete'" class="operation-panel">
        <div class="delete-container">
          <label class="form-label">Selectează produsul de șters:</label>
          <select v-model="selectedDeleteId" class="product-select">
            <option value="">-- Selectează un produs --</option>
            <option v-for="product in products" :key="product.id" :value="product.id">
              {{ product.name }} ({{ product.price }} RON)
            </option>
          </select>
          
          <div v-if="selectedDeleteId" class="delete-confirmation">
            <h4 class="delete-title">Confirmare ștergere</h4>
            <p class="delete-message">Ești sigur că vrei să ștergi produsul "{{ getProductById(selectedDeleteId)?.name }}"?</p>
            <div class="delete-actions">
              <button @click="selectedDeleteId = null" class="cancel-btn">
                Anulează
              </button>
              <button @click="confirmDelete" class="delete-confirm-btn">
                Confirmă ștergerea
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
  import { db } from '@/firebase';
  import AdminProductForm from './AdminProductForm.vue';
  
  export default {
    name: 'AiryAdminProductsPanel',
    components: {
      AdminProductForm
    },
    data() {
      return {
        selectedOperation: 'list',
        notification: null,
        loading: false,
        products: [],
        
        // For edit
        selectedEditId: '',
        
        // For delete
        selectedDeleteId: '',
        isDeleting: null
      };
    },
    computed: {
      notificationClass() {
        if (!this.notification) return '';
        switch (this.notification.type) {
          case 'success': return 'notification-success';
          case 'error': return 'notification-error';
          default: return 'notification-info';
        }
      }
    },
    created() {
      this.fetchProducts();
    },
    methods: {
      getAvailabilityClass(availability) {
        if (!availability) return 'status-inactive';
        
        switch (availability.toLowerCase()) {
          case 'disponibil':
            return 'status-active';
          case 'stoc-limitat':
            return 'status-warning';
          case 'indisponibil':
            return 'status-inactive';
          default:
            return 'status-info';
        }
      },
      
      getProductById(id) {
        return this.products.find(product => product.id === id);
      },
      
      executeOperation() {
        switch (this.selectedOperation) {
          case 'list':
            this.fetchProducts();
            break;
          case 'add':
            // Nothing to do, just show the form
            break;
          case 'edit':
            this.selectedEditId = '';
            break;
          case 'delete':
            this.selectedDeleteId = '';
            break;
        }
      },
      
      async fetchProducts() {
        this.loading = true;
        try {
          console.log("Fetching products...");
          
          const productsRef = collection(db, 'products');
          const snapshot = await getDocs(productsRef);
          
          const prods = [];
          snapshot.forEach(doc => {
            if (doc.exists()) {
              const data = doc.data();
              prods.push({ 
                ...data, 
                _firestoreId: doc.id
              });
            }
          });
          
          this.products = [...prods];
          console.log(`Fetched ${this.products.length} products`);
        } catch (error) {
          console.error("Error fetching products:", error);
          this.showNotification({
            type: 'error',
            message: `Eroare la încărcarea produselor: ${error.message}`
          });
        } finally {
          this.loading = false;
        }
      },
      
      handleProductSaved(product) {
        // Update the products list if the product exists, otherwise add it
        const index = this.products.findIndex(p => p.id === product.id);
        if (index !== -1) {
          this.products.splice(index, 1, product);
          this.showNotification({
            type: 'success',
            message: `Produsul "${product.name}" a fost actualizat cu succes!`
          });
        } else {
          this.products.push(product);
          this.showNotification({
            type: 'success',
            message: `Produsul "${product.name}" a fost adăugat cu succes!`
          });
        }
        
        this.selectedEditId = null;
        this.selectedOperation = 'list';
      },
      
      cancelAdd() {
        this.selectedOperation = 'list';
      },
      
      cancelEdit() {
        this.selectedEditId = '';
        this.selectedOperation = 'list';
      },
      
      editItem(product) {
        this.selectedOperation = 'edit';
        this.selectedEditId = product.id;
      },
      
      deleteItem(product) {
        this.selectedOperation = 'delete';
        this.selectedDeleteId = product.id;
      },
      
      async confirmDelete() {
        if (!this.selectedDeleteId) return;
        
        const product = this.getProductById(this.selectedDeleteId);
        if (!product) return;
        
        this.isDeleting = this.selectedDeleteId;
        
        try {
          console.log("Attempting to delete product:", product.name);
          console.log("Product ID:", product.id);
          console.log("Firestore document ID:", product._firestoreId);
          
          // Use the Firestore document ID if available, otherwise fall back to product ID
          const documentId = product._firestoreId || product.id;
          console.log(`Using document ID for deletion: "${documentId}"`);
          
          // Delete the document
          await deleteDoc(doc(db, 'products', documentId));
          
          console.log("Product deleted successfully!");
          
          // Update the UI immediately
          this.products = this.products.filter(p => p.id !== product.id);
          
          this.showNotification({
            type: 'success',
            message: `Produsul "${product.name}" a fost șters cu succes!`
          });
          
          this.selectedDeleteId = '';
          this.selectedOperation = 'list';
        } catch (error) {
          console.error("Error deleting product:", error);
          this.showNotification({
            type: 'error',
            message: `Eroare la ștergerea produsului: ${error.message}`
          });
        } finally {
          this.isDeleting = null;
        }
      },
      
      showNotification(notification) {
        this.notification = notification;
        
        // Auto-dismiss notification after 5 seconds
        setTimeout(() => {
          if (this.notification === notification) {
            this.notification = null;
          }
        }, 5000);
      }
    }
  };
  </script>
  
  <style scoped>
  /* Base container */
  .products-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    color: #213547;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
  
  /* Title */
  .panel-title {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 24px;
    text-align: center;
    color: #1e293b;
  }
  
  /* Operation selector */
  .operation-selector {
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
    align-items: center;
  }
  
  .operation-select {
    padding: 10px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 6px 0 0 6px;
    font-size: 16px;
    background-color: #ffffff;
    color: #1e293b;
    appearance: menulist;
    width: 180px;
  }
  
  .execute-btn {
    padding: 10px 24px;
    background-color: #1e293b;
    color: white;
    border: 1px solid #1e293b;
    border-radius: 0 6px 6px 0;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
  }
  
  /* Notification */
  .notification {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 20px;
    border-radius: 6px;
    font-size: 15px;
  }
  
  .notification-success {
    background-color: #ecfdf5;
    color: #065f46;
    border: 1px solid #a7f3d0;
  }
  
  .notification-error {
    background-color: #fef2f2;
    color: #991b1b;
    border: 1px solid #fecaca;
  }
  
  .notification-info {
    background-color: #eff6ff;
    color: #1e40af;
    border: 1px solid #bfdbfe;
  }
  
  .close-btn {
    background: none;
    border: none;
    color: currentColor;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    margin-left: 12px;
  }
  
  /* Operation panel */
  .operation-panel {
    padding: 16px;
    background-color: #f8fafc;
    border-radius: 8px;
    min-height: 200px;
    margin-bottom: 20px;
  }
  
  /* Table styles */
  .table-container {
    overflow-x: auto;
    margin: 0 -16px;
  }
  
  .products-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .products-table th {
    padding: 16px;
    text-align: left;
    font-weight: 600;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;
    background-color: #f9fafb;
  }
  
  .products-table td {
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .table-row:hover {
    background-color: #f9fafb;
  }
  
  .column-name {
    width: 25%;
  }
  
  .column-category {
    width: 20%;
  }
  
  .column-price {
    width: 15%;
    text-align: right;
  }
  
  .column-status {
    width: 15%;
    text-align: center;
  }
  
  .column-actions {
    width: 25%;
  }
  
  .product-name {
    font-weight: 600;
    font-size: 16px;
    color: #1e293b;
  }
  
  .product-id {
    font-size: 14px;
    color: #64748b;
  }
  
  /* Status indicators */
  .status-indicator {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 14px;
    font-weight: 500;
  }
  
  .status-active {
    background-color: #dcfce7;
    color: #166534;
  }
  
  .status-warning {
    background-color: #fff7ed;
    color: #c2410c;
  }
  
  .status-inactive {
    background-color: #f3f4f6;
    color: #6b7280;
  }
  
  .status-info {
    background-color: #eff6ff;
    color: #1e40af;
  }
  
  /* Action buttons */
  .action-buttons {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
  
  .action-btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border: none;
  }
  
  .edit-btn {
    background-color: #1e293b;
    color: white;
  }
  
  .delete-btn {
    background-color: #1e293b;
    color: white;
  }
  
  /* Loading and empty states */
  .loading-message,
  .empty-message {
    text-align: center;
    padding: 32px;
    color: #6b7280;
    font-size: 16px;
  }
  
  /* Select container for edit & delete */
  .select-container {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    margin-bottom: 16px;
  }
  
  .product-select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background-color: white;
    color: #1f2937;
    font-size: 15px;
    margin-top: 8px;
  }
  
  /* Form header for edit form */
  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 12px;
  }
  
  .form-title {
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
  }
  
  .back-btn {
    background: none;
    border: none;
    color: #3b82f6;
    cursor: pointer;
    font-size: 15px;
    display: flex;
    align-items: center;
  }
  
  /* Form label */
  .form-label {
    display: block;
    font-weight: 500;
    margin-bottom: 8px;
    color: #374151;
  }
  
  /* Delete confirmation */
  .delete-container {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }
  
  .delete-confirmation {
    margin-top: 16px;
    padding: 16px;
    background-color: #fef2f2;
    border: 1px solid #fee2e2;
    border-radius: 6px;
  }
  
  .delete-title {
    font-size: 18px;
    font-weight: 600;
    color: #991b1b;
    margin-bottom: 8px;
  }
  
  .delete-message {
    margin-bottom: 16px;
    color: #7f1d1d;
  }
  
  .delete-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  
  .cancel-btn {
    padding: 10px 16px;
    background-color: #e5e7eb;
    color: #374151;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
  }
  
  .delete-confirm-btn {
    padding: 10px 16px;
    background-color: #dc2626;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
  }
  
  /* Button hover states */
  .action-btn:hover,
  .execute-btn:hover {
    opacity: 0.9;
  }
  
  .cancel-btn:hover {
    background-color: #d1d5db;
  }
  
  .delete-confirm-btn:hover {
    background-color: #b91c1c;
  }
  
  .back-btn:hover {
    text-decoration: underline;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .products-container {
      padding: 16px;
    }
    
    .panel-title {
      font-size: 24px;
    }
    
    .action-buttons {
      flex-direction: column;
      gap: 6px;
    }
    
    .action-btn {
      width: 100%;
    }
    
    .products-table th,
    .products-table td {
      padding: 12px 8px;
    }
  }
  
  /* Dark mode overrides to ensure light appearance */
  @media (prefers-color-scheme: dark) {
    .products-container,
    .select-container,
    .delete-container,
    .product-select,
    .operation-select,
    .products-table,
    .products-table th,
    .products-table td {
      background-color: #ffffff;
      color: #1f2937;
    }
    
    .operation-panel {
      background-color: #f8fafc;
    }
    
    .form-label,
    .product-name,
    .panel-title,
    .form-title {
      color: #1e293b;
    }
    
    .product-id {
      color: #64748b;
    }
    
    .loading-message,
    .empty-message {
      color: #6b7280;
    }
  }
  </style>