const { db } = require('../firebase');
const { FieldValue } = require('firebase-admin/firestore');

class Review {
  constructor(data) {
    this.productId = data.productId;
    this.orderId = data.orderId || null;
    this.user = data.user || {};
    this.rating = data.rating;
    this.comment = data.comment || '';
    this.createdAt = data.createdAt || FieldValue.serverTimestamp();
  }

  toFirestoreData() {
    return {
      productId: this.productId,
      orderId: this.orderId,
      user: this.user,
      rating: this.rating,
      comment: this.comment,
      createdAt: this.createdAt,
    };
  }

  async save() {
    try {
      const docRef = await db.collection('reviews').add(this.toFirestoreData());
      return { _id: docRef.id, ...this.toFirestoreData() };
    } catch (error) {
      throw new Error(`Error saving review: ${error.message}`);
    }
  }

  static async findByProductId(productId) {
    try {
      // Avoid Firestore composite index requirement by not ordering in query
      const snapshot = await db
        .collection('reviews')
        .where('productId', '==', productId)
        .get();

      const items = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        items.push({
          _id: doc.id,
          ...data,
          // Keep raw timestamp for sorting; convert to ISO after sort
          _createdAtTs: data.createdAt?.toDate ? data.createdAt.toDate().getTime() : 0,
        });
      });

      // Sort by createdAt desc in memory
      items.sort((a, b) => (b._createdAtTs || 0) - (a._createdAtTs || 0));

      // Map to final shape with ISO string for createdAt
      const reviews = items.map(item => ({
        _id: item._id,
        productId: item.productId,
        orderId: item.orderId,
        user: item.user,
        rating: item.rating,
        comment: item.comment,
        createdAt: item._createdAtTs ? new Date(item._createdAtTs).toISOString() : item.createdAt,
      }));

      return reviews;
    } catch (error) {
      throw new Error(`Error fetching reviews: ${error.message}`);
    }
  }
}

module.exports = Review;