<!-- components/user/UserReviewForm.vue -->
<template>
  <div class="review-form-modal">
    <div class="review-form-container">
      <div class="modal-header">
        <h2>Scrie o recenzie</h2>
        <p v-if="product">pentru {{ product.name }}</p>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <div v-if="loading" class="loading-container">
        <div class="loader"></div>
        <p>Se încarcă...</p>
      </div>
      
      <form v-else @submit.prevent="submitReview" class="review-form">
        <div class="form-group">
          <label for="rating">Rating</label>
          <div class="star-rating">
            <button 
              v-for="star in 5" 
              :key="star" 
              type="button"
              class="star-btn" 
              :class="{ 'active': star <= rating }"
              @click="rating = star"
            >
              ★
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label for="title">Titlu recenzie</label>
          <input 
            type="text" 
            id="title" 
            v-model="title" 
            placeholder="Rezumă experiența ta" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="comment">Recenzia ta</label>
          <textarea 
            id="comment" 
            v-model="comment" 
            rows="5" 
            placeholder="Ce ți-a plăcut sau ce nu ți-a plăcut la produs?" 
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label>Etichete</label>
          <div class="tags-container">
            <div 
              v-for="(tag, index) in availableTags" 
              :key="index"
              class="tag-item"
              :class="{ 'active': selectedTags.includes(tag) }"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label class="photo-label">
            <span>Adaugă fotografii (opțional)</span>
            <div class="photo-preview-area">
              <div 
                v-for="(photo, index) in photoPreviewUrls" 
                :key="index" 
                class="photo-preview"
              >
                <img :src="photo" alt="Preview" />
                <button type="button" class="remove-photo-btn" @click="removePhoto(index)">
                  ×
                </button>
              </div>
              <div class="photo-upload-box" @click="triggerFileInput" v-if="photoPreviewUrls.length < 3">
                <span>+</span>
              </div>
            </div>
            <input 
              type="file" 
              ref="fileInput" 
              accept="image/*" 
              @change="handleFileUpload" 
              multiple
              style="display: none;"
            />
          </label>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Renunță
          </button>
          <button 
            type="submit" 
            class="btn btn-primary" 
            :disabled="isSubmitting || !isValid"
          >
            {{ isSubmitting ? 'Se trimite...' : 'Trimite recenzia' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserReviewForm',
  props: {
    orderId: {
      type: String,
      required: true
    },
    product: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      rating: 5,
      title: '',
      comment: '',
      photos: [],
      photoPreviewUrls: [],
      isSubmitting: false,
      selectedTags: [],
      availableTags: [
        'calitate', 
        'gust', 
        'aspect', 
        'prospețime',
        'preț', 
        'servicii', 
        'rapiditate',
        'ambalaj'
      ]
    }
  },
  computed: {
    isValid() {
      return this.rating > 0 && this.title.trim() && this.comment.trim();
    }
  },
  methods: {
    toggleTag(tag) {
      if (this.selectedTags.includes(tag)) {
        this.selectedTags = this.selectedTags.filter(t => t !== tag);
      } else {
        // Limit to 4 tags maximum
        if (this.selectedTags.length < 4) {
          this.selectedTags.push(tag);
        }
      }
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileUpload(event) {
      const files = event.target.files;
      if (!files.length) return;
      
      // Limit to 3 photos total
      const remainingSlots = 3 - this.photos.length;
      const filesToAdd = Array.from(files).slice(0, remainingSlots);
      
      filesToAdd.forEach(file => {
        // Create preview URL
        const reader = new FileReader();
        reader.onload = e => {
          this.photoPreviewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
        
        // Add to photos array
        this.photos.push(file);
      });
    },
    removePhoto(index) {
      this.photos.splice(index, 1);
      this.photoPreviewUrls.splice(index, 1);
    },
    async submitReview() {
      if (!this.isValid || this.isSubmitting) return;
      
      this.isSubmitting = true;
      
      try {
        // Create review object matching your database structure
        const reviewData = {
          comment: this.comment,
          date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
          product_id: this.product?.id,
          rating: this.rating,
          tags: this.selectedTags,
          title: this.title,
          user_id: this.$store.getters['user/currentUser']?.uid || 'user-unknown',
          user_name: this.$store.getters['user/currentUser']?.displayName || 'Utilizator',
          verified_purchase: true
        };
        
        // Handle images
        if (this.photos.length > 0) {
          // In a real implementation, we would upload photos to Firebase Storage
          // and get back URLs to store with the review
          // For now, simulate this with placeholder URLs
          reviewData.images = this.photos.map((_, i) => 
            `url_review_img${i + 1}.jpg`
          );
        }
        
        // Emit the review data to parent component
        this.$emit('submit-review', reviewData);
        
      } catch (error) {
        console.error('Error submitting review:', error);
        this.$emit('error', 'Nu s-a putut trimite recenzia. Vă rugăm să încercați din nou.');
      } finally {
        this.isSubmitting = false;
      }
    }
  }
}
</script>

<style scoped>
.review-form-modal {
  display: flex;
  align-items: center;
  justify-content: center;
}

.review-form-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 550px;
  margin: 0 auto;
  overflow: hidden;
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.modal-header h2 {
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  font-size: 1.8rem;
  font-weight: 400;
  color: #333;
  margin: 0 0 0.3rem 0;
}

.modal-header p {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

.close-btn {
  position: absolute;
  top: 1.2rem;
  right: 1.5rem;
  background: transparent;
  border: none;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  color: #999;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #333;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 2rem;
}

.loader {
  width: 48px;
  height: 48px;
  border: 5px solid rgba(181, 131, 141, 0.2);
  border-radius: 50%;
  border-top: 5px solid #b5838d;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Form */
.review-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.6rem;
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
}

/* Star Rating */
.star-rating {
  display: flex;
  gap: 0.5rem;
}

.star-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #ddd;
  transition: color 0.2s;
  padding: 0;
  line-height: 1;
}

.star-btn.active {
  color: #b5838d;
}

/* Input Fields */
input[type="text"],
textarea {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: 'Montserrat', 'Helvetica Neue', sans-serif;
}

input[type="text"]:focus,
textarea:focus {
  border-color: #b5838d;
  outline: none;
  box-shadow: 0 0 0 3px rgba(181, 131, 141, 0.1);
}

/* Tags */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag-item {
  padding: 0.4rem 0.8rem;
  background-color: #f5f5f5;
  border-radius: 50px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.tag-item:hover {
  background-color: #f0f0f0;
}

.tag-item.active {
  background-color: rgba(181, 131, 141, 0.1);
  color: #b5838d;
  border-color: rgba(181, 131, 141, 0.3);
}

/* Photo Upload */
.photo-label {
  cursor: pointer;
}

.photo-preview-area {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.photo-preview {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-photo-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.remove-photo-btn:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

.photo-upload-box {
  width: 80px;
  height: 80px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.photo-upload-box:hover {
  border-color: #b5838d;
  background-color: rgba(181, 131, 141, 0.03);
}

.photo-upload-box span {
  font-size: 1.8rem;
  color: #ccc;
}

/* Action Buttons */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.95rem;
  font-family: 'Montserrat', 'Helvetica Neue', sans-serif;
}

.btn-primary {
  background: linear-gradient(to right, #b5838d, #9c27b0);
  color: white;
  box-shadow: 0 4px 12px rgba(181, 131, 141, 0.2);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(181, 131, 141, 0.3);
}

.btn-primary:disabled {
  background: linear-gradient(to right, #d1b3bd, #ce93d8);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background-color: transparent;
  color: #666;
  border: 1px solid #e0e0e0;
}

.btn-secondary:hover {
  background-color: #f9f9f9;
  border-color: #ccc;
}

/* Responsive Adjustments */
@media (max-width: 600px) {
  .review-form-container {
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .star-rating {
    justify-content: center;
  }
  
  .form-actions {
    flex-direction: column-reverse;
    gap: 0.8rem;
  }
  
  .btn {
    width: 100%;
  }
}
</style>