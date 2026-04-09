"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Heart, ShoppingCart, Star, Filter, SortAsc, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { productsApi } from "@/lib/api";

// Product interface
interface Product {
  _id: string;
  name: string;
  description: string;
  images: string[];
  gender: "men" | "women";
  category: "boots" | "fur jackets" | "leather jackets";
  sizes: Array<{ size: string; stock: number }>;
  price: number;
  createdAt: string;
  rating?: number;
  reviews?: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGender, setSelectedGender] = useState<'men' | 'women'>("men");
  const [selectedCat, setSelectedCat] = useState<'boots' | 'fur jackets' | 'leather jackets'>("boots");
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

  // Collect unique categories (keep display friendly order)
  const categoryNames = [
    { label: "Boots", value: "boots" },
    { label: "Fur Jackets", value: "fur jackets" },
    { label: "Leather Jackets", value: "leather jackets" },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsApi.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = (product: Product) => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const isAlreadyInWishlist = wishlist.some((item: Product) => item._id === product._id);
    
    if (!isAlreadyInWishlist) {
      wishlist.push(product);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      window.dispatchEvent(new Event('wishlistUpdated'));
    }
  };

  const addToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item._id === product._id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1, selectedSize: product.sizes[0]?.size });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter((p) => {
      const matchesGender = p.gender === selectedGender;
      const matchesCategory = p.category === selectedCat;
      const matchesSearch = searchQuery === '' || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesGender && matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'name':
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-black dark:text-white mb-6">
            Our Products
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover our premium collection of clothing designed for style, comfort, and quality
          </p>
        </div>

        {/* Search Bar - separated from filters */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6 relative overflow-visible">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
            />

            {/* Live suggestions dropdown */}
            {searchQuery.trim() !== '' && (
              <div className="absolute left-0 right-0 mt-2 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                {products
                  .filter((p) => {
                    const q = searchQuery.toLowerCase();
                    return (
                      p.name.toLowerCase().includes(q) ||
                      p.description.toLowerCase().includes(q)
                    );
                  })
                  .slice(0, 8)
                  .map((p) => (
                    <Link
                      key={p._id}
                      href={`/products/${toSlug(p.name)}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <Image src={p.images[0] || '/placeholder.jpg'} alt={p.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">{p.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 truncate">{p.description}</div>
                      </div>
                    </Link>
                  ))}
                {products.filter((p) => {
                  const q = searchQuery.toLowerCase();
                  return (
                    p.name.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q)
                  );
                }).length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">No results found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-black text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Filter className="w-5 h-5" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Filters and Sorting */}
        <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-12 transition-all duration-300 ${
          showFilters ? 'block' : 'hidden lg:block'
        }`}>
          {/* Filters grouped below (search bar is separate above) */}
          
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Gender Filter */}
            <div className="w-full lg:w-auto">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mr-4 mb-2 lg:mb-0">
                  <Filter className="w-4 h-4" />
                  Gender:
                </span>
                {['men', 'women'].map((gender) => (
                  <button
                    key={gender}
                    onClick={() => setSelectedGender(gender as 'men' | 'women')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedGender === gender
                        ? 'bg-black text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full lg:w-auto">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mr-4 mb-2 lg:mb-0">Category:</span>
                {categoryNames.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setSelectedCat(value as typeof selectedCat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedCat === value
                        ? 'bg-black text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sorting */}
            <div className="w-full lg:w-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <SortAsc className="w-4 h-4" />
                  Sort by:
                </span>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="rating">Rating</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors duration-200"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredAndSortedProducts.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="text-gray-500 dark:text-gray-400 text-lg">
                No products found for this category.
              </div>
            </div>
          ) : (
            filteredAndSortedProducts.map((product) => (
              <div key={product._id} className="group bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                {/* Badge */}
                <div className="absolute top-4 left-4 z-10 bg-black text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Premium
                </div>
                
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden">
                  <Link href={`/products/${product.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    {product.images[0] && (
                      <Image
                        src={product.images[0] || '/placeholder.jpg'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                  </Link>
                  
                  {/* Wishlist Button */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToWishlist(product);
                      }}
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <Heart className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <Link href={`/products/${product.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-gray-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                    </div>
                  </div>
                  {/* Add to Cart */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        ₹{product.price.toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                      }}
                      className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}