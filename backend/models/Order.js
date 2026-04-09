const { db } = require('../firebase');
const { FieldValue } = require('firebase-admin/firestore');

class Order {
  constructor(data) {
    this.user = data.user;
    this.contact = data.contact;
    this.address = data.address;
    this.products = data.products;
    this.total = data.total;
    this.paymentMethod = data.paymentMethod;
    this.status = data.status || 'pending';
    this.createdAt = data.createdAt || FieldValue.serverTimestamp();
    this.updatedAt = data.updatedAt || FieldValue.serverTimestamp();
    // Add expected delivery date (15 days from creation)
    if (!data.expectedDeliveryDate) {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 15);
      this.expectedDeliveryDate = deliveryDate.toISOString();
    } else {
      this.expectedDeliveryDate = data.expectedDeliveryDate;
    }
  }

  async save() {
    try {
      console.log('=== ORDER SAVE DEBUG ===');
      console.log('Order instance data:', {
        user: this.user,
        contact: this.contact,
        address: this.address,
        products: this.products,
        total: this.total,
        paymentMethod: this.paymentMethod,
        status: this.status
      });
      
      // Convert the Order instance to a plain object for Firestore
      const orderData = {
        user: this.user,
        contact: this.contact,
        address: this.address,
        products: this.products,
        total: this.total,
        paymentMethod: this.paymentMethod,
        status: this.status,
        createdAt: this.createdAt,
        updatedAt: FieldValue.serverTimestamp(),
        expectedDeliveryDate: this.expectedDeliveryDate
      };
      
      console.log('Converted order data for Firestore:', JSON.stringify(orderData, null, 2));
      console.log('Attempting to save to Firestore...');
      
      const docRef = await db.collection('orders').add(orderData);
      console.log('Successfully saved to Firestore with ID:', docRef.id);
      
      const result = { _id: docRef.id, ...orderData };
      console.log('=== END ORDER SAVE DEBUG ===');
      return result;
    } catch (error) {
      console.error('=== ORDER SAVE ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('=== END ORDER SAVE ERROR ===');
      throw new Error(`Error saving order: ${error.message}`);
    }
  }

  static async find(filter = {}) {
    try {
      console.log('=== FIND ORDERS DEBUG ===');
      console.log('Filter:', filter);
      
      let query = db.collection('orders');
      
      if (filter.status) {
        query = query.where('status', '==', filter.status);
      }
      
      const snapshot = await query.orderBy('createdAt', 'desc').get();
      console.log('Found', snapshot.size, 'orders');
      
      const orders = [];
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const orderData = { 
          _id: doc.id, 
          ...data,
          // Convert Firestore timestamps to ISO strings
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
        };
        console.log('Processing order:', orderData._id, 'with', orderData.products?.length || 0, 'products');
        
        // Populate product details
        if (orderData.products && orderData.products.length > 0) {
          for (let i = 0; i < orderData.products.length; i++) {
            const productId = orderData.products[i].product;
            console.log('Fetching product details for:', productId);
            const productDoc = await db.collection('products').doc(productId).get();
            if (productDoc.exists) {
              orderData.products[i].product = { id: productDoc.id, ...productDoc.data() };
            } else {
              console.log('Product not found:', productId);
            }
          }
        }
        
        orders.push(orderData);
      }
      
      console.log('Returning', orders.length, 'orders');
      console.log('=== END FIND ORDERS DEBUG ===');
      return orders;
    } catch (error) {
      console.error('=== FIND ORDERS ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('=== END FIND ORDERS ERROR ===');
      throw new Error(`Error fetching orders: ${error.message}`);
    }
  }

  static async findByUserId(uid) {
    try {
      console.log('=== FIND BY USER ID DEBUG ===');
      console.log('Looking for orders with user._id:', uid);
      
      // Remove orderBy to avoid composite index requirement
      let query = db.collection('orders').where('user._id', '==', uid);
      const snapshot = await query.get();
      console.log('Found', snapshot.size, 'orders for user:', uid);
      
      const orders = [];
    
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const orderData = { 
          _id: doc.id, 
          ...data,
          // Convert Firestore timestamps to ISO strings
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
        };
        console.log('Processing order:', orderData._id, 'with', orderData.products?.length || 0, 'products');
        
        // Populate product details
        if (orderData.products && orderData.products.length > 0) {
          for (let i = 0; i < orderData.products.length; i++) {
            const productId = orderData.products[i].product;
            console.log('Fetching product details for:', productId);
            const productDoc = await db.collection('products').doc(productId).get();
            if (productDoc.exists) {
              orderData.products[i].product = { id: productDoc.id, ...productDoc.data() };
            } else {
              console.log('Product not found:', productId);
            }
          }
        }
        orders.push(orderData);
      }
      
      // Sort in memory by createdAt descending
      orders.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });
      
      console.log('Returning', orders.length, 'orders');
      console.log('=== END FIND BY USER ID DEBUG ===');
      return orders;
    } catch (error) {
      console.error('=== FIND BY USER ID ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('=== END FIND BY USER ID ERROR ===');
      throw new Error(`Error fetching user orders: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const doc = await db.collection('orders').doc(id).get();
      if (!doc.exists) {
        return null;
      }
      
      const data = doc.data();
      const orderData = { 
        _id: doc.id, 
        ...data,
        // Convert Firestore timestamps to ISO strings
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
      };
      
      // Populate product details
      for (let i = 0; i < orderData.products.length; i++) {
        const productId = orderData.products[i].product;
        const productDoc = await db.collection('products').doc(productId).get();
        if (productDoc.exists) {
          orderData.products[i].product = { id: productDoc.id, ...productDoc.data() };
        }
      }
      
      return orderData;
    } catch (error) {
      throw new Error(`Error fetching order: ${error.message}`);
    }
  }

  static async findByIdAndUpdate(id, updateData) {
    try {
      updateData.updatedAt = FieldValue.serverTimestamp();
      await db.collection('orders').doc(id).update(updateData);
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating order: ${error.message}`);
    }
  }

  static async countDocuments(filter = {}) {
    try {
      let query = db.collection('orders');
      
      if (filter.status) {
        query = query.where('status', '==', filter.status);
      }
      
      const snapshot = await query.get();
      return snapshot.size;
    } catch (error) {
      throw new Error(`Error counting orders: ${error.message}`);
    }
  }

  static async aggregate(pipeline) {
    try {
      // Simple aggregation for total revenue
      if (pipeline[0].$match && pipeline[1].$group) {
        let query = db.collection('orders');
        
        // Apply match conditions
        const matchConditions = pipeline[0].$match;
        if (matchConditions.status && matchConditions.status.$ne) {
          query = query.where('status', '!=', matchConditions.status.$ne);
        }
        
        const snapshot = await query.get();
        let total = 0;
        
        snapshot.forEach(doc => {
          const data = doc.data();
          total += data.total || 0;
        });
        
        return [{ _id: null, total }];
      }
      
      return [];
    } catch (error) {
      throw new Error(`Error in aggregation: ${error.message}`);
    }
  }
}

module.exports = Order;
