import axios from 'axios';

const RAW_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_BASE_URL = (() => {
  try {
    const u = new URL(RAW_BASE_URL);
    const origin = `${u.protocol}//${u.host}`;
    return origin + '/api';
  } catch {
    return 'http://localhost:4000/api';
  }
})();

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'admin123';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

// Products API
export const productsApi = {
  getAll: () => api.get('/products'),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: FormData) => api.post('/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id: string, data: FormData) => api.put(`/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Orders API
export const ordersApi = {
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string) => api.put(`/orders/${id}`, { status }),
  getStats: () => api.get('/orders/stats/overview'),
  getByUser: (uid: string) => axios.get(`${API_BASE_URL}/orders/user/${uid}`), // No API key needed for user orders
};

// Authentication API
export const authApi = {
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),
  signup: (userData: any) => 
    api.post('/auth/signup', userData),
  getMe: (token: string) => 
    api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
  updateCart: (token: string, cart: any[]) => 
    api.put('/auth/cart', { cart }, { headers: { Authorization: `Bearer ${token}` } }),
  updateWishlist: (token: string, wishlist: any[]) => 
    api.put('/auth/wishlist', { wishlist }, { headers: { Authorization: `Bearer ${token}` } }),
};

// Payment API
export const paymentApi = {
  createOrder: (orderData: any) => {
    console.log('Creating order with base URL:', API_BASE_URL);
    console.log('Order data:', orderData);
    return api.post('/payment/create-order', orderData);
  },
  verifyPayment: (paymentData: any) => 
    api.post('/payment/verify', paymentData),
};

export const usersApi = {
  saveProfile: (uid: string, profile: any) => api.post('/users/profile', { uid, profile }),
};

// Reviews API
export const reviewsApi = {
  getByProduct: (productId: string) => api.get(`/reviews/product/${productId}`),
  create: (data: { productId: string; orderId?: string; user?: any; rating: number; comment?: string }) =>
    api.post('/reviews', data),
};

export default api;
