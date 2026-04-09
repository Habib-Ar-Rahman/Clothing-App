require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Initialize Firebase
try {
  require('./firebase');
  console.log('✅ Firebase initialization successful');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Routes
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payment');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check
app.get('/', (req, res) => { 
  res.json({ message: 'Clothing App API Running with Firebase' }); 
});

// Add a test endpoint for Firebase connectivity
app.get('/api/test-firebase', async (req, res) => {
  try {
    const { db } = require('./firebase');
    const testDoc = await db.collection('test').add({ timestamp: new Date() });
    await db.collection('test').doc(testDoc.id).delete();
    res.json({ message: 'Firebase connection successful', testId: testDoc.id });
  } catch (error) {
    console.error('Firebase test failed:', error);
    res.status(500).json({ error: 'Firebase connection failed', details: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('🔥 Firebase connected successfully!');
});