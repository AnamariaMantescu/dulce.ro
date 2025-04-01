// backend/routes/orders.js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Get user orders
router.get('/user/:userId', async (req, res) => {
  try {
    const ordersSnapshot = await db.collection('orders')
      .where('userId', '==', req.params.userId)
      .orderBy('createdAt', 'desc')
      .get();
    
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
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const orderDoc = await db.collection('orders').doc(req.params.id).get();
    
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const orderData = orderDoc.data();
    
    res.json({
      id: orderDoc.id,
      ...orderData,
      createdAt: orderData.createdAt ? orderData.createdAt.toDate() : null
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create a new order
router.post('/', async (req, res) => {
  try {
    const { userId, products, deliveryInfo, paymentMethod, totalAmount } = req.body;
    
    const orderRef = await db.collection('orders').add({
      userId,
      products,
      deliveryInfo,
      paymentMethod,
      totalAmount,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(201).json({ 
      success: true, 
      orderId: orderRef.id 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    await db.collection('orders').doc(req.params.id).update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
