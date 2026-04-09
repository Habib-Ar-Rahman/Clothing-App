// Simple test script to verify the Firebase API is working
const axios = require('axios');

async function testAPI() {
  try {
    console.log('🧪 Testing Velewera Firebase API...\n');
    
    // Test 1: Get all products
    console.log('1. Testing GET /api/products...');
    const response = await axios.get('http://localhost:4000/api/products');
    console.log(`✅ Found ${response.data.length} products`);
    
    // Test 2: Filter by gender
    console.log('\n2. Testing gender filter (men)...');
    const menProducts = await axios.get('http://localhost:4000/api/products?gender=men');
    console.log(`✅ Found ${menProducts.data.length} men's products`);
    
    // Test 3: Filter by category
    console.log('\n3. Testing category filter (boots)...');
    const bootsProducts = await axios.get('http://localhost:4000/api/products?category=boots');
    console.log(`✅ Found ${bootsProducts.data.length} boots`);
    
    // Test 4: Show sample product
    if (response.data.length > 0) {
      console.log('\n4. Sample product:');
      console.log(`   Name: ${response.data[0].name}`);
      console.log(`   Price: $${response.data[0].price}`);
      console.log(`   Gender: ${response.data[0].gender}`);
      console.log(`   Category: ${response.data[0].category}`);
    }
    
    console.log('\n🎉 Firebase API is working correctly!');
    console.log('\n📝 Next steps:');
    console.log('   1. Visit http://localhost:3000 for the frontend');
    console.log('   2. Visit http://localhost:3001 for the admin panel');
    console.log('   3. Add products through the admin panel');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure the backend is running: cd backend && npm start');
    console.log('   2. Check if port 4000 is available');
    console.log('   3. Verify Firebase configuration in .env file');
  }
}

testAPI();
