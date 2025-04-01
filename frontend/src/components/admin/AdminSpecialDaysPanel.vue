<template>
    <div class="special-days-container">
      <h2 class="panel-title">Gestionare Zile Speciale</h2>
      
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
        
        <div v-else-if="specialDays.length === 0" class="empty-message">
          Nu există zile speciale. Adăugați una folosind operația "Adaugă".
        </div>
        
        <div v-else class="table-container">
          <table class="special-days-table">
            <thead>
              <tr>
                <th class="column-name">Nume</th>
                <th class="column-date">Data</th>
                <th class="column-status">Status</th>
                <th class="column-discount">Discount</th>
                <th class="column-actions">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="day in specialDays" :key="day.id" class="table-row">
                <td class="column-name">
                  <div class="day-name">{{ day.name }}</div>
                  <div class="day-id">{{ day.id }}</div>
                </td>
                <td class="column-date">{{ formatDate(day.date) }}</td>
                <td class="column-status">
                  <span :class="['status-indicator', day.active ? 'status-active' : 'status-inactive']">
                    {{ day.active ? 'Activ' : 'Inactiv' }}
                  </span>
                </td>
                <td class="column-discount">{{ day.discount || 0 }}%</td>
                <td class="column-actions">
                  <div class="action-buttons">
                    <button @click="toggleStatus(day)" class="action-btn activate-btn">
                      {{ day.active ? 'Dezactivează' : 'Activează' }}
                    </button>
                    <button @click="editItem(day)" class="action-btn edit-btn">
                      Editează
                    </button>
                    <button @click="deleteItem(day)" class="action-btn delete-btn">
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
        <form @submit.prevent="onSaveSpecialDay" class="special-day-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nume eveniment*</label>
              <input v-model="form.name" required class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">ID eveniment*</label>
              <input
                v-model="form.id"
                required
                class="form-input"
                title="Folosiți doar litere mici, numere și cratime"
              />
              <small class="form-hint">Ex: cheesecake-day</small>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Data*</label>
              <input v-model="form.date" type="date" required class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Discount (%)</label>
              <input
                v-model.number="form.discount"
                type="number"
                min="0"
                max="100"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Cuvânt cheie</label>
              <input v-model="form.keyword" class="form-input" placeholder="ex: cheesecake" />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Descriere scurtă*</label>
            <input v-model="form.description" required class="form-input" />
          </div>
          
          <div class="form-group">
            <label class="form-label">Descriere detaliată</label>
            <textarea v-model="form.long_description" rows="3" class="form-textarea"></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">Ofertă specială</label>
            <input v-model="form.special_offer" class="form-input" />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">URL Imagine</label>
              <input
                v-model="form.image"
                class="form-input"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div class="form-group">
              <label class="form-label">URL Banner</label>
              <input
                v-model="form.banner"
                class="form-input"
                placeholder="https://example.com/banner.jpg"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Produse asociate</label>
            <div v-if="isLoadingProducts" class="loading-message">Se încarcă produsele...</div>
            <div v-else class="products-container">
              <div
                v-for="(productId, index) in form.products_ids"
                :key="index"
                class="product-row"
              >
                <select v-model="form.products_ids[index]" class="product-select">
                  <option value="">-- Selectează un produs --</option>
                  <option
                    v-for="product in availableProducts"
                    :key="product.id"
                    :value="product.id"
                  >
                    {{ product.name }}
                  </option>
                </select>
                <button type="button" @click="removeProduct(index)" class="remove-product-btn">
                  Șterge
                </button>
              </div>
              <button type="button" @click="addProduct" class="add-product-btn">
                + Adaugă produs
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-checkbox">
              <input type="checkbox" v-model="form.active" />
              <span class="checkbox-label">Activat</span>
            </label>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="cancelAdd" class="cancel-btn">
              Anulează
            </button>
            <button type="submit" class="submit-btn">
              Adaugă eveniment
            </button>
          </div>
        </form>
      </div>
      
      <!-- EDIT OPERATION -->
      <div v-if="selectedOperation === 'edit'" class="operation-panel">
        <div v-if="!selectedEditId" class="select-container">
          <label class="form-label">Selectează evenimentul de editat:</label>
          <select v-model="selectedEditId" class="day-select">
            <option value="">-- Selectează un eveniment --</option>
            <option v-for="day in specialDays" :key="day.id" :value="day.id">
              {{ day.name }} ({{ formatDate(day.date) }})
            </option>
          </select>
        </div>
        
        <form v-else @submit.prevent="onUpdateSpecialDay" class="special-day-form">
          <div class="form-header">
            <h3 class="form-title">Editare: {{ getSpecialDayById(selectedEditId)?.name }}</h3>
            <button type="button" @click="selectedEditId = null" class="back-btn">
              ← Înapoi la selecție
            </button>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nume eveniment*</label>
              <input v-model="editForm.name" required class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">ID eveniment*</label>
              <input v-model="editForm.id" required class="form-input" disabled />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Data*</label>
              <input v-model="editForm.date" type="date" required class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Discount (%)</label>
              <input
                v-model.number="editForm.discount"
                type="number"
                min="0"
                max="100"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Cuvânt cheie</label>
              <input v-model="editForm.keyword" class="form-input" placeholder="ex: cheesecake" />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Descriere scurtă*</label>
            <input v-model="editForm.description" required class="form-input" />
          </div>
          
          <div class="form-group">
            <label class="form-label">Descriere detaliată</label>
            <textarea v-model="editForm.long_description" rows="3" class="form-textarea"></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">Ofertă specială</label>
            <input v-model="editForm.special_offer" class="form-input" />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">URL Imagine</label>
              <input
                v-model="editForm.image"
                class="form-input"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div class="form-group">
              <label class="form-label">URL Banner</label>
              <input
                v-model="editForm.banner"
                class="form-input"
                placeholder="https://example.com/banner.jpg"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Produse asociate</label>
            <div v-if="isLoadingProducts" class="loading-message">Se încarcă produsele...</div>
            <div v-else class="products-container">
              <div
                v-for="(productId, index) in editForm.products_ids"
                :key="index"
                class="product-row"
              >
                <select v-model="editForm.products_ids[index]" class="product-select">
                  <option value="">-- Selectează un produs --</option>
                  <option
                    v-for="product in availableProducts"
                    :key="product.id"
                    :value="product.id"
                  >
                    {{ product.name }}
                  </option>
                </select>
                <button type="button" @click="removeEditProduct(index)" class="remove-product-btn">
                  Șterge
                </button>
              </div>
              <button type="button" @click="addEditProduct" class="add-product-btn">
                + Adaugă produs
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-checkbox">
              <input type="checkbox" v-model="editForm.active" />
              <span class="checkbox-label">Activat</span>
            </label>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="cancelEdit" class="cancel-btn">
              Anulează
            </button>
            <button type="submit" class="submit-btn">
              Salvează modificările
            </button>
          </div>
        </form>
      </div>
      
      <!-- DELETE OPERATION -->
      <div v-if="selectedOperation === 'delete'" class="operation-panel">
        <div class="delete-container">
          <label class="form-label">Selectează evenimentul de șters:</label>
          <select v-model="selectedDeleteId" class="day-select">
            <option value="">-- Selectează un eveniment --</option>
            <option v-for="day in specialDays" :key="day.id" :value="day.id">
              {{ day.name }} ({{ formatDate(day.date) }})
            </option>
          </select>
          
          <div v-if="selectedDeleteId" class="delete-confirmation">
            <h4 class="delete-title">Confirmare ștergere</h4>
            <p class="delete-message">
              Ești sigur că vrei să ștergi evenimentul 
              "{{ getSpecialDayById(selectedDeleteId)?.name }}"?
            </p>
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
  import { mapActions, mapGetters } from 'vuex';
  import { collection, getDocs } from 'firebase/firestore';
  import { db } from '@/firebase';
  
  export default {
    name: 'AiryAdminSpecialDaysPanel',
    data() {
      return {
        selectedOperation: 'list',
        notification: null,
        loading: false,
        isLoadingProducts: false,
        availableProducts: [],
        
        // For add
        form: {
          name: '',
          id: '',
          date: new Date().toISOString().split('T')[0],
          description: '',
          long_description: '',
          image: '',
          banner: '',
          discount: 0,
          keyword: '',
          active: false,
          special_offer: '',
          products_ids: []
        },
        
        // For edit
        selectedEditId: '',
        editForm: {
          name: '',
          id: '',
          date: '',
          description: '',
          long_description: '',
          image: '',
          banner: '',
          discount: 0,
          keyword: '',
          active: false,
          special_offer: '',
          products_ids: []
        },
        
        // For delete
        selectedDeleteId: ''
      };
    },
    computed: {
      ...mapGetters('specialDays', ['getAllSpecialDays']),
      
      specialDays() {
        return this.getAllSpecialDays;
      },
      
      notificationClass() {
        if (!this.notification) return '';
        switch (this.notification.type) {
          case 'success':
            return 'notification-success';
          case 'error':
            return 'notification-error';
          default:
            return 'notification-info';
        }
      }
    },
    created() {
      this.fetchData();
      this.fetchProducts();
    },
    methods: {
        ...mapActions('specialDays', {
        fetchAllSpecialDays: 'fetchAllSpecialDays',
        saveSpecialDayAction: 'saveSpecialDay',
        deleteSpecialDay: 'deleteSpecialDay',
        toggleSpecialDayActive: 'toggleSpecialDayActive'
        }),
      formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Format like "25 apr. 2025"
        return date
          .toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' })
          .replace('.', '');
      },
      
      getSpecialDayById(id) {
        return this.specialDays.find(day => day.id === id);
      },
      
      executeOperation() {
        switch (this.selectedOperation) {
          case 'list':
            this.fetchData();
            break;
          case 'add':
            // Reset form
            this.form = {
              name: '',
              id: '',
              date: new Date().toISOString().split('T')[0],
              description: '',
              long_description: '',
              image: '',
              banner: '',
              discount: 0,
              keyword: '',
              active: false,
              special_offer: '',
              products_ids: []
            };
            break;
          case 'edit':
            this.selectedEditId = '';
            break;
          case 'delete':
            this.selectedDeleteId = '';
            break;
        }
      },
      
      async fetchData() {
        this.loading = true;
        try {
          await this.fetchAllSpecialDays();
        } catch (error) {
          this.showNotification('error', `Eroare la încărcarea datelor: ${error.message}`);
        } finally {
          this.loading = false;
        }
      },
      
      async fetchProducts() {
        this.isLoadingProducts = true;
        try {
          const productsRef = collection(db, 'products');
          const snapshot = await getDocs(productsRef);
          
          this.availableProducts = snapshot.docs.map(doc => {
            return { id: doc.id, ...doc.data() };
          });
        } catch (error) {
          this.showNotification('error', `Eroare la încărcarea produselor: ${error.message}`);
        } finally {
          this.isLoadingProducts = false;
        }
      },
      
      // Add operation
      addProduct() {
        this.form.products_ids.push('');
      },
      removeProduct(index) {
        this.form.products_ids.splice(index, 1);
      },
      async onSaveSpecialDay() {
        try {
          if (!this.form.id || !this.form.name || !this.form.date) {
            return this.showNotification('error', 'Completați toate câmpurile obligatorii');
          }
          
          // Remove empty product IDs
          const specialDayToSave = JSON.parse(JSON.stringify(this.form));
          specialDayToSave.products_ids = (specialDayToSave.products_ids || []).filter(id => id);
          
          // Save
          await this.saveSpecialDayAction(specialDayToSave);
          
          this.showNotification('success', 'Evenimentul a fost adăugat cu succes');
          this.selectedOperation = 'list';
        } catch (error) {
          this.showNotification('error', `Eroare la salvare: ${error.message}`);
        }
      },
      cancelAdd() {
        this.selectedOperation = 'list';
      },
      
      // Edit operation
      addEditProduct() {
        this.editForm.products_ids.push('');
      },
      removeEditProduct(index) {
        this.editForm.products_ids.splice(index, 1);
      },
      async loadEditForm() {
        const specialDay = this.getSpecialDayById(this.selectedEditId);
        if (specialDay) {
          this.editForm = {
            ...specialDay,
            products_ids: [...(specialDay.products_ids || [])]
          };
        }
      },
      cancelEdit() {
        this.selectedEditId = '';
        this.selectedOperation = 'list';
      },
      async onUpdateSpecialDay() {
        try {
          if (!this.editForm.name || !this.editForm.date) {
            return this.showNotification('error', 'Completați toate câmpurile obligatorii');
          }
          
          // Remove empty product IDs
          const specialDayToSave = JSON.parse(JSON.stringify(this.editForm));
          specialDayToSave.products_ids = (specialDayToSave.products_ids || []).filter(id => id);
          
          // Save
          await this.saveSpecialDayAction(specialDayToSave);
          
          this.showNotification('success', 'Evenimentul a fost actualizat cu succes');
          this.selectedEditId = '';
          this.selectedOperation = 'list';
        } catch (error) {
          this.showNotification('error', `Eroare la actualizare: ${error.message}`);
        }
      },
      
      // Toggle status
      async toggleStatus(specialDay) {
        try {
          await this.toggleSpecialDayActive(specialDay.id);
          this.showNotification(
            'success',
            `Evenimentul a fost ${!specialDay.active ? 'activat' : 'dezactivat'} cu succes`
          );
        } catch (error) {
          this.showNotification('error', `Eroare: ${error.message}`);
        }
      },
      
      // Delete operation
      async confirmDelete() {
        try {
          await this.deleteSpecialDay(this.selectedDeleteId);
          this.showNotification('success', 'Evenimentul a fost șters cu succes');
          this.selectedDeleteId = '';
          this.selectedOperation = 'list';
        } catch (error) {
          this.showNotification('error', `Eroare la ștergere: ${error.message}`);
        }
      },
      
      // Quick actions from list
      editItem(specialDay) {
        this.selectedOperation = 'edit';
        this.selectedEditId = specialDay.id;
        this.loadEditForm();
      },
      deleteItem(specialDay) {
        this.selectedOperation = 'delete';
        this.selectedDeleteId = specialDay.id;
      },
      
      // Notification helper
      showNotification(type, message) {
        this.notification = { type, message };
        setTimeout(() => {
          if (this.notification && this.notification.message === message) {
            this.notification = null;
          }
        }, 5000);
      }
    },
    watch: {
      selectedEditId(newVal) {
        if (newVal) {
          this.loadEditForm();
        }
      }
    }
  };
  </script>
  
  
  <style scoped>
  /* Base container */
  .special-days-container {
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
  
  .special-days-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .special-days-table th {
    padding: 16px;
    text-align: left;
    font-weight: 600;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;
    background-color: #f9fafb;
  }
  
  .special-days-table td {
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .table-row:hover {
    background-color: #f9fafb;
  }
  
  .column-name {
    width: 25%;
  }
  
  .column-date {
    width: 15%;
  }
  
  .column-status {
    width: 15%;
    text-align: center;
  }
  
  .column-discount {
    width: 15%;
    text-align: center;
  }
  
  .column-actions {
    width: 30%;
  }
  
  .day-name {
    font-weight: 600;
    font-size: 16px;
    color: #1e293b;
  }
  
  .day-id {
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
  
  .status-inactive {
    background-color: #f3f4f6;
    color: #6b7280;
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
  
  .activate-btn {
    background-color: #1e293b;
    color: white;
  }
  
  .edit-btn {
    background-color: #1e293b;
    color: white;
  }
  
  .delete-btn {
    background-color: #1e293b;
    color: white;
  }
  
  /* Form styles */
  .special-day-form {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }
  
  .form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .form-label {
    display: block;
    font-weight: 500;
    margin-bottom: 8px;
    color: #374151;
  }
  
  .form-input, .form-textarea, .product-select, .day-select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background-color: white;
    color: #1f2937;
    font-size: 15px;
  }
  
  .form-textarea {
    resize: vertical;
    min-height: 100px;
  }
  
  .form-hint {
    display: block;
    font-size: 13px;
    color: #6b7280;
    margin-top: 4px;
  }
  
  .form-checkbox {
    display: flex;
    align-items: center;
  }
  
  .checkbox-label {
    margin-left: 8px;
    color: #374151;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
  }
  
  /* Product selection */
  .products-container {
    margin-top: 8px;
  }
  
  .product-row {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }
  
  .product-select {
    flex-grow: 1;
  }
  
  .remove-product-btn {
  padding: 10px 16px;
  background-color: #1e293b;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.add-product-btn {
  padding: 10px 16px;
  background-color: #1e293b;
  color: white;
  border: none;
  border-radius: 6px;
  margin-top: 8px;
  cursor: pointer;
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

.day-select {
  margin-top: 8px;
}

/* Form header for edit form */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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

.delete-confirm-btn {
  padding: 10px 16px;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

/* Buttons */
.cancel-btn {
  padding: 10px 16px;
  background-color: #e5e7eb;
  color: #374151;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.submit-btn {
  padding: 10px 16px;
  background-color: #1e293b;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

/* Button hover states */
.action-btn:hover,
.execute-btn:hover,
.remove-product-btn:hover,
.add-product-btn:hover,
.submit-btn:hover {
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
  .special-days-container {
    padding: 16px;
  }
  
  .panel-title {
    font-size: 24px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 6px;
  }
  
  .action-btn {
    width: 100%;
  }
  
  .special-days-table th,
  .special-days-table td {
    padding: 12px 8px;
  }
}

/* Dark mode overrides to ensure light appearance */
@media (prefers-color-scheme: dark) {
  .special-days-container,
  .special-day-form,
  .select-container,
  .delete-container,
  .form-input,
  .form-textarea,
  .product-select,
  .day-select,
  .operation-select,
  .special-days-table,
  .special-days-table th,
  .special-days-table td {
    background-color: #ffffff;
    color: #1f2937;
  }
  
  .operation-panel {
    background-color: #f8fafc;
  }
  
  .form-label,
  .checkbox-label,
  .day-name,
  .panel-title,
  .form-title {
    color: #1e293b;
  }
  
  .day-id {
    color: #64748b;
  }
  
  .loading-message,
  .empty-message {
    color: #6b7280;
  }
}

</style>