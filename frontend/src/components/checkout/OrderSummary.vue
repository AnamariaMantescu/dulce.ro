<template>
    <div class="order-summary">
      <h2>Sumar Comandă</h2>
      
      <div class="summary-section">
        <h3>Produse ({{ orderData.items.length }})</h3>
        <ul class="product-list">
          <li v-for="item in orderData.items" :key="item.product.id" class="product-item">
            <div class="product-details">
              <div class="product-image" v-if="item.product.image">
                <img :src="item.product.image" :alt="item.product.name">
              </div>
              <div class="product-info">
                <h4>{{ item.product.name }}</h4>
                <span class="product-qty">x{{ item.quantity }}</span>
              </div>
            </div>
            <span class="product-price">{{ (item.product.price * item.quantity).toFixed(2) }} lei</span>
          </li>
        </ul>
      </div>
      
      <div class="summary-section totals">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>{{ orderData.subtotal.toFixed(2) }} lei</span>
        </div>
        <div class="totals-row">
          <span>Cost Livrare</span>
          <span>{{ orderData.shipping.toFixed(2) }} lei</span>
        </div>
        <div class="totals-row total">
          <span>Total</span>
          <span>{{ orderData.total.toFixed(2) }} lei</span>
        </div>
      </div>
      
      <div class="summary-section" v-if="orderData.paymentMethod">
        <h3>Metoda de Plată</h3>
        <div class="payment-method">
          <span v-if="orderData.paymentMethod === 'card'">
            <i class="fas fa-credit-card"></i> Card de credit/debit
          </span>
          <span v-else-if="orderData.paymentMethod === 'cash'">
            <i class="fas fa-money-bill-wave"></i> Numerar la livrare
          </span>
        </div>
      </div>
      
      <div class="tax-info">
        <small>* Prețurile includ TVA</small>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'OrderSummary',
    
    props: {
      orderData: {
        type: Object,
        required: true
      }
    }
  };
  </script>
  
  <style scoped>
  .order-summary {
    background-color: #fff;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    position: sticky;
    top: 2rem;
  }
  
  h2 {
    color: #1d3557;
    margin-bottom: 1.5rem;
    font-size: 1.3rem;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 0.5rem;
  }
  
  h3 {
    font-size: 1.1rem;
    color: #333;
    margin-bottom: 1rem;
  }
  
  .summary-section {
    margin-bottom: 1.5rem;
  }
  
  .product-list {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 300px;
    overflow-y: auto;
  }
  
  .product-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .product-details {
    display: flex;
    align-items: center;
    flex: 1;
  }
  
  .product-image {
    width: 50px;
    height: 50px;
    margin-right: 0.75rem;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .product-info h4 {
    margin: 0 0 0.25rem 0;
    font-size: 0.95rem;
    color: #333;
  }
  
  .product-qty {
    font-size: 0.85rem;
    color: #666;
  }
  
  .product-price {
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
    margin-left: 1rem;
  }
  
  .totals {
    border-top: 1px solid #ddd;
    padding-top: 1rem;
  }
  
  .totals-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    font-size: 0.95rem;
    color: #555;
  }
  
  .totals-row.total {
    font-size: 1.1rem;
    font-weight: bold;
    color: #333;
    border-top: 1px solid #ddd;
    padding-top: 0.75rem;
    margin-top: 0.75rem;
  }
  
  .payment-method {
    padding: 0.5rem 0;
    font-size: 0.95rem;
    color: #555;
  }
  
  .payment-method i {
    margin-right: 0.5rem;
    color: #1d3557;
  }
  
  .tax-info {
    text-align: right;
    font-size: 0.8rem;
    color: #777;
    margin-top: 1rem;
  }
  
  @media (max-width: 768px) {
    .order-summary {
      position: static;
      margin-top: 1.5rem;
    }
  }
  </style>