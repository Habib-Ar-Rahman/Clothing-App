"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Smartphone, QrCode } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function UpiPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const method = searchParams.get('method') || 'upi';
  
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);

  const getMethodDisplay = (method: string) => {
    switch (method.toLowerCase()) {
      case 'phonepe':
        return { name: 'PhonePe', color: 'bg-purple-600 hover:bg-purple-700' };
      case 'googlepay':
        return { name: 'Google Pay', color: 'bg-blue-600 hover:bg-blue-700' };
      case 'paytm':
        return { name: 'Paytm', color: 'bg-blue-500 hover:bg-blue-600' };
      default:
        return { name: 'UPI', color: 'bg-green-600 hover:bg-green-700' };
    }
  };

  const methodDisplay = getMethodDisplay(method);

  const handlePayment = async () => {
    if (!upiId) {
      alert('Please enter your UPI ID');
      return;
    }

    if (!upiId.includes('@')) {
      alert('Please enter a valid UPI ID (e.g., user@paytm)');
      return;
    }

    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      router.push(`/orders/success?orderId=${orderId}&amount=${amount}&paymentMethod=${method}&status=success`);
    }, 3000);
  };

  const handleQRPayment = () => {
    setProcessing(true);
    
    // Simulate QR code payment
    setTimeout(() => {
      router.push(`/orders/success?orderId=${orderId}&amount=${amount}&paymentMethod=${method}&status=success`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <Smartphone className="w-8 h-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {methodDisplay.name} Payment
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Pay using UPI
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                <span className="font-mono text-sm">{orderId}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  ₹{amount}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {/* UPI ID Payment */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Pay with UPI ID
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Enter UPI ID
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@paytm"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={processing || !upiId}
                    className={`w-full text-white py-3 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${methodDisplay.color}`}
                  >
                    {processing ? 'Processing Payment...' : `Pay ₹${amount} with UPI ID`}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">OR</span>
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
              </div>

              {/* QR Code Payment */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Scan QR Code
                </h3>
                <div className="text-center">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 mb-4">
                    <QrCode className="w-32 h-32 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                      Scan this QR code with your UPI app
                    </p>
                  </div>

                  <button
                    onClick={handleQRPayment}
                    disabled={processing}
                    className={`w-full text-white py-3 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${methodDisplay.color}`}
                  >
                    {processing ? 'Processing Payment...' : 'I have scanned and paid'}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.back()}
              className="w-full mt-6 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
            >
              Back to Checkout
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}