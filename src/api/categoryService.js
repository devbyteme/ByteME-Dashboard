import api from './axios';

// Category service
export const categoryService = {
  // Get all categories for the authenticated vendor
  async getAll() {
    console.log('CategoryService.getAll called');
    
    const response = await api.get('/menu/categories');
    console.log('CategoryService API response:', response);
    
    return response;
  },

  // Get category by ID
  async getById(id) {
    return api.get(`/menu/categories/${id}`);
  },

  // Create new category
  async create(category) {
    console.log('CategoryService.create called with:', category);
    return api.post('/menu/categories', category);
  },

  // Update category
  async update(id, category) {
    console.log('CategoryService.update called with:', { id, category });
    return api.put(`/menu/categories/${id}`, category);
  },

  // Delete category
  async delete(id) {
    console.log('CategoryService.delete called with id:', id);
    return api.delete(`/menu/categories/${id}`);
  },

  // Initialize default categories for new vendor
  async initializeDefaults() {
    console.log('CategoryService.initializeDefaults called');
    return api.post('/menu/categories/initialize');
  },

  // Reorder categories
  async reorder(categoryOrders) {
    console.log('CategoryService.reorder called with:', categoryOrders);
    return api.patch('/menu/categories/reorder', { categoryOrders });
  }
};
