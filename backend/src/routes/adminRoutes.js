const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const reportController = require('../controllers/reportController');
const adminStudentController = require('../controllers/adminStudentController');
const adminSubjectController = require('../controllers/adminSubjectController');

const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');

const { approveRejectSchema } = require('../validators/resourceValidator');
const { updateReportStatusSchema } = require('../validators/reportValidator');
const { userRoleUpdateSchema } = require('../validators/authValidator');
const {
  createStudentSchema,
  updateStudentSchema,
  updateStatusSchema,
} = require('../validators/studentValidator');
const {
  subjectSchema,
  updateSubjectSchema,
  updateSubjectStatusSchema,
  unitSchema,
  updateUnitSchema,
} = require('../validators/subjectValidator');

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

// Strict Admin Student Management Operations
router.post(
  '/students',
  requireAuth,
  requireRole('admin'),
  validateBody(createStudentSchema),
  adminStudentController.createStudent
);
router.get('/students', requireAuth, requireRole('admin'), adminStudentController.getStudents);
router.get('/students/audit/logs', requireAuth, requireRole('admin'), adminStudentController.getAdminAuditLogs);
router.get('/students/:id', requireAuth, requireRole('admin'), adminStudentController.getStudentById);
router.put(
  '/students/:id',
  requireAuth,
  requireRole('admin'),
  validateBody(updateStudentSchema),
  adminStudentController.updateStudent
);
router.patch(
  '/students/:id/status',
  requireAuth,
  requireRole('admin'),
  validateBody(updateStatusSchema),
  adminStudentController.updateStudentStatus
);
router.delete(
  '/students/:id',
  requireAuth,
  requireRole('admin'),
  adminStudentController.deleteStudent
);

// Strict Admin Subject Management Operations
router.post(
  '/subjects',
  requireAuth,
  requireRole('admin'),
  validateBody(subjectSchema),
  adminSubjectController.createSubject
);
router.put(
  '/subjects/:id',
  requireAuth,
  requireRole('admin'),
  validateBody(updateSubjectSchema),
  adminSubjectController.updateSubject
);
router.delete(
  '/subjects/:id',
  requireAuth,
  requireRole('admin'),
  adminSubjectController.deleteSubject
);
router.patch(
  '/subjects/:id/status',
  requireAuth,
  requireRole('admin'),
  validateBody(updateSubjectStatusSchema),
  adminSubjectController.updateSubjectStatus
);

// Strict Admin Unit Management Operations
router.post(
  '/subjects/:subjectId/units',
  requireAuth,
  requireRole('admin'),
  validateBody(unitSchema),
  adminSubjectController.createSubjectUnit
);
router.put(
  '/units/:id',
  requireAuth,
  requireRole('admin'),
  validateBody(updateUnitSchema),
  adminSubjectController.updateUnit
);
router.delete(
  '/units/:id',
  requireAuth,
  requireRole('admin'),
  adminSubjectController.deleteUnit
);

module.exports = router;
