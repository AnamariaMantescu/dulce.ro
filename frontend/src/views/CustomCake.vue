<!-- client/src/views/CustomCake.vue -->
<template>
    <div class="custom-cake-page">
      <h1>Construiește-ți tortul perfect</h1>
      
      <div class="cake-builder">
        <div class="cake-preview">
          <!-- Previzualizare tort în timp real -->
          <CakePreview :cake="currentCake" />
          
          <!-- Afișare preț estimativ -->
          <div class="price-estimate">
            <h3>Preț estimativ: {{ totalPrice }} RON</h3>
          </div>
        </div>
        
        <div class="cake-steps">
          <!-- Pasul curent din proces -->
          <StepsIndicator :current-step="currentStep" :total-steps="7" />
          
          <!-- Pasul 1: Blaturi -->
          <div v-if="currentStep === 1" class="step-content">
            <h2>Alege tipul și numărul de blaturi</h2>
            <BlatSelector :blat-options="blatOptions" v-model="selectedBlats" />
          </div>
          
          <!-- Pasul 2: Creme -->
          <div v-if="currentStep === 2" class="step-content">
            <h2>Selectează cremele și ordinea lor</h2>
            <CremaSelector :crema-options="cremaOptions" v-model="selectedCremas" />
          </div>
          
          <!-- Implementează celelalte 5 pași similar -->
          
          <!-- Navigare între pași -->
          <div class="step-navigation">
            <button v-if="currentStep > 1" @click="prevStep" class="btn-prev">Înapoi</button>
            <button v-if="currentStep < 7" @click="nextStep" class="btn-next">Înainte</button>
            <button v-if="currentStep === 7" @click="addToCart" class="btn-add-to-cart">Adaugă în coș</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import CakePreview from '@/components/custom-cake/CakePreview.vue'
  import StepsIndicator from '@/components/custom-cake/StepsIndicator.vue'
  import BlatSelector from '@/components/custom-cake/BlatSelector.vue'
  import CremaSelector from '@/components/custom-cake/CremaSelector.vue'
  
  export default {
    components: {
      CakePreview,
      StepsIndicator,
      BlatSelector,
      CremaSelector
    },
    data() {
      return {
        currentStep: 1,
        selectedBlats: [],
        selectedCremas: [],
        selectedToppings: [],
        selectedDecorations: [],
        selectedSize: null,
        customMessage: '',
        imageFile: null
      }
    },
    computed: {
      blatOptions() {
        return this.$store.state.customCake.blatOptions
      },
      cremaOptions() {
        return this.$store.state.customCake.cremaOptions
      },
      currentCake() {
        return {
          blats: this.selectedBlats,
          cremas: this.selectedCremas,
          toppings: this.selectedToppings,
          decorations: this.selectedDecorations,
          size: this.selectedSize,
          message: this.customMessage,
          image: this.imageFile
        }
      },
      totalPrice() {
        // Calculează prețul total al tortului bazat pe selecții
        let price = 0
        
        // Adaugă costuri pentru blaturi
        this.selectedBlats.forEach(blat => {
          const blatOption = this.blatOptions.find(opt => opt.id === blat.id)
          if (blatOption) {
            price += blatOption.price_per_layer
          }
        })
        
        // Adaugă costuri pentru creme
        this.selectedCremas.forEach(crema => {
          const cremaOption = this.cremaOptions.find(opt => opt.id === crema.id)
          if (cremaOption) {
            price += cremaOption.price_per_layer
          }
        })
        
        // Implementează logica pentru restul componentelor
  
        // Aplică multiplicator pentru mărime
        if (this.selectedSize) {
          price *= this.selectedSize.price_multiplier
        }
        
        return price.toFixed(2)
      }
    },
    methods: {
      nextStep() {
        if (this.currentStep < 7) {
          this.currentStep++
        }
      },
      prevStep() {
        if (this.currentStep > 1) {
          this.currentStep--
        }
      },
      addToCart() {
        this.$store.dispatch('cart/addCustomCake', this.currentCake)
        this.$router.push('/cart')
      }
    },
    created() {
      this.$store.dispatch('customCake/fetchElements')
    }
  }
  </script>