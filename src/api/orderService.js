import api from './axios';

// Order service
export const orderService = {
  // Get all orders
  async getAll(status = null, tableNumber = null, customerId = null, limit = 50, page = 1) {
    let endpoint = '/orders';
    const params = new URLSearchParams();
    
    if (status) params.append('status', status);
    if (tableNumber) params.append('tableNumber', tableNumber);
    if (customerId) params.append('customerId', customerId);
    if (limit) params.append('limit', limit);
    if (page) params.append('page', page);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return api.get(endpoint);
  },

  // Get order by ID
  async getById(id) {
    return api.get(`/orders/${id}`);
  },

  // Create new order
  async create(order) {
    return api.post('/orders', order);
  },

  // Update order
  async update(id, order) {
    return api.put(`/orders/${id}`, order);
  },

  // Delete order
  async delete(id) {
    return api.delete(`/orders/${id}`);
  },

  // Get orders by status
  async getByStatus(status, limit = 50, page = 1) {
    let endpoint = `/orders/by-status/${status}`;
    const params = new URLSearchParams();
    
    if (limit) params.append('limit', limit);
    if (page) params.append('page', page);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return api.get(endpoint);
  },

  // Get orders by table
  async getByTable(tableNumber, limit = 50, page = 1) {
    let endpoint = `/orders/by-table/${tableNumber}`;
    const params = new URLSearchParams();
    
    if (limit) params.append('limit', limit);
    if (page) params.append('page', page);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return api.get(endpoint);
  },

  // Update order status
  async updateStatus(id, status) {
    return api.patch(`/orders/${id}/status`, { status });
  },

  // Get orders for today
  async getToday() {
    return api.get('/orders/today');
  },

  // Get orders by date range (custom implementation)
  async getByDateRange(startDate, endDate, limit = 50, page = 1) {
    // This would need to be implemented on the backend
    // For now, we'll get all orders and filter client-side
    const response = await this.getAll(null, null, null, 1000, 1);
    const orders = response.data || [];
    
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
    });
    
    return {
      success: true,
      count: filteredOrders.length,
      data: filteredOrders
    };
  }
}; 