import api from './axios';

class AuthService {
  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  // Get stored token
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Store authentication data
  setAuth(token, user) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Clear authentication data
  clearAuth() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Get current user from localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }

  // Vendor registration
  async registerVendor(vendorData) {
    try {
      const response = await api.post('/auth/vendor/register', vendorData);
      
      if (response.success) {
        // Store authentication data
        this.setAuth(response.token, response.user);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Vendor login
  async loginVendor(credentials) {
    try {
      const response = await api.post('/auth/vendor/login', credentials);
      
      if (response.success) {
        // Store authentication data
        this.setAuth(response.token, response.user);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // User registration
  async registerUser(userData) {
    try {
      const response = await api.post('/auth/user/register', userData);
      
      if (response.success) {
        // Store authentication data
        response.user.userType = 'user'; // Add user type for frontend
        this.setAuth(response.token, response.user);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // User login
  async loginUser(credentials) {
    try {
      const response = await api.post('/auth/user/login', credentials);
      
      if (response.success) {
        // Store authentication data
        response.user.userType = 'user'; // Add user type for frontend
        this.setAuth(response.token, response.user);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get current user profile from API
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      
      if (response.success) {
        // Update stored user data
        const userData = response.data;
        userData.userType = userData.userType || 'vendor'; // Default to vendor for existing users
        
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      // Call backend logout endpoint
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      this.clearAuth();
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const response = await api.post('/auth/refresh');
      
      if (response.success) {
        // Update stored token
        localStorage.setItem('authToken', response.token);
        return response.token;
      }
      
      return null;
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService(); 