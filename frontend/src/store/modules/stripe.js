// services/stripe.js
const BACKEND_URL = process.env.VUE_APP_API_URL || 'http://localhost:5000/api';

export default {
  /**
   * Creează un intent de plată pe server
   * @param {number} amount - Suma în RON (va fi convertită în bani)
   * @param {string} currency - Moneda (implicit 'ron')
   * @param {Object} metadata - Date adiționale pentru plată (detalii client, etc)
   * @returns {Promise<{clientSecret: string}>} - Client secret pentru plată
   */
  async createPaymentIntent(amount, currency = 'ron', metadata = {}) {
    try {
      const response = await fetch(`${BACKEND_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convertim în bani (Stripe folosește cea mai mică unitate monetară)
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
      const response = await fetch(`${BACKEND_URL}/check-payment-status/${paymentIntentId}`, {
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
  }
};