import api from './axios';

class AuthService {
  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('vendorAuthToken');
    console.log('🔐 AuthService: Checking vendor authentication - token exists:', !!token);
    return !!token;
  }

  // Get stored token
  getToken() {
    return localStorage.getItem('vendorAuthToken');
  }

  // Store authentication data
  setAuth(token, user) {
    console.log('🔐 AuthService: Setting vendor auth data - token length:', token ? token.length : 0);
    localStorage.setItem('vendorAuthToken', token);
    localStorage.setItem('vendorUser', JSON.stringify(user));
    console.log('🔐 AuthService: Vendor auth data stored successfully');
  }

  // Clear authentication data (vendor-specific only)
  clearAuth() {
    // Clear only vendor-specific auth tokens and user data
    localStorage.removeItem('vendorAuthToken');
    localStorage.removeItem('vendorUser');
    localStorage.removeItem('authToken'); // Legacy support
    localStorage.removeItem('user'); // Legacy support
    
    console.log('🔐 AuthService: Vendor authentication data cleared from localStorage');
  }

  // Get current user from localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('vendorUser');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing vendor user data:', error);
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
        
        localStorage.setItem('vendorUser', JSON.stringify(userData));
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
        localStorage.setItem('vendorAuthToken', response.token);
        return response.token;
      }
      
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Forgot password - send reset email
  async forgotPassword(emailData) {
    try {
      const response = await api.post('/auth/forgot-password', emailData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Reset password with token
  async resetPassword(resetData) {
    try {
      const response = await api.post('/auth/reset-password', resetData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update user profile (personal information)
  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/me', profileData);
      
      if (response.success) {
        // Update stored user data
        const updatedUser = response.data;
        updatedUser.userType = updatedUser.userType || 'vendor';
        localStorage.setItem('vendorUser', JSON.stringify(updatedUser));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update vendor profile (restaurant information)
  async updateVendorProfile(vendorData) {
    try {
      const response = await api.put('/vendors/profile', vendorData);
      
      if (response.success) {
        // Update stored user data with vendor information
        const currentUser = this.getCurrentUser();
        const updatedUser = {
          ...currentUser,
          ...response.data,
          userType: 'vendor'
        };
        localStorage.setItem('vendorUser', JSON.stringify(updatedUser));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get vendor profile by ID (for customers to fetch vendor billing settings)
  async getVendorProfile(vendorId) {
    try {
      const response = await api.get(`/vendors/${vendorId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Vendor Access Management
  async grantVendorAccess(accessData) {
    try {
      const response = await api.post('/vendor-access/grant', accessData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getVendorAccessList(vendorId) {
    try {
      const response = await api.get(`/vendor-access/vendor/${vendorId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getUserVendorAccess(userEmail) {
    try {
      const response = await api.get(`/vendor-access/user/${userEmail}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateVendorAccess(accessId, accessData) {
    try {
      const response = await api.put(`/vendor-access/${accessId}`, accessData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async revokeVendorAccess(accessId) {
    try {
      const response = await api.delete(`/vendor-access/${accessId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async acceptVendorAccess(accessId, userEmail) {
    try {
      const response = await api.post(`/vendor-access/${accessId}/accept`, { userEmail });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService(); 