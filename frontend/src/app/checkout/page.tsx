"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CreditCard, Smartphone, Truck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { paymentApi, usersApi } from "@/lib/api";
import { waitForFirebase } from "@/lib/firebase";

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: <CreditCard className="w-6 h-6" />,
    description: 'Pay securely with your card'
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    icon: <Smartphone className="w-6 h-6" />,
    description: 'Pay with PhonePe UPI'
  },
  {
    id: 'googlepay',
    name: 'Google Pay',
    icon: <Smartphone className="w-6 h-6" />,
    description: 'Pay with Google Pay'
  },
  {
    id: 'paytm',
    name: 'Paytm',
    icon: <Smartphone className="w-6 h-6" />,
    description: 'Pay with Paytm UPI'
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    icon: <Truck className="w-6 h-6" />,
    description: 'Pay when your order is delivered'
  }
];

export default function CheckoutPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [loading, setLoading] = useState(false);

  // Contact details and phone OTP state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  // Separate country code and local 10-digit phone
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  // Use refs for confirmation and reCAPTCHA
  const confirmationResultRef = useRef<any>(null);
  const recaptchaVerifierRef = useRef<any>(null);
  const verificationIdRef = useRef<string | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);

  // Address fields
  const [pincode, setPincode] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
    }
  }, [isAuthenticated, user, router]);

  const cartItems = user?.cart || [];
  const totalAmount = cartItems.reduce((total: number, item: any) =>
    total + (item.price * item.quantity), 0
  );

  useEffect(() => {
    let mounted = true;
    const initRecaptcha = async () => {
      try {
        await waitForFirebase();
        if (mounted && !recaptchaVerifierRef.current && recaptchaContainerRef.current) {
          recaptchaVerifierRef.current = new (window as any).firebase.auth.RecaptchaVerifier(
            recaptchaContainerRef.current,
            { size: 'normal' }
          );
          await recaptchaVerifierRef.current.render();
        }
      } catch (e) {
        console.error('reCAPTCHA init error:', e);
      }
    };
    initRecaptcha();
    return () => {
      mounted = false;
      try {
        if (recaptchaVerifierRef.current) {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
        }
      } catch {}
    };
  }, []);

  const sendOtp = async () => {
    setOtpError(null);
    setSendingOtp(true);
    try {
      const auth = await waitForFirebase();

      if (!/^\d{10}$/.test(phoneLocal)) {
        setOtpError('Please enter a valid 10-digit mobile number.');
        setSendingOtp(false);
        return;
      }

      if (!recaptchaVerifierRef.current) {
        if (!recaptchaContainerRef.current) {
          setOtpError('reCAPTCHA is not ready. Please try again.');
          setSendingOtp(false);
          return;
        }
        recaptchaVerifierRef.current = new (window as any).firebase.auth.RecaptchaVerifier(
          recaptchaContainerRef.current,
          { size: 'normal' }
        );
        await recaptchaVerifierRef.current.render();
      }
      const appVerifier = recaptchaVerifierRef.current;
      const fullPhone = `${countryCode}${phoneLocal}`;
      const currentUser = auth.currentUser;

      if (currentUser) {
        // If phone provider is already linked, switch to re-verification flow
        if (currentUser.phoneNumber) {
          const provider = new (window as any).firebase.auth.PhoneAuthProvider();
          verificationIdRef.current = await provider.verifyPhoneNumber(fullPhone, appVerifier);
          setOtpSent(true);
        } else {
          const confirmation = await currentUser.linkWithPhoneNumber(fullPhone, appVerifier);
          confirmationResultRef.current = confirmation;
          setOtpSent(true);
        }
      } else {
        // Not signed in: sign in with phone
        const confirmation = await auth.signInWithPhoneNumber(fullPhone, appVerifier);
        confirmationResultRef.current = confirmation;
        setOtpSent(true);
      }
    } catch (err: any) {
      console.error('OTP send error:', err);

      if (err?.code === 'auth/provider-already-linked') {
        // Fallback: re-verify an already-linked phone
        try {
          const auth = await waitForFirebase();
          const appVerifier = recaptchaVerifierRef.current;
          const fullPhone = `${countryCode}${phoneLocal}`;
          const provider = new (window as any).firebase.auth.PhoneAuthProvider();
          verificationIdRef.current = await provider.verifyPhoneNumber(fullPhone, appVerifier);
          setOtpSent(true);
        } catch (e) {
          setOtpError('Phone already linked and re-verification failed. Please try again.');
        }
      } else if (String(err?.message || '').includes('client element has been removed')) {
        try {
          if (recaptchaVerifierRef.current) {
            recaptchaVerifierRef.current.clear();
            recaptchaVerifierRef.current = null;
          }
          if (recaptchaContainerRef.current) {
            recaptchaVerifierRef.current = new (window as any).firebase.auth.RecaptchaVerifier(
              recaptchaContainerRef.current,
              { size: 'normal' }
            );
            await recaptchaVerifierRef.current.render();
          }
        } catch {}
        setOtpError('reCAPTCHA was reset. Please tap “Send OTP” again.');
      } else if (err?.code === 'auth/billing-not-enabled') {
        setOtpError('For real SMS, enable billing; use Firebase test numbers + codes locally.');
      } else {
        setOtpError(err?.message || 'Failed to send OTP');
      }
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    setOtpError(null);
    setVerifyingOtp(true);
    try {
      const auth = await waitForFirebase();

      // Re-authenticate already-linked phone users
      if (verificationIdRef.current) {
        const credential = (window as any).firebase.auth.PhoneAuthProvider.credential(
          verificationIdRef.current,
          otpCode
        );
        if (auth.currentUser) {
          await auth.currentUser.reauthenticateWithCredential(credential);
        } else {
          await auth.signInWithCredential(credential);
        }
        setPhoneVerified(true);
      } else if (confirmationResultRef.current) {
        await confirmationResultRef.current.confirm(otpCode);
        setPhoneVerified(true);
      } else {
        setOtpError('Please request OTP first');
      }
    } catch (err: any) {
      console.error('OTP verify error:', err);
      setOtpError(err?.message || 'Invalid OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!cartItems.length) return;

    const fullPhone = `${countryCode}${phoneLocal}`;

    const requiredFilled =
      fullName.trim() &&
      email.trim() &&
      phoneLocal.trim() &&
      phoneVerified &&
      pincode.trim() &&
      addressLine.trim() &&
      locality.trim() &&
      city.trim() &&
      stateName.trim();

    if (!requiredFilled) {
      alert('Please complete contact details, verify phone, and fill all address fields.');
      return;
    }

    setLoading(true);
    try {
      const combinedAddress = `${addressLine}, ${locality}, ${city}, ${stateName} - ${pincode}`;

      if (user?.uid) {
        await usersApi.saveProfile(user.uid, {
          name: fullName,
          email,
          phone: fullPhone,
          address: {
            pincode,
            addressLine,
            locality,
            city,
            state: stateName,
            combined: combinedAddress,
          },
        });
      }

      const orderData = {
        user: { uid: user?.uid, name: fullName, email },
        contact: { name: fullName, email, phone: fullPhone },
        address: { pincode, addressLine, locality, city, state: stateName },
        products: cartItems.map((item: any) => ({
          product: item._id,
          quantity: item.quantity,
          size: item.selectedSize,
          price: item.price,
        })),
        total: totalAmount,
        paymentMethod: selectedPayment,
        shippingAddress: combinedAddress,
      };

      console.log('Attempting to create order with data:', orderData);
      const response = await paymentApi.createOrder(orderData as any);
      const { paymentUrl } = response.data;
      window.location.href = paymentUrl || '/orders';
    } catch (error) {
      console.error('Order creation failed:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Details</h2>
              <div className="space-y-4">
                {/* Name label above box */}
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />

                {/* Email label above box */}
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />

                {/* Phone label above boxes */}
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <div className="flex gap-2">
                  {/* Country code box, default +91 */}
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-24 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none"
                  >
                    <option value="+91">+91</option>
                  </select>

                  {/* 10-digit number box */}
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phoneLocal}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhoneLocal(onlyDigits);
                    }}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={sendOtp}
                    disabled={sendingOtp || !/^\d{10}$/.test(phoneLocal)}
                    className="px-4 py-3 rounded-lg bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {sendingOtp ? 'Sending...' : (otpSent ? 'Resend OTP' : 'Send OTP')}
                  </button>
                </div>

                {otpSent && (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter OTP"
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={verifyOtp}
                      disabled={verifyingOtp || !otpCode}
                      className="px-4 py-3 rounded-lg bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {verifyingOtp ? 'Verifying...' : (phoneVerified ? 'Verified' : 'Verify OTP')}
                    </button>
                  </div>
                )}
                {otpError && (
                  <p className="text-red-600 text-sm">{otpError}</p>
                )}
                {/* Invisible reCAPTCHA container - keep mounted */}
                <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">House/Building, Street/Area</label>
                <input
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Locality/Town</label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City/District</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Payment Method
              </h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedPayment === method.id
                        ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-700'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={selectedPayment === method.id}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      {method.icon}
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {method.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {method.description}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-fit sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Order Summary
            </h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item: any) => (
                <div key={item._id} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={item.images[0] || '/placeholder.jpg'}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Size: {item.selectedSize} × {item.quantity}
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white border-t pt-2">
                <span>Total</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <button
              onClick={handlePlaceOrder}
              disabled={
                loading ||
                !fullName.trim() ||
                !email.trim() ||
                !/^\d{10}$/.test(phoneLocal) ||
                !phoneVerified ||
                !pincode.trim() ||
                !addressLine.trim() ||
                !locality.trim() ||
                !city.trim() ||
                !stateName.trim()
              }
              className="w-full mt-6 bg-black text-white dark:bg-white dark:text-black py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : `Place Order - ₹${totalAmount.toFixed(2)}`}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}