import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.usebyteme.com/api',
  baseURL:import.meta.env.VITE_API_BASE_URL,
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
    
    // All other requests (including /tables, /menu, /analytics) are vendor requests
    const isVendorRequest = !isCustomerRequest;
    
    // Additional context: if we're in a vendor context (like dashboard), prefer vendor token
    const isVendorContext = window.location.pathname.includes('/vendor') || 
                           window.location.pathname.includes('/dashboard') ||
                           window.location.pathname.includes('/menu') ||
                           window.location.pathname.includes('/tables') ||
                           window.location.pathname.includes('/analytics');
    
    // Additional context: if we're in a customer context (like menu), prefer customer token
    const isCustomerContext = window.location.pathname.includes('/customer') ||
                             window.location.pathname.includes('/menu') && window.location.search.includes('restaurant');
    
    // Check which tokens are available
    const customerToken = localStorage.getItem('customerAuthToken');
    const vendorToken = localStorage.getItem('vendorAuthToken');
    const hasCustomerToken = !!customerToken;
    const hasVendorToken = !!vendorToken;
    
    let token;
    let tokenSource = 'unknown';
    
    if (isCustomerRequest) {
      // Use customer token for customer-related requests
      token = customerToken;
      tokenSource = 'customer-request';
      console.log('🔗 Axios: Customer request to', config.url, 'Token:', !!token);
    } else if (isVendorRequest) {
      // Use vendor token for vendor-related requests
      token = vendorToken;
      tokenSource = 'vendor-request';
      console.log('🔗 Axios: Vendor request to', config.url, 'Token:', !!token);
    } else {
      // Fallback: use context to determine which token to use
      if (isVendorContext && hasVendorToken) {
        token = vendorToken;
        tokenSource = 'vendor-context';
      } else if (isCustomerContext && hasCustomerToken) {
        token = customerToken;
        tokenSource = 'customer-context';
      } else {
        // Final fallback: try vendor token first, then customer token
        token = vendorToken || customerToken;
        tokenSource = 'fallback';
      }
      console.log('🔗 Axios: Fallback request to', config.url, 'Token:', !!token, 'Source:', tokenSource);
    }
    
    // Log the request categorization for debugging
    console.log('🔗 Axios: Request categorization:', {
      url: config.url,
      method: config.method,
      isCustomerRequest,
      isVendorRequest,
      isVendorContext,
      isCustomerContext,
      hasCustomerToken,
      hasVendorToken,
      tokenSource,
      tokenType: isCustomerRequest ? 'customerAuthToken' : (isVendorRequest ? 'vendorAuthToken' : 'fallback'),
      hasToken: !!token,
      concurrentAuth: hasCustomerToken && hasVendorToken,
      currentPath: window.location.pathname,
      currentSearch: window.location.search
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔗 Axios: Authorization header added for', config.url);
    } else {
      console.log('🔗 Axios: No token found for request to', config.url);
      console.log('🔗 Axios: Available tokens:');
      console.log('  - customerAuthToken:', hasCustomerToken);
      console.log('  - vendorAuthToken:', hasVendorToken);
      console.log('🔗 Axios: Request type:', isCustomerRequest ? 'customer' : (isVendorRequest ? 'vendor' : 'unknown'));
      if (hasCustomerToken && hasVendorToken) {
        console.log('🔗 Axios: WARNING - Both tokens present, this might cause conflicts!');
      }
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
