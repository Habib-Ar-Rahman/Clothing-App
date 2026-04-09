// Test script to verify order functionality
const axios = require('axios');

const API_BASE_URL = 'http://localhost:4000/api';
const API_KEY = 'admin123';

async function testOrders() {
  try {
    console.log('🧪 Testing Order API...\n');
    
    // Test 1: Create a test order
    console.log('1. Creating a test order...');
    const testOrder = {
      user: {
        uid: 'test-user-123',
        name: 'Test User',
        email: 'test@example.com'
      },
      contact: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890'
      },
      address: {
        addressLine: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '12345'
      },
      products: [
        {
          product: 'test-product-id',
          quantity: 2,
          size: 'M',
          price: 50
        }
      ],
      total: 100,
      paymentMethod: 'card'
    };
    
    const createResponse = await axios.post(`${API_BASE_URL}/payment/create-order`, testOrder);
    console.log(`✅ Order created with ID: ${createResponse.data.order.id}`);
    const orderId = createResponse.data.order.id;
    
    // Test 2: Get orders for user
    console.log('\n2. Testing GET /api/orders/user/:uid...');
    const userOrdersResponse = await axios.get(`${API_BASE_URL}/orders/user/test-user-123`);
    console.log(`✅ Found ${userOrdersResponse.data.length} orders for user`);
    
    // Test 3: Get all orders (admin)
    console.log('\n3. Testing GET /api/orders (admin)...');
    const allOrdersResponse = await axios.get(`${API_BASE_URL}/orders`, {
      headers: { 'x-api-key': API_KEY }
    });
    console.log(`✅ Found ${allOrdersResponse.data.length} total orders`);
    
    console.log('\n🎉 All order tests passed!');
    
  } catch (error) {
    console.error('❌ Order test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testOrders();