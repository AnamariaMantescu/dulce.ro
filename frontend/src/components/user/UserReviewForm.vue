<!-- components/user/UserReviewForm.vue -->
<template>
  <div class="review-form-modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ isEditing ? 'Editare Recenzie' : 'Adaugă o Recenzie' }}</h2>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Se încarcă...</p>
      </div>

      <div v-else class="form-content">
        <form @submit.prevent="submitReview" class="review-form">
          <!-- Product Selection -->
          <div v-if="availableProducts && availableProducts.length > 0" class="form-group">
            <label for="product">Produs</label>
            <select 
              id="product" 
              v-model="review.product_id" 
              required
              :disabled="isEditing || productPreselected"
            >
              <option value="" disabled>Selectați produsul</option>
              <option 
                v-for="prod in availableProducts" 
                :key="prod.id || prod.productId" 
                :value="prod.id || prod.productId"
              >
                {{ prod.name }}
              </option>
            </select>
          </div>

          <!-- Product Preview -->
          <div v-if="selectedProduct && selectedProduct.name" class="product-preview">
            <div class="preview-details">
              <h3>{{ selectedProduct.name }}</h3>
              <p v-if="selectedProduct.price">{{ formatPrice(selectedProduct.price) }}</p>
            </div>
          </div>

          <!-- Rating Stars -->
          <div class="form-group">
            <label>Rating</label>
            <div class="star-rating-input">
              <span 
                v-for="star in 5" 
                :key="star" 
                class="star-input" 
                :class="{ 'filled': star <= review.rating }"
                @click="review.rating = star"
                @mouseover="hoverRating = star"
                @mouseleave="hoverRating = 0"
              >★</span>
              <span class="rating-text">{{ getRatingText() }}</span>
            </div>
          </div>

          <!-- Review Title -->
          <div class="form-group">
            <label for="review-title">Titlu</label>
            <input 
              type="text" 
              id="review-title" 
              v-model="review.title"
              placeholder="Un titlu scurt pentru recenzia ta"
              required
            >
          </div>

          <!-- Review Comment -->
          <div class="form-group">
            <label for="review-comment">Comentariu</label>
            <textarea 
              id="review-comment" 
              v-model="review.comment"
              placeholder="Împărtășește experiența ta cu acest produs..."
              rows="5"
              required
            ></textarea>
            <div class="char-counter" :class="{ 'limit-warning': review.comment.length > 800 }">
              {{ review.comment.length }}/1000
            </div>
          </div>

          <!-- Tags -->
          <div class="form-group">
            <label>Etichete (opțional)</label>
            <div class="tags-container">
              <div class="available-tags">
                <div 
                  v-for="tag in availableTags" 
                  :key="tag"
                  class="tag-option"
                  :class="{ 'selected': review.tags.includes(tag) }"
                  @click="toggleTag(tag)"
                >
                  {{ tag }}
                </div>
              </div>
              
              <div class="custom-tag-input">
                <input 
                  type="text" 
                  v-model="customTag" 
                  placeholder="Adaugă o etichetă personalizată"
                  @keyup.enter="addCustomTag"
                >
                <button type="button" class="add-tag-btn" @click="addCustomTag">+</button>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">Anulează</button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting">
                <span class="submitting-icon"></span>
                Se trimite...
              </span>
              <span v-else>{{ isEditing ? 'Salvează Modificările' : 'Trimite Recenzia' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserReviewForm',
  props: {
    orderId: {
      type: String,
      default: ''
    },
    product: {
      type: Object,
      default: () => null
    },
    availableProducts: {
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
      review: {
        title: '',
        rating: 0,
        comment: '',
        product_id: '',
        tags: [],
        verified_purchase: true,
        order_id: this.orderId || '',
      },
      availableTags: ['calitate', 'gust', 'servire', 'aspect', 'ambalaj', 'preț', 'valoare'],
      customTag: '',
      hoverRating: 0,
      error: '',
      isSubmitting: false,
    };
  },
  computed: {
    isEditing() {
      return this.product && this.product.existingReview;
    },
    productPreselected() {
      return !!this.product && !!this.product.id;
    },
    selectedProduct() {
      return this.product;
    }
  },
  watch: {
    product: {
      immediate: true,
      handler(newProduct) {
        if (newProduct) {
          // Dacă avem o recenzie existentă, populăm formularul cu ea
          if (newProduct.existingReview) {
            const existingReview = newProduct.existingReview;
            this.review = {
              ...existingReview,
              product_id: existingReview.product_id || newProduct.id || newProduct.productId || '',
              tags: existingReview.tags || [],
              order_id: existingReview.order_id || this.orderId || ''
            };
          } else {
            // Recenzie nouă pentru un produs selectat
            // Folosim ID-ul produsului chiar dacă este 'unknown'
            this.review.product_id = newProduct.id || newProduct.productId || '';
            
            // Dacă avem un nume de produs, îl folosim pentru un titlu predefinit
            if (newProduct.name && newProduct.name !== 'Produs necunoscut') {
              this.review.title = `Recenzie pentru ${newProduct.name}`;
            }
          }
        }
      }
    }
  },
  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat('ro-RO', { 
        style: 'currency', 
        currency: 'RON' 
      }).format(price);
    },
    getRatingText() {
      const rating = this.hoverRating || this.review.rating;
      const ratingTexts = [
        '',
        'Nesatisfăcător',
        'Acceptabil',
        'Bun',
        'Foarte Bun',
        'Excelent'
      ];
      return ratingTexts[rating];
    },
    toggleTag(tag) {
      if (this.review.tags.includes(tag)) {
        this.review.tags = this.review.tags.filter(t => t !== tag);
      } else {
        this.review.tags.push(tag);
      }
    },
    addCustomTag() {
      if (this.customTag && this.customTag.trim().length) {
        const tag = this.customTag.trim();
        if (!this.review.tags.includes(tag)) {
          this.review.tags.push(tag);
        }
        this.customTag = '';
      }
    },
    async submitReview() {
      try {
        this.error = '';
        this.isSubmitting = true;
        
        // Validare pentru câmpuri
        if (this.review.rating === 0) {
          this.error = 'Te rugăm să selectezi un rating.';
          this.isSubmitting = false;
          return;
        }
        
        if (this.review.comment.length > 1000) {
          this.error = 'Comentariul este prea lung (max 1000 caractere).';
          this.isSubmitting = false;
          return;
        }
        
        // Pregătirea datelor recenziei
        const reviewData = {
          ...this.review,
          date: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
        };
        
        // Verificăm dacă product_id este 'unknown' și generăm un ID aleator
        if (this.review.product_id === 'unknown' || !this.review.product_id) {
          const randomId = 'temp-' + Math.random().toString(36).substring(2, 15);
          console.log('Folosim un ID temporar pentru recenzie:', randomId);
          reviewData.product_id = randomId;
          reviewData.isPlaceholderProduct = true;
        }
        
        // Emitem evenimentul cu datele recenziei
        this.$emit('submit-review', reviewData);
      } catch (err) {
        console.error('Eroare la trimiterea recenziei:', err);
        this.error = 'A apărut o eroare. Te rugăm să încerci din nou.';
        this.$emit('error', this.error);
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.review-form-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
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

.form-content {
  padding: 20px;
  flex-grow: 1;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(181, 131, 141, 0.3);
  border-radius: 50%;
  border-top-color: #b5838d;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.review-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #555;
  font-size: 0.95rem;
}

input, textarea, select {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #b5838d;
  box-shadow: 0 0 0 3px rgba(181, 131, 141, 0.1);
}

textarea {
  resize: vertical;
  min-height: 120px;
}

.char-counter {
  align-self: flex-end;
  font-size: 0.85rem;
  color: #999;
}

.limit-warning {
  color: #e74c3c;
}

/* Product Preview */
.product-preview {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.preview-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-details h3 {
  margin: 0 0 5px 0;
  font-size: 1rem;
  color: #333;
}

.preview-details p {
  margin: 0;
  font-size: 0.9rem;
  color: #b5838d;
  font-weight: 500;
}

/* Star Rating Input */
.star-rating-input {
  display: flex;
  align-items: center;
  gap: 15px;
}

.star-input {
  font-size: 2rem;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s ease;
}

.star-input.filled {
  color: #b5838d;
}

.star-input:hover {
  transform: scale(1.1);
}

.rating-text {
  font-size: 0.9rem;
  color: #666;
  width: 100px;
}

/* Tags */
.tags-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.available-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-option {
  padding: 6px 12px;
  background-color: #f1f1f1;
  border-radius: 30px;
  font-size: 0.9rem;
  color: #555;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag-option:hover {
  background-color: #e9e9e9;
}

.tag-option.selected {
  background-color: rgba(181, 131, 141, 0.1);
  color: #b5838d;
  border: 1px solid rgba(181, 131, 141, 0.3);
}

.custom-tag-input {
  display: flex;
  gap: 10px;
}

.custom-tag-input input {
  flex-grow: 1;
}

.add-tag-btn {
  width: 40px;
  height: 40px;
  background-color: #b5838d;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-tag-btn:hover {
  background-color: #9c7082;
  transform: scale(1.05);
}

/* Image Upload */
.image-upload-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.preview-thumbnail {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 3px 8px rgba(0,0,0,0.1);
}

.preview-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.remove-image-btn:hover {
  opacity: 1;
}

.upload-btn-wrapper {
  position: relative;
  display: inline-block;
  overflow: hidden;
}

.upload-btn {
  width: 100px;
  height: 100px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background: #f9f9f9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-btn:hover {
  border-color: #b5838d;
  background: rgba(181, 131, 141, 0.05);
}

.upload-icon {
  font-size: 2rem;
  color: #999;
  margin-bottom: 5px;
}

.upload-btn-wrapper input[type=file] {
  font-size: 100px;
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}

.upload-help {
  font-size: 0.85rem;
  color: #999;
  margin: 0;
}

/* Error Message */
.error-message {
  padding: 12px;
  background-color: rgba(231, 76, 60, 0.1);
  border-left: 3px solid #e74c3c;
  color: #e74c3c;
  border-radius: 4px;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 10px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #666;
  border: none;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn-primary {
  background-color: #b5838d;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #9c7082;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.submitting-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>