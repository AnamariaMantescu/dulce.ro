const express = require("express");
const cors = require("cors");
require("dotenv").config();
const admin = require("firebase-admin");
// const serviceAccount = require("./serviceAccountKey.json");
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
const Stripe = require("stripe");
const stripe = Stripe('sk_test_51R7FEGQpGLybqVEL530ubCzxTCSylRakpA2xOOxUJlIivBpj0obkTL4ltpHGZFOGl1v07VgzPor4EYm9sLuBj15c00Ho2E9D9x');

// // Inițializare Firebase Admin SDK
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com"
// });
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const app = express();
// Update your CORS configuration
app.use(cors({
  origin: 'https://dulce-ro.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Verificare că backend-ul funcționează
app.get("/", (req, res) => {
    res.send("Backend Express funcționează!");
});

// Health check endpoint for frontend connection testing
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Serverul este funcțional!" });
});

// Endpoint pentru a prelua utilizatorii din Firestore
app.get("/test", async (req, res) => {
    try {
        const snapshot = await db.collection("users").get();
        let users = [];
        snapshot.forEach((doc) => users.push({ id: doc.id, ...doc.data() }));
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Eroare la citirea datelor." });
    }
});

app.post("/api/payment/create-checkout-session", async (req, res) => {
    try {
        const { cartItems, customCake, total } = req.body;
        
        // Create line items for Stripe
        const lineItems = [];
        
        // Add regular cart items
        if (cartItems && cartItems.length > 0) {
            cartItems.forEach(item => {
                lineItems.push({
                    price_data: {
                        currency: 'ron', // Romanian Lei
                        product_data: {
                            name: item.product.name || 'Produs',
                            description: item.product.description || '',
                        },
                        unit_amount: Math.round((item.product.price || 0) * 100), // Stripe requires amounts in cents
                    },
                    quantity: item.quantity || 1,
                });
            });
        }
        
        // Add custom cake if exists
        if (customCake) {
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
        }

        // If no items, respond with error
        if (lineItems.length === 0) {
            return res.status(400).json({ error: "Coșul este gol." });
        }

        // Create the checkout session with phone number collection
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            shipping_address_collection: {
                allowed_countries: ['RO'], // Romania
            },
            phone_number_collection: {
                enabled: true
            },
            success_url: `${req.headers.origin || 'https://dulce-ro.vercel.app'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin || 'https://dulce-ro.vercel.app'}/cart`,
        });

        res.json({ id: session.id, url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/payment/save-order", async (req, res) => {
    try {
      const { sessionId, cartItems, customCake, userId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }
      
      // Retrieve the session from Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items']
      });
      
      // Create an array of product details from cart items
      let products = [];
      
      // If cartItems were sent directly from the frontend
      if (cartItems && cartItems.length > 0) {
        products = cartItems.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image || '',
          category: item.product.category || '',
          subcategory: item.product.subcategory || ''
        }));
      } 
      // If no cartItems in request, try to rebuild from Stripe line_items
      else if (session.line_items && session.line_items.data.length > 0) {
        products = session.line_items.data.map(item => ({
          name: item.description || 'Product',
          price: item.amount_total / 100, // Convert from cents
          quantity: item.quantity,
          productId: 'unknown'
        }));
      }
      
      // Create the order data object
      const orderData = {
        stripeSessionId: sessionId,
        amount: session.amount_total / 100,
        currency: session.currency,
        paymentStatus: session.payment_status,
        customerDetails: {
          name: session.customer_details?.name || '',
          email: session.customer_details?.email || '',
          phone: session.customer_details?.phone || '',
          address: session.customer_details?.address || {}
        },
        products: products,
        created: admin.firestore.FieldValue.serverTimestamp(),
        status: 'new'
      };
      
      // Add user ID if provided
      if (userId) {
        orderData.userId = userId;
      }
      
      // Add custom cake if it exists
      if (customCake) {
        orderData.customCake = customCake;
      }
      
      const orderRef = await db.collection("orders").add(orderData);
      
      res.json({ 
        success: true, 
        orderId: orderRef.id,
        message: "Comanda a fost salvată cu succes."
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

app.get("/api/payment/session/:sessionId", async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.params.sessionId, {
            expand: ['line_items']
        });
        
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Serverul rulează pe portul ${PORT}`));