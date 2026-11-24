const adminService = require('../services/adminService');

class AdminController {
  /**
   * Add a new user (normal USER, ADMIN, or STORE_OWNER)
   */
  async createUser(req, res, next) {
    try {
      const { name, email, password, address, role } = req.body;
      const user = await adminService.createUser({ name, email, password, address, role });
      res.status(201).json({
        success: true,
        message: `${role} user created successfully.`,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add a new store
   */
  async createStore(req, res, next) {
    try {
      const { name, email, address, owner_id } = req.body;
      const store = await adminService.createStore({ name, email, address, owner_id });
      res.status(201).json({
        success: true,
        message: 'Store created successfully.',
        data: { store },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * View dashboard statistics: total users, total stores, total submitted ratings
   */
  async getDashboardStats(req, res, next) {
    try {
      const stats = await adminService.getDashboardStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * View all stores with name, email, address and overall rating
   * Supports search and sort
   */
  async getAllStores(req, res, next) {
    try {
      const { search, sortBy, order } = req.query;
      const stores = await adminService.getAllStores({ search, sortBy, order });
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
   * View normal, admin, and store owner users
   * Supports search by name/email/address, filter by role, and sorting
   */
  async getAllUsers(req, res, next) {
    try {
      const { search, role, sortBy, order } = req.query;
      const users = await adminService.getAllUsers({ search, role, sortBy, order });
      res.status(200).json({
        success: true,
        count: users.length,
        data: { users },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * View individual user details.
   * If viewing a store owner, displays store owner's rating and store info.
   */
  async getUserById(req, res, next) {
    try {
      const userId = parseInt(req.params.id, 10);
      const user = await adminService.getUserById(userId);
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
