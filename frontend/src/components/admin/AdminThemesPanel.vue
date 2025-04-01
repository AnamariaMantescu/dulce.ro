<template>
  <div class="themes-container">
    <h2 class="panel-title">Gestionare Săptămâni Tematice</h2>
    
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
      
      <div v-else-if="themes.length === 0" class="empty-message">
        Nu există săptămâni tematice. Adăugați una folosind operația "Adaugă".
      </div>
      
      <div v-else class="table-container">
        <table class="themes-table">
          <thead>
            <tr>
              <th class="column-name">Nume</th>
              <th class="column-date">Perioada</th>
              <th class="column-status">Status</th>
              <th class="column-discount">Discount</th>
              <th class="column-actions">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="theme in themes" :key="theme.id" class="table-row">
              <td class="column-name">
                <div class="theme-name">{{ theme.name }}</div>
                <div class="theme-id">{{ theme.id }}</div>
              </td>
              <td class="column-date">
                {{ formatDate(theme.start_date) }} - {{ formatDate(theme.end_date) }}
              </td>
              <td class="column-status">
                <span :class="['status-indicator', theme.active ? 'status-active' : 'status-inactive']">
                  {{ theme.active ? 'Activ' : 'Inactiv' }}
                </span>
              </td>
              <td class="column-discount">{{ theme.special_discount || 0 }}%</td>
              <td class="column-actions">
                <div class="action-buttons">
                  <button @click="toggleStatus(theme)" class="action-btn activate-btn">
                    {{ theme.active ? 'Dezactivează' : 'Activează' }}
                  </button>
                  <button @click="editItem(theme)" class="action-btn edit-btn">
                    Editează
                  </button>
                  <button @click="deleteItem(theme)" class="action-btn delete-btn">
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
      <form @submit.prevent="onSaveTheme" class="theme-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nume temă*</label>
            <input v-model="form.name" required class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">ID temă*</label>
            <input
              v-model="form.id"
              required
              class="form-input"
              title="Folosiți doar litere mici, numere și cratime"
              @input="sanitizeId"
            />
            <small class="form-hint">Ex: french-week</small>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Data început*</label>
            <input v-model="form.start_date" type="date" required class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Data sfârșit*</label>
            <input v-model="form.end_date" type="date" required class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Discount special (%)</label>
            <input
              v-model.number="form.special_discount"
              type="number"
              min="0"
              max="100"
              class="form-input"
            />
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
        
        <!-- Galerie de imagini -->
        <div class="form-group">
          <label class="form-label">Galerie de imagini</label>
          <div class="gallery-container border rounded-md bg-gray-50 p-4 mb-4">
            <div v-if="form.gallery && form.gallery.length > 0">
              <div 
                v-for="(imageUrl, index) in form.gallery" 
                :key="'img-'+index" 
                class="gallery-item mb-2 last:mb-0"
              >
                <div class="flex items-center bg-white p-2 rounded border">
                  <input 
                    v-model="form.gallery[index]" 
                    placeholder="URL imagine (ex: https://example.com/gallery1.jpg)" 
                    class="form-input flex-grow mr-2"
                  />
                  <button 
                    type="button" 
                    @click="removeGalleryImage(index)" 
                    class="btn-danger p-2 h-10 w-10 flex items-center justify-center"
                    title="Eliminare imagine"
                  >
                    <span>×</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-4 text-gray-500">
              <p>Nu există imagini adăugate pentru galerie.</p>
            </div>
            
            <button 
              type="button" 
              @click="addGalleryImage()" 
              class="btn-secondary mt-2"
            >
              + Adaugă imagine în galerie
            </button>
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
            Adaugă săptămână tematică
          </button>
        </div>
      </form>
    </div>
    
    <!-- EDIT OPERATION -->
    <div v-if="selectedOperation === 'edit'" class="operation-panel">
      <div v-if="!selectedEditId" class="select-container">
        <label class="form-label">Selectează tema de editat:</label>
        <select v-model="selectedEditId" class="theme-select">
          <option value="">-- Selectează o temă --</option>
          <option v-for="theme in themes" :key="theme.id" :value="theme.id">
            {{ theme.name }} ({{ formatDate(theme.start_date) }} - {{ formatDate(theme.end_date) }})
          </option>
        </select>
      </div>
      
      <form v-else @submit.prevent="onUpdateTheme" class="theme-form">
        <div class="form-header">
          <h3 class="form-title">Editare: {{ getThemeById(selectedEditId)?.name }}</h3>
          <button type="button" @click="selectedEditId = null" class="back-btn">
            ← Înapoi la selecție
          </button>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nume temă*</label>
            <input v-model="editForm.name" required class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">ID temă*</label>
            <input v-model="editForm.id" required class="form-input" disabled />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Data început*</label>
            <input v-model="editForm.start_date" type="date" required class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Data sfârșit*</label>
            <input v-model="editForm.end_date" type="date" required class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Discount special (%)</label>
            <input
              v-model.number="editForm.special_discount"
              type="number"
              min="0"
              max="100"
              class="form-input"
            />
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
        
        <!-- Galerie de imagini pentru edit -->
        <div class="form-group">
          <label class="form-label">Galerie de imagini</label>
          <div class="gallery-container border rounded-md bg-gray-50 p-4 mb-4">
            <div v-if="editForm.gallery && editForm.gallery.length > 0">
              <div 
                v-for="(imageUrl, index) in editForm.gallery" 
                :key="'img-edit-'+index" 
                class="gallery-item mb-2 last:mb-0"
              >
                <div class="flex items-center bg-white p-2 rounded border">
                  <input 
                    v-model="editForm.gallery[index]" 
                    placeholder="URL imagine (ex: https://example.com/gallery1.jpg)" 
                    class="form-input flex-grow mr-2"
                  />
                  <button 
                    type="button" 
                    @click="removeEditGalleryImage(index)" 
                    class="btn-danger p-2 h-10 w-10 flex items-center justify-center"
                    title="Eliminare imagine"
                  >
                    <span>×</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-4 text-gray-500">
              <p>Nu există imagini adăugate pentru galerie.</p>
            </div>
            
            <button 
              type="button" 
              @click="addEditGalleryImage()" 
              class="btn-secondary mt-2"
            >
              + Adaugă imagine în galerie
            </button>
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
        <label class="form-label">Selectează tema de șters:</label>
        <select v-model="selectedDeleteId" class="theme-select">
          <option value="">-- Selectează o temă --</option>
          <option v-for="theme in themes" :key="theme.id" :value="theme.id">
            {{ theme.name }} ({{ formatDate(theme.start_date) }} - {{ formatDate(theme.end_date) }})
          </option>
        </select>
        
        <div v-if="selectedDeleteId" class="delete-confirmation">
          <h4 class="delete-title">Confirmare ștergere</h4>
          <p class="delete-message">
            Ești sigur că vrei să ștergi tema 
            "{{ getThemeById(selectedDeleteId)?.name }}"?
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
import { collection, getDocs, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export default {
  name: 'AdminThemesPanel',
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
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
        description: '',
        long_description: '',
        image: '',
        banner: '',
        special_discount: 0,
        active: false,
        gallery: [],
        products_ids: []
      },
      
      // For edit
      selectedEditId: '',
      editForm: {
        name: '',
        id: '',
        start_date: '',
        end_date: '',
        description: '',
        long_description: '',
        image: '',
        banner: '',
        special_discount: 0,
        active: false,
        gallery: [],
        products_ids: []
      },
      
      // For delete
      selectedDeleteId: ''
    };
  },
  computed: {
    ...mapGetters('themes', ['allThemes']),
    
    themes() {
      return this.allThemes;
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
    ...mapActions('themes', {
      fetchAllThemes: 'fetchAllThemes'
    }),
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      // Format like "25 apr. 2025"
      return date
        .toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' })
        .replace('.', '');
    },
    
    getThemeById(id) {
      return this.themes.find(theme => theme.id === id);
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
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
            description: '',
            long_description: '',
            image: '',
            banner: '',
            special_discount: 0,
            active: false,
            gallery: [],
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
        await this.fetchAllThemes();
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
    
    validateId() {
      const regex = /^[a-z0-9-]+$/;
      return regex.test(this.form.id);
    },
    
    sanitizeId() {
      // Remove any characters that don't match the allowed pattern
      this.form.id = this.form.id.toLowerCase().replace(/[^a-z0-9-]/g, '');
    },
    
    // Gallery operations
    addGalleryImage() {
      if (!this.form.gallery) {
        this.form.gallery = [];
      }
      this.form.gallery.push('');
    },
    
    removeGalleryImage(index) {
      this.form.gallery.splice(index, 1);
    },
    
    addEditGalleryImage() {
      if (!this.editForm.gallery) {
        this.editForm.gallery = [];
      }
      this.editForm.gallery.push('');
    },
    
    removeEditGalleryImage(index) {
      this.editForm.gallery.splice(index, 1);
    },
    
    // Product operations
    addProduct() {
      if (!this.form.products_ids) {
        this.form.products_ids = [];
      }
      this.form.products_ids.push('');
    },
    
    removeProduct(index) {
      this.form.products_ids.splice(index, 1);
    },
    
    addEditProduct() {
      if (!this.editForm.products_ids) {
        this.editForm.products_ids = [];
      }
      this.editForm.products_ids.push('');
    },
    
    removeEditProduct(index) {
      this.editForm.products_ids.splice(index, 1);
    },
    
    // Save theme
    async onSaveTheme() {
      try {
        if (!this.form.id || !this.form.name || !this.form.start_date || !this.form.end_date) {
          return this.showNotification('error', 'Completați toate câmpurile obligatorii');
        }
        
        // Validate ID format
        if (!this.validateId()) {
          return this.showNotification('error', 'ID-ul trebuie să conțină doar litere mici, numere și cratime');
        }
        
        // Validate dates
        const startDate = new Date(this.form.start_date);
        const endDate = new Date(this.form.end_date);
        
        if (endDate < startDate) {
          return this.showNotification('error', 'Data de sfârșit trebuie să fie după data de început');
        }
        
        // Clean data - filter out empty values
        const themeToSave = JSON.parse(JSON.stringify(this.form));
        themeToSave.products_ids = (themeToSave.products_ids || []).filter(id => id);
        themeToSave.gallery = (themeToSave.gallery || []).filter(url => url);
        
        // Save to Firestore
        await setDoc(doc(db, 'themes', themeToSave.id), themeToSave);
        
        // Refresh data
        await this.fetchAllThemes();
        
        this.showNotification('success', 'Tema a fost adăugată cu succes');
        this.selectedOperation = 'list';
      } catch (error) {
        this.showNotification('error', `Eroare la salvare: ${error.message}`);
      }
    },
    
    cancelAdd() {
      this.selectedOperation = 'list';
    },
    
    // Edit theme
    async loadEditForm() {
      const theme = this.getThemeById(this.selectedEditId);
      if (theme) {
        this.editForm = {
          ...theme,
          gallery: [...(theme.gallery || [])],
          products_ids: [...(theme.products_ids || [])]
        };
      }
    },
    
    cancelEdit() {
      this.selectedEditId = '';
      this.selectedOperation = 'list';
    },
    
    async onUpdateTheme() {
      try {
        if (!this.editForm.name || !this.editForm.start_date || !this.editForm.end_date) {
          return this.showNotification('error', 'Completați toate câmpurile obligatorii');
        }
        
        // Validate dates
        const startDate = new Date(this.editForm.start_date);
        const endDate = new Date(this.editForm.end_date);
        
        if (endDate < startDate) {
          return this.showNotification('error', 'Data de sfârșit trebuie să fie după data de început');
        }
        
        // Clean data - filter out empty values
        const themeToSave = JSON.parse(JSON.stringify(this.editForm));
        themeToSave.products_ids = (themeToSave.products_ids || []).filter(id => id);
        themeToSave.gallery = (themeToSave.gallery || []).filter(url => url);
        
        // Save to Firestore
        await setDoc(doc(db, 'themes', themeToSave.id), themeToSave);
        
        // Refresh data
        await this.fetchAllThemes();
        
        this.showNotification('success', 'Tema a fost actualizată cu succes');
        this.selectedEditId = '';
        this.selectedOperation = 'list';
      } catch (error) {
        this.showNotification('error', `Eroare la actualizare: ${error.message}`);
      }
    },
    
    // Toggle theme status
    async toggleStatus(theme) {
      try {
        const newStatus = !theme.active;
        await updateDoc(doc(db, 'themes', theme.id), { active: newStatus });
        
        // Refresh data
        await this.fetchAllThemes();
        
        this.showNotification(
          'success',
          `Tema a fost ${newStatus ? 'activată' : 'dezactivată'} cu succes`
        );
      } catch (error) {
        this.showNotification('error', `Eroare: ${error.message}`);
      }
    },
    
    // Delete theme
    async confirmDelete() {
      try {
        await deleteDoc(doc(db, 'themes', this.selectedDeleteId));
        
        // Refresh data
        await this.fetchAllThemes();
        
        this.showNotification('success', 'Tema a fost ștearsă cu succes');
        this.selectedDeleteId = '';
        this.selectedOperation = 'list';
      } catch (error) {
        this.showNotification('error', `Eroare la ștergere: ${error.message}`);
      }
    },
    
    // Quick actions from list
    editItem(theme) {
      this.selectedOperation = 'edit';
      this.selectedEditId = theme.id;
      this.loadEditForm();
    },
    
    deleteItem(theme) {
      this.selectedOperation = 'delete';
      this.selectedDeleteId = theme.id;
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
/* Reutilizarea stilurilor din AdminSpecialDaysPanel.vue */
.themes-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #213547;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.panel-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
  text-align: center;
  color: #1e293b;
}

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

.operation-panel {
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
  min-height: 200px;
  margin-bottom: 20px;
}

.table-container {
  overflow-x: auto;
  margin: 0 -16px;
}

.themes-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.themes-table th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.themes-table td {
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
  width: 20%;
}

.column-status {
  width: 15%;
  text-align: center;
}

.column-discount {
  width: 10%;
  text-align: center;
}

.column-actions {
  width: 30%;
}

.theme-name {
  font-weight: 600;
  font-size: 16px;
  color: #1e293b;
}

.theme-id {
  font-size: 14px;
  color: #64748b;
}

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

.theme-form {
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

.form-input, .form-textarea, .product-select, .theme-select {
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

.products-container, .gallery-container {
  margin-top: 8px;
}

.product-row, .gallery-item {
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

.add-product-btn, .btn-secondary {
  padding: 10px 16px;
  background-color: #1e293b;
  color: white;
  border: none;
  border-radius: 6px;
  margin-top: 8px;
  cursor: pointer;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
}

.loading-message,
.empty-message {
  text-align: center;
  padding: 32px;
  color: #6b7280;
  font-size: 16px;
}

.select-container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 16px;
}

.theme-select {
  margin-top: 8px;
}

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
.btn-secondary:hover,
.btn-danger:hover,
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
  .themes-container {
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
  
  .themes-table th,
  .themes-table td {
    padding: 12px 8px;
  }
}

/* Dark mode overrides to ensure light appearance */
@media (prefers-color-scheme: dark) {
  .themes-container,
  .theme-form,
  .select-container,
  .delete-container,
  .form-input,
  .form-textarea,
  .product-select,
  .theme-select,
  .operation-select,
  .themes-table,
  .themes-table th,
  .themes-table td {
    background-color: #ffffff;
    color: #1f2937;
  }
  
  .operation-panel {
    background-color: #f8fafc;
  }
  
  .form-label,
  .checkbox-label,
  .theme-name,
  .panel-title,
  .form-title {
    color: #1e293b;
  }
  
  .theme-id {
    color: #64748b;
  }
  
  .loading-message,
  .empty-message {
    color: #6b7280;
  }
}
</style>