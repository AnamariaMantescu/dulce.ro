// backend/routes/users.js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    // Remove sensitive information
    delete userData.password;
    
    res.json({
      id: userDoc.id,
      ...userData
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create or update user profile
router.post('/profile', async (req, res) => {
  try {
    const { userId, profileData } = req.body;
    
    await db.collection('users').doc(userId).set({
      ...profileData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Get user addresses
router.get('/:id/addresses', async (req, res) => {
  try {
    const addressesSnapshot = await db.collection('users')
      .doc(req.params.id)
      .collection('addresses')
      .get();
    
    const addresses = [];
    addressesSnapshot.forEach(doc => {
      addresses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(addresses);
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    res.status(500).json({ error: 'Failed to fetch user addresses' });
  }
});

// Add user address
router.post('/:id/addresses', async (req, res) => {
  try {
    const addressData = req.body;
    
    const addressRef = await db.collection('users')
      .doc(req.params.id)
      .collection('addresses')
      .add({
        ...addressData,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    
    res.status(201).json({ 
      success: true, 
      addressId: addressRef.id 
    });
  } catch (error) {
    console.error('Error adding user address:', error);
    res.status(500).json({ error: 'Failed to add user address' });
  }
});

module.exports = router;
