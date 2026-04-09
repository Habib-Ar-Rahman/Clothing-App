require('dotenv').config({ path: './backend/.env' });
const { db } = require('./backend/firebase');

async function debugFirebase() {
  try {
    console.log('🔍 Debugging Firebase Database...');
    
    // Check connection
    const snapshot = await db.collection('products').get();
    console.log(`📊 Total products in Firebase: ${snapshot.size}`);
    
    if (snapshot.size === 0) {
      console.log('❌ No products found in Firebase!');
      console.log('💡 Solution: Add products through the admin panel first.');
      return;
    }
    
    console.log('\n📋 Product Details:');
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ID: ${doc.id}`);
      console.log(`   Name: ${data.name}`);
      console.log(`   Price: ${data.price}`);
      console.log(`   Created: ${data.createdAt}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Firebase Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check Firebase credentials in .env file');
    console.log('2. Verify Firebase project ID');
    console.log('3. Ensure Firestore is enabled');
  }
}

debugFirebase();