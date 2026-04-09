"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, ShoppingCart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { productsApi, reviewsApi } from "@/lib/api";

interface Product {
  _id: string;
  name: string;
  description: string;
  leathercare?: string;
  images: string[];
  gender: "men" | "women";
  category: "boots" | "fur jackets" | "leather jackets";
  sizes: Array<{ size: string; stock: number }>;
  colors: string[];
  price: number;
  createdAt: string;
}

interface Review {
  _id?: string;
  user?: { name?: string; uid?: string } | string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState<string>("");
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetchProduct();
  }, [params.productName]);

  const fetchProduct = async () => {
    try {
      const response = await productsApi.getAll();
      const productName = (params.productName as string).replace(/-/g, ' ');
      const foundProduct = response.data.find((p: Product) => 
        p.name.toLowerCase() === productName.toLowerCase()
      );
      
      if (foundProduct) {
        // Normalize sizes: split comma-separated strings into individual sizes
        const normalizeSizes = (sizes: Array<{ size: string; stock: number }>): Array<{ size: string; stock: number }> => {
          const expanded: Array<{ size: string; stock: number }> = [];
          (sizes || []).forEach((s) => {
            if (typeof s.size === 'string' && s.size.includes(',')) {
              s.size.split(',').map(part => part.trim()).filter(Boolean).forEach(part => {
                expanded.push({ size: part, stock: s.stock });
              });
            } else {
              expanded.push(s);
            }
          });
          // Dedupe by size while keeping the first occurrence's stock
          const seen = new Set<string>();
          const result: Array<{ size: string; stock: number }> = [];
          for (const item of expanded) {
            if (!seen.has(item.size)) {
              seen.add(item.size);
              result.push(item);
            }
          }
          return result;
        };

        const normalized = normalizeSizes(foundProduct.sizes || []);
        setProduct({ ...foundProduct, sizes: normalized });
        // Load reviews for this product
        try {
          const r = await reviewsApi.getByProduct(foundProduct._id);
          setReviews(Array.isArray(r.data) ? r.data : []);
        } catch (err) {
          console.error('Failed to load reviews', err);
          setReviews([]);
        }
        // Do not auto-select a size by default
        setSelectedSize("");
        if (!(normalized || []).some((s) => s.stock > 0)) {
          setSizeError("This product is currently out of stock for all sizes.");
        } else {
          setSizeError("");
        }
        if (foundProduct.colors && foundProduct.colors.length > 0) {
          setSelectedColor(foundProduct.colors[0]);
        }
      } else {
        router.push('/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = () => {
    if (!product) return;
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const isAlreadyInWishlist = wishlist.some((item: Product) => item._id === product._id);
    
    if (!isAlreadyInWishlist) {
      wishlist.push(product);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      alert('Added to wishlist!');
    } else {
      alert('Already in wishlist!');
    }
  };

  const addToCart = async () => {
    if (!product || !selectedSize) {
      setSizeError('Please select a size before adding to cart.');
      return;
    }

    try {
      // Revalidate availability in case sizes changed during the session
      const latest = await productsApi.getById(product._id);
      const latestProduct = latest.data;
      // Normalize sizes in the revalidated product as well
      const normalizeSizes = (sizes: Array<{ size: string; stock: number }>): Array<{ size: string; stock: number }> => {
        const expanded: Array<{ size: string; stock: number }> = [];
        (sizes || []).forEach((s) => {
          if (typeof s.size === 'string' && s.size.includes(',')) {
            s.size.split(',').map(part => part.trim()).filter(Boolean).forEach(part => {
              expanded.push({ size: part, stock: s.stock });
            });
          } else {
            expanded.push(s);
          }
        });
        const seen = new Set<string>();
        const result: Array<{ size: string; stock: number }> = [];
        for (const item of expanded) {
          if (!seen.has(item.size)) {
            seen.add(item.size);
            result.push(item);
          }
        }
        return result;
      };
      const normalized = normalizeSizes(latestProduct.sizes || []);
      latestProduct.sizes = normalized;
      const selectedSizeData = (normalized || []).find((s: any) => s.size === selectedSize);
      if (!selectedSizeData || selectedSizeData.stock <= 0) {
        setProduct(latestProduct);
        const firstAvailable = (latestProduct.sizes || []).find((s: any) => s.stock > 0);
        setSelectedSize(firstAvailable ? firstAvailable.size : "");
        setSizeError('Selected size is no longer available. Please choose another size.');
        return;
      }

      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cart.find((item: any) => 
        item._id === product._id && item.selectedSize === selectedSize
      );
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({ 
          ...product, 
          quantity, 
          selectedSize,
          selectedColor
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      setSizeError("");
      alert('Added to cart!');
    } catch (e) {
      setSizeError('Could not validate size availability. Please try again.');
    }
  };

  const nextImage = () => {
    if (product && product.images.length > 0) {
      setSelectedImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product && product.images.length > 0) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 font-sans flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 flex items-center justify-center">
          <div className="text-xl">Loading product...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 font-sans flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 flex items-center justify-center">
          <div className="text-xl">Product not found</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-sm">
            <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/products" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Products
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 dark:text-white font-medium">{product.name}</span>
          </div>

          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
                <div className="aspect-square relative">
                  <Image
                    src={product.images[selectedImageIndex] || '/placeholder.jpg'}
                    alt={`${product.name} - View ${selectedImageIndex + 1}`}
                    fill
                    className="object-cover"
                    priority
                  />
                  
                  {/* Navigation Arrows */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-900/80 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-900 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-900/80 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-900 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === index
                          ? 'border-blue-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={image || '/placeholder.jpg'}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Description below images on desktop only */}
              <div className="hidden lg:block bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Leather Care Section */}
              {product.leathercare && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Leather Care
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {product.leathercare}
                  </p>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(averageRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {averageRating.toFixed(1)} ({reviews.length} reviews)
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  ₹{product.price.toLocaleString()}
                </p>
              </div>

              {/* Color Selection - Only show if admin added colors */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Color: {selectedColor}
                  </h3>
                  <div className="flex gap-3 flex-wrap">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-lg border-2 transition-colors font-medium ${
                          selectedColor === color
                            ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-500 text-gray-900 dark:text-white'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Size: {selectedSize || 'Select a size'}
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((sizeData) => {
                    const isAvailable = sizeData.stock > 0;
                    return (
                      <button
                        key={sizeData.size}
                        onClick={() => {
                          if (isAvailable) {
                            setSelectedSize(sizeData.size);
                            setSizeError("");
                          }
                        }}
                        disabled={!isAvailable}
                        className={`py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                          selectedSize === sizeData.size
                            ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                            : isAvailable
                            ? 'bg-white text-black border-gray-300 hover:border-gray-500 dark:bg-gray-900 dark:text-white dark:border-gray-600'
                            : 'bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700'
                        }`}
                      >
                        {sizeData.size}
                      </button>
                    );
                  })}
                </div>
                {sizeError && (
                  <p className="text-sm text-red-600 mt-2">{sizeError}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Quantity
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium text-gray-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={addToCart}
                  className="w-full bg-black text-white dark:bg-white dark:text-black py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={addToWishlist}
                  className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-4 rounded-xl font-semibold text-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Heart className="w-5 h-5" />
                  Add to Wishlist
                </button>
              </div>

              {/* Description repositioned for mobile: below wishlist, above reviews */}
              <div className="block lg:hidden bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Customer Reviews ({reviews.length})
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review, idx) => {
                const name = typeof review.user === 'string' ? review.user : (review.user?.name || 'Anonymous');
                const initial = name?.charAt(0)?.toUpperCase() || '?';
                return (
                <div key={review._id || idx} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center font-semibold text-gray-700 dark:text-gray-300">
                      {initial}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{name}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{review.comment}</p>
                  {review.createdAt && (
                    <p className="text-sm text-gray-500 dark:text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                  )}
                </div>
              );})}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}