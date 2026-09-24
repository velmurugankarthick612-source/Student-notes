const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');

// Public registration is strictly disabled
router.post('/register', authController.disableRegister);

// Authentication endpoints
router.post('/login', authLimiter, authController.login);
router.get('/me', authLimiter, requireAuth, authController.getMe);
router.post('/logout', requireAuth, authController.logout);

module.exports = router;
