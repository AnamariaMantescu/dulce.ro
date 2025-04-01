<template>
  <div class="gift-boxes-page">
    <div class="page-header">
      <h1>Cutii Cadou</h1>
      <p>Descoperă selecția noastră de cutii cadou cu deserturi artizanale</p>
    </div>

    <div class="gift-boxes-grid">
      <div v-for="box in giftBoxes" :key="box.id" class="gift-box-card">
        <img :src="box.image" :alt="box.name" class="gift-box-image">
        <div class="gift-box-content">
          <h3>{{ box.name }}</h3>
          <p class="gift-box-description">{{ box.description }}</p>
          <div class="gift-box-price">{{ box.price }} lei</div>
          <button class="add-to-cart-button" @click="addToCart(box)">Adaugă în coș</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GiftBoxes',
  data() {
    return {
      giftBoxes: [
        {
          id: 1,
          name: 'Cutie Surpriză',
          description: 'O selecție variată de 12 prăjituri artizanale, perfecte pentru orice ocazie',
          price: 120,
          image: '/images/gift-boxes/surprise-box.jpg'
        },
        {
          id: 2,
          name: 'Cutie Deluxe',
          description: 'Colecție premium de 18 prăjituri și bomboane de ciocolată artizanale',
          price: 180,
          image: '/images/gift-boxes/deluxe-box.jpg'
        },
        {
          id: 3,
          name: 'Cutie Aniversară',
          description: 'Set special de 8 prăjituri și un mini tort, ideal pentru aniversări',
          price: 150,
          image: '/images/gift-boxes/birthday-box.jpg'
        },
        {
          id: 4,
          name: 'Cutie Sezonală',
          description: 'Selecție de 10 prăjituri inspirate din aromele sezonului',
          price: 130,
          image: '/images/gift-boxes/seasonal-box.jpg'
        }
      ]
    }
  },
  methods: {
    addToCart(product) {
      this.$store.dispatch('cart/addItem', product)
      this.$store.dispatch('notifications/add', {
        type: 'success',
        message: `${product.name} a fost adăugat în coș`
      })
    }
  }
}
</script>

<style scoped>
.gift-boxes-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 300;
  margin-bottom: 1rem;
}

.page-header p {
  font-size: 1.2rem;
  color: #666;
}

.gift-boxes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.gift-box-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.gift-box-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.gift-box-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.gift-box-content {
  padding: 1.5rem;
}

.gift-box-content h3 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.gift-box-description {
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
}

.gift-box-price {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.add-to-cart-button {
  width: 100%;
  padding: 0.8rem;
  background-color: #000;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-to-cart-button:hover {
  background-color: #333;
}

@media (max-width: 768px) {
  .gift-boxes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .gift-boxes-grid {
    grid-template-columns: 1fr;
  }
}
</style> 