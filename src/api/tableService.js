import api from './axios';

// Table service
export const tableService = {
  // Get all tables
  async getAll(vendorId = null) {
    let endpoint = '/tables';
    if (vendorId) {
      endpoint += `?vendorId=${vendorId}`;
    }
    return api.get(endpoint);
  },

  // Get table by ID
  async getById(id) {
    return api.get(`/tables/${id}`);
  },

  // Create new table
  async create(table) {
    return api.post('/tables', table);
  },

  // Update table
  async update(id, table) {
    return api.put(`/tables/${id}`, table);
  },

  // Delete table
  async delete(id) {
    return api.delete(`/tables/${id}`);
  },

  // Get table by number
  async getByNumber(number) {
    return api.get(`/tables?number=${number}`);
  },

  // Update table status
  async updateStatus(id, status) {
    return api.patch(`/tables/${id}/status`, { status });
  },

  // Get table availability
  async getAvailability(vendorId, date = null, time = null) {
    let endpoint = `/tables/availability?vendorId=${vendorId}`;
    if (date) endpoint += `&date=${date}`;
    if (time) endpoint += `&time=${time}`;
    return api.get(endpoint);
  }
}; 