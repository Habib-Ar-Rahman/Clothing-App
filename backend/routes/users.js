const express = require('express');
const router = express.Router();
const { db } = require('../firebase');

router.post('/profile', async (req, res) => {
  try {
    const { uid, profile } = req.body;
    if (!uid) {
      return res.status(400).json({ error: 'uid is required' });
    }
    await db.collection('users').doc(uid).set(profile, { merge: true });
    res.json({ message: 'Profile saved', profile });
  } catch (error) {
    console.error('Save profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;