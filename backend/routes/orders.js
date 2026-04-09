const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Middleware for API key authentication
const requireApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.API_KEY || 'admin123';
  
  if (apiKey && apiKey === validApiKey) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized. Valid API key required.' });
  }
};

// GET /api/orders - Get all orders (admin only)
router.get('/', requireApiKey, async (req, res) => {
  try {
    console.log('=== GET ALL ORDERS DEBUG ===');
    console.log('Query params:', req.query);
    
    const { status } = req.query;
    let filter = {};
    
    if (status) filter.status = status;
    
    const orders = await Order.find(filter);
    
    console.log('Found orders:', orders.length);
    console.log('=== END GET ALL ORDERS DEBUG ===');
    
    res.json(orders);
  } catch (error) {
    console.error('=== GET ALL ORDERS ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=== END GET ALL ORDERS ERROR ===');
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders/:id - Get single order (admin only)
router.get('/:id', requireApiKey, async (req, res) => {
  try {
    console.log('=== GET SINGLE ORDER DEBUG ===');
    console.log('Order ID:', req.params.id);
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      console.log('Order not found for ID:', req.params.id);
      return res.status(404).json({ error: 'Order not found' });
    }
    
    console.log('Found order:', order.id);
    console.log('=== END GET SINGLE ORDER DEBUG ===');
    
    res.json(order);
  } catch (error) {
    console.error('=== GET SINGLE ORDER ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=== END GET SINGLE ORDER ERROR ===');
    res.status(500).json({ error: error.message });
  }
});

// POST /api/orders - Create new order (public)
router.post('/', async (req, res) => {
  try {
    const { user, products, total } = req.body;
    
    const order = new Order({
      user,
      products,
      total: parseFloat(total)
    });
    
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/orders/:id - Update order status (admin only)
router.put('/:id', requireApiKey, async (req, res) => {
  try {
    console.log('=== UPDATE ORDER STATUS DEBUG ===');
    console.log('Order ID:', req.params.id);
    console.log('New status:', req.body.status);
    
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!order) {
      console.log('Order not found for update:', req.params.id);
      return res.status(404).json({ error: 'Order not found' });
    }
    
    console.log('Order updated successfully:', order.id);
    console.log('=== END UPDATE ORDER STATUS DEBUG ===');
    
    res.json(order);
  } catch (error) {
    console.error('=== UPDATE ORDER STATUS ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=== END UPDATE ORDER STATUS ERROR ===');
    res.status(400).json({ error: error.message });
  }
});

// GET /api/orders/stats - Get order statistics (admin only)
router.get('/stats/overview', requireApiKey, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: 'delivered' });
    
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/orders/:id/cancel - Cancel an order (user can cancel their own orders)
router.patch('/:id/cancel', async (req, res) => {
  try {
    console.log('=== CANCEL ORDER DEBUG ===');
    console.log('Order ID:', req.params.id);
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if order can be cancelled (only pending or processing orders)
    if (order.status !== 'pending' && order.status !== 'processing') {
      return res.status(400).json({ 
        error: 'Order cannot be cancelled. Only pending or processing orders can be cancelled.' 
      });
    }
    
    // Update order status to cancelled
    const updatedOrder = await Order.updateStatus(req.params.id, 'cancelled');
    
    console.log('Order cancelled successfully:', updatedOrder._id);
    console.log('=== END CANCEL ORDER DEBUG ===');
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('=== CANCEL ORDER ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=== END CANCEL ORDER ERROR ===');
    res.status(500).json({ error: error.message });
  }
});

// Public: Get orders for a specific user
router.get('/user/:uid', async (req, res) => {
  try {
    console.log('=== GET USER ORDERS DEBUG ===');
    console.log('Requested user ID:', req.params.uid);
    
    const { uid } = req.params;
    const orders = await Order.findByUserId(uid);
    
    console.log('Found orders for user:', orders.length);
    console.log('=== END GET USER ORDERS DEBUG ===');
    
    res.json(orders);
  } catch (error) {
    console.error('=== GET USER ORDERS ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=== END GET USER ORDERS ERROR ===');
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
