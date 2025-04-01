// backend/routes/payment.js
const express = require('express');
const router = express.Router();
const Stripe = require('stripe');

console.log('Payment routes file is being loaded...');

// Initialize Stripe with your secret key
const stripe = Stripe('sk_test_51R7FEGQpGLybqVEL530ubCzxTCSylRakpA2xOOxUJlIivBpj0obkTL4ltpHGZFOGl1v07VgzPor4EYm9sLuBj15c00Ho2E9D9x');
console.log('Stripe initialized in payment.js');

// Simple test route
router.get('/test', (req, res) => {
  console.log('Test route accessed');
  res.json({ message: 'Payment routes are working!' });
});

// Create a checkout session
router.post('/create-checkout-session', async (req, res) => {
  console.log('Received request to /api/payment/create-checkout-session');
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  
  try {
    const { cartItems, customCake, total } = req.body;
    console.log('Cart items:', cartItems);
    console.log('Custom cake:', customCake);
    console.log('Total:', total);
    
    // Create line items for Stripe
    const lineItems = [];
    
    // Add regular cart items
    if (cartItems && cartItems.length > 0) {
      console.log('Processing cart items...');
      cartItems.forEach((item, index) => {
        console.log(`Processing item ${index}:`, item);
        lineItems.push({
          price_data: {
            currency: 'ron', // Romanian Lei
            product_data: {
              name: item.product.name || 'Product',
              description: item.product.description || '',
            },
            unit_amount: Math.round((item.product.price || 0) * 100), // Stripe requires amounts in cents
          },
          quantity: item.quantity || 1,
        });
      });
      console.log('Line items created:', lineItems);
    } else {
      console.log('No cart items found in request');
    }
    
    // Add custom cake if exists
    if (customCake) {
      console.log('Adding custom cake to line items...');
      lineItems.push({
        price_data: {
          currency: 'ron',
          product_data: {
            name: 'Tort Personalizat',
            description: 'Tort personalizat conform specificațiilor',
          },
          unit_amount: Math.round((customCake.totalPrice || 0) * 100),
        },
        quantity: 1,
      });
      console.log('Custom cake added to line items');
    }

    if (lineItems.length === 0) {
      console.log('No line items created. Sending error response...');
      return res.status(400).json({ error: 'No products in cart' });
    }

    console.log('Creating checkout session with Stripe...');
    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.origin || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:5173'}/cart`,
    });

    console.log('Checkout session created:', session.id);
    console.log('Checkout URL:', session.url);
    
    res.json({ id: session.id, url: session.url });
    console.log('Response sent to client');
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
    console.log('Error response sent to client');
  }
});

// Endpoint to check session status (optional, for order confirmation)
router.get('/session/:sessionId', async (req, res) => {
  console.log(`Received request to get session: ${req.params.sessionId}`);
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    console.log('Session retrieved:', session.id);
    res.json(session);
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Log all routes that have been set up
console.log('Payment routes set up:', 
  router.stack
    .filter(r => r.route)
    .map(r => {
      return {
        path: r.route?.path,
        methods: r.route?.methods ? Object.keys(r.route.methods) : []
      };
    })
);

module.exports = router;