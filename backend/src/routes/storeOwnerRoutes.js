const express = require('express');
const storeOwnerController = require('../controllers/storeOwnerController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Store Owner routes require authentication and STORE_OWNER or ADMIN role
router.use(authenticate, authorize('STORE_OWNER', 'ADMIN'));

// Store Owner dashboard (store details and average rating)
router.get('/dashboard', storeOwnerController.getDashboard);

// Users who submitted ratings for the store
router.get('/ratings', storeOwnerController.getStoreRatings);

module.exports = router;
