// backend/routes/customCake.js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Get custom cake options
router.get('/options', async (req, res) => {
  try {
    const optionsSnapshot = await db.collection('cakeOptions').get();
    const options = {};
    
    optionsSnapshot.forEach(doc => {
      const data = doc.data();
      if (!options[data.type]) {
        options[data.type] = [];
      }
      options[data.type].push({
        id: doc.id,
        ...data
      });
    });
    
    res.json(options);
  } catch (error) {
    console.error('Error fetching cake options:', error);
    res.status(500).json({ error: 'Failed to fetch cake options' });
  }
});

// Submit custom cake order
router.post('/submit', async (req, res) => {
  try {
    const { userId, cakeDetails, deliveryInfo } = req.body;
    
    const orderRef = await db.collection('orders').add({
      userId,
      type: 'custom-cake',
      cakeDetails,
      deliveryInfo,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(201).json({ 
      success: true, 
      orderId: orderRef.id 
    });
  } catch (error) {
    console.error('Error submitting custom cake order:', error);
    res.status(500).json({ error: 'Failed to submit custom cake order' });
  }
});

module.exports = router;
