// services/stripe.js
// Define API URL using Vite's environment variables approach
const API_URL = import.meta.env ? import.meta.env.VITE_API_URL || 'https://backend-ciyopt2dv-anamaria-mantescus-projects.vercel.app/api' : 'https://backend-ciyopt2dv-anamaria-mantescus-projects.vercel.app/api';

export default {
  /**
   * Creează un intent de plată pe server
   * @param {number} amount - Suma în RON
   * @param {string} currency - Moneda (implicit 'ron')
   * @param {Object} metadata - Date adiționale pentru plată (detalii client, etc)
   * @returns {Promise<string>} - Client secret pentru plată
   */
  async createPaymentIntent(amount, currency = 'ron', metadata = {}) {
    try {
      const response = await fetch(`${API_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount, 
          currency,
          metadata
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Eroare la crearea intenției de plată');
      }

      const data = await response.json();
      return data.clientSecret;
    } catch (error) {
      console.error('Eroare la crearea intenției de plată:', error);
      throw error;
    }
  },

  /**
   * Verifică starea unei plăți
   * @param {string} paymentIntentId - ID-ul intenției de plată
   * @returns {Promise<Object>} - Detalii despre starea plății
   */
  async checkPaymentStatus(paymentIntentId) {
    try {
      const response = await fetch(`${API_URL}/check-payment-status/${paymentIntentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Eroare la verificarea stării plății');
      }

      return await response.json();
    } catch (error) {
      console.error('Eroare la verificarea stării plății:', error);
      throw error;
    }
  },

  /**
   * Finalizează o comandă după procesarea plății
   * @param {Object} orderData - Datele comenzii
   * @param {string} paymentIntentId - ID-ul intenției de plată
   * @returns {Promise<Object>} - Rezultatul finalizării comenzii
   */
  async finalizeOrder(orderData, paymentIntentId) {
    try {
      const response = await fetch(`${API_URL}/orders/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderData,
          paymentIntentId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Eroare la finalizarea comenzii');
      }

      return await response.json();
    } catch (error) {
      console.error('Eroare la finalizarea comenzii:', error);
      throw error;
    }
  }
};