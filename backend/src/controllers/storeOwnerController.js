const storeOwnerService = require('../services/storeOwnerService');

class StoreOwnerController {
  /**
   * View store owner's dashboard: store details, average rating, and rating distribution
   */
  async getDashboard(req, res, next) {
    try {
      const ownerId = req.user.id;
      const dashboard = await storeOwnerService.getDashboard(ownerId);
      res.status(200).json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * View list of users who submitted ratings for the store:
   * user details (name, email, address) and submitted ratings.
   */
  async getStoreRatings(req, res, next) {
    try {
      const ownerId = req.user.id;
      const { storeId, sortBy, order } = req.query;
      const result = await storeOwnerService.getStoreRatingsWithUsers(ownerId, { storeId, sortBy, order });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StoreOwnerController();
