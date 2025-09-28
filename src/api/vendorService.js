import api from './axios';

const vendorService = {
  // Get all vendors
  getAll: async () => {
    const response = await api.get('/vendors');
    return response; // axios interceptor already returns response.data
  },

  // Get vendor by ID
  getById: async (id) => {
    const response = await api.get(`/vendors/${id}`);
    return response; // axios interceptor already returns response.data
  },

  // Update vendor
  update: async (id, data) => {
    const response = await api.put(`/vendors/${id}`, data);
    return response; // axios interceptor already returns response.data
  },

  // Delete vendor
  delete: async (id) => {
    const response = await api.delete(`/vendors/${id}`);
    return response; // axios interceptor already returns response.data
  }
};

export default vendorService;
