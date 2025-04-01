// server/routes/products.js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Obține toate produsele
router.get('/', async (req, res) => {
  try {
    let query = db.collection('products');
    
    // Filtrare după categorie dacă există
    if (req.query.category) {
      query = query.where('category', '==', req.query.category);
    }
    
    const snapshot = await query.get();
    const products = [];
    
    snapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obține un produs după ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('products').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Produsul nu a fost găsit' });
    }
    
    res.json({
      id: doc.id,
      ...doc.data()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;