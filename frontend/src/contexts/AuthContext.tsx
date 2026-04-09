"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { waitForFirebase } from '@/lib/firebase';

interface User {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  cart: any[];
  wishlist: any[];
}

interface AuthContextType {
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateCart: (cart: any[]) => Promise<void>;
  updateWishlist: (wishlist: any[]) => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  setShowSignInModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignInModal, setShowSignInModal] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const auth = await waitForFirebase();
        
        // Listen for auth state changes
        auth.onAuthStateChanged((firebaseUser: any) => {
          if (firebaseUser) {
            const userData: User = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || undefined,
              cart: JSON.parse(localStorage.getItem(`cart_${firebaseUser.uid}`) || '[]'),
              wishlist: JSON.parse(localStorage.getItem(`wishlist_${firebaseUser.uid}`) || '[]')
            };
            setUser(userData);
            
            // Merge any existing localStorage cart/wishlist
            const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
            const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            
            if (localCart.length > 0) {
              localStorage.setItem(`cart_${firebaseUser.uid}`, JSON.stringify(localCart));
              localStorage.removeItem('cart');
              userData.cart = localCart;
            }
            
            if (localWishlist.length > 0) {
              localStorage.setItem(`wishlist_${firebaseUser.uid}`, JSON.stringify(localWishlist));
              localStorage.removeItem('wishlist');
              userData.wishlist = localWishlist;
            }
            
            setUser(userData);
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const auth = await waitForFirebase();
      const provider = new window.firebase.auth.GoogleAuthProvider();
      
      // Add scopes for profile information
      provider.addScope('profile');
      provider.addScope('email');
      
      await auth.signInWithPopup(provider);
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const auth = await waitForFirebase();
      await auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateCart = async (cart: any[]) => {
    if (user) {
      localStorage.setItem(`cart_${user.uid}`, JSON.stringify(cart));
      setUser(prev => prev ? { ...prev, cart } : null);
    } else {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  };

  const updateWishlist = async (wishlist: any[]) => {
    if (user) {
      localStorage.setItem(`wishlist_${user.uid}`, JSON.stringify(wishlist));
      setUser(prev => prev ? { ...prev, wishlist } : null);
    } else {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  };

  const value = {
    user,
    signInWithGoogle,
    logout,
    updateCart,
    updateWishlist,
    isAuthenticated: !!user,
    loading,
    showSignInModal,
    setShowSignInModal
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}