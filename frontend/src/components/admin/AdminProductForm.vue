<template>
  <div class="product-form">
    <h2 class="form-title">{{ isEditing ? 'Editează Produs' : 'Adaugă Produs Nou' }}</h2>
    
    <form @submit.prevent="saveProduct" class="form-container">
      <div class="form-row">
        <div class="form-field">
          <label>Nume produs*</label>
          <input v-model="product.name" type="text" required placeholder="Nume produs" />
        </div>
        
        <div class="form-field">
          <label>ID produs*</label>
          <input 
            v-model="product.id" 
            type="text" 
            required 
            placeholder="ID produs (ex: gift-box-2)" 
            :disabled="isEditing" 
          />
          <small v-if="!isEditing" class="hint-text">ID-ul va apărea în URL și trebuie să fie unic. Folosește doar litere mici, numere și cratime.</small>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-field">
          <label>Preț (RON)*</label>
          <input v-model.number="product.price" type="number" required />
        </div>
        
        <div class="form-field">
          <label>Greutate (g)</label>
          <input v-model.number="product.weight" type="number" placeholder="Greutate în grame" />
        </div>
        
        <div class="form-field">
          <label>Porții</label>
          <input v-model.number="product.servings" type="number" placeholder="Număr de porții" />
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-field">
          <label>Categorie</label>
          <select v-model="product.category">
            <option value="cadouri">Cadouri</option>
            <option value="dulciuri">Dulciuri</option>
            <option value="torturi">Torturi</option>
            <option value="prajituri">Prăjituri</option>
          </select>
        </div>
        
        <div class="form-field">
          <label>Subcategorie</label>
          <input v-model="product.subcategory" type="text" placeholder="Subcategorie" />
        </div>
        
        <div class="form-field">
          <label>Disponibilitate</label>
          <select v-model="product.availability">
            <option value="disponibil">Disponibil</option>
            <option value="stoc-limitat">Stoc limitat</option>
            <option value="indisponibil">Indisponibil</option>
          </select>
        </div>
      </div>
      
      <div class="form-field full-width">
        <label>Descriere*</label>
        <textarea v-model="product.description" rows="4" required placeholder="Descriere detaliată"></textarea>
      </div>
      
      <div class="form-field full-width">
        <label>Note speciale</label>
        <input v-model="product.special_notes" type="text" placeholder="Note speciale" />
      </div>
      
      <div class="form-row">
        <div class="form-field">
          <label>Termen de valabilitate</label>
          <input v-model="product.expiry_date" type="text" placeholder="Termen de valabilitate" />
        </div>
        
        <div class="form-field">
          <label>Condiții de păstrare</label>
          <input v-model="product.storage_conditions" type="text" placeholder="Condiții de păstrare" />
        </div>
      </div>
      
      <div class="form-field full-width">
        <label>URL Imagine</label>
        <input v-model="product.image" type="text" placeholder="URL imagine" />
      </div>
      
      <h3 class="section-title">Ingrediente</h3>
      <div class="array-input-container">
        <div v-for="(ingredient, index) in product.ingredients" :key="'ing-'+index" class="array-item">
          <input v-model="product.ingredients[index]" type="text" placeholder="Ingredient" />
          <button type="button" class="remove-btn" @click="removeItem(product.ingredients, index)">×</button>
        </div>
        <button type="button" class="add-btn" @click="addItem(product.ingredients, '')">+ Adaugă ingredient</button>
      </div>
      
      <h3 class="section-title">Alergeni</h3>
      <div class="array-input-container">
        <div v-for="(allergen, index) in product.allergens" :key="'alg-'+index" class="array-item">
          <input v-model="product.allergens[index]" type="text" placeholder="Alergen" />
          <button type="button" class="remove-btn" @click="removeItem(product.allergens, index)">×</button>
        </div>
        <button type="button" class="add-btn" @click="addItem(product.allergens, '')">+ Adaugă alergen</button>
      </div>
      
      <h3 class="section-title">Valori nutriționale (per 100g)</h3>
      <div class="form-row">
        <div class="form-field">
          <label>Calorii</label>
          <input v-model.number="product.nutritional_values.calories" type="number" placeholder="Calorii" />
        </div>
        <div class="form-field">
          <label>Carbohidrați (g)</label>
          <input v-model.number="product.nutritional_values.carbs" type="number" placeholder="Carbohidrați" />
        </div>
        <div class="form-field">
          <label>Grăsimi (g)</label>
          <input v-model.number="product.nutritional_values.fat" type="number" placeholder="Grăsimi" />
        </div>
        <div class="form-field">
          <label>Proteine (g)</label>
          <input v-model.number="product.nutritional_values.protein" type="number" placeholder="Proteine" />
        </div>
        <div class="form-field">
          <label>Zahăr (g)</label>
          <input v-model.number="product.nutritional_values.sugar" type="number" placeholder="Zahăr" />
        </div>
      </div>
      
      <h3 class="section-title">Etichete</h3>
      <div class="array-input-container">
        <div v-for="(tag, index) in product.tags" :key="'tag-'+index" class="array-item">
          <input v-model="product.tags[index]" type="text" placeholder="Etichetă" />
          <button type="button" class="remove-btn" @click="removeItem(product.tags, index)">×</button>
        </div>
        <button type="button" class="add-btn" @click="addItem(product.tags, '')">+ Adaugă etichetă</button>
      </div>
      
      <div class="form-actions">
        <button type="button" @click="resetForm" class="cancel-button">Anulează</button>
        <button type="submit" class="submit-button">{{ isEditing ? 'Actualizează Produs' : 'Adaugă Produs' }}</button>
      </div>
    </form>
  </div>
</template>

<script>
import { collection, setDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export default {
  name: 'UpdatedAdminProductForm',
  props: {
    productId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      product: {
        name: '',
        id: '',
        price: 0,
        description: '',
        category: 'cadouri',
        subcategory: '',
        image: '',
        ingredients: [],
        allergens: [],
        availability: 'disponibil',
        nutritional_values: {
          calories: 0,
          carbs: 0,
          fat: 0,
          protein: 0,
          sugar: 0
        },
        tags: [],
        weight: 0,
        servings: 0,
        storage_conditions: '',
        expiry_date: '',
        special_notes: ''
      },
      isEditing: false
    };
  },
  created() {
    if (this.productId) {
      this.loadProduct();
    }
  },
  methods: {
    addItem(array, defaultValue) {
      array.push(defaultValue);
    },
    
    removeItem(array, index) {
      array.splice(index, 1);
    },
    
    async loadProduct() {
      try {
        const docRef = doc(db, 'products', this.productId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Prepopulate all fields
          this.product = {
            ...this.product, // Default values
            ...data, // Overwrite with actual data
            nutritional_values: {
              ...this.product.nutritional_values,
              ...(data.nutritional_values || {})
            }
          };
          
          // Ensure arrays exist
          if (!this.product.ingredients) this.product.ingredients = [];
          if (!this.product.allergens) this.product.allergens = [];
          if (!this.product.tags) this.product.tags = [];
          
          this.isEditing = true;
        } else {
          console.error("Produsul nu există!");
          this.$emit('showNotification', { 
            type: 'error', 
            message: 'Produsul nu a fost găsit în baza de date!' 
          });
        }
      } catch (error) {
        console.error("Eroare la încărcarea produsului:", error);
        this.$emit('showNotification', { 
          type: 'error', 
          message: 'Eroare la încărcarea produsului: ' + error.message 
        });
      }
    },
    
    async saveProduct() {
      try {
        // Validare
        if (!this.product.id || !this.product.name || this.product.price <= 0) {
          this.$emit('showNotification', { 
            type: 'error', 
            message: 'Vă rugăm completați toate câmpurile obligatorii (nume, id, preț)'
          });
          return;
        }
        
        // Validare ID format
        if (!this.isEditing) {
          const idRegex = /^[a-z0-9-]+$/;
          if (!idRegex.test(this.product.id)) {
            this.$emit('showNotification', { 
              type: 'error', 
              message: 'ID-ul trebuie să conțină doar litere mici, numere și cratime'
            });
            return;
          }
        }
        
        // Curățare date
        const productToSave = JSON.parse(JSON.stringify(this.product));
        
        // Salvare în Firestore
        await setDoc(doc(db, 'products', productToSave.id), productToSave);
        
        // Notificare și resetare
        this.$emit('productSaved', productToSave);
        
        if (!this.isEditing) {
          this.resetForm();
        }
      } catch (error) {
        console.error("Eroare la salvarea produsului:", error);
        this.$emit('showNotification', { 
          type: 'error', 
          message: 'Eroare la salvarea produsului: ' + error.message 
        });
      }
    },
    
    resetForm() {
      this.product = {
        name: '',
        id: '',
        price: 0,
        description: '',
        category: 'cadouri',
        subcategory: '',
        image: '',
        ingredients: [],
        allergens: [],
        availability: 'disponibil',
        nutritional_values: {
          calories: 0,
          carbs: 0,
          fat: 0,
          protein: 0,
          sugar: 0
        },
        tags: [],
        weight: 0,
        servings: 0,
        storage_conditions: '',
        expiry_date: '',
        special_notes: ''
      };
      this.$emit('cancel');
    }
  }
};
</script>

<style scoped>
.product-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 0;
}

.form-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #1e293b;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1.5rem 0 1rem;
  color: #1e293b;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.25rem;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.full-width {
  grid-column: 1 / -1;
}

label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
}

input, select, textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  color: #1f2937;
  width: 100%;
}

textarea {
  resize: vertical;
  min-height: 100px;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.hint-text {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.array-input-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.array-item {
  display: flex;
  gap: 0.5rem;
}

.remove-btn {
  padding: 0;
  width: 2.5rem;
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
  font-size: 1.25rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.add-btn {
  padding: 0.75rem 1rem;
  background-color: #f9fafb;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  align-self: flex-start;
  margin-top: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.cancel-button {
  padding: 0.75rem 1.5rem;
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
}

.submit-button {
  padding: 0.75rem 1.5rem;
  background-color: #1e293b;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
}

.submit-button:hover {
  background-color: #172035;
}

.cancel-button:hover {
  background-color: #e5e7eb;
}

.add-btn:hover {
  background-color: #f3f4f6;
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  .product-form {
    background-color: #ffffff;
    color: #1f2937;
  }
  
  input, select, textarea {
    background-color: #ffffff;
    color: #1f2937;
  }
}
</style>