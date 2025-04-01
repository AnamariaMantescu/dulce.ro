// backend/routes/quiz.js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Get quiz questions
router.get('/questions', async (req, res) => {
  try {
    const questionsSnapshot = await db.collection('quizQuestions').orderBy('order').get();
    const questions = [];
    
    questionsSnapshot.forEach(doc => {
      questions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(questions);
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    res.status(500).json({ error: 'Failed to fetch quiz questions' });
  }
});

// Submit quiz answers and get recommendations
router.post('/submit', async (req, res) => {
  try {
    const { answers, userId } = req.body;
    
    // Process answers to determine product recommendations
    // This is a simplified example - you would implement your recommendation algorithm here
    const recommendationsSnapshot = await db.collection('products')
      .where('active', '==', true)
      .limit(4)
      .get();
    
    const recommendations = [];
    recommendationsSnapshot.forEach(doc => {
      recommendations.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Generate discount code if needed
    const discountCode = generateDiscountCode();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // 7 days validity
    
    // Save quiz results
    if (userId) {
      await db.collection('quizResults').add({
        userId,
        answers,
        recommendations: recommendations.map(r => r.id),
        discountCode,
        discountExpiry: admin.firestore.Timestamp.fromDate(expiryDate),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    res.json({
      recommendations,
      discount: {
        code: discountCode,
        value: 10, // 10% discount
        expiry: expiryDate.toISOString()
      }
    });
  } catch (error) {
    console.error('Error processing quiz:', error);
    res.status(500).json({ error: 'Failed to process quiz results' });
  }
});

// Helper function to generate a random discount code
function generateDiscountCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'QUIZ';
  
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return code;
}

module.exports = router;
