import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check if this is a customer-related request
    // Customer requests: /auth/user/*, /customer/*, POST /orders (placing orders)
    // Vendor requests: /auth/vendor/*, /menu/*, /tables/*, /analytics/*, GET /orders (managing orders)
    const isCustomerRequest = config.url.includes('/auth/user') || 
                             config.url.includes('/customer') ||
                             (config.url.includes('/orders') && config.method?.toLowerCase() === 'post');
    
    let token;
    if (isCustomerRequest) {
      // Use customer token for customer-related requests
      token = localStorage.getItem('customerAuthToken');
      console.log('🔗 Axios: Customer request to', config.url, 'Token:', !!token);
    } else {
      // Use vendor token for vendor-related requests
      token = localStorage.getItem('vendorAuthToken');
      console.log('🔗 Axios: Vendor request to', config.url, 'Token:', !!token);
    }
    
    // Log the request categorization for debugging
    console.log('🔗 Axios: Request categorization:', {
      url: config.url,
      isCustomerRequest,
      tokenType: isCustomerRequest ? 'customerAuthToken' : 'vendorAuthToken',
      hasToken: !!token
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔗 Axios: Authorization header added for', config.url);
    } else {
      console.log('🔗 Axios: No token found for request to', config.url);
      console.log('🔗 Axios: Available tokens:');
      console.log('  - customerAuthToken:', !!localStorage.getItem('customerAuthToken'));
      console.log('  - vendorAuthToken:', !!localStorage.getItem('vendorAuthToken'));
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
      throw new Error(error.response.data.message || `HTTP error! status: ${error.response.status}`);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request);
      throw new Error('Network error - no response received');
    } else {
      // Something else happened
      console.error('Request Error:', error.message);
      throw error;
    }
  }
);

export default api; 