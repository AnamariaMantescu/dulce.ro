<template>
  <section class="cake-builder-cta">
    <div class="container">
      <div class="cta-content">
        <h2 class="cta-title">{{ title }}</h2>
        <p class="cta-description">{{ description }}</p>
        <router-link :to="buttonLink" class="cta-button">
          {{ buttonText }}
        </router-link>
      </div>
      <div class="cta-image">
        <img v-if="image" :src="image" :alt="title">
        <div v-else class="placeholder-image"></div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CustomCakeCTA',
  props: {
    title: {
      type: String,
      default: 'Creează Tortul Tău Unic'
    },
    description: {
      type: String,
      default: 'Alege blaturile, cremele și decorațiunile preferate pentru a crea un tort personalizat exact pe gustul tău.'
    },
    buttonText: {
      type: String,
      default: 'Construiește-ți Tortul'
    },
    buttonLink: {
      type: String,
      default: '/cake-builder'
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1557308536-ee471ef2c390?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    backgroundColor: {
      type: String,
      default: '#fff'
    }
  }
}
</script>

<style scoped>
.cake-builder-cta {
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 60px;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.cta-content {
  flex: 1;
  padding: 60px 40px;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 300;
  margin-bottom: 20px;
  color: #333;
  line-height: 1.2;
}

.cta-description {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 30px;
  color: #666;
  max-width: 500px;
}

.cta-button {
  display: inline-block;
  padding: 14px 32px;
  background-color: #e91e63;
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  border-radius: 8px;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.3);
  transition: all 0.3s ease;
}

.cta-button:hover {
  background-color: #c2185b;
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(233, 30, 99, 0.4);
}

.cta-image {
  flex: 1;
  height: 500px;
  position: relative;
  overflow: hidden;
}

.cta-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s ease;
}

.cta-image:hover img {
  transform: scale(1.05);
}

.placeholder-image {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0),
                    linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0);
  background-size: 30px 30px;
  background-position: 0 0, 15px 15px;
}

/* Replace your existing media queries with these enhanced ones */
@media (max-width: 992px) {
  .container {
    flex-direction: column;
    gap: 0;
    border-radius: 12px;
    margin: 0 1rem;
  }
  
  .cta-content {
    width: 100%;
    padding: 40px 30px;
    order: 2;
    text-align: center;
  }
  
  .cta-image {
    width: 100%;
    height: 300px;
    order: 1;
    border-radius: 12px 12px 0 0;
  }
  
  .cta-title {
    font-size: 2rem;
  }
  
  .cta-button {
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .cake-builder-cta {
    padding: 2rem 0;
  }
  
  .container {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }
  
  .cta-content {
    padding: 30px 20px;
  }
  
  .cta-title {
    font-size: 1.75rem;
  }
  
  .cta-description {
    font-size: 1rem;
    margin-bottom: 25px;
  }
  
  .cta-button {
    padding: 12px 24px;
    font-size: 1rem;
  }
  
  .cta-image {
    height: 250px;
  }
}

@media (max-width: 480px) {
  .cta-title {
    font-size: 1.5rem;
  }
  
  .cta-image {
    height: 200px;
  }
}
</style>