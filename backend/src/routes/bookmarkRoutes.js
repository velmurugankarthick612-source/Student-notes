const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, bookmarkController.getBookmarks);
router.post('/', requireAuth, bookmarkController.addBookmark);
router.delete('/:resourceId', requireAuth, bookmarkController.removeBookmark);

module.exports = router;
