// frontend/src/services/stripeService.js
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/payment';

const stripeService = {
  // Create a checkout session
  createCheckoutSession: async (cartItems, customCake, total) => {
    try {
      const response = await axios.post(`${API_URL}/create-checkout-session`, {
        cartItems,
        customCake,
        total
      });
      return response.data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },
  
  // Get checkout session details
  getSession: async (sessionId) => {
    try {
      const response = await axios.get(`${API_URL}/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  }
};

export default stripeService;