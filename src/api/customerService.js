import api from './axios';

// Customer Profile service
export const customerService = {
  // Get all customer profiles
  async getAll() {
    return api.get('/customers');
  },

  // Get customer profile by ID
  async getById(id) {
    return api.get(`/customers/${id}`);
  },

  // Create new customer profile
  async create(customer) {
    return api.post('/customers', customer);
  },

  // Update customer profile
  async update(id, customer) {
    return api.put(`/customers/${id}`, customer);
  },

  // Delete customer profile
  async delete(id) {
    return api.delete(`/customers/${id}`);
  },

  // Get customer by email
  async getByEmail(email) {
    return api.get(`/customers?email=${email}`);
  },

  // Get customer by phone
  async getByPhone(phone) {
    return api.get(`/customers?phone=${phone}`);
  },

  // Update customer preferences
  async updatePreferences(id, preferences) {
    return api.patch(`/customers/${id}`, { preferences });
  },

  // Get customer order history
  async getOrderHistory(id) {
    return api.get(`/customers/${id}/orders`);
  },

  // Add customer to loyalty program
  async addToLoyalty(id, loyaltyData) {
    return api.post(`/customers/${id}/loyalty`, loyaltyData);
  }
}; 