import api from './api';

export const authService = {
  /**
   * Register a new normal user
   */
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Single login endpoint for all roles (ADMIN, USER, STORE_OWNER)
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Get current authenticated user profile
   */
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Change password for authenticated user
   */
  async changePassword(passwords) {
    const response = await api.post('/auth/change-password', passwords);
    return response.data;
  },
};

export default authService;
