<template>
  <div class="quiz-recommendations">
    <div class="quiz-cta">
      <div class="quiz-content">
        <h2>Descoperă desertul perfect pentru tine</h2>
        <p>Răspunde la câteva întrebări simple și îți vom recomanda produsele care se potrivesc gusturilor tale.</p>
        <div class="quiz-button-wrapper">
          <router-link to="/quiz" class="quiz-button">
            <span>Începe quiz-ul</span>
            <span class="button-arrow">→</span>
          </router-link>
        </div>
      </div>
      <div class="quiz-image">
        <div class="image-container">
          <img src="@/assets/images/logo-dulce.png" alt="Logo Dulce" class="site-logo" :class="{ 'scrolled': isScrolled }">
          <div class="floating-elements">
            <div class="floating-element element-1"></div>
            <div class="floating-element element-2"></div>
            <div class="floating-element element-3"></div>
            <div class="floating-element element-4"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuizRecommendations',
  data() {
    return {
      isScrolled: false
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    handleScroll() {
      this.isScrolled = window.scrollY > 50;
    }
  }
}
</script>

<style scoped>
.quiz-recommendations {
  margin: 5rem 0;
  padding: 0 2rem;
  font-family: 'Montserrat', sans-serif;
}

.quiz-cta {
  display: flex;
  background: linear-gradient(135deg, #fcf8f3 0%, #fef5ec 100%);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
  position: relative;
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.quiz-cta:hover {
  transform: translateY(-10px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.12);
}

.quiz-content {
  flex: 1.2;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.quiz-content::before {
  content: '';
  position: absolute;
  top: 50px;
  left: 50px;
  width: 70px;
  height: 70px;
  border: 3px solid rgba(139, 69, 19, 0.1);
  border-radius: 50%;
  z-index: -1;
}

.quiz-content::after {
  content: '';
  position: absolute;
  bottom: 50px;
  right: 50px;
  width: 40px;
  height: 40px;
  background-color: rgba(139, 69, 19, 0.05);
  border-radius: 8px;
  transform: rotate(45deg);
  z-index: -1;
}

.quiz-image {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f7e8d8 0%, #fceee5 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.site-logo {
  max-width: 60%;
  position: relative;
  z-index: 2;
  transition: transform 0.5s ease;
  filter: drop-shadow(0 10px 15px rgba(139, 69, 19, 0.15));
}

.quiz-cta:hover .site-logo {
  transform: scale(1.05) rotate(2deg);
}

h2 {
  font-size: 2.8rem;
  color: #8B4513;
  margin-bottom: 1.5rem;
  font-weight: 400;
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  position: relative;
  line-height: 1.2;
}

h2::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 0;
  width: 80px;
  height: 2px;
  background-color: rgba(139, 69, 19, 0.3);
}

p {
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 2.5rem;
  line-height: 1.8;
  font-weight: 300;
}

.quiz-button-wrapper {
  display: inline-block;
  position: relative;
}

.quiz-button {
  display: inline-flex;
  align-items: center;
  background-color: transparent;
  color: #8B4513;
  padding: 1rem 2rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  border: 1.5px solid #8B4513;
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.button-arrow {
  margin-left: 12px;
  transition: transform 0.3s ease;
}

.quiz-button:hover {
  background-color: #8B4513;
  color: white;
}

.quiz-button:hover .button-arrow {
  transform: translateX(5px);
}

/* Floating Elements */
.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.floating-element {
  position: absolute;
  border-radius: 50%;
  opacity: 0.8;
}

.element-1 {
  top: 20%;
  left: 20%;
  width: 50px;
  height: 50px;
  background-color: rgba(231, 76, 60, 0.1);
  animation: float1 8s infinite ease-in-out;
}

.element-2 {
  top: 60%;
  left: 15%;
  width: 35px;
  height: 35px;
  background-color: rgba(46, 204, 113, 0.1);
  animation: float2 10s infinite ease-in-out;
}

.element-3 {
  top: 30%;
  right: 20%;
  width: 60px;
  height: 60px;
  background-color: rgba(241, 196, 15, 0.1);
  animation: float3 12s infinite ease-in-out;
}

.element-4 {
  bottom: 15%;
  right: 10%;
  width: 45px;
  height: 45px;
  background-color: rgba(52, 152, 219, 0.1);
  animation: float4 9s infinite ease-in-out;
}

@keyframes float1 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(-15px, 10px) rotate(5deg); }
  50% { transform: translate(5px, 20px) rotate(0deg); }
  75% { transform: translate(10px, -15px) rotate(-5deg); }
}

@keyframes float2 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(10px, 15px) rotate(-5deg); }
  50% { transform: translate(-10px, 10px) rotate(0deg); }
  75% { transform: translate(-15px, -10px) rotate(5deg); }
}

@keyframes float3 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(-10px, -15px) rotate(-3deg); }
  50% { transform: translate(-5px, 10px) rotate(0deg); }
  75% { transform: translate(15px, 5px) rotate(3deg); }
}

@keyframes float4 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(15px, -10px) rotate(5deg); }
  50% { transform: translate(5px, -20px) rotate(0deg); }
  75% { transform: translate(-10px, 15px) rotate(-5deg); }
}

/* Responsive styles */
@media (max-width: 1024px) {
  .quiz-content {
    padding: 3rem;
  }
  
  h2 {
    font-size: 2.4rem;
  }
}

@media (max-width: 768px) {
  .quiz-cta {
    flex-direction: column-reverse;
    border-radius: 15px;
  }
  
  .quiz-content {
    padding: 3rem 2rem;
    text-align: center;
  }
  
  .quiz-content::before,
  .quiz-content::after {
    display: none;
  }
  
  h2 {
    font-size: 2.2rem;
  }
  
  h2::after {
    left: 50%;
    transform: translateX(-50%);
  }
  
  p {
    font-size: 1.1rem;
  }
  
  .quiz-button {
    margin: 0 auto;
  }
  
  .quiz-image {
    min-height: 220px;
    padding: 2rem;
  }
}

@media (max-width: 480px) {
  .quiz-recommendations {
    margin: 3rem 0;
    padding: 0 1rem;
  }
  
  .quiz-content {
    padding: 2.5rem 1.5rem;
  }
  
  h2 {
    font-size: 1.8rem;
  }
  
  p {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
  
  .quiz-button {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }
  
  .element-1, .element-2, .element-3, .element-4 {
    transform: scale(0.7);
  }
}
</style>