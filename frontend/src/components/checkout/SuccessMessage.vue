<template>
    <div class="success-message">
      <div class="success-icon">
        <svg viewBox="0 0 24 24" width="60" height="60">
          <circle cx="12" cy="12" r="11" fill="#4caf50" />
          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="white" />
        </svg>
      </div>
      
      <h2>Comandă Finalizată cu Succes!</h2>
      <p class="success-message-text">Vă mulțumim pentru comandă. Detaliile comenzii au fost salvate și veți primi în curând un email de confirmare.</p>
      
      <div class="order-info">
        <div class="info-row">
          <span>Număr de referință:</span>
          <span class="reference">{{ orderReference }}</span>
        </div>
        <div class="info-row">
          <span>Data:</span>
          <span>{{ formattedDate }}</span>
        </div>
      </div>
      
      <p class="email-notice">Am trimis detaliile comenzii la adresa dvs. de email.</p>
      
      <div class="actions">
        <router-link to="/" class="home-btn">
          Înapoi la magazin
        </router-link>
        <router-link v-if="!isGuest" to="/account" class="account-btn">
          Vezi comenzile tale
        </router-link>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'SuccessMessage',
    
    props: {
      orderReference: {
        type: String,
        required: true
      },
      isGuest: {
        type: Boolean,
        default: false
      }
    },
    
    data() {
      return {
        date: new Date()
      };
    },
    
    computed: {
      formattedDate() {
        const day = this.date.getDate().toString().padStart(2, '0');
        const month = (this.date.getMonth() + 1).toString().padStart(2, '0');
        const year = this.date.getFullYear();
        const hours = this.date.getHours().toString().padStart(2, '0');
        const minutes = this.date.getMinutes().toString().padStart(2, '0');
        
        return `${day}.${month}.${year} ${hours}:${minutes}`;
      }
    }
  };
  </script>
  
  <style scoped>
  .success-message {
    background-color: #fff;
    padding: 3rem 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .success-icon {
    margin-bottom: 1.5rem;
  }
  
  h2 {
    color: #1d3557;
    margin-bottom: 1rem;
    font-size: 1.8rem;
  }
  
  .success-message-text {
    color: #4b5563;
    font-size: 1.1rem;
    margin-bottom: 2rem;
    line-height: 1.5;
  }
  
  .order-info {
    background-color: #f1faee;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    text-align: left;
  }
  
  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    font-size: 1rem;
    color: #333;
  }
  
  .info-row:last-child {
    margin-bottom: 0;
  }
  
  .reference {
    font-weight: bold;
    color: #1d3557;
    font-family: monospace;
    font-size: 1.05rem;
  }
  
  .email-notice {
    color: #6b7280;
    margin-bottom: 2rem;
    font-size: 0.95rem;
  }
  
  .actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 300px;
    margin: 0 auto;
  }
  
  .home-btn, .account-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
    text-align: center;
  }
  
  .home-btn {
    background-color: #1d3557;
    color: white;
  }
  
  .home-btn:hover {
    background-color: #14253d;
  }
  
  .account-btn {
    background-color: #f1faee;
    color: #1d3557;
    border: 1px solid #1d3557;
  }
  
  .account-btn:hover {
    background-color: #e8f5e9;
  }
  
  @media (max-width: 640px) {
    .success-message {
      padding: 2rem 1.5rem;
    }
  }
  </style>