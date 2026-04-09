"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Heart, ShoppingCart, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const { user, isAuthenticated, signInWithGoogle, logout, showSignInModal, setShowSignInModal } = useAuth();

  // Update counts from localStorage and user data
  useEffect(() => {
    const updateCounts = () => {
      if (isAuthenticated && user) {
        setCartCount(user.cart?.length || 0);
        setWishlistCount(user.wishlist?.length || 0);
      } else {
        // For non-authenticated users, get from localStorage
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setCartCount(cart.length);
        setWishlistCount(wishlist.length);
      }
    };

    updateCounts();

    // Listen for cart and wishlist updates
    const handleCartUpdate = () => updateCounts();
    const handleWishlistUpdate = () => updateCounts();

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, [isAuthenticated, user]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      setShowSignInModal(false);
    } catch (error) {
      console.error('Sign-in failed:', error);
    }
  };

  return (
    <>
      <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-xl border-b border-gray-200/20 dark:border-gray-700/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20 relative">
            {/* Left: Navigation Links (Desktop) and Menu button (Mobile) */}
            <div className="flex-1 flex justify-start items-center">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2.5 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl md:hidden"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              
              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center gap-8 ml-4">
                <Link href="/" className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-all duration-200 relative group">
                  Home
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link href="/products" className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-all duration-200 relative group">
                  Products
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link href="/about" className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-all duration-200 relative group">
                  About
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </div>

              {/* Center: Logo - absolutely centered across navbar */}
              <Link href="/" className="absolute left-1/2 -translate-x-1/2">
                <Image
                  src="/Velewera_name.png"
                  alt="Velewera Logo"
                  width={160}
                  height={45}
                  className="object-contain drop-shadow-lg"
                  priority
                />
              </Link>
            </div>

            {/* Right: Cart, Wishlist, and Auth */}
            <div className="flex-1 flex justify-end items-center gap-2">

              {/* Cart and Wishlist - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-1">
                <Link href="/wishlist" className="p-2.5 text-gray-700 dark:text-gray-200 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 relative hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl group">
                  <Heart className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link href="/cart" className="p-2.5 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 relative hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl group">
                  <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* User Authentication */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-2.5 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                  >
                    {user?.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt="Profile"
                        width={28}
                        height={28}
                        className="rounded-full ring-2 ring-indigo-500/20"
                      />
                    ) : (
                      <div className="w-7 h-7 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="hidden sm:block font-semibold">{user?.name}</span>
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/20 dark:border-gray-700/20 overflow-hidden">
                      <div className="py-2">
                        <Link 
                          href="/orders" 
                          className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          My Orders
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowSignInModal(true)}
                  className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-t border-gray-200/20 dark:border-gray-700/20">
            <div className="flex flex-col py-4 px-4 space-y-1">
              <Link 
                href="/" 
                className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold py-3 px-4 rounded-lg transition-all duration-200" 
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/products" 
                className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold py-3 px-4 rounded-lg transition-all duration-200" 
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                href="/about" 
                className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold py-3 px-4 rounded-lg transition-all duration-200" 
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              
              {/* Mobile Cart and Wishlist */}
              <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-2 mt-2">
                <Link 
                  href="/wishlist" 
                  className="text-gray-700 dark:text-gray-200 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center gap-3" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="w-5 h-5" />
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-auto">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link 
                  href="/cart" 
                  className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center gap-3" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-auto">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Google Sign-In Modal (controlled by global AuthContext) */}
      {showSignInModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-200/20 dark:border-gray-700/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to Velewera
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Sign in to save your cart, wishlist, and checkout faster.
              </p>
              <button
                onClick={handleGoogleSignIn}
                className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Continue with Google
              </button>
              <button
                onClick={() => setShowSignInModal(false)}
                className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
