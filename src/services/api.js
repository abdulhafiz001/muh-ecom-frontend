import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getUser: () => api.get('/auth/user'),
};

// Categories API calls
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  getAllCategories: () => api.get('/categories'), // Alias for admin use
};

// Products API calls
export const productsAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  getByCategory: (categoryId, params = {}) => 
    api.get(`/products/category/${categoryId}`, { params }),
  getAllProducts: () => api.get('/products'), // Alias for admin use
};

// Cart API calls
export const cartAPI = {
  getCart: (userId) => api.get(`/cart?user_id=${userId || 1}`),
  addToCart: (productId, quantity, userId) => 
    api.post('/cart/add', { product_id: productId, quantity, user_id: userId || 1 }),
  updateCartItem: (itemId, quantity, userId) => 
    api.put(`/cart/${itemId}?user_id=${userId || 1}`, { quantity }),
  removeFromCart: (itemId, userId) => api.delete(`/cart/${itemId}?user_id=${userId || 1}`),
  clearCart: (userId) => api.delete(`/cart?user_id=${userId || 1}`),
};

// Orders API calls
export const ordersAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getUserOrders: (userId) => api.get(`/orders?user_id=${userId || 1}`),
  getOrder: (id, userId) => api.get(`/orders/${id}?user_id=${userId || 1}`),
  getOrderById: (id, userId) => api.get(`/orders/${id}?user_id=${userId || 1}`),
  deleteOrder: (id, userId) => api.delete(`/orders/${id}?user_id=${userId || 1}`),
  getAllOrders: () => api.get('/admin/orders/all'), // For admin use
};

// Payment API calls
export const paymentAPI = {
  initializePayment: (paymentData) => api.post('/payment/initialize', paymentData),
  verifyPayment: (verificationData) => api.post('/payment/verify', verificationData),
  getPaymentStatus: (params) => api.get('/payment/status', { params }),
};

// Admin Products API calls
export const adminProductsAPI = {
  getAllProducts: () => api.get('/admin/products/all'),
  getProduct: (id) => api.get(`/admin/products/${id}`),
  createProduct: (productData) => api.post('/admin/products', productData),
  updateProduct: (id, productData) => api.put(`/admin/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
};

// Admin Users API calls
export const adminUsersAPI = {
  getAllUsers: () => api.get('/admin/users/all'),
};

// Admin Categories API calls
export const adminCategoriesAPI = {
  getAllCategories: () => api.get('/admin/categories'),
  getCategory: (id) => api.get(`/admin/categories/${id}`),
  createCategory: (categoryData) => api.post('/admin/categories', categoryData),
  updateCategory: (id, categoryData) => api.put(`/admin/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
};

// Admin API calls (legacy - keeping for backward compatibility)
export const adminAPI = {
  getProducts: (params = {}) => api.get('/admin/products', { params }),
  createProduct: (productData) => api.post('/admin/products', productData),
  updateProduct: (id, productData) => api.put(`/admin/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
};

export default api;
