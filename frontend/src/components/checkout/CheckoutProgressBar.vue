<template>
    <div class="progress-bar">
      <div class="progress-step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
        <div class="step-bubble">
          <template v-if="currentStep > 1">
            <i class="fas fa-check"></i>
          </template>
          <template v-else>1</template>
        </div>
        <span class="step-label">Informații Personale</span>
      </div>
      
      <div class="progress-connector" :class="{ active: currentStep > 1 }"></div>
      
      <div class="progress-step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
        <div class="step-bubble">
          <template v-if="currentStep > 2">
            <i class="fas fa-check"></i>
          </template>
          <template v-else>2</template>
        </div>
        <span class="step-label">Detalii Livrare</span>
      </div>
      
      <div class="progress-connector" :class="{ active: currentStep > 2 }"></div>
      
      <div class="progress-step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
        <div class="step-bubble">
          <template v-if="currentStep > 3">
            <i class="fas fa-check"></i>
          </template>
          <template v-else>3</template>
        </div>
        <span class="step-label">Plată</span>
      </div>
      
      <div class="progress-connector" :class="{ active: currentStep > 3 }"></div>
      
      <div class="progress-step" :class="{ active: currentStep >= 4 }">
        <div class="step-bubble">4</div>
        <span class="step-label">Confirmare</span>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'CheckoutProgressBar',
    
    props: {
      currentStep: {
        type: Number,
        required: true,
        validator: value => value >= 1 && value <= 4
      }
    }
  };
  </script>
  
  <style scoped>
  .progress-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0;
    margin-bottom: 2rem;
  }
  
  .progress-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 1;
  }
  
  .step-bubble {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: #f1faee;
    border: 2px solid #a8dadc;
    color: #a8dadc;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-bottom: 0.5rem;
    transition: all 0.3s ease;
  }
  
  .step-label {
    font-size: 0.85rem;
    color: #666;
    text-align: center;
    transition: color 0.3s ease;
  }
  
  .progress-connector {
    flex: 1;
    height: 3px;
    background-color: #a8dadc;
    margin: 0 0.5rem;
    position: relative;
    top: -18px; /* Half of step-bubble height */
    z-index: 0;
    transition: background-color 0.3s ease;
  }
  
  /* Active states */
  .progress-step.active .step-bubble {
    background-color: #2a9d8f;
    border-color: #2a9d8f;
    color: white;
  }
  
  .progress-step.active .step-label {
    color: #333;
    font-weight: 500;
  }
  
  /* Completed states */
  .progress-step.completed .step-bubble {
    background-color: #1d7d70;
    border-color: #1d7d70;
    color: white;
  }
  
  .progress-connector.active {
    background-color: #2a9d8f;
  }
  
  @media (max-width: 640px) {
    .progress-bar {
      flex-direction: column;
      align-items: flex-start;
      padding: 1rem;
    }
    
    .progress-step {
      flex-direction: row;
      align-items: center;
      width: 100%;
      margin-bottom: 1rem;
    }
    
    .step-bubble {
      margin-bottom: 0;
      margin-right: 1rem;
    }
    
    .step-label {
      text-align: left;
    }
    
    .progress-connector {
      width: 3px;
      height: 24px;
      margin: 0.25rem 0;
      margin-left: 18px;
      top: 0;
    }
  }
  </style>