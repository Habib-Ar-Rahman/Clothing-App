const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

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

// GET /api/products - Get all products (public)
router.get('/', async (req, res) => {
  try {
    const { gender, category } = req.query;
    
    // Use Firebase for all operations
    let filter = {};
    if (gender) filter.gender = gender;
    if (category) filter.category = category;
    
    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id - Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products - Create new product (admin only)
router.post('/', requireApiKey, upload.array('images', 5), async (req, res) => {
  try {
    console.log('Creating product with data:', req.body);
    console.log('Files received:', req.files?.length || 0);
    
    const { name, description, gender, category, sizes, price } = req.body;
    
    // Validate required fields
    if (!name || !description || !gender || !category || !price) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, description, gender, category, price' 
      });
    }
    
    // Parse sizes if it's a string
    let parsedSizes = [];
    if (sizes) {
      try {
        parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      } catch (e) {
        return res.status(400).json({ error: 'Invalid sizes format' });
      }
    }
    
    // Handle uploaded images
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        imageUrls.push(`http://localhost:4000/uploads/${file.filename}`);
      });
    }
    
    const productData = {
      name,
      description,
      images: imageUrls,
      gender,
      category,
      sizes: parsedSizes,
      price: parseFloat(price)
    };
    
    console.log('Creating product with data:', productData);
    
    const product = new Product(productData);
    const savedProduct = await product.save();
    
    console.log('Product created successfully:', savedProduct.id);
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/products/:id - Update product (admin only)
router.put('/:id', requireApiKey, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, leathercare, gender, category, sizes, price, colors, existingImages } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (leathercare !== undefined) updateData.leathercare = leathercare;
    if (gender) updateData.gender = gender;
    if (category) updateData.category = category;
    if (price) updateData.price = parseFloat(price);
    
    // Handle sizes
    if (sizes) {
      const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      updateData.sizes = parsedSizes;
    }
    
    // Handle colors
    if (colors) {
      const parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors;
      updateData.colors = parsedColors;
    }
    
    // Handle images
    let finalImages = [];
    
    // Keep existing images that weren't removed
    if (existingImages) {
      const parsedExistingImages = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
      finalImages = [...parsedExistingImages];
    }
    
    // Add new images
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => `http://localhost:4000/uploads/${file.filename}`);
      finalImages = [...finalImages, ...newImageUrls];
    }
    
    if (finalImages.length > 0) {
      updateData.images = finalImages;
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/products/:id - Delete product (admin only)
router.delete('/:id', requireApiKey, async (req, res) => {
  try {
    console.log('=== DELETE REQUEST DEBUG ===');
    console.log('Attempting to delete product with ID:', req.params.id);
    console.log('ID type:', typeof req.params.id);
    console.log('ID length:', req.params.id.length);
    
    // First, let's check if any products exist
    const allProducts = await Product.find({});
    console.log('Total products in database:', allProducts.length);
    if (allProducts.length > 0) {
      console.log('Sample product IDs:', allProducts.slice(0, 3).map(p => ({ id: p._id, name: p.name })));
    }
    
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      console.log('Product not found for ID:', req.params.id);
      console.log('Available product IDs:', allProducts.map(p => p._id));
      return res.status(404).json({ error: 'Product not found' });
    }
    
    console.log('Product found and deleted:', product.name);
    
    // Delete associated image files
    if (product.images) {
      product.images.forEach(imageUrl => {
        // Extract filename from URL
        const filename = imageUrl.split('/').pop();
        const fullPath = path.join(__dirname, '..', 'uploads', filename);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log('Deleted image file:', filename);
        }
      });
    }
    
    console.log('Product deletion completed successfully');
    console.log('=== END DELETE DEBUG ===');
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
