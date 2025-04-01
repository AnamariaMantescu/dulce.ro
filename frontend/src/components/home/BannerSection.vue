<template>
  <section class="banner-section">
    <div v-if="banner" class="banner-grid">
      <div class="banner-content">
        <h1 class="banner-title">{{ banner.title }}</h1>
        <p class="banner-subtitle">{{ banner.subtitle }}</p>
        <!-- <router-link 
          :to="banner.buttonLink || '/'" 
          class="banner-button"
        >
          {{ banner.buttonText }}
        </router-link> -->
      </div>

      <div class="banner-images">
        <div class="image-grid">
          <div v-for="(image, index) in banner.images" 
               :key="index"
               class="image-wrapper">
            <img :src="image"
                 :alt="'Artisanal Cake ' + (index + 1)"
                 :class="['banner-image', 'image-' + (index + 1)]"
                 @load="handleImageLoad(index)"
                 @error="handleImageError(index)" />
            <div v-if="!imagesLoaded[index]" class="image-loading">
              <span class="loading-spinner"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="banner-loading">
      <span class="loading-spinner"></span>
    </div>
  </section>
</template>

<script>
import { reactive, toRefs } from 'vue';

export default {
  name: 'BannerSection',
  props: {
    banner: {
      type: Object,
      required: true
    }
  },
  setup() {
    const state = reactive({
      imagesLoaded: {}
    });

    const handleImageLoad = (index) => {
      state.imagesLoaded[index] = true;
      console.log(`Image ${index} loaded successfully`);
    };

    const handleImageError = (index) => {
      console.error(`Error loading image ${index}`);
      // Aici puteți gestiona erorile de încărcare a imaginilor
    };

    return {
      ...toRefs(state),
      handleImageLoad,
      handleImageError
    };
  }
}
</script>

<style scoped>
.banner-section {
  width: 100%;
  min-height: 80vh; /* Change from 100vh to something shorter */
  position: relative;
  background-color: #fff;
}

.banner-grid {
  max-width: 1400px;
  margin: 0 auto; /* Add bottom margin */
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  min-height: 75vh; /* Change from height: calc(100vh - 4rem) to min-height */
  height: auto; 
}

.banner-content {
  padding: 2rem;
}

.banner-title {
  font-size: 3.5rem;
  font-weight: 300;
  color: #000;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  letter-spacing: -1px;
}

.banner-subtitle {
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 2.5rem;
  line-height: 1.6;
  font-weight: 300;
}

.banner-button {
  display: inline-block;
  padding: 1rem 2rem;
  background-color: #000;
  color: #fff;
  text-decoration: none;
  font-size: 1rem;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  border: 1px solid #000;
}

.banner-button:hover {
  background-color: #fff;
  color: #000;
}

.banner-images {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1rem;
  width: 100%;
  height: 80%;
  aspect-ratio: 1;
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  aspect-ratio: 1;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.banner-image:hover {
  transform: scale(1.02);
}

.image-loading,
.banner-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Add these adjustments to your existing BannerSection styles */
@media (max-width: 992px) {
  .banner-grid {
    grid-template-columns: 1fr;
    height: auto;
    min-height: auto;
    padding: 2rem 0;
    gap: 2rem;
  }

  .banner-content {
    text-align: center;
    padding: 1rem 2rem;
  }

  .banner-button {
    margin: 0 auto;
  }

  .image-grid {
    height: auto;
    aspect-ratio: 1;
    max-width: 500px; /* Constrain maximum width on mobile */
    margin: 0 auto;
  }
}

@media (max-width: 576px) {
  .banner-section {
    padding: 1rem;
    min-height: auto;
  }

  .banner-title {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .banner-subtitle {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }

  .image-grid {
    height: 300px;
  }
}
</style>
