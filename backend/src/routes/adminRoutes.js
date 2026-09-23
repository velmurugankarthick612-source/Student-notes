const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const reportController = require('../controllers/reportController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');
const { approveRejectSchema } = require('../validators/resourceValidator');
const { updateReportStatusSchema } = require('../validators/reportValidator');
const { userRoleUpdateSchema } = require('../validators/authValidator');

// Moderation & Platform Analytics (Accessible to both Moderator and Admin)
router.get('/statistics', requireAuth, requireRole('moderator', 'admin'), adminController.getPlatformStatistics);
router.get('/resources/pending', requireAuth, requireRole('moderator', 'admin'), adminController.getPendingResources);
router.patch('/resources/:id/approve', requireAuth, requireRole('moderator', 'admin'), adminController.approveResource);
router.patch('/resources/:id/reject', requireAuth, requireRole('moderator', 'admin'), validateBody(approveRejectSchema), adminController.rejectResource);
router.get('/reports', requireAuth, requireRole('moderator', 'admin'), reportController.getAdminReports);
router.put('/reports/:id', requireAuth, requireRole('moderator', 'admin'), validateBody(updateReportStatusSchema), reportController.updateReportStatus);

// Strict Admin Operations (Users & Permanent Deletion)
router.delete('/resources/:id', requireAuth, requireRole('admin'), adminController.deleteAdminResource);
router.get('/users', requireAuth, requireRole('admin'), adminController.getUsers);
router.patch('/users/:id/role', requireAuth, requireRole('admin'), validateBody(userRoleUpdateSchema), adminController.updateUserRole);

module.exports = router;
