const userService = require('../services/userService');

class UserController {
  /**
   * View all registered stores.
   * Displays name, address, overall rating, and user's submitted rating.
   * Supports searching by name and address, and sorting.
   */
  async getAllStores(req, res, next) {
    try {
      const userId = req.user.id;
      const { search, sortBy, order } = req.query;
      const stores = await userService.getAllStoresForUser(userId, { search, sortBy, order });
      res.status(200).json({
        success: true,
        count: stores.length,
        data: { stores },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit or update rating for a store (1 to 5)
   */
  async submitRating(req, res, next) {
    try {
      const userId = req.user.id;
      const { store_id, rating } = req.body;
      const result = await userService.submitRating(userId, { store_id, rating });
      res.status(result.isUpdated ? 200 : 201).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Explicitly modify previously submitted rating
   */
  async updateRating(req, res, next) {
    try {
      const userId = req.user.id;
      const storeId = parseInt(req.params.storeId, 10);
      const { rating } = req.body;
      const result = await userService.updateRating(userId, storeId, rating);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * View all ratings submitted by the logged-in user
   */
  async getUserRatings(req, res, next) {
    try {
      const userId = req.user.id;
      const ratings = await userService.getUserRatings(userId);
      res.status(200).json({
        success: true,
        count: ratings.length,
        data: { ratings },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
