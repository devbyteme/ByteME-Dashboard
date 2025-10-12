import api from './axios';

// Customer Category service - for public access to categories
export const customerCategoryService = {
  // Get all categories for a specific vendor (public access)
  async getCategoriesByVendor(vendorId) {
    console.log('CustomerCategoryService.getCategoriesByVendor called with vendorId:', vendorId);
    
    const response = await api.get(`/public/categories/${vendorId}`);
    console.log('CustomerCategoryService API response:', response);
    
    return response;
  }
};
