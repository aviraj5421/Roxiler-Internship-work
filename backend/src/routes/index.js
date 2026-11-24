const express = require('express');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const userRoutes = require('./userRoutes');
const storeOwnerRoutes = require('./storeOwnerRoutes');

const router = express.Router();

// Health Check Endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Store Rating Platform API is operational.',
    timestamp: new Date().toISOString(),
  });
});

// Domain Routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/user', userRoutes);
router.use('/store-owner', storeOwnerRoutes);

// Convenient Root Aliases for Frontend Compatibility
// E.g. GET /api/stores, POST /api/ratings
router.use('/stores', userRoutes);
router.use('/ratings', userRoutes);

module.exports = router;
