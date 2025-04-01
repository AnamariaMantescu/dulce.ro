// backend/routes/themes.js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Get all themes
router.get('/', async (req, res) => {
  try {
    const themesSnapshot = await db.collection('themes').get();
    const themes = [];
    
    themesSnapshot.forEach(doc => {
      themes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(themes);
  } catch (error) {
    console.error('Error fetching themes:', error);
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
});

// Get active theme
router.get('/active', async (req, res) => {
  try {
    const activeThemeSnapshot = await db.collection('themes')
      .where('active', '==', true)
      .limit(1)
      .get();
    
    if (activeThemeSnapshot.empty) {
      return res.json(null);
    }
    
    const activeTheme = activeThemeSnapshot.docs[0];
    
    res.json({
      id: activeTheme.id,
      ...activeTheme.data()
    });
  } catch (error) {
    console.error('Error fetching active theme:', error);
    res.status(500).json({ error: 'Failed to fetch active theme' });
  }
});

// Get theme by ID
router.get('/:id', async (req, res) => {
  try {
    const themeDoc = await db.collection('themes').doc(req.params.id).get();
    
    if (!themeDoc.exists) {
      return res.status(404).json({ error: 'Theme not found' });
    }
    
    res.json({
      id: themeDoc.id,
      ...themeDoc.data()
    });
  } catch (error) {
    console.error('Error fetching theme:', error);
    res.status(500).json({ error: 'Failed to fetch theme' });
  }
});

module.exports = router;
