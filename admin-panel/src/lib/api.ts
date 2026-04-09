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
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      headers: {
        'x-api-key': API_KEY, // normalized casing
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    const product = await response.json();
    return { data: product };
  },
  
  create: (data: FormData) => api.post('/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: async (id: string, formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'x-api-key': API_KEY, // normalized casing
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Failed to update product');
    }
    return response.json();
  },
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Orders API
export const ordersApi = {
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string) => api.put(`/orders/${id}`, { status }),
  getStats: () => api.get('/orders/stats/overview'),
};

export default api;
