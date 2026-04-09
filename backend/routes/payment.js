const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// POST /api/payment/create-order - Create payment order
router.post('/create-order', async (req, res) => {
  try {
    console.log('=== CREATE ORDER DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { products, total, paymentMethod, shippingAddress, user, contact, address } = req.body;
    const userInfo = user || {};
    const combinedAddress =
      shippingAddress ||
      [
        address?.addressLine,
        address?.locality,
        address?.city,
        address?.state,
        address?.pincode,
      ].filter(Boolean).join(', ');

    const orderData = {
      user: {
        _id: userInfo.uid,
        name: (contact && contact.name) || userInfo.name,
        email: (contact && contact.email) || userInfo.email,
        phone: contact?.phone,
        address: combinedAddress,
      },
      contact: contact || null,
      address: address || null,
      products,
      total,
      paymentMethod,
      status: 'pending',
    };

    console.log('Order data to save:', JSON.stringify(orderData, null, 2));

    const order = new Order(orderData);
    console.log('Order instance created, attempting to save...');
    
    const savedOrder = await order.save();
    console.log('Order saved successfully:', savedOrder.id);

    const paymentUrl = generatePaymentUrl(savedOrder, paymentMethod);
    console.log('Payment URL generated:', paymentUrl);

    res.status(201).json({
      message: 'Order created successfully',
      order: savedOrder,
      paymentUrl: paymentUrl,
    });
    console.log('=== END CREATE ORDER DEBUG ===');
  } catch (error) {
    console.error('=== ORDER CREATION ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=== END ERROR DEBUG ===');
    res.status(500).json({ error: error.message });
  }
});

// POST /api/payment/verify - Verify payment
router.post('/verify', async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    
    // Here you would verify the payment with your payment gateway
    // For demo purposes, we'll assume payment is successful
    
    const order = await Order.findByIdAndUpdate(orderId, {
      status: 'processing',
      paymentId,
      paymentSignature: signature
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      message: 'Payment verified successfully',
      order
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to generate payment URLs
function generatePaymentUrl(order, paymentMethod) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  // Handle different payment methods
  switch (paymentMethod.toLowerCase()) {
    case 'card':
      // Redirect to card payment page (for future implementation)
      return `${frontendUrl}/payment/card?orderId=${order.id}&amount=${order.total}`;
    
    case 'upi':
    case 'phonepe':
    case 'googlepay':
    case 'paytm':
      // Redirect to UPI payment page (for future implementation)
      return `${frontendUrl}/payment/upi?orderId=${order.id}&amount=${order.total}&method=${paymentMethod}`;
    
    case 'cod':
    case 'cash-on-delivery':
      // For Cash on Delivery, directly confirm the order
      return `${frontendUrl}/orders/success?orderId=${order.id}&amount=${order.total}&paymentMethod=${paymentMethod}&status=confirmed`;
    
    default:
      // Default to success page
      return `${frontendUrl}/orders/success?orderId=${order.id}&amount=${order.total}&paymentMethod=${paymentMethod}`;
  }
}

module.exports = router;