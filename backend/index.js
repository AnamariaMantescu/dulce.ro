const express = require("express");
const cors = require("cors");
const fs = require('fs');
const path = require('path');
require("dotenv").config();
const admin = require("firebase-admin");

// Create credential file for Google Application Default Credentials
const googleCredentialsPath = path.join(__dirname, 'google-credentials.json');
const serviceAccountObj = {
  "type": "service_account",
  "project_id": "cofetarie-artizanala",
  "private_key_id": "3839b6822bc3d7af7714fbfbb4e59fcd6ee645cd",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCrbSTnUn9YftRw\nz2ngHXRvG7z9L6FdL+/+cyH4/gbKsdKEeL7Ywzm0ZkLleqs3pbHD1OmBQ68wD7Y4\ncwvLZVRqdS/av5mSMLRB10TAY5FPDRh8HgzgShKjmpIkq8Rk5tLPnipjuGLKoK0p\n4t0XMzv1DBKa+mf7yMOwkAPkS1iOnYib7acZ04Dr+ju7QV3Lt197zyAnra5175tx\n2PvNHXwsssJd2dSPqwuMVqQZK/ERlfoYH9nqIWQO8bN1h5oW8c6kVxnqvPEaurxI\nJuGKB827bJu2NRzsccCoSCA+elohgsyebLBV/yIBXf4afX8K9yUzKzx6CXHXnsUp\nhKMvxjD1AgMBAAECggEAMXucYu+D1eIqZXPhrnEiKm5Z08W7cQBE6PCH9m0xPbIt\nv9Jw2HYmAoZgOgh6QuJf2VTsoEUO3TMz2MCQv4H854vzJ9QVusa3Sagfbt9u0uBH\nWJB+DAIltjcIh3BTjQK6CHcx6j4Puki+I3CafDdsT7RP7I9qk5nkruMrVGtRYTzr\n26gXEFXIskV7y4JR1AVmBdhOA0hCLMuA6KZJ3cbXuyjPICc86lBqBCzdzqirsad/\nQwtZv9IDC0bm8HnilIOB+J2SO7N0I5DZ6PQNPfuQnCtZ4/xFdbJsQc7+QM0EGre/\nYB3NAif0MqOofQBdgrO3BGp34QNnbXh0ahUzstxskwKBgQDb/KXMSb3PFKP/m1Ph\nx1AsH3LRYdOjBAPy9mpm7uDpwR+opbXQdqiC+yKe4f3XgVpAGs+QzKoVBH/1sD3H\n9aX8iJ4YP1O0w+iITFXqi0jC1bv87diOJF0sPXbq5sryTtHRdl9dltcY4MBIiKMC\n3DE5s81mNJtwLwKftNqCpwhIPwKBgQDHfWOuZMLQl8eAIdIXGCoIjC/CxZPRlF1t\n7Nn5irYncjtmTMawRuvH7MWmZm+H/ZKnPxtZd3yyTdtdqHrsKvh+swx01XC4p5it\nTf4XxuhBHlnNUqyp7ZZPJDxBhIqlXYsAQpEE74yF1ZnUmq9zpkueE58WIY0m9mcd\nPbNydylZywKBgQCCcoimYTvqpeSx15ugEJ6b63IccxQaYHEvC6wAqbo5IsnxKYJs\nwVAfi2f2KzBpME0iIkPfK13X5Lk0KXQZNLNe0mxdGIA8esdSu2FfGYTl8/Prgeae\nMzYE29W+aWkC0nZc7QKT7rRSDkQ3Pr7bHVMbUmGEL8HUfiviJE5Gl2Gz5QKBgHU1\nnR3YIgbBRvxn4rKjBf9jrqQ3xjQ7gfGWWjQeZgwjN/dRYOQtp1ceLLsqMJmsSUBu\n+bjFVcTFrgAHf8HHNZ3rwYPb7JDyF+irjIGX4tpv5L+Ytc5ZxBjX53dvUq76mTMb\n6W0G+n+gEvQxtqiyqndEfBJawD6GQ+uQVyEIFomlAoGAJ/dUxhqZ8lu2TN116QD4\n+CADkdAoajJxmu1Vmrtfo67mLtCbFLQuIrXTyyJ/KSaegcteWhwVeAPC63RJu6Et\ndPqH3KRGWhdbu/V7LXUeYoAWiJfqVaM2JE8nsHBxG1789LE6GLhqw022obu4d4FY\nu0hHNkW8pYtrNU/SWC84zpc=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@cofetarie-artizanala.iam.gserviceaccount.com",
  "client_id": "106142584775445274673",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40cofetarie-artizanala.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

try {
  fs.writeFileSync(googleCredentialsPath, JSON.stringify(serviceAccountObj, null, 2));
  console.log("✅ Google credentials file created successfully at:", googleCredentialsPath);
} catch (error) {
  console.error("❌ Error creating Google credentials file:", error);
}

// Set environment variables for Google auth
process.env.GOOGLE_APPLICATION_CREDENTIALS = googleCredentialsPath;
process.env.GCLOUD_PROJECT = "cofetarie-artizanala";

// Initialize Firebase with Application Default Credentials
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      // No explicit credential provided - will use ADC
    });
    console.log("✅ Firebase Admin initialized with Google Application Default Credentials");
  }
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
}

const Stripe = require("stripe");
const stripe = Stripe('sk_test_51R7FEGQpGLybqVEL530ubCzxTCSylRakpA2xOOxUJlIivBpj0obkTL4ltpHGZFOGl1v07VgzPor4EYm9sLuBj15c00Ho2E9D9x');

// Get Firestore with error handling
const { getFirestore } = require('firebase-admin/firestore');
let db;
try {
  db = getFirestore();
  console.log("✅ Firestore initialized successfully");
} catch (dbError) {
  console.error("❌ Firestore initialization failed:", dbError);
  throw new Error("Critical error: Could not initialize Firestore");
}

const app = express();
app.use(cors());
app.use(express.json());

// Rest of your existing endpoints remain the same
// ...

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
            success_url: `${req.headers.origin || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin || 'http://localhost:5173'}/cart`,
        });

        res.json({ id: session.id, url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/payment/save-order", async (req, res) => {
  console.log("📦 [save-order] Request received");

  try {
    const { sessionId, cartItems, customCake, userId } = req.body;

    console.log("🔑 sessionId:", sessionId);
    console.log("👤 userId:", userId);
    console.log("🛒 cartItems:", JSON.stringify(cartItems, null, 2));
    console.log("🎂 customCake:", JSON.stringify(customCake, null, 2));

    if (!sessionId) {
      console.warn("❌ No sessionId provided");
      return res.status(400).json({ error: "Session ID is required" });
    }

    console.log("🔍 Retrieving session from Stripe...");
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items']
    });

    console.log("✅ Stripe session retrieved:", session.id);
    
    let products = [];

    if (cartItems && cartItems.length > 0) {
      console.log("🧠 Mapping frontend cartItems...");
      products = cartItems.map(item => {
        if (!item.product) {
          console.warn("⚠️ item.product is undefined!", item);
          return {
            productId: 'unknown',
            name: 'Unknown Product',
            price: 0,
            quantity: 1
          };
        }
        return {
          productId: item.product?.id || 'unknown',
          name: item.product?.name || 'N/A',
          price: item.product?.price || 0,
          quantity: item.quantity || 1,
          image: item.product?.image || '',
          category: item.product?.category || '',
          subcategory: item.product?.subcategory || ''
        };
      });
    } else if (session.line_items && session.line_items.data.length > 0) {
      console.log("🧠 Mapping Stripe line_items...");
      products = session.line_items.data.map(item => ({
        name: item.description || 'Product',
        price: item.amount_total / 100,
        quantity: item.quantity,
        productId: 'unknown'
      }));
    } else {
      console.warn("⚠️ No cartItems or Stripe line_items found.");
    }

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

    if (userId) {
      orderData.userId = userId;
    }

    if (customCake) {
      orderData.customCake = customCake;
    }

    console.log("📝 Preparing to save order to Firestore");
    console.log("📊 Order data structure:", JSON.stringify(orderData, null, 2));
    
    // Check Firestore connection before saving
    console.log("🔌 Testing Firestore connection...");
    try {
      const testDoc = await db.collection("_test_connection").doc("test").set({
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log("✅ Firestore connection test successful");
    } catch (firestoreTestError) {
      console.error("❌ Firestore connection test failed:", firestoreTestError);
      console.error("Error details:", firestoreTestError.details || "No details available");
      console.error("Error code:", firestoreTestError.code || "No code available");
      throw new Error(`Firestore connection failed: ${firestoreTestError.message}`);
    }
    
    // Now try to save the actual order
    console.log("💾 Saving order to Firestore collection 'orders'...");
    const orderRef = await db.collection("orders").add(orderData);
    
    console.log("✅ Order saved successfully with ID:", orderRef.id);

    res.json({
      success: true,
      orderId: orderRef.id,
      message: "Comanda a fost salvată cu succes."
    });
  } catch (error) {
    console.error("❌ Error in save-order:", error);
    console.error("Error stack:", error.stack);
    
    // Log more detailed error information
    if (error.code) console.error("Error code:", error.code);
    if (error.details) console.error("Error details:", error.details);
    if (error.message) console.error("Error message:", error.message);
    
    res.status(500).json({ 
      error: error.message,
      code: error.code || "unknown",
      details: error.details || "No additional details" 
    });
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