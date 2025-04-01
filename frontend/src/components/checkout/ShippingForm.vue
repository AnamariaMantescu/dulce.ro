<template>
    <div class="shipping-form">
      <h2>Detalii de Livrare</h2>
      
      <form @submit.prevent="onContinue">
        <div class="form-group">
          <label for="address">Adresă*</label>
          <input 
            id="address" 
            v-model="form.address" 
            type="text" 
            required
            placeholder="Strada, Număr, Bloc, Apartament"
          >
        </div>
        
        <div class="form-grid">
          <div class="form-group">
            <label for="city">Oraș*</label>
            <input 
              id="city" 
              v-model="form.city" 
              type="text" 
              required
              placeholder="Introduceți orașul"
            >
          </div>
          
          <div class="form-group">
            <label for="county">Județ*</label>
            <select 
              id="county" 
              v-model="form.county" 
              required
            >
              <option value="" disabled selected>Selectați județul</option>
              <option v-for="county in counties" :key="county" :value="county">
                {{ county }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="zipCode">Cod Poștal*</label>
            <input 
              id="zipCode" 
              v-model="form.zipCode" 
              type="text" 
              required
              placeholder="Ex: 123456"
            >
          </div>
        </div>
        
        <div class="form-group">
          <label for="deliveryDate">Data Livrării*</label>
          <input 
            id="deliveryDate" 
            v-model="form.deliveryDate" 
            type="date" 
            required
            :min="minDeliveryDate"
          >
        </div>
        
        <div class="form-group">
          <label for="timeSlot">Interval Orar*</label>
          <select 
            id="timeSlot" 
            v-model="form.deliveryTimeSlot" 
            required
          >
            <option value="" disabled selected>Selectați intervalul orar</option>
            <option value="9-12">9:00 - 12:00</option>
            <option value="12-15">12:00 - 15:00</option>
            <option value="15-18">15:00 - 18:00</option>
            <option value="18-21">18:00 - 21:00</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="specialInstructions">Instrucțiuni speciale (opțional)</label>
          <textarea 
            id="specialInstructions" 
            v-model="form.specialInstructions" 
            rows="4"
            placeholder="Ex: Lăsați pachetul la vecin, cod interfon, etc."
          ></textarea>
        </div>
        
        <div class="form-actions">
          <button type="button" class="back-btn" @click="goBack">
            Înapoi
          </button>
          <button type="submit" class="continue-btn">
            Continuă la plată
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ShippingForm',
    
    props: {
      shippingData: {
        type: Object,
        default: () => ({
          address: '',
          city: '',
          county: '',
          zipCode: '',
          deliveryDate: '',
          deliveryTimeSlot: '',
          specialInstructions: ''
        })
      }
    },
    
    data() {
      return {
        form: {
          address: this.shippingData.address || '',
          city: this.shippingData.city || '',
          county: this.shippingData.county || '',
          zipCode: this.shippingData.zipCode || '',
          deliveryDate: this.shippingData.deliveryDate || '',
          deliveryTimeSlot: this.shippingData.deliveryTimeSlot || '',
          specialInstructions: this.shippingData.specialInstructions || ''
        },
        counties: [
          'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani', 'Brăila',
          'Brașov', 'București', 'Buzău', 'Călărași', 'Caraș-Severin', 'Cluj', 'Constanța',
          'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara',
          'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți', 'Mureș', 'Neamț', 'Olt',
          'Prahova', 'Sălaj', 'Satu Mare', 'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea',
          'Vaslui', 'Vâlcea', 'Vrancea'
        ]
      };
    },
    
    computed: {
      minDeliveryDate() {
        const today = new Date();
        // Add 2 days for minimum delivery date
        const minDate = new Date(today);
        minDate.setDate(today.getDate() + 2);
        
        return minDate.toISOString().split('T')[0];
      }
    },
    
    methods: {
      onContinue() {
        this.$emit('shipping-data-updated', { ...this.form });
        this.$emit('continue');
      },
      
      goBack() {
        this.$emit('go-back');
      }
    }
  };
  </script>
  
  <style scoped>
  .shipping-form {
    background-color: #fff;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  
  h2 {
    color: #1d3557;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 0.5rem;
  }
  
  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #457b9d;
    box-shadow: 0 0 0 2px rgba(69, 123, 157, 0.2);
  }
  
  .form-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
  }
  
  .back-btn, .continue-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-weight: 600;
    text-decoration: none;
    text-align: center;
    transition: all 0.3s ease;
  }
  
  .back-btn {
    background-color: #f1faee;
    color: #1d3557;
    border: 1px solid #1d3557;
  }
  
  .back-btn:hover {
    background-color: #e5f0e9;
  }
  
  .continue-btn {
    background-color: #2a9d8f;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  .continue-btn:hover {
    background-color: #1d7d70;
  }
  
  @media (max-width: 640px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
  }
  </style>