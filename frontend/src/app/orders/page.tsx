"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { ordersApi, reviewsApi } from "@/lib/api";
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, CreditCard, Calendar } from "lucide-react";

interface OrderProduct {
  product: {
    id: string; // Firestore product document id
    name: string;
    images: string[];
  };
  quantity: number;
  size: string;
  price: number;
}

interface Order {
  _id: string;
  id?: string;
  user: {
    name: string;
    email: string;
    phone?: string;
    address: string;
  };
  products: OrderProduct[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'out-for-delivery' | 'delivered' | 'cancelled';
  paymentMethod?: string;
  paymentStatus?: 'paid' | 'pending' | 'cod';
  createdAt: string;
  expectedDeliveryDate?: string;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'Order Placed',
    description: 'Your order has been received and is being processed'
  },
  processing: {
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Processing',
    description: 'Your order is being prepared for shipment'
  },
  shipped: {
    icon: Truck,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    label: 'Shipped',
    description: 'Your order is on its way to you'
  },
  'out-for-delivery': {
    icon: Truck,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    label: 'Out for Delivery',
    description: 'Your order is out for delivery and will arrive soon'
  },
  delivered: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Delivered',
    description: 'Your order has been successfully delivered'
  },
  cancelled: {
    icon: Clock,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Cancelled',
    description: 'This order has been cancelled'
  }
};

export default function MyOrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, { rating: number; comment: string; submitted?: boolean }>>({});

  const updateDraft = (key: string, updates: Partial<{ rating: number; comment: string; submitted?: boolean }>) => {
    setReviewDrafts(prev => ({ ...prev, [key]: { rating: prev[key]?.rating || 0, comment: prev[key]?.comment || '', ...updates } }));
  };

  const submitReview = async (orderId: string, product: { id: string; name: string }) => {
    const key = `${orderId}_${product.id}`;
    const draft = reviewDrafts[key] || { rating: 0, comment: '' };
    if (!draft.rating) {
      alert('Please select a star rating');
      return;
    }
    try {
      await reviewsApi.create({
        productId: product.id,
        orderId,
        user: { uid: user?.uid, name: user?.name },
        rating: draft.rating,
        comment: draft.comment || '',
      });
      updateDraft(key, { submitted: true });
      alert('Review submitted successfully');
    } catch (error) {
      console.error('Failed to submit review', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setCancellingOrder(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Update the order status in the local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: 'cancelled' as const }
              : order
          )
        );
        alert('Order cancelled successfully');
      } else {
        throw new Error('Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setCancellingOrder(null);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const res = await ordersApi.getByUser(user.uid);
        // Ensure we have an array of orders
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error('Failed to load orders', e);
        // Set empty array on error to prevent undefined issues
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const getEstimatedDelivery = (order: Order) => {
    if (order.status === 'delivered') return 'Delivered';
    if (order.status === 'cancelled') return 'Cancelled';
    
    // Use expectedDeliveryDate if available, otherwise calculate from createdAt
    if (order.expectedDeliveryDate) {
      const deliveryDate = new Date(order.expectedDeliveryDate);
      return deliveryDate.toLocaleDateString('en-IN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    
    // Fallback: calculate 15 days from order date
    const orderDate = new Date(order.createdAt);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(orderDate.getDate() + 15);
    
    return deliveryDate.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600">Please sign in to view your orders.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">When you place your first order, it will appear here.</p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const orderId = order._id || order.id || '';
              const config = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              
              return (
                <div key={orderId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{orderId.slice(-8).toUpperCase()}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-0 text-right">
                        <div className="text-2xl font-bold text-gray-900">₹{(order.total || 0).toFixed(2)}</div>
                        <div className="text-sm text-gray-600">{order.products?.length || 0} item(s)</div>
                      </div>
                    </div>
                  </div>

                  {/* Order Status */}
                  <div className={`px-6 py-4 ${config.bgColor} border-l-4 ${config.borderColor}`}>
                    <div className="flex items-center space-x-3">
                      <StatusIcon className={`w-6 h-6 ${config.color}`} />
                      <div>
                        <h4 className={`font-semibold ${config.color}`}>{config.label}</h4>
                        <p className="text-sm text-gray-600">{config.description}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm">
                      <span className="text-gray-600">Expected delivery: </span>
                      <span className="font-medium text-gray-900">
                        {getEstimatedDelivery(order)}
                      </span>
                    </div>
                  </div>

                  {/* Order Products */}
                  <div className="px-6 py-4">
                    <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                    <div className="space-y-4">
                      {order.products?.map((item, index) => (
                        <div key={index} className="flex flex-col space-y-3 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {item.product?.images && item.product.images.length > 0 ? (
                              <img
                                src={item.product.images[0]}
                                alt={item.product?.name || 'Product'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</h5>
                            <p className="text-sm text-gray-600">
                              Size: {item.size || 'N/A'} • Quantity: {item.quantity || 0}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">₹{(item.price || 0).toFixed(2)}</p>
                            <p className="text-sm text-gray-600">
                              Total: ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                            </p>
                          </div>
                          </div>

                          {/* Review form for delivered orders */}
                          {order.status === 'delivered' && (
                            <div className="mt-2 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-gray-900">Rate & Review</span>
                                  <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 border border-green-200">Verified purchase</span>
                                </div>
                                <span className="text-xs text-gray-500">Order #{(order._id || order.id || '').slice(-8).toUpperCase()}</span>
                              </div>
                              {(() => {
                                const orderId = order._id || order.id || '';
                                const key = `${orderId}_${item.product?.id || ''}`;
                                const draft = reviewDrafts[key] || { rating: 0, comment: '' };
                                return (
                                  <div className="mt-3">
                                    <div className="flex items-center gap-1">
                                      {[1,2,3,4,5].map(i => (
                                        <button
                                          key={i}
                                          type="button"
                                          aria-label={`${i} star`}
                                          onClick={() => updateDraft(key, { rating: i })}
                                          className="focus:outline-none transition-transform hover:scale-105"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 ${i <= (draft.rating || 0) ? 'text-amber-500 drop-shadow-sm' : 'text-gray-300'}`}>
                                            <path d="M11.48 3.499a.75.75 0 011.04 0l2.1 2.157 2.937.427a.75.75 0 01.416 1.279l-2.123 2.07.501 2.922a.75.75 0 01-1.088.79L12 12.533l-2.628 1.611a.75.75 0 01-1.088-.79l.5-2.922-2.122-2.07a.75.75 0 01.416-1.28l2.937-.426 2.1-2.157z" />
                                          </svg>
                                        </button>
                                      ))}
                                    </div>
                                    <textarea
                                      rows={3}
                                      placeholder="Share something helpful about fit, feel, or quality..."
                                      value={draft.comment}
                                      onChange={(e) => updateDraft(key, { comment: e.target.value })}
                                      className="mt-3 w-full text-sm px-3 py-2 border rounded-md focus:ring-2 focus:ring-black focus:border-black bg-gray-50"
                                    />
                                    <div className="mt-3 flex items-center justify-between">
                                      <p className="text-xs text-gray-500">Your review helps other shoppers.</p>
                                      <button
                                        onClick={() => submitReview(orderId, { id: item.product?.id || '', name: item.product?.name || '' })}
                                        disabled={!draft.rating || draft.submitted}
                                        className={`px-4 py-2 rounded-md text-sm font-semibold ${draft.submitted ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-gray-800'} disabled:opacity-50`}
                                      >
                                        {draft.submitted ? 'Submitted' : 'Submit Review'}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary & Details */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Payment Information */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <CreditCard className="w-5 h-5 mr-2" />
                          Payment Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Method:</span>
                            <span className="font-medium">
                              {order.paymentMethod || 'Cash on Delivery'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Status:</span>
                            <span className={`font-medium ${
                              (order.paymentStatus === 'paid') ? 'text-green-600' : 
                              (order.paymentStatus === 'cod') ? 'text-blue-600' : 'text-yellow-600'
                            }`}>
                              {order.paymentStatus === 'paid' ? 'Paid' : 
                               order.paymentStatus === 'cod' ? 'Cash on Delivery' : 'Pending'}
                            </span>
                          </div>
                          <div className="flex justify-between font-semibold text-base pt-2 border-t">
                            <span>Total Amount:</span>
                            <span>₹{(order.total || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Information */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <MapPin className="w-5 h-5 mr-2" />
                          Delivery Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Delivery Address:</span>
                            <p className="font-medium mt-1">{order.user?.address || 'Address not available'}</p>
                          </div>
                          {order.user?.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{order.user.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Cancel Order Button */}
                    {(order.status === 'pending' || order.status === 'processing') && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={cancellingOrder === order._id}
                          className="w-full sm:w-auto bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingOrder === order._id ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}