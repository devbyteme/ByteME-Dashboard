import api from './axios';

class CustomerAuthService {
  // Check if customer is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('customerAuthToken');
    return !!token;
  }

  // Get stored customer token
  getToken() {
    return localStorage.getItem('customerAuthToken');
  }

  // Store customer authentication data
  setAuth(token, user) {
    localStorage.setItem('customerAuthToken', token);
    localStorage.setItem('customerUser', JSON.stringify(user));
    localStorage.setItem('customerSessionActive', 'true');
  }

  // Clear customer authentication data
  clearAuth() {
    localStorage.removeItem('customerAuthToken');
    localStorage.removeItem('customerUser');
    localStorage.removeItem('customerSessionActive');
  }

  // Get current customer from localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('customerUser');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing customer user data:', error);
        return null;
      }
    }
    return null;
  }

  // Customer registration
  async registerUser(userData) {
    try {
      const response = await api.post('/auth/user/register', userData);
      
      if (response.success) {
        // Store authentication data
        this.setAuth(response.token, response.user);
        return response;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      throw error;
    }
  }

  // Customer login
  async loginUser(credentials) {
    try {
      const response = await api.post('/auth/user/login', credentials);
      
      if (response.success) {
        // Store authentication data
        this.setAuth(response.token, response.user);
        return response;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  }

  // Logout customer
  async logout() {
    try {
      // Call backend logout endpoint
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Customer logout error:', error);
    } finally {
      // Always clear local storage
      this.clearAuth();
    }
  }
}

export default new CustomerAuthService();
