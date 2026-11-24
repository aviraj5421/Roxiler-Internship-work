const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { validateRating } = require('../validators/ratingValidator');

const router = express.Router();

// User routes require authentication
router.use(authenticate, authorize('USER', 'ADMIN'));

// Stores listing for users (includes overall rating and user's submitted rating)
router.get('/stores', userController.getAllStores);

// Ratings submission and modification
router.post('/ratings', validateRating, userController.submitRating);
router.put('/ratings/:storeId', validateRating, userController.updateRating);
router.get('/ratings', userController.getUserRatings);

module.exports = router;
