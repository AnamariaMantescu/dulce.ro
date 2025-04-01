// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Middleware to check admin status
const checkAdmin = async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists || !userDoc.data().isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all orders (admin only)
router.post('/orders', checkAdmin, async (req, res) => {
  try {
    const { status, limit = 20, startAfter } = req.body;
    
    let query = db.collection('orders')
      .orderBy('createdAt', 'desc');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (startAfter) {
      const startAfterDoc = await db.collection('orders').doc(startAfter).get();
      query = query.startAfter(startAfterDoc);
    }
    
    query = query.limit(limit);
    
    const ordersSnapshot = await query.get();
    const orders = [];
    
    ordersSnapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : null
      });
    });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Manage products (admin only)
router.post('/products', checkAdmin, async (req, res) => {
  try {
    const { action, productData, productId } = req.body;
    
    switch (action) {
      case 'create':
        const productRef = await db.collection('products').add({
          ...productData,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return res.status(201).json({ 
          success: true, 
          productId: productRef.id 
        });
        
      case 'update':
        await db.collection('products').doc(productId).update({
          ...productData,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return res.json({ success: true });
        
      case 'delete':
        await db.collection('products').doc(productId).delete();
        return res.json({ success: true });
        
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error managing products:', error);
    res.status(500).json({ error: 'Failed to manage products' });
  }
});

// Manage themes (admin only)
router.post('/themes', checkAdmin, async (req, res) => {
  try {
    const { action, themeData, themeId } = req.body;
    
    switch (action) {
      case 'create':
        // If setting this theme as active, deactivate all other themes
        if (themeData.active) {
          const batch = db.batch();
          const activeThemesSnapshot = await db.collection('themes')
            .where('active', '==', true)
            .get();
          
          activeThemesSnapshot.forEach(doc => {
            batch.update(doc.ref, { active: false });
          });
          
          await batch.commit();
        }
        
        const themeRef = await db.collection('themes').add({
          ...themeData,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return res.status(201).json({ 
          success: true, 
          themeId: themeRef.id 
        });
        
      case 'update':
        // If setting this theme as active, deactivate all other themes
        if (themeData.active) {
          const batch = db.batch();
          const activeThemesSnapshot = await db.collection('themes')
            .where('active', '==', true)
            .where('__name__', '!=', themeId)
            .get();
          
          activeThemesSnapshot.forEach(doc => {
            batch.update(doc.ref, { active: false });
          });
          
          await batch.commit();
        }
        
        await db.collection('themes').doc(themeId).update({
          ...themeData,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return res.json({ success: true });
        
      case 'delete':
        await db.collection('themes').doc(themeId).delete();
        return res.json({ success: true });
        
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error managing themes:', error);
    res.status(500).json({ error: 'Failed to manage themes' });
  }
});

module.exports = router;
