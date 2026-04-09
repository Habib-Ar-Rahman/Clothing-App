const { db } = require('../firebase');
const { FieldValue } = require('firebase-admin/firestore');

class Product {
  constructor(data) {
    this.name = data.name;
    this.description = data.description;
    this.leathercare = data.leathercare || '';
    this.images = data.images || [];
    this.gender = data.gender;
    this.category = data.category;
    this.sizes = data.sizes || [];
    this.colors = data.colors || [];
    this.price = data.price;
    this.createdAt = data.createdAt || FieldValue.serverTimestamp();
    this.updatedAt = data.updatedAt || FieldValue.serverTimestamp();
  }

  // Convert Product instance to plain object for Firestore
  toFirestoreData() {
    return {
      name: this.name,
      description: this.description,
      leathercare: this.leathercare,
      images: this.images,
      gender: this.gender,
      category: this.category,
      sizes: this.sizes,
      colors: this.colors,
      price: this.price,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Save product to Firestore
  async save() {
    try {
      this.updatedAt = FieldValue.serverTimestamp();
      const productData = this.toFirestoreData();
      const docRef = await db.collection('products').add(productData);
      return { id: docRef.id, ...productData };
    } catch (error) {
      throw new Error(`Error saving product: ${error.message}`);
    }
  }

  // Static methods
  static async find(filter = {}) {
    try {
      let query = db.collection('products');
      
      // Apply filters
      Object.keys(filter).forEach(key => {
        query = query.where(key, '==', filter[key]);
      });
      
      const snapshot = await query.get();
      const products = [];
      
      snapshot.forEach(doc => {
        products.push({ _id: doc.id, ...doc.data() });
      });
      
      return products;
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const doc = await db.collection('products').doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return { _id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error fetching product: ${error.message}`);
    }
  }

  static async findByIdAndUpdate(id, updateData) {
    try {
      updateData.updatedAt = FieldValue.serverTimestamp();
      await db.collection('products').doc(id).update(updateData);
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }
  }

  static async findByIdAndDelete(id) {
    try {
      const product = await this.findById(id);
      if (!product) {
        return null;
      }
      await db.collection('products').doc(id).delete();
      return product;
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }
}

module.exports = Product;
