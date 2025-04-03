const express = require("express");
const cors = require("cors");
require("dotenv").config();
const admin = require("firebase-admin");
let serviceAccount;

try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
} catch (error) {
  console.error("Error parsing Firebase credentials:", error);
  // Provide more context to help debug
  console.error("Credential string:", process.env.FIREBASE_SERVICE_ACCOUNT_JSON.substring(0, 20) + "...");
}

// Add additional logging
console.log("Initializing Firebase with project ID:", serviceAccount?.project_id || "MISSING PROJECT ID");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const Stripe = require("stripe");
const stripe = Stripe('sk_test_51R7FEGQpGLybqVEL530ubCzxTCSylRakpA2xOOxUJlIivBpj0obkTL4ltpHGZFOGl1v07VgzPor4EYm9sLuBj15c00Ho2E9D9x');



const { getFirestore } = require('firebase-admin/firestore');
const db = getFirestore();


const app = express();
app.use(cors());
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

    // Log Firebase credentials info (without exposing sensitive data)
    console.log("🔥 Firebase project ID:", serviceAccount.project_id);
    console.log("🔥 Firebase client email:", serviceAccount.client_email);
    console.log("🔥 Private key format check:", 
      serviceAccount.private_key.startsWith("-----BEGIN PRIVATE KEY-----") && 
      serviceAccount.private_key.includes("\n"));

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
    
    // Check if this is a Firebase Auth error
    if (error.code === 16 || (error.message && error.message.includes("UNAUTHENTICATED"))) {
      console.error("🔥 Firebase authentication error detected!");
      console.error("This is likely related to service account credentials");
      
      // Try to extract service account info for debugging (without private key)
      try {
        const safeServiceAccount = { ...serviceAccount };
        if (safeServiceAccount.private_key) {
          safeServiceAccount.private_key = safeServiceAccount.private_key.substring(0, 20) + "... [TRUNCATED]";
        }
        console.error("Service account info:", JSON.stringify(safeServiceAccount, null, 2));
      } catch (e) {
        console.error("Could not log service account info:", e.message);
      }
    }
    
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