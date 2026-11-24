const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { validateCreateUser } = require('../validators/userValidator');
const { validateCreateStore } = require('../validators/storeValidator');

const router = express.Router();

// All admin routes require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Dashboard statistics
router.get('/dashboard', adminController.getDashboardStats);

// User management
router.post('/users', validateCreateUser, adminController.createUser);
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);

// Store management
router.post('/stores', validateCreateStore, adminController.createStore);
router.get('/stores', adminController.getAllStores);

module.exports = router;
