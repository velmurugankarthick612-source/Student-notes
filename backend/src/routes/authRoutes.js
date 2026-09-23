const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');

router.get('/me', authLimiter, requireAuth, authController.getMe);
router.post('/logout', requireAuth, authController.logout);

module.exports = router;
