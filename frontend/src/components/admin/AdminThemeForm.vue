<template>
    <div class="theme-form bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">
        {{ isEditing ? 'Editează Săptămâna Tematică' : 'Adaugă Săptămână Tematică' }}
      </h2>
      <form @submit.prevent="saveTheme" class="space-y-6">
        <!-- Secțiunea de bază -->
        <div class="form-section">
          <h3 class="text-lg font-medium mb-4 text-gray-700 border-b pb-2">Informații de bază</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">Nume <span class="text-red-500">*</span></label>
              <input 
                v-model="theme.name" 
                placeholder="ex: Săptămâna Franțuzească" 
                required
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label class="form-label">ID <span class="text-red-500">*</span></label>
              <input
                v-model="theme.id"
                pattern="^[a-z0-9-]+$"
                required
                class="form-input"
                title="Folosește doar litere mici, cifre și cratime"
                @input="sanitizeId"
                :disabled="isEditing"
              />
              <small class="form-hint">
                ID-ul va apărea în URL și trebuie să fie unic. Folosește doar litere mici, numere și cratime.
              </small>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div class="form-group">
              <label class="form-label">Data început <span class="text-red-500">*</span></label>
              <input 
                v-model="theme.start_date" 
                type="date" 
                required 
                class="form-input" 
              />
            </div>
            <div class="form-group">
              <label class="form-label">Data sfârșit <span class="text-red-500">*</span></label>
              <input 
                v-model="theme.end_date" 
                type="date" 
                required 
                class="form-input" 
              />
              <small v-if="dateError" class="form-hint text-red-500">
                {{ dateError }}
              </small>
            </div>
            <div class="form-group">
              <label class="form-label">Discount special (%)</label>
              <input 
                v-model.number="theme.special_discount" 
                type="number" 
                min="0" 
                max="100" 
                class="form-input" 
                placeholder="0"
              />
            </div>
          </div>
          
          <div class="form-group mt-4">
            <div class="flex items-center">
              <input 
                type="checkbox" 
                id="active-checkbox" 
                v-model="theme.active" 
                class="form-checkbox h-5 w-5 text-blue-600" 
              />
              <label for="active-checkbox" class="ml-2 block text-gray-700">
                Activează această temă
              </label>
            </div>
            <small class="form-hint">
              Doar temele active vor fi afișate pe site.
            </small>
          </div>
        </div>
        
        <!-- Secțiunea de conținut -->
        <div class="form-section">
          <h3 class="text-lg font-medium mb-4 text-gray-700 border-b pb-2">Conținut tematic</h3>
          
          <div class="form-group">
            <label class="form-label">Descriere scurtă <span class="text-red-500">*</span></label>
            <input 
              v-model="theme.description" 
              placeholder="Scurtă descriere (maxim 160 caractere)" 
              required 
              class="form-input" 
              maxlength="160"
            />
            <small class="form-hint">
              Această descriere va apărea pe pagina principală ({{ theme.description ? theme.description.length : 0 }}/160)
            </small>
          </div>
          
          <div class="form-group mt-4">
            <label class="form-label">Descriere detaliată</label>
            <textarea 
              v-model="theme.long_description" 
              placeholder="Descriere detaliată a temei" 
              rows="4" 
              class="form-textarea" 
            ></textarea>
          </div>
        </div>
        
        <!-- Secțiunea de imagini -->
        <div class="form-section">
          <h3 class="text-lg font-medium mb-4 text-gray-700 border-b pb-2">Imagini</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="form-label">Imagine principală</label>
              <input 
                v-model="theme.image" 
                placeholder="URL imagine (ex: https://example.com/image.jpg)" 
                class="form-input" 
              />
              <div v-if="theme.image" class="mt-3 border rounded overflow-hidden">
                <img :src="theme.image" alt="Previzualizare" class="w-full h-36 object-cover" />
              </div>
              <small class="form-hint">
                Această imagine va apărea pe cardurile temei.
              </small>
            </div>
            <div class="form-group">
              <label class="form-label">Banner</label>
              <input 
                v-model="theme.banner" 
                placeholder="URL banner (ex: https://example.com/banner.jpg)" 
                class="form-input" 
              />
              <div v-if="theme.banner" class="mt-3 border rounded overflow-hidden">
                <img :src="theme.banner" alt="Previzualizare banner" class="w-full h-36 object-cover" />
              </div>
              <small class="form-hint">
                Acest banner va apărea în partea de sus a paginii temei.
              </small>
            </div>
          </div>
          
          <!-- Galerie de imagini -->
          <div class="form-group mt-6">
            <label class="form-label">Galerie de imagini</label>
            <div class="gallery-container border rounded-md bg-gray-50 p-4">
              <div v-if="theme.gallery && theme.gallery.length > 0">
                <div 
                  v-for="(imageUrl, index) in theme.gallery" 
                  :key="'gallery-'+index" 
                  class="gallery-item mb-3 last:mb-0"
                >
                  <div class="flex items-center bg-white p-2 rounded border">
                    <input 
                      v-model="theme.gallery[index]" 
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
                  <div v-if="theme.gallery[index]" class="mt-2 border rounded overflow-hidden">
                    <img :src="theme.gallery[index]" alt="Previzualizare galerie" class="w-full h-24 object-cover" />
                  </div>
                </div>
              </div>
              
              <div v-else class="text-center py-4 text-gray-500">
                <p>Nu există imagini adăugate pentru galerie.</p>
              </div>
              
              <button 
                type="button" 
                @click="addGalleryImage()" 
                class="btn-secondary mt-3"
              >
                + Adaugă imagine în galerie
              </button>
            </div>
          </div>
        </div>
        
        <!-- Secțiunea de produse asociate -->
        <div class="form-section">
          <h3 class="text-lg font-medium mb-4 text-gray-700 border-b pb-2">Produse asociate</h3>
          
          <div v-if="isLoadingProducts" class="py-8 flex justify-center">
            <div class="loader"></div>
          </div>
          
          <div v-else>
            <div class="mb-3">
              <p class="text-gray-600 text-sm">
                Selectează produsele care vor fi asociate cu această temă. Acestea vor apărea pe pagina temei.
              </p>
            </div>
            
            <div v-if="availableProducts.length === 0" class="bg-yellow-50 p-3 rounded-md border border-yellow-100 mb-4">
              <p class="text-yellow-800 text-sm">
                <span class="font-bold">⚠️ Atenție:</span> Nu există produse disponibile. Adaugă produse în secțiunea Produse.
              </p>
            </div>
            
            <div v-else>
              <div class="products-container border rounded-md bg-gray-50 p-4 mb-4">
                <div v-if="theme.products_ids && theme.products_ids.length > 0">
                  <div 
                    v-for="(productId, index) in theme.products_ids" 
                    :key="'prod-'+index" 
                    class="product-item mb-2 last:mb-0"
                  >
                    <div class="flex items-center bg-white p-2 rounded border">
                      <select v-model="theme.products_ids[index]" class="form-select flex-grow mr-2">
                        <option value="">-- Selectează un produs --</option>
                        <option 
                          v-for="product in availableProducts" 
                          :key="product.id" 
                          :value="product.id"
                        >
                          {{ product.name }} ({{ product.id }})
                        </option>
                      </select>
                      <button 
                        type="button" 
                        @click="removeProductId(index)" 
                        class="btn-danger p-2 h-10 w-10 flex items-center justify-center"
                        title="Eliminare produs"
                      >
                        <span>×</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div v-else class="text-center py-4 text-gray-500">
                  <p>Nu există produse adăugate pentru această temă.</p>
                </div>
              </div>
              
              <button 
                type="button" 
                @click="addProductId()" 
                class="btn-secondary"
              >
                + Adaugă produs
              </button>
            </div>
          </div>
        </div>
        
        <!-- Butoane de acțiune -->
        <div class="flex justify-end space-x-4 pt-4 border-t">
          <button type="button" @click="resetForm" class="btn-cancel">
            Anulează
          </button>
          <button type="submit" class="btn-primary">
            {{ isEditing ? 'Salvează modificările' : 'Adaugă temă' }}
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import { collection, setDoc, doc, getDoc, getDocs } from 'firebase/firestore';
  import { db } from '@/firebase';
  
  export default {
    name: 'AdminThemeForm',
    props: {
      themeId: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        theme: {
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
        isEditing: false,
        availableProducts: [],
        isLoadingProducts: false,
        dateError: ''
      };
    },
    created() {
      this.fetchProducts();
      if (this.themeId) {
        this.loadTheme();
      }
    },
    methods: {
      validateId() {
        const regex = /^[a-z0-9-]+$/;
        return regex.test(this.theme.id);
      },
      
      sanitizeId() {
        // Remove any characters that don't match the allowed pattern
        this.theme.id = this.theme.id.toLowerCase().replace(/[^a-z0-9-]/g, '');
      },
      
      validateDates() {
        const startDate = new Date(this.theme.start_date);
        const endDate = new Date(this.theme.end_date);
        
        if (endDate < startDate) {
          this.dateError = 'Data de sfârșit trebuie să fie după data de început';
          return false;
        }
        
        this.dateError = '';
        return true;
      },
  
      async fetchProducts() {
        this.isLoadingProducts = true;
        try {
          const productsRef = collection(db, 'products');
          const snapshot = await getDocs(productsRef);
          
          if (snapshot.empty) {
            console.log('No products found in database');
            this.availableProducts = [];
            return;
          }
          
          this.availableProducts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          console.log(`Fetched ${this.availableProducts.length} products for selection`);
        } catch (error) {
          console.error("Error fetching products:", error);
          this.$emit('showNotification', { 
            type: 'error', 
            message: 'Eroare la încărcarea produselor: ' + error.message 
          });
        } finally {
          this.isLoadingProducts = false;
        }
      },
      
      addGalleryImage() {
        if (!this.theme.gallery) {
          this.theme.gallery = [];
        }
        this.theme.gallery.push('');
      },
      
      removeGalleryImage(index) {
        this.theme.gallery.splice(index, 1);
      },
      
      addProductId() {
        if (!this.theme.products_ids) {
          this.theme.products_ids = [];
        }
        this.theme.products_ids.push('');
      },
      
      removeProductId(index) {
        this.theme.products_ids.splice(index, 1);
      },
      
      async loadTheme() {
        try {
          const docRef = doc(db, 'themes', this.themeId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            this.theme = {
              ...this.theme,
              ...data,
            };
            
            // Ensure arrays exist
            if (!this.theme.gallery) {
              this.theme.gallery = [];
            }
            
            if (!this.theme.products_ids) {
              this.theme.products_ids = [];
            }
            
            this.isEditing = true;
          } else {
            console.error("Tema nu există!");
            this.$emit('showNotification', { 
              type: 'error', 
              message: 'Tema nu a fost găsită în baza de date!' 
            });
          }
        } catch (error) {
          console.error("Eroare la încărcarea temei:", error);
          this.$emit('showNotification', { 
            type: 'error', 
            message: 'Eroare la încărcarea temei: ' + error.message 
          });
        }
      },
      
      async saveTheme() {
        try {
          // Validare
          if (!this.theme.id || !this.theme.name || !this.theme.start_date || !this.theme.end_date) {
            this.$emit('showNotification', { 
              type: 'error', 
              message: 'Vă rugăm completați toate câmpurile obligatorii (nume, id, dată început, dată sfârșit)'
            });
            return;
          }
          
          // Validare ID format (doar litere mici, numere și cratime)
          if (!this.isEditing && !this.validateId()) {
            this.$emit('showNotification', { 
              type: 'error', 
              message: 'ID-ul trebuie să conțină doar litere mici, numere și cratime'
            });
            return;
          }
          
          // Validare date
          if (!this.validateDates()) {
            this.$emit('showNotification', { 
              type: 'error', 
              message: this.dateError
            });
            return;
          }
  
          // Curățare date - eliminăm valorile goale
          const themeToSave = JSON.parse(JSON.stringify(this.theme));
          themeToSave.products_ids = (themeToSave.products_ids || []).filter(id => id);
          themeToSave.gallery = (themeToSave.gallery || []).filter(url => url);
  
          // Salvare în Firestore
          await setDoc(doc(db, 'themes', themeToSave.id), themeToSave);
  
          // Notificare și resetare
          this.$emit('themeSaved', themeToSave);
          this.$emit('showNotification', {
            type: 'success',
            message: this.isEditing
              ? 'Tema a fost actualizată cu succes!'
              : 'Tema a fost adăugată cu succes!'
          });
  
          if (!this.isEditing) {
            this.resetForm();
          }
        } catch (error) {
          console.error("Eroare la salvarea temei:", error);
          this.$emit('showNotification', { 
            type: 'error', 
            message: 'Eroare la salvarea temei: ' + error.message 
          });
        }
      },
      
      resetForm() {
        this.theme = {
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
        this.dateError = '';
        this.$emit('cancel');
      }
    },
    watch: {
      'theme.start_date': function() {
        this.validateDates();
      },
      'theme.end_date': function() {
        this.validateDates();
      }
    }
  };
  </script>
  
  <style scoped>
  .form-section {
    padding-bottom: 1.5rem;
    margin-bottom: 1.5rem;
  }
  .form-label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }
  .form-input, .form-textarea, .form-select {
    @apply block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500;
  }
  .form-textarea {
    @apply resize-y;
  }
  .form-hint {
    @apply block text-xs text-gray-500 mt-1;
  }
  .form-checkbox {
    @apply rounded text-blue-600 focus:ring-blue-500 border-gray-300;
  }
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors;
  }
  .btn-secondary {
    @apply px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors;
  }
  .btn-cancel {
    @apply px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition-colors;
  }
  .btn-danger {
    @apply bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors text-lg font-bold;
  }
  .loader {
    @apply border-4 border-gray-300 rounded-full w-8 h-8;
    border-top-color: #3b82f6;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  </style>