import api from './api';

export const adminService = {
  /**
   * Get Admin dashboard metrics
   */
  async getDashboard() {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  /**
   * Get users listing with search, role filter, and sorting
   */
  async getUsers(params = {}) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  /**
   * Get single user details (includes store owner rating if role is STORE_OWNER)
   */
  async getUserById(id) {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Create a new user (ADMIN, STORE_OWNER, USER)
   */
  async createUser(userData) {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  /**
   * Get stores listing with search and sorting
   */
  async getStores(params = {}) {
    const response = await api.get('/admin/stores', { params });
    return response.data;
  },

  /**
   * Create a new store
   */
  async createStore(storeData) {
    const response = await api.post('/admin/stores', storeData);
    return response.data;
  },
};

export default adminService;
