const express = require('express');
const authController = require('../controllers/authController');
const { validateRegister, validateLogin, validateChangePassword } = require('../validators/authValidator');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

// Authenticated routes
router.post('/change-password', authenticate, validateChangePassword, authController.changePassword);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
