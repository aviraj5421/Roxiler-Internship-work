import api from './api';

export const storeOwnerService = {
  /**
   * Get Store Owner dashboard: store details, average rating, and 1-5 rating distribution
   */
  async getDashboard() {
    const response = await api.get('/store-owner/dashboard');
    return response.data;
  },

  /**
   * Get reviewers list for store: user details (name, email, address) and submitted ratings
   */
  async getRatings(params = {}) {
    const response = await api.get('/store-owner/ratings', { params });
    return response.data;
  },
};

export default storeOwnerService;
