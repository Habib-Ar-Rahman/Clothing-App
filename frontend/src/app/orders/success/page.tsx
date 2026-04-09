"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { CheckCircle, Package, CreditCard, Smartphone, Truck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, updateCart } = useAuth();
  
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const paymentMethod = searchParams.get('paymentMethod');
  const status = searchParams.get('status');

  // Clear cart after successful order
  useEffect(() => {
    const clearCart = async () => {
      if (status === 'confirmed' || status === 'success') {
        // Clear cart for authenticated users
        if (user) {
          await updateCart([]);
        } else {
          // Clear cart for non-authenticated users
          localStorage.removeItem('cart');
          window.dispatchEvent(new Event('cartUpdated'));
        }
      }
    };

    clearCart();
  }, [status, user, updateCart]);

  const getPaymentMethodDisplay = (method: string | null) => {
    switch (method) {
      case 'card':
        return { name: 'Credit/Debit Card', icon: <CreditCard className="w-5 h-5" /> };
      case 'phonepe':
        return { name: 'PhonePe', icon: <Smartphone className="w-5 h-5" /> };
      case 'googlepay':
        return { name: 'Google Pay', icon: <Smartphone className="w-5 h-5" /> };
      case 'paytm':
        return { name: 'Paytm', icon: <Smartphone className="w-5 h-5" /> };
      case 'cod':
      case 'cash-on-delivery':
        return { name: 'Cash on Delivery', icon: <Truck className="w-5 h-5" /> };
      default:
        return { name: 'Unknown', icon: <Package className="w-5 h-5" /> };
    }
  };

  const paymentDisplay = getPaymentMethodDisplay(paymentMethod);
  const isConfirmed = status === 'confirmed' || status === 'success';
  const isCOD = paymentMethod === 'cod' || paymentMethod === 'cash-on-delivery';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {isCOD ? 'Order Confirmed!' : 'Payment Successful!'}
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {isCOD 
                ? 'Your order has been confirmed and will be delivered to your address.'
                : 'Thank you for your payment. Your order has been confirmed.'
              }
            </p>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Details</h2>
              
              <div className="space-y-3 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                  <span className="font-mono text-sm bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                    {orderId || 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ₹{amount || '0.00'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                  <div className="flex items-center gap-2">
                    {paymentDisplay.icon}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {paymentDisplay.name}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="text-green-600 font-medium">
                    {isCOD ? 'Confirmed' : 'Paid'}
                  </span>
                </div>
              </div>
            </div>

            {isCOD && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <Truck className="w-5 h-5" />
                  <span className="font-medium">Cash on Delivery</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Please keep the exact amount ready when your order arrives.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/orders')}
                className="bg-black text-white dark:bg-white dark:text-black px-6 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-semibold"
              >
                View My Orders
              </button>
              
              <button
                onClick={() => router.push('/products')}
                className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}