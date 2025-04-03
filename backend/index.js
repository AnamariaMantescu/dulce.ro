const express = require("express");
const cors = require("cors");
const axios = require('axios');
require("dotenv").config();
const admin = require("firebase-admin");

// Initialize Firebase Admin for non-critical operations 
try {
  const serviceAccount = {
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

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error("Firebase SDK initialization error:", error);
}

// Firebase Web API Key - This is not the service account key, it's the web API key
// You can find it in Firebase Console → Project Settings → General → Your apps (Web app)
const FIREBASE_API_KEY = "AIzaSyBNcxh5A8ysLvHi7wskWw8CMhXl0jHrp-Y"; // Replace with your actual Web API key

// Firebase project ID
const FIREBASE_PROJECT_ID = "cofetarie-artizanala"; 

const Stripe = require("stripe");
const stripe = Stripe('sk_test_51R7FEGQpGLybqVEL530ubCzxTCSylRakpA2xOOxUJlIivBpj0obkTL4ltpHGZFOGl1v07VgzPor4EYm9sLuBj15c00Ho2E9D9x');

const app = express();
app.use(cors());
app.use(express.json());

// Function to save order to Firestore via REST API instead of SDK
async function saveOrderToFirestoreREST(orderData) {
  console.log("📞 Using REST API to save order to Firestore");
  
  try {
    // Convert JavaScript values to Firestore data types
    const firestoreFields = {};
    
    // Convert orderData to Firestore fields format
    const convertToFirestoreValue = (value) => {
      if (value === null || value === undefined) {
        return { nullValue: null };
      } else if (typeof value === 'string') {
        return { stringValue: value };
      } else if (typeof value === 'number') {
        return { doubleValue: value };
      } else if (typeof value === 'boolean') {
        return { booleanValue: value };
      } else if (value instanceof Date) {
        return { timestampValue: value.toISOString() };
      } else if (Array.isArray(value)) {
        return { 
          arrayValue: { 
            values: value.map(item => convertToFirestoreValue(item)) 
          } 
        };
      } else if (typeof value === 'object') {
        const fields = {};
        for (const [key, val] of Object.entries(value)) {
          fields[key] = convertToFirestoreValue(val);
        }
        return { mapValue: { fields } };
      }
      return { stringValue: String(value) };
    };
    
    // Process each field in orderData
    for (const [key, value] of Object.entries(orderData)) {
      // Skip the 'created' field which uses FieldValue.serverTimestamp()
      if (key === 'created') {
        firestoreFields[key] = { 
          timestampValue: new Date().toISOString()
        };
      } else {
        firestoreFields[key] = convertToFirestoreValue(value);
      }
    }
    
    // Create the request body
    const documentData = {
      fields: firestoreFields
    };
    
    // Generate a random document ID
    const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // FIXED: Correct URL format for Firestore REST API
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/orders?documentId=${randomId}`;
    
    console.log("🔗 Making REST API request to Firestore");
    const response = await axios.post(url, documentData);
    
    console.log("✅ Order saved via REST API with ID:", randomId);
    return { id: randomId, ...response.data };
  } catch (error) {
    console.error("❌ REST API error:", error.response ? error.response.data : error.message);
    throw new Error(`Failed to save via REST API: ${error.message}`);
  }
}

// Verificare că backend-ul funcționează
app.get("/", (req, res) => {
    res.send("Backend Express funcționează!");
});

// Health check endpoint for frontend connection testing
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Serverul este funcțional!" });
});

// Endpoint to retrieve local backups
app.get("/api/orders/local-backup", (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const backupPath = path.join(__dirname, 'order_backups.json');
    
    if (fs.existsSync(backupPath)) {
      const backups = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      res.json(backups);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pentru a prelua utilizatorii din Firestore
app.get("/test", async (req, res) => {
    try {
        // Try to use the REST API if the SDK fails
        try {
            // Try SDK first
            const db = admin.firestore();
            const snapshot = await db.collection("users").get();
            let users = [];
            snapshot.forEach((doc) => users.push({ id: doc.id, ...doc.data() }));
            res.json(users);
        } catch (sdkError) {
            console.error("SDK Error, falling back to REST API:", sdkError);
            // Fallback to REST API
            const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users`;
            const response = await axios.get(url);
            
            const users = response.data.documents ? response.data.documents.map(doc => {
                const id = doc.name.split('/').pop();
                const data = {};
                for (const [key, value] of Object.entries(doc.fields || {})) {
                    // Extract the actual value from Firestore format
                    data[key] = Object.values(value)[0];
                }
                return { id, ...data };
            }) : [];
            
            res.json(users);
        }
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
      created: new Date().toISOString(), // Use simple date instead of FieldValue
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
    
    // First try to use the Firebase Admin SDK
    let orderRef;
    let orderId;
    try {
      console.log("🔌 Attempting to use Firebase Admin SDK first...");
      const db = admin.firestore();
      orderRef = await db.collection("orders").add({
        ...orderData,
        created: admin.firestore.FieldValue.serverTimestamp() // This only works with the SDK
      });
      orderId = orderRef.id;
      console.log("✅ Order saved successfully with SDK, ID:", orderId);
    } catch (sdkError) {
      console.error("❌ SDK error, falling back to REST API:", sdkError);
      
      // Fall back to REST API if SDK fails
      try {
        const result = await saveOrderToFirestoreREST(orderData);
        orderId = result.id;
        console.log("✅ Order saved via REST API with ID:", orderId);
      } catch (restError) {
        console.error("❌ REST API error:", restError);
        
        // Last resort - save to a local file on Render
        try {
          const fs = require('fs');
          const path = require('path');
          const backupPath = path.join(__dirname, 'order_backups.json');
          
          // Read existing backups if any
          let backups = [];
          try {
            if (fs.existsSync(backupPath)) {
              backups = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
            }
          } catch (readError) {
            console.error("Error reading backup file:", readError);
          }
          
          // Add new order with timestamp
          orderId = `local-${Date.now()}`;
          backups.push({
            id: orderId,
            timestamp: new Date().toISOString(),
            orderData
          });
          
          // Save backups
          fs.writeFileSync(backupPath, JSON.stringify(backups, null, 2));
          console.log("⚠️ Saved order to local backup file with ID:", orderId);
        } catch (fileError) {
          console.error("❌ Even file backup failed:", fileError);
          throw new Error("All methods to save order failed");
        }
      }
    }

    res.json({
      success: true,
      orderId: orderId,
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