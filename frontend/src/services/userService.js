import api from './api';

export const userService = {
  /**
   * Get all registered stores for normal user, including overall rating and user's rating
   */
  async getStores(params = {}) {
    const response = await api.get('/user/stores', { params });
    return response.data;
  },

  /**
   * Submit or update a rating for a store (1 to 5)
   */
  async submitRating({ store_id, rating }) {
    const response = await api.post('/user/ratings', { store_id, rating });
    return response.data;
  },

  /**
   * Modify existing rating explicitly
   */
  async updateRating(storeId, rating) {
    const response = await api.put(`/user/ratings/${storeId}`, { rating });
    return response.data;
  },

  /**
   * Get all ratings submitted by current logged-in user
   */
  async getMyRatings() {
    const response = await api.get('/user/ratings');
    return response.data;
  },
};

export default userService;
