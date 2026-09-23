const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');
const { updateProfileSchema } = require('../validators/authValidator');

router.get('/', requireAuth, profileController.getProfile);
router.put('/', requireAuth, validateBody(updateProfileSchema), profileController.updateProfile);

module.exports = router;
