<template>
  <div class="product-detail-container" v-if="product">
    <div class="product-gallery">
      <div class="main-image">
        <img :src="selectedImage" :alt="product.name" class="product-image">
        <div v-if="product.isNew" class="product-badge new">Nou</div>
      </div>
      <div class="thumbnail-gallery">
        <div 
          v-for="(image, index) in product.gallery" 
          :key="index" 
          @click="selectedImage = image"
          class="thumbnail-wrapper"
          :class="{ active: selectedImage === image }"
        >
          <img 
            :src="image" 
            :alt="`${product.name} - imagine ${index + 1}`"
            class="thumbnail"
          >
        </div>
      </div>
    </div>

    <div class="product-info">
      <div class="product-header">
        <h1 class="product-title">{{ product.name }}</h1>
        <div class="product-price">{{ product.price }} <span>lei</span></div>
      </div>
      
      <div class="product-description">{{ product.description }}</div>
      
      <div class="product-meta">
        <div class="meta-item">
          <div class="meta-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div class="meta-content">
            <h3>Porții</h3>
            <p>{{ product.servings }}</p>
          </div>
        </div>
        <div class="meta-item">
          <div class="meta-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="3" x2="1" y2="3"></line><line x1="8" y1="21" x2="1" y2="21"></line><line x1="16" y1="3" x2="23" y2="3"></line><line x1="16" y1="21" x2="23" y2="21"></line></svg>
          </div>
          <div class="meta-content">
            <h3>Greutate</h3>
            <p>{{ product.weight }}g</p>
          </div>
        </div>
        <div class="meta-item">
          <div class="meta-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div class="meta-content">
            <h3>Valabilitate</h3>
            <p>{{ product.expiry_date }}</p>
          </div>
        </div>
      </div>
      
      <div class="product-tags">
        <span v-for="(tag, index) in product.tags" :key="index" class="tag">{{ tag }}</span>
      </div>
      
      <div class="product-actions">
        <div class="quantity-selector">
          <button @click="decrementQuantity" :disabled="quantity <= 1" class="quantity-btn">
            <span class="quantity-symbol">−</span>
          </button>
          <input type="number" v-model.number="quantity" min="1" class="quantity-input">
          <button @click="incrementQuantity" class="quantity-btn">
            <span class="quantity-symbol">+</span>
          </button>
        </div>
        <button class="add-to-cart-btn" @click="addToCart">
          <span>Adaugă în coș</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
        </button>
      </div>
    </div>

    <div class="product-details">
      <div class="details-tabs">
        <button 
          v-for="(tab, index) in tabs" 
          :key="index" 
          @click="activeTab = tab.id" 
          :class="{ active: activeTab === tab.id }"
          class="tab-button"
        >
          {{ tab.name }}
        </button>
      </div>
      
      <div class="details-content">
        <div v-if="activeTab === 'ingredients'" class="tab-content">
          <h2>Ingrediente</h2>
          <ul class="ingredients-list">
            <li v-for="(ingredient, index) in product.ingredients" :key="index">{{ ingredient }}</li>
          </ul>
        </div>
        
        <div v-if="activeTab === 'allergens'" class="tab-content">
          <h2>Alergeni</h2>
          <div class="allergens">
            <span v-for="(allergen, index) in product.allergens" :key="index" class="allergen">{{ allergen }}</span>
          </div>
        </div>
        
        <div v-if="activeTab === 'nutrition'" class="tab-content">
          <h2>Valori nutriționale</h2>
          <div class="nutritional-table">
            <div class="nutritional-row">
              <span>Calorii</span>
              <span>{{ product.nutritional_values.calories }} kcal</span>
            </div>
            <div class="nutritional-row">
              <span>Grăsimi</span>
              <span>{{ product.nutritional_values.fat }}g</span>
            </div>
            <div class="nutritional-row">
              <span>Carbohidrați</span>
              <span>{{ product.nutritional_values.carbs }}g</span>
            </div>
            <div class="nutritional-row">
              <span>Proteine</span>
              <span>{{ product.nutritional_values.protein }}g</span>
            </div>
            <div class="nutritional-row">
              <span>Zahăr</span>
              <span>{{ product.nutritional_values.sugar }}g</span>
            </div>
          </div>
        </div>
        
        <div v-if="activeTab === 'storage'" class="tab-content">
          <h2>Condiții de păstrare</h2>
          <p>{{ product.storage_conditions }}</p>
        </div>
        
        <div v-if="activeTab === 'notes' && product.special_notes" class="tab-content">
          <h2>Note speciale</h2>
          <p>{{ product.special_notes }}</p>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading">
    <div class="loader"></div>
    <p>Se încarcă produsul...</p>
  </div>
</template>

<script>
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
  data() {
    return {
      product: null,
      selectedImage: null,
      quantity: 1,
      activeTab: 'ingredients',
      tabs: [
        { id: 'ingredients', name: 'Ingrediente' },
        { id: 'allergens', name: 'Alergeni' },
        { id: 'nutrition', name: 'Nutriție' },
        { id: 'storage', name: 'Păstrare' },
        { id: 'notes', name: 'Note' }
      ]
    };
  },
  
  computed: {
    ...mapState('products', ['loading', 'error']),
    ...mapGetters('products', ['getCurrentProduct'])
  },
  
  async created() {
    const productId = this.$route.params.id;
    try {
      await this.fetchProductData(productId);
    } catch (error) {
      console.error("Eroare la preluarea datelor produsului:", error);
    }
  },
  
  methods: {
    ...mapActions('products', ['fetchProductById']),
    ...mapActions('cart', ['addToCart']),
    
    async fetchProductData(productId) {
      try {
        const productRef = doc(db, "products", productId);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
          this.product = {
            id: productSnap.id,
            ...productSnap.data(),
            isNew: this.isProductNew(productSnap.data().createdAt)
          };
          this.selectedImage = this.product.image;
          
          if (!this.product.special_notes) {
            this.tabs = this.tabs.filter(tab => tab.id !== 'notes');
          }
        } else {
          console.error(`Produsul cu ID-ul ${productId} nu a fost găsit.`);
        }
      } catch (error) {
        console.error("Eroare la preluarea produsului:", error);
      }
    },
    
    isProductNew(createdAt) {
      if (!createdAt) return false;
      const today = new Date();
      const creationDate = new Date(createdAt);
      const daysDifference = Math.floor((today - creationDate) / (1000 * 60 * 60 * 24));
      return daysDifference <= 14; // Nou dacă a fost adăugat în ultimele 14 zile
    },
    
    incrementQuantity() {
      this.quantity++;
    },
    
    decrementQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    
    addToCart() {
      this.$store.dispatch('cart/addToCart', {
        product: this.product,
        quantity: this.quantity
      });
      
      if (this.$toast) {
        this.$toast.success(`${this.product.name} a fost adăugat în coș!`);
      } else {
        alert(`Produsul ${this.product.name} a fost adăugat în coș (${this.quantity} bucăți)`);
      }
    }
  }
};
</script>

<style scoped>
.product-detail-container {
  max-width: 1200px;
  margin: 4rem auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 4rem;
  font-family: 'Montserrat', sans-serif;
  color: #222;
}

/* Gallery Section */
.product-gallery {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
}

.main-image {
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  position: relative;
  background-color: #fafafa;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.main-image:hover .product-image {
  transform: scale(1.02);
}

.product-badge {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 0.4rem 0.8rem;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  z-index: 10;
  font-family: 'Montserrat', sans-serif;
}

.product-badge.new {
  background-color: #222;
  color: white;
}

.thumbnail-gallery {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: thin;
}

.thumbnail-gallery::-webkit-scrollbar {
  height: 4px;
}

.thumbnail-gallery::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.thumbnail-gallery::-webkit-scrollbar-thumb {
  background: #ddd;
}

.thumbnail-wrapper {
  width: 75px;
  height: 75px;
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.thumbnail-wrapper:hover {
  opacity: 0.9;
}

.thumbnail-wrapper.active {
  opacity: 1;
  border: 1px solid #222;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Product Info Section */
.product-info {
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
}

.product-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 1.5rem;
}

.product-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 2.2rem;
  font-weight: 300;
  margin: 0 0 1rem 0;
  color: #111;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.product-price {
  font-size: 1.8rem;
  font-weight: 500;
  color: #111;
  display: flex;
  align-items: baseline;
}

.product-price span {
  font-size: 1.1rem;
  margin-left: 4px;
  font-weight: 400;
  color: #666;
}

.product-description {
  font-size: 1rem;
  color: #555;
  line-height: 1.8;
  font-weight: 300;
  letter-spacing: 0.2px;
}

.product-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 1.5rem;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.meta-item {
  flex: 1;
  min-width: 150px;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.meta-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 50%;
  color: #333;
}

.meta-content h3 {
  font-size: 0.7rem;
  margin: 0 0 0.3rem 0;
  color: #777;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
}

.meta-content p {
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  color: #222;
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin: 0.5rem 0;
}

.tag {
  background-color: #f4f4f4;
  color: #555;
  padding: 0.3rem 0.8rem;
  border-radius: 2px;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
}

.tag:hover {
  background-color: #eaeaea;
}

.product-actions {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  align-items: center;
}

.quantity-selector {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 2px;
  overflow: hidden;
}

.quantity-btn {
  width: 36px;
  height: 42px;
  border: none;
  background-color: #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #222;
}

.quantity-symbol {
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1;
}

.quantity-btn:hover {
  background-color: #f5f5f5;
}

.quantity-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.quantity-input {
  width: 50px;
  height: 42px;
  border: none;
  border-left: 1px solid #eee;
  border-right: 1px solid #eee;
  text-align: center;
  font-size: 1rem;
  color: #333;
  background-color: white;
  font-weight: 400;
}

.add-to-cart-btn {
  flex: 1;
  height: 42px;
  padding: 0 1.5rem;
  background-color: #222;
  color: white;
  border: none;
  border-radius: 2px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: 0.5px;
}

.add-to-cart-btn:hover {
  background-color: #000;
}

/* Product Details Section */
.product-details {
  margin-top: 1rem;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  grid-column: 1 / -1;
}

.details-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  background-color: #fcfcfc;
}

.details-tabs::-webkit-scrollbar {
  display: none;
}

.tab-button {
  padding: 1.2rem 1.8rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 0.85rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.tab-button:hover {
  color: #222;
}

.tab-button.active {
  color: #222;
  border-bottom: 2px solid #222;
  font-weight: 600;
}

.details-content {
  padding: 2.5rem;
}

.tab-content {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.tab-content h2 {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #222;
  font-weight: 300;
  position: relative;
  padding-bottom: 0.8rem;
  letter-spacing: -0.3px;
}

.tab-content h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 1px;
  background-color: #222;
}

.ingredients-list {
  padding-left: 1.2rem;
  margin: 0;
  list-style-type: square;
}

.ingredients-list li {
  margin-bottom: 0.7rem;
  color: #444;
  font-size: 0.95rem;
  line-height: 1.5;
}

.allergens {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.allergen {
  background-color: #f0f0f0;
  color: #444;
  padding: 0.4rem 0.8rem;
  border-radius: 2px;
  font-size: 0.85rem;
  font-weight: 400;
  border: 1px solid #e0e0e0;
}

.nutritional-table {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 500px;
}

.nutritional-row {
  display: flex;
  justify-content: space-between;
  padding: 0.9rem 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.95rem;
}

.nutritional-row:last-child {
  border-bottom: none;
}

.nutritional-row span:first-child {
  color: #555;
  font-weight: 400;
}

.nutritional-row span:last-child {
  color: #222;
  font-weight: 500;
}

/* Loading state */
.loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  gap: 1.5rem;
}

.loader {
  width: 40px;
  height: 40px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #222;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading p {
  font-size: 1rem;
  color: #666;
  letter-spacing: 0.5px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive styles */
@media (min-width: 768px) {
  .product-detail-container {
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
  }
  
  .product-details {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .product-detail-container {
    margin: 2rem auto;
    padding: 0 1.5rem;
    gap: 2.5rem;
  }
  
  .product-title {
    font-size: 1.8rem;
  }
  
  .product-price {
    font-size: 1.6rem;
  }
  
  .meta-item {
    flex-basis: 100%;
  }
  
  .tab-button {
    padding: 1rem 1.4rem;
    font-size: 0.8rem;
  }
  
  .details-content {
    padding: 2rem 1.5rem;
  }
}

/* Enhanced Mobile Cart Styling */

/* Modify the existing media query for mobile devices */
@media (max-width: 480px) {
  .product-actions {
    /* Keep the same horizontal layout */
    display: flex;
    gap: 10px;
    align-items: center;
  }
  
  .quantity-selector {
    /* Same elegant styling */
    height: 34px;
    min-width: unset; /* Remove any minimum width constraints */
  }
  
  .quantity-btn {
    width: 28px;
    height: 34px;
  }
  
  .quantity-input {
    width: 34px;
    height: 34px;
  }
  
  .add-to-cart-btn {
    height: 34px;
    /* Ensure text doesn't wrap */
    white-space: nowrap;
  }
}

/* For very small screens - adjustments that maintain elegance */
@media (max-width: 359px) {
  .quantity-selector {
    flex: 0 0 auto; /* Don't allow the selector to grow */
  }
  
  .add-to-cart-btn {
    padding: 0 10px; /* Slightly reduce padding */
  }
}
/* Minimalist Elegant Cart Design */

@media (max-width: 767px) {
  /* Product actions - clean horizontal layout */
  .product-actions {
    display: flex;
    gap: 10px;
    margin: 14px 0;
    align-items: center;
  }
  
  /* Minimalist quantity selector */
  .quantity-selector {
    display: flex;
    align-items: center;
    height: 34px;
    border: 1px solid #e5e5e5;
    border-radius: 5px;
    overflow: hidden;
    background-color: white;
  }
  
  .quantity-btn {
    width: 28px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: none;
    color: #777;
    font-weight: normal;
    padding: 0;
  }
  
  .quantity-symbol {
    font-size: 0.9rem;
  }
  
  .quantity-input {
    width: 34px;
    height: 34px;
    border: none;
    border-left: 1px solid #f0f0f0;
    border-right: 1px solid #f0f0f0;
    text-align: center;
    font-size: 0.85rem;
    color: #333;
    padding: 0;
    background-color: white;
  }
  
  /* Refined add to cart button */
  .add-to-cart-btn {
    flex: 1;
    height: 34px;
    border-radius: 5px;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.3px;
    text-transform: uppercase;
    background-color: #222;
    color: white;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 0 12px;
  }
  
  .add-to-cart-btn svg {
    width: 14px;
    height: 14px;
  }
  
  /* Hide spinner on number input */
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  input[type="number"] {
    -moz-appearance: textfield;
  }
}


</style>