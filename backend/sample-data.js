// Sample data for testing when MongoDB is not available
const sampleProducts = [
  {
    _id: '1',
    name: 'Classic Leather Jacket - Men',
    description: 'Premium quality leather jacket for men. Perfect for any occasion.',
    images: ['/leather-jacket.jpg'],
    gender: 'men',
    category: 'leather jackets',
    sizes: [
      { size: 'S', stock: 5 },
      { size: 'M', stock: 8 },
      { size: 'L', stock: 6 },
      { size: 'XL', stock: 4 }
    ],
    price: 299.99,
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    name: 'Elegant Leather Jacket - Women',
    description: 'Stylish leather jacket designed for women. Comfortable and fashionable.',
    images: ['/leather-jacket.jpg'],
    gender: 'women',
    category: 'leather jackets',
    sizes: [
      { size: 'S', stock: 7 },
      { size: 'M', stock: 9 },
      { size: 'L', stock: 5 },
      { size: 'XL', stock: 3 }
    ],
    price: 279.99,
    createdAt: new Date().toISOString()
  },
  {
    _id: '3',
    name: 'Luxury Fur Jacket - Men',
    description: 'Warm and luxurious fur jacket for men. Perfect for cold weather.',
    images: ['/fur-jacket.jpg'],
    gender: 'men',
    category: 'fur jackets',
    sizes: [
      { size: 'M', stock: 4 },
      { size: 'L', stock: 6 },
      { size: 'XL', stock: 5 }
    ],
    price: 599.99,
    createdAt: new Date().toISOString()
  },
  {
    _id: '4',
    name: 'Designer Fur Jacket - Women',
    description: 'Elegant fur jacket for women. Made with the finest materials.',
    images: ['/fur-jacket.jpg'],
    gender: 'women',
    category: 'fur jackets',
    sizes: [
      { size: 'S', stock: 3 },
      { size: 'M', stock: 7 },
      { size: 'L', stock: 4 }
    ],
    price: 549.99,
    createdAt: new Date().toISOString()
  },
  {
    _id: '5',
    name: 'Comfort Boots - Men',
    description: 'Durable and comfortable boots for men. Perfect for daily wear.',
    images: ['/boots.jpg'],
    gender: 'men',
    category: 'boots',
    sizes: [
      { size: '8', stock: 6 },
      { size: '9', stock: 8 },
      { size: '10', stock: 7 },
      { size: '11', stock: 5 }
    ],
    price: 149.99,
    createdAt: new Date().toISOString()
  },
  {
    _id: '6',
    name: 'Fashion Boots - Women',
    description: 'Trendy boots for women. Style meets comfort.',
    images: ['/boots.jpg'],
    gender: 'women',
    category: 'boots',
    sizes: [
      { size: '6', stock: 8 },
      { size: '7', stock: 10 },
      { size: '8', stock: 6 },
      { size: '9', stock: 4 }
    ],
    price: 129.99,
    createdAt: new Date().toISOString()
  }
];

module.exports = { sampleProducts };
