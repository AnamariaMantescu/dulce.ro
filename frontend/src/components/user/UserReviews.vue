<!-- components/user/UserReviews.vue -->
<template>
  <div class="reviews-container">
    <h2 class="section-title">Recenziile Mele</h2>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loader"></div>
      <p>Se încarcă recenziile...</p>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="reviews.length === 0" class="empty-state">
      <div class="empty-icon">⭐</div>
      <h3>Nicio recenzie încă</h3>
      <p>Nu ai lăsat nicio recenzie până acum. Împărtășește experiența ta cu produsele noastre!</p>
    </div>
    
    <!-- Reviews List -->
    <div v-else class="reviews-list">
      <div v-for="review in reviews" :key="review.id" class="review-card">
        <div class="review-header">
          <div class="review-title-section">
            <h3 class="review-title">{{ review.title }}</h3>
            <div class="review-rating">
              <div class="star-rating">
                <span 
                  v-for="star in 5" 
                  :key="star" 
                  class="star" 
                  :class="{ 'filled': star <= review.rating }"
                >★</span>
              </div>
            </div>
          </div>
          <div class="review-meta">
            <div class="review-date">{{ formatDate(review.date) }}</div>
            <div v-if="review.verified_purchase" class="verified-badge">
              <span class="verify-icon">✓</span>
              <span>Achiziție verificată</span>
            </div>
          </div>
        </div>
        
        <div class="review-content">
          <p class="review-comment">{{ review.comment }}</p>
          
          <div v-if="review.tags && review.tags.length > 0" class="review-tags">
            <div 
              v-for="(tag, index) in review.tags" 
              :key="index"
              class="tag-badge"
            >
              {{ tag }}
            </div>
          </div>
          
          <div v-if="review.images && review.images.length > 0" class="review-images">
            <div 
              v-for="(imageUrl, index) in review.images" 
              :key="index" 
              class="image-thumbnail"
              @click="openImageModal(imageUrl)"
            >
              <img :src="imageUrl" alt="Imagine recenzie" />
            </div>
          </div>
        </div>
        
        <div v-if="review.response" class="review-response">
          <div class="response-header">
            <h4>Răspunsul nostru</h4>
            <span class="response-date">{{ formatDate(review.response.date) }}</span>
          </div>
          <p class="response-text">{{ review.response.text }}</p>
        </div>
        
        <div class="review-footer">
          <div class="likes-counter" v-if="review.likes">
            <span class="like-icon">👍</span>
            <span>{{ review.likes }} {{ review.likes === 1 ? 'persoană a considerat' : 'persoane au considerat' }} utilă această recenzie</span>
          </div>
          
          <div class="review-actions">
            <button class="action-btn edit" @click="$emit('edit-review', review)">
              <span class="btn-icon">✏️</span>
              <span class="btn-text">Editează</span>
            </button>
            <button class="action-btn delete" @click="confirmDelete(review.id)">
              <span class="btn-icon">🗑️</span>
              <span class="btn-text">Șterge</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Image Modal -->
    <div v-if="showImageModal" class="image-modal" @click="closeImageModal">
      <div class="modal-content">
        <img :src="currentImage" alt="Imagine recenzie" />
        <button class="close-modal-btn" @click.stop="closeImageModal">×</button>
      </div>
    </div>
    
    <!-- Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="confirm-modal">
      <div class="confirm-dialog">
        <h3>Confirmare ștergere</h3>
        <p>Ești sigur că vrei să ștergi această recenzie?</p>
        <div class="confirm-actions">
          <button class="btn btn-secondary" @click="showDeleteConfirm = false">Anulează</button>
          <button class="btn btn-danger" @click="deleteReview">Șterge</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserReviews',
  props: {
    reviews: {
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
      showImageModal: false,
      currentImage: '',
      showDeleteConfirm: false,
      reviewToDelete: null
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString);
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      return date.toLocaleDateString('ro-RO', options);
    },
    openImageModal(imageUrl) {
      this.currentImage = imageUrl;
      this.showImageModal = true;
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    },
    closeImageModal() {
      this.showImageModal = false;
      document.body.style.overflow = ''; // Restore scrolling
    },
    confirmDelete(reviewId) {
      this.reviewToDelete = reviewId;
      this.showDeleteConfirm = true;
    },
    deleteReview() {
      this.$emit('delete-review', this.reviewToDelete);
      this.showDeleteConfirm = false;
      this.reviewToDelete = null;
    }
  }
}
</script>

<style scoped>
.reviews-container {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.section-title {
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  font-size: 1.8rem;
  font-weight: 300;
  color: #333;
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 0.8rem;
}

.section-title:after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 40px;
  height: 2px;
  background-color: #b5838d;
  transition: width 0.3s ease;
}

.reviews-container:hover .section-title:after {
  width: 60px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
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

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 2rem;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 12px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  color: #b5838d;
}

.empty-state h3 {
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #666;
}

.empty-state p {
  margin-bottom: 1rem;
  color: #888;
  max-width: 400px;
}

/* Reviews List */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.review-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

/* Review Header */
.review-header {
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.review-title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.review-title {
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  font-size: 1.3rem;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.review-rating {
  display: flex;
  align-items: center;
}

.star-rating {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 1.2rem;
  color: #ddd;
}

.star.filled {
  color: #b5838d;
}

.review-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #777;
}

.review-date {
  font-style: italic;
}

.verified-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #27ae60;
  font-weight: 500;
}

.verify-icon {
  font-size: 1rem;
}

/* Review Content */
.review-content {
  padding: 1.5rem;
}

.review-comment {
  margin: 0 0 1.2rem 0;
  line-height: 1.6;
  color: #444;
}

.review-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
}

.tag-badge {
  padding: 0.3rem 0.8rem;
  background-color: rgba(181, 131, 141, 0.1);
  border: 1px solid rgba(181, 131, 141, 0.2);
  color: #b5838d;
  border-radius: 50px;
  font-size: 0.8rem;
}

.review-images {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.image-thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.image-thumbnail:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.12);
}

.image-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Review Response */
.review-response {
  margin: 0 1.5rem;
  padding: 1.2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  border-left: 3px solid #b5838d;
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.response-header h4 {
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  font-size: 1.1rem;
  color: #333;
  margin: 0;
}

.response-date {
  font-size: 0.8rem;
  color: #777;
}

.response-text {
  margin: 0;
  font-style: italic;
  color: #555;
  line-height: 1.5;
}

/* Review Footer */
.review-footer {
  padding: 1.2rem 1.5rem;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.likes-counter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.like-icon {
  font-size: 1.1rem;
  color: #b5838d;
}

.review-actions {
  display: flex;
  gap: 0.8rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.edit {
  background-color: rgba(181, 131, 141, 0.1);
  color: #b5838d;
}

.action-btn.edit:hover {
  background-color: rgba(181, 131, 141, 0.2);
}

.action-btn.delete {
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.action-btn.delete:hover {
  background-color: rgba(231, 76, 60, 0.2);
}

.btn-icon {
  font-size: 1.1rem;
}

/* Image Modal */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.modal-content img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.close-modal-btn {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.close-modal-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

/* Confirmation Modal */
.confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.confirm-dialog {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.confirm-dialog h3 {
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
  color: #333;
}

.confirm-dialog p {
  margin: 0 0 1.5rem 0;
  color: #555;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn {
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.95rem;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #666;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background-color: #c0392b;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .review-title-section,
  .review-meta,
  .review-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
  
  .review-actions {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .review-images {
    justify-content: center;
  }
  
  .confirm-actions {
    flex-direction: column;
  }
}
</style>