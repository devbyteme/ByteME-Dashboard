import api from './axios';

// Menu Item service
export const menuService = {
  // Get all menu items
  async getAll(vendorId = null, category = null, available = null) {
    let endpoint = '/menu/menu-items';
    const params = new URLSearchParams();
    
    if (vendorId) params.append('vendorId', vendorId);
    if (category) params.append('category', category);
    if (available !== null) params.append('available', available);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    console.log('MenuService.getAll called with:', { vendorId, category, available });
    console.log('API endpoint:', endpoint);
    
    const response = await api.get(endpoint);
    console.log('MenuService API response:', response);
    
    return response;
  },

  // Get menu item by ID
  async getById(id) {
    return api.get(`/menu/menu-items/${id}`);
  },

  // Create new menu item
  async create(menuItem) {
    console.log('MenuService.create called with:', menuItem);
    
    // Use FormData for file uploads
    const response = await api.post('/menu/menu-items', menuItem, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('MenuService.create response:', response);
    return response;
  },

  // Update menu item
  async update(id, menuItem) {
    return api.put(`/menu/menu-items/${id}`, menuItem, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete menu item
  async delete(id) {
    return api.delete(`/menu/menu-items/${id}`);
  },

  // Get menu items by category
  async getByCategory(category, vendorId = null, available = null) {
    let endpoint = `/menu/menu-items/category/${category}`;
    const params = new URLSearchParams();
    
    if (vendorId) params.append('vendorId', vendorId);
    if (available !== null) params.append('available', available);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return api.get(endpoint);
  },

  // Update availability
  async updateAvailability(id, available) {
    return api.patch(`/menu/menu-items/${id}/availability`, { available });
  }
}; 