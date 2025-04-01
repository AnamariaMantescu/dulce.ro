
<template>
  <div class="special-day-form bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">
      {{ isEditing ? 'Editează Eveniment Special' : 'Adaugă Eveniment Special' }}
    </h2>
    <form @submit.prevent="saveSpecialDay" class="space-y-6">
      <!-- Secțiunea de bază -->
      <div class="form-section">
        <h3 class="text-lg font-medium mb-4 text-gray-700 border-b pb-2">Informații de bază</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label">Nume eveniment <span class="text-red-500">*</span></label>
            <input 
              v-model="specialDay.name" 
              placeholder="ex: Ziua Cheesecake-ului" 
              required
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label class="form-label">ID eveniment <span class="text-red-500">*</span></label>
            <input
  v-model="specialDay.id"
  pattern="^[a-z0-9-]+$"
  required
  class="form-input"
  title="Folosește doar litere mici, cifre și cratime"
  @input="sanitizeId"
/>
            <small class="form-hint">
              ID-ul va apărea în URL și trebuie să fie unic. Folosește doar litere mici, numere și cratime.
            </small>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div class="form-group">
            <label class="form-label">Data evenimentului <span class="text-red-500">*</span></label>
            <input 
              v-model="specialDay.date" 
              type="date" 
              required 
              class="form-input" 
            />
          </div>
          <div class="form-group">
            <label class="form-label">Discount (%)</label>
            <input 
              v-model.number="specialDay.discount" 
              type="number" 
              min="0" 
              max="100" 
              class="form-input" 
              placeholder="0"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Cuvânt cheie pentru căutare</label>
            <input 
              v-model="specialDay.keyword" 
              placeholder="ex: cheesecake" 
              class="form-input" 
            />
          </div>
        </div>
        
        <div class="form-group mt-4">
          <div class="flex items-center">
            <input 
              type="checkbox" 
              id="active-checkbox" 
              v-model="specialDay.active" 
              class="form-checkbox h-5 w-5 text-blue-600" 
            />
            <label for="active-checkbox" class="ml-2 block text-gray-700">
              Activează acest eveniment
            </label>
          </div>
          <small class="form-hint">
            Doar evenimentele active vor fi afișate pe site.
          </small>
        </div>
      </div>
      
      <!-- Secțiunea de conținut -->
      <div class="form-section">
        <h3 class="text-lg font-medium mb-4 text-gray-700 border-b pb-2">Conținut eveniment</h3>
        
        <div class="form-group">
          <label class="form-label">Descriere scurtă <span class="text-red-500">*</span></label>
          <input 
            v-model="specialDay.description" 
            placeholder="Scurtă descriere (maxim 160 caractere)" 
            required 
            class="form-input" 
            maxlength="160"
          />
          <small class="form-hint">
            Această descriere va apărea pe pagina principală ({{ specialDay.description ? specialDay.description.length : 0 }}/160)
          </small>
        </div>
        
        <div class="form-group mt-4">
          <label class="form-label">Descriere detaliată</label>
          <textarea 
            v-model="specialDay.long_description" 
            placeholder="Descriere detaliată a evenimentului" 
            rows="4" 
            class="form-textarea" 
          ></textarea>
        </div>
        
        <div class="form-group mt-4">
          <label class="form-label">Ofertă specială</label>
          <input 
            v-model="specialDay.special_offer" 
            placeholder="ex: Livrare gratuită la orice produs" 
            class="form-input" 
          />
          <small class="form-hint">
            O ofertă specială care va fi afișată pe pagina evenimentului.
          </small>
        </div>
      </div>
      
      <!-- Secțiunea de imagini -->
      <div class="form-section">
        <h3 class="text-lg font-medium mb-4 text-gray-700 border-b pb-2">Imagini</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-group">
            <label class="form-label">Imagine principală</label>
            <input 
              v-model="specialDay.image" 
              placeholder="URL imagine (ex: https://example.com/image.jpg)" 
              class="form-input" 
            />
            <div v-if="specialDay.image" class="mt-3 border rounded overflow-hidden">
              <img :src="specialDay.image" alt="Previzualizare" class="w-full h-36 object-cover" />
            </div>
            <small class="form-hint">
              Această imagine va apărea pe cardurile evenimentului.
            </small>
          </div>
          <div class="form-group">
            <label class="form-label">Banner</label>
            <input 
              v-model="specialDay.banner" 
              placeholder="URL banner (ex: https://example.com/banner.jpg)" 
              class="form-input" 
            />
            <div v-if="specialDay.banner" class="mt-3 border rounded overflow-hidden">
              <img :src="specialDay.banner" alt="Previzualizare banner" class="w-full h-36 object-cover" />
            </div>
            <small class="form-hint">
              Acest banner va apărea în partea de sus a paginii evenimentului.
            </small>
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
              Selectează produsele care vor fi asociate cu acest eveniment. Acestea vor apărea pe pagina evenimentului.
            </p>
          </div>
          
          <div v-if="availableProducts.length === 0" class="bg-yellow-50 p-3 rounded-md border border-yellow-100 mb-4">
            <p class="text-yellow-800 text-sm">
              <span class="font-bold">⚠️ Atenție:</span> Nu există produse disponibile. Adaugă produse în secțiunea Produse.
            </p>
          </div>
          
          <div v-else>
            <div class="products-container border rounded-md bg-gray-50 p-4 mb-4">
              <div v-if="specialDay.products_ids && specialDay.products_ids.length > 0">
                <div 
                  v-for="(productId, index) in specialDay.products_ids" 
                  :key="'prod-'+index" 
                  class="product-item mb-2 last:mb-0"
                >
                  <div class="flex items-center bg-white p-2 rounded border">
                    <select v-model="specialDay.products_ids[index]" class="form-select flex-grow mr-2">
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
                <p>Nu există produse adăugate pentru acest eveniment.</p>
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
          {{ isEditing ? 'Salvează modificările' : 'Adaugă eveniment' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { collection, setDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

export default {
  name: 'AdminSpecialDayForm',
  props: {
    specialDayId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      specialDay: {
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
      isEditing: false,
      availableProducts: [],
      isLoadingProducts: false
    };
  },
  created() {
    this.fetchProducts();
    if (this.specialDayId) {
      this.loadSpecialDay();
    }
  },
  methods: {
    validateId() {
      const regex = /^[a-z0-9-]+$/;
      return regex.test(this.specialDay.id);
    },
    sanitizeId() {
    // Remove any characters that don't match the allowed pattern
    this.specialDay.id = this.specialDay.id.toLowerCase();
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
    
    addProductId() {
      if (!this.specialDay.products_ids) {
        this.specialDay.products_ids = [];
      }
      this.specialDay.products_ids.push('');
    },
    
    removeProductId(index) {
      this.specialDay.products_ids.splice(index, 1);
    },
    
    async loadSpecialDay() {
      try {
        const docRef = doc(db, 'specialDays', this.specialDayId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          this.specialDay = {
            ...this.specialDay,
            ...data,
          };
          if (!this.specialDay.products_ids) {
            this.specialDay.products_ids = [];
          }
          this.isEditing = true;
        } else {
          console.error("Evenimentul special nu există!");
          this.$emit('showNotification', { 
            type: 'error', 
            message: 'Evenimentul special nu a fost găsit în baza de date!' 
          });
        }
      } catch (error) {
        console.error("Eroare la încărcarea evenimentului special:", error);
        this.$emit('showNotification', { 
          type: 'error', 
          message: 'Eroare la încărcarea evenimentului special: ' + error.message 
        });
      }
    },
    
    async saveSpecialDay() {
      try {
        // Validare
        if (!this.specialDay.id || !this.specialDay.name || !this.specialDay.date) {
          this.$emit('showNotification', { 
            type: 'error', 
            message: 'Vă rugăm completați toate câmpurile obligatorii (nume, id, dată)'
          });
          return;
        }
        
        // Validare ID format (doar litere mici, numere și cratime)
        if (!this.validateId()) {
          this.$emit('showNotification', { 
            type: 'error', 
            message: 'ID-ul trebuie să conțină doar litere mici, numere și cratime'
          });
          return;
        }

        // Curățare date - eliminăm ID-urile goale
        const specialDayToSave = JSON.parse(JSON.stringify(this.specialDay));
        specialDayToSave.products_ids = (specialDayToSave.products_ids || []).filter(id => id);

        // Salvare în Firestore
        await setDoc(doc(db, 'specialDays', specialDayToSave.id), specialDayToSave);

        // Notificare și resetare
        this.$emit('specialDaySaved', specialDayToSave);
        this.$emit('showNotification', {
          type: 'success',
          message: this.isEditing
            ? 'Evenimentul a fost actualizat cu succes!'
            : 'Evenimentul a fost adăugat cu succes!'
        });

        if (!this.isEditing) {
          this.resetForm();
        }
      } catch (error) {
        console.error("Eroare la salvarea evenimentului special:", error);
        this.$emit('showNotification', { 
          type: 'error', 
          message: 'Eroare la salvarea evenimentului special: ' + error.message 
        });
      }
    },
    
    resetForm() {
      this.specialDay = {
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
      this.$emit('cancel');
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