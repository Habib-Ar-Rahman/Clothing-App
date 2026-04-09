const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// GET /api/reviews/product/:productId - public
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.findByProductId(productId);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST /api/reviews - public (reviews from delivered orders)
router.post('/', async (req, res) => {
  try {
    const { productId, orderId, user, rating, comment } = req.body;
    if (!productId || !rating) {
      return res.status(400).json({ error: 'productId and rating are required' });
    }

    const review = new Review({
      productId,
      orderId: orderId || null,
      user: user || {},
      rating: Number(rating),
      comment: comment || '',
    });
    const saved = await review.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

module.exports = router;