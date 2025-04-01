// server/server.js
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const stripe = require('stripe')('sk_test_51R7FEGQpGLybqVEL530ubCzxTCSylRakpA2xOOxUJlIivBpj0obkTL4ltpHGZFOGl1v07VgzPor4EYm9sLuBj15c00Ho2E9D9x'); // Updated with your test key

console.log('Server initialization started...');

// Load payment routes
console.log('Loading payment routes...');
const paymentRoutes = require('./routes/payment');
console.log('Payment routes loaded');

// Inițializare Firebase
console.log('Initializing Firebase...');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
console.log('Firebase initialized');

const db = admin.firestore();

const app = express();

// Setup more detailed CORS
console.log('Setting up CORS...');
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Your frontend URLs
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
console.log('CORS configured');

// Debug incoming requests
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  next();
});

// Initialize JSON body parser
console.log('Setting up body parsers...');
app.use(express.json());
console.log('JSON body parser configured');

// Middleware pentru webhook Stripe (trebuie să fie raw pentru a verifica semnătura)
const stripeWebhookMiddleware = express.raw({type: 'application/json'});

// Direct test route
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint accessed');
  res.json({ status: 'ok', message: 'Server is running' });
});

// Register payment routes FIRST to prioritize them
console.log('Registering payment routes...');
app.use('/api/payment', paymentRoutes);
console.log('Payment routes registered');

// Direct checkout endpoint for testing
app.post('/api/direct-checkout', async (req, res) => {
  console.log('Direct checkout endpoint hit');
  console.log('Request body:', req.body);
  
  try {
    const { cartItems, customCake, total } = req.body;
    
    // Basic validation
    if (!cartItems || cartItems.length === 0) {
      console.log('No cart items - sending error');
      return res.status(400).json({ error: 'Cart cannot be empty' });
    }
    
    // Create line items
    const lineItems = cartItems.map(item => ({
      price_data: {
        currency: 'ron',
        product_data: {
          name: item.product.name || 'Product',
        },
        unit_amount: Math.round((item.product.price || 0) * 100),
      },
      quantity: item.quantity || 1,
    }));
    
    console.log('Line items created for direct checkout');
    
    // Create session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.origin || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:5173'}/cart`,
    });
    
    console.log('Direct checkout session created:', session.id);
    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Direct checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Încărcați celelalte rute
console.log('Registering other routes...');
app.use('/api/products', require('./routes/products'));
app.use('/api/custom-cake', require('./routes/customCake'));
app.use('/api/themes', require('./routes/themes'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
console.log('Other routes registered');

// Rută pentru crearea unui payment intent
app.post('/api/create-payment-intent', async (req, res) => {
  console.log('Create payment intent endpoint hit');
  try {
    const { amount, currency, metadata } = req.body;
    
    // Creează Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertim în cenți/bani
      currency: currency || 'ron',
      metadata: metadata || {},
      payment_method_types: ['card'],
    });
    
    // Stochează paymentIntent în Firestore pentru a putea urmări starea
    await db.collection('payment_intents').doc(paymentIntent.id).set({
      amount: amount,
      currency: currency || 'ron',
      status: paymentIntent.status,
      created: admin.firestore.FieldValue.serverTimestamp(),
      metadata: metadata || {}
    });
    
    // Returnează client secret pentru a fi folosit de frontend
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Eroare la crearea payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rută pentru verificarea stării unei plăți
app.get('/api/check-payment-status/:paymentIntentId', async (req, res) => {
  console.log(`Check payment status endpoint hit: ${req.params.paymentIntentId}`);
  try {
    const { paymentIntentId } = req.params;
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // Actualizează și în Firestore
    await db.collection('payment_intents').doc(paymentIntentId).update({
      status: paymentIntent.status,
      updated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // Convertim înapoi în unitatea principală (RON)
      currency: paymentIntent.currency,
      created: new Date(paymentIntent.created * 1000).toISOString(),
      metadata: paymentIntent.metadata
    });
  } catch (error) {
    console.error('Eroare la verificarea stării plății:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook pentru a primi actualizări de la Stripe
app.post('/webhook', stripeWebhookMiddleware, async (req, res) => {
  console.log('Stripe webhook endpoint hit');
  const signature = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      'whsec_YOUR_WEBHOOK_SECRET' // Înlocuiește cu secretul webhook-ului tău
    );
    
    // Gestionează evenimentele
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent ${paymentIntent.id} a reușit.`);
        
        // Actualizează în Firestore
        await db.collection('payment_intents').doc(paymentIntent.id).update({
          status: 'succeeded',
          updated: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Dacă există order_id în metadata, actualizează comanda
        if (paymentIntent.metadata && paymentIntent.metadata.order_id) {
          await db.collection('orders').doc(paymentIntent.metadata.order_id).update({
            'payment.status': 'finalizată',
            'status': 'în procesare',
            'updated_at': admin.firestore.FieldValue.serverTimestamp()
          });
        }
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log(`Plata pentru PaymentIntent ${failedPayment.id} a eșuat.`);
        
        // Actualizează în Firestore
        await db.collection('payment_intents').doc(failedPayment.id).update({
          status: 'failed',
          error: failedPayment.last_payment_error ? failedPayment.last_payment_error.message : 'Unknown error',
          updated: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Dacă există order_id în metadata, actualizează comanda
        if (failedPayment.metadata && failedPayment.metadata.order_id) {
          await db.collection('orders').doc(failedPayment.metadata.order_id).update({
            'payment.status': 'eșuată',
            'status': 'plată respinsă',
            'updated_at': admin.firestore.FieldValue.serverTimestamp()
          });
        }
        break;
        
      default:
        console.log(`Eveniment netratat: ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Eroare la procesarea webhook-ului:', error);
    res.status(400).json({ error: `Webhook Error: ${error.message}` });
  }
});

// Rută pentru finalizarea unei comenzi cu plată
app.post('/api/orders/finalize', async (req, res) => {
  console.log('Finalize order endpoint hit');
  try {
    const { orderData, paymentIntentId } = req.body;
    
    // Creează documentul comenzii
    const orderRef = await db.collection('orders').add({
      ...orderData,
      payment: {
        method: 'card',
        provider: 'stripe',
        payment_intent_id: paymentIntentId,
        status: 'în așteptare'
      },
      status: 'în așteptare',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Actualizează payment intent cu ID-ul comenzii
    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        order_id: orderRef.id
      }
    });
    
    // Actualizează și în Firestore
    await db.collection('payment_intents').doc(paymentIntentId).update({
      order_id: orderRef.id,
      updated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({
      success: true,
      order_id: orderRef.id,
      message: 'Comanda a fost înregistrată cu succes.'
    });
  } catch (error) {
    console.error('Eroare la finalizarea comenzii:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  res.status(500).json({ error: err.message });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Routes registered:', 
  app._router.stack
    .filter(r => r.route)
    .map(r => {
      return {
        path: r.route?.path,
        methods: r.route?.methods ? Object.keys(r.route.methods) : []
      };
    })
  );
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});