import api from './axios';
import authService from './authService';
import customerAuthService from './customerAuthService';
import { customerService } from './customerService';
import { menuService } from './menuService';
import { categoryService } from './categoryService';
import { orderService } from './orderService';
import { tableService } from './tableService';

// For backward compatibility, create User object
export const User = {
  login: (credentials) => authService.loginUser(credentials),
  loginVendor: (credentials) => authService.loginVendor(credentials),
  register: (userData) => authService.registerUser(userData),
  registerVendor: (vendorData) => authService.registerVendor(vendorData),
  logout: () => authService.logout(),
  me: () => authService.getCurrentUser(),
  isAuthenticated: () => authService.isAuthenticated(),
  getStoredUser: () => authService.getCurrentUser(),
  refreshToken: () => authService.refreshToken(),
  changePassword: (passwordData) => authService.changePassword(passwordData),
  
  // Legacy method for redirect-based login
  loginWithRedirect: async (redirectUrl) => {
    window.location.href = `/vendor-login?redirect=${encodeURIComponent(redirectUrl)}`;
  }
};

// Legacy exports for backward compatibility
export const MenuItem = {
  list: (vendorId = null, category = null, available = null) => 
    menuService.getAll(vendorId, category, available),
  get: (id) => menuService.getById(id),
  create: (data) => menuService.create(data),
  update: (id, data) => menuService.update(id, data),
  delete: (id) => menuService.delete(id),
  listByCategory: (category, vendorId = null, available = null) => 
    menuService.getByCategory(category, vendorId, available),
  updateAvailability: (id, available) => menuService.updateAvailability(id, available)
};

export const Order = {
  list: (status = null, tableNumber = null, customerId = null, limit = 50, page = 1) => 
    orderService.getAll(status, tableNumber, customerId, limit, page),
  get: (id) => orderService.getById(id),
  create: (data) => orderService.create(data),
  update: (id, data) => orderService.update(id, data),
  delete: (id) => orderService.delete(id),
  listByStatus: (status, limit = 50, page = 1) => 
    orderService.getByStatus(status, limit, page),
  listByTable: (tableNumber, limit = 50, page = 1) => 
    orderService.getByTable(tableNumber, limit, page),
  updateStatus: (id, status) => orderService.updateStatus(id, status),
  listToday: () => orderService.getToday(),
  listByDateRange: (startDate, endDate, limit = 50, page = 1) => 
    orderService.getByDateRange(startDate, endDate, limit, page)
};

export const CustomerProfile = {
  list: () => customerService.getAll(),
  get: (id) => customerService.getById(id),
  create: (data) => customerService.create(data),
  update: (id, data) => customerService.update(id, data),
  delete: (id) => customerService.delete(id),
  getByEmail: (email) => customerService.getByEmail(email),
  getByPhone: (phone) => customerService.getByPhone(phone),
  updatePreferences: (id, preferences) => customerService.updatePreferences(id, preferences),
  getOrderHistory: (id) => customerService.getOrderHistory(id),
  addToLoyalty: (id, loyaltyData) => customerService.addToLoyalty(id, loyaltyData)
};

export const Table = {
  list: (vendorId = null) => tableService.getAll(vendorId),
  get: (id) => tableService.getById(id),
  create: (data) => tableService.create(data),
  update: (id, data) => tableService.update(id, data),
  delete: (id) => tableService.delete(id),
  updateStatus: (id, status) => tableService.updateStatus(id, status),
  getAvailability: (vendorId, date, time) => tableService.getAvailability(vendorId, date, time)
};

export const Category = {
  list: () => categoryService.getAll(),
  get: (id) => categoryService.getById(id),
  create: (data) => categoryService.create(data),
  update: (id, data) => categoryService.update(id, data),
  delete: (id) => categoryService.delete(id),
  initializeDefaults: () => categoryService.initializeDefaults(),
  reorder: (categoryOrders) => categoryService.reorder(categoryOrders)
};

export {
  api,
  authService,
  customerAuthService,
  customerService,
  menuService,
  categoryService,
  orderService,
  tableService
}; 