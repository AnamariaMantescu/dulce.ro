<template>
  <div class="quiz-page">
    <div v-if="loading" class="loading-container">
      <div class="loader"></div>
      <p>Se încarcă întrebările...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="quizCompleted" class="quiz-results">
      <h2>Deserturi recomandate pentru tine</h2>
      <div class="products-grid">
        <div v-for="product in recommendedProducts" :key="product.id" class="product-card" @click="goToProduct(product.id)">
          <div class="product-card-image">
            <img :src="product.image" :alt="product.name">
            <div class="product-overlay">
              <div v-if="product.isNew" class="product-badge new">Nou</div>
              <div v-if="product.isPopular" class="product-status popular">Popular</div>
            </div>
          </div>
          <div class="product-card-content">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-description">{{ truncateDescription(product.description || 'Delicios desert artizanal creat cu ingrediente premium.') }}</p>
            <div class="product-card-footer">
              <div class="product-price">{{ product.price }} lei</div>
              <button class="product-button">
                <span>Vezi detalii</span>
                <span class="button-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <button @click="restartQuiz" class="btn-restart">Refă Quiz-ul</button>
    </div>

    <div v-else class="quiz-container">
      <h2 class="quiz-question">{{ currentQuestion.question }}</h2>
      <div class="quiz-options">
        <button
          v-for="option in currentQuestion.options"
          :key="option.id"
          @click="selectOption(option)"
          class="quiz-option"
        >
          {{ option.text }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  data() {
    return {
      currentQuestion: null,
      quizCompleted: false,
      userTags: [],
      recommendedProducts: [],
    };
  },
  computed: {
    ...mapState('quiz', ['questions', 'loading', 'error']),
  },
  methods: {
    ...mapActions('quiz', ['fetchAllQuestions']),
    ...mapActions('products', ['fetchProducts']),

    startQuiz() {
      this.currentQuestion = this.questions.find(q => q.id === 'q1');
      this.quizCompleted = false;
      this.userTags = [];
    },

    async selectOption(option) {
      this.userTags.push(...option.tags);
      if (option.nextQuestion) {
        this.currentQuestion = this.questions.find(q => q.id === option.nextQuestion);
      } else {
        this.quizCompleted = true;
        await this.loadRecommendedProducts();
      }
    },

    async loadRecommendedProducts() {
      await this.fetchProducts();
      const allProducts = this.$store.getters['products/getAllProducts'];

      // Filtrează produsele care au cele mai multe tag-uri comune
      const scoredProducts = allProducts
        .map(product => ({
          ...product,
          matchScore: product.tags ? product.tags.filter(tag => this.userTags.includes(tag)).length : 0,
          isNew: this.isProductNew(product.createdAt),
          isPopular: product.popularity > 4.5 // Presupunem că există un câmp de popularitate
        }))
        .filter(p => p.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);

      this.recommendedProducts = scoredProducts.slice(0, 6);
    },

    isProductNew(createdAt) {
      if (!createdAt) return false;
      const today = new Date();
      const creationDate = new Date(createdAt);
      const daysDifference = Math.floor((today - creationDate) / (1000 * 60 * 60 * 24));
      return daysDifference <= 14; // Nou dacă a fost adăugat în ultimele 14 zile
    },

    truncateDescription(description) {
      return description.length > 120 ? description.substring(0, 120) + '...' : description;
    },
    
    goToProduct(productId) {
      this.$router.push(`/products/${productId}`);
    },

    restartQuiz() {
      this.startQuiz();
    }
  },
  async created() {
    if (!this.questions.length) {
      await this.fetchAllQuestions();
    }
    this.startQuiz();
  }
};
</script>

<style scoped>
.quiz-page {
  font-family: 'Montserrat', sans-serif;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  text-align: center;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #555;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.quiz-question {
  font-size: 1.8rem;
  margin-bottom: 2rem;
  font-weight: 300;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.quiz-option {
  padding: 1rem;
  border: 1px solid #ddd;
  background: #fff;
  transition: background 0.3s;
  cursor: pointer;
  font-size: 1.1rem;
  color: black;
}

.quiz-option:hover {
  background: #f7f7f7;
}

.quiz-results h2 {
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  font-size: 2.5rem;
  margin-bottom: 2.5rem;
  font-weight: 400;
  color: #333;
}

/* Stiluri pentru grid-ul de produse */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2.5rem;
  margin-top: 2.5rem;
}

/* Stiluri pentru cardul de produs - adaptat din ThemeCard */
.product-card {
  background-color: white;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  cursor: pointer;
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  position: relative;
  text-align: left;
}

.product-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.12);
}

.product-card-image {
  position: relative;
  height: 250px;
  overflow: hidden;
}

.product-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.product-card:hover .product-card-image img {
  transform: scale(1.05);
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.5rem;
}

.product-badge {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 400;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-family: 'Montserrat', sans-serif;
}

.product-badge.new {
  background-color: rgba(46, 204, 113, 0.8);
  color: white;
  backdrop-filter: blur(8px);
}

.product-status {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 400;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.3);
  font-family: 'Montserrat', sans-serif;
}

.product-status.popular {
  background-color: rgba(231, 76, 60, 0.4);
  color: white;
}

.product-card-content {
  padding: 2.5rem;
  position: relative;
}

.product-card-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 1px;
  background-color: #eee;
}

.product-name {
  font-size: 1.6rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: 400;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
}

.product-card:hover .product-name {
  color: #e74c3c;
}

.product-description {
  font-size: 1rem;
  color: #555;
  margin-bottom: 2rem;
  line-height: 1.6;
  font-weight: 300;
  font-family: 'Montserrat', sans-serif;
}

.product-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 1.2rem;
  font-weight: 500;
  color: #e74c3c;
  font-family: 'Montserrat', sans-serif;
}

.product-button {
  display: inline-flex;
  align-items: center;
  padding: 0.9rem 1.6rem;
  background-color: transparent;
  color: #333;
  border: 1px solid #333;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.9rem;
}

.button-arrow {
  margin-left: 8px;
  transition: transform 0.3s ease;
}

.product-card:hover .product-button {
  background-color: #333;
  color: white;
}

.product-card:hover .button-arrow {
  transform: translateX(4px);
}

.btn-restart {
  margin-top: 3rem;
  padding: 1rem 2.5rem;
  border: 1px solid #333;
  background: transparent;
  color: #333;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Montserrat', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.9rem;
}

.btn-restart:hover {
  background: #333;
  color: white;
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 1.5rem;
  }
  
  .product-card-image {
    height: 200px;
  }
  
  .product-card-content {
    padding: 2rem;
  }
  
  .product-name {
    font-size: 1.4rem;
  }
}

@media (max-width: 576px) {
  .products-grid {
    grid-template-columns: 1fr;
    max-width: 350px;
    margin-left: auto;
    margin-right: auto;
  }
  
  .product-overlay {
    padding: 1rem;
  }
  
  .product-status {
    top: 10px;
    right: 10px;
    padding: 0.4rem 0.8rem;
    font-size: 0.7rem;
  }
  
  .product-badge {
    top: 10px;
    left: 10px;
    padding: 0.4rem 0.8rem;
    font-size: 0.7rem;
  }
  
  .product-card-content {
    padding: 1.8rem 1.5rem;
  }
  
  .product-name {
    font-size: 1.4rem;
  }
  
  .product-description {
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
  }
  
  .product-button {
    padding: 0.8rem 1.4rem;
    font-size: 0.85rem;
  }
}
</style>