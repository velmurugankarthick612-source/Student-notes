const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const adminSubjectController = require('../controllers/adminSubjectController');
const { requireAuth, optionalAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');
const { subjectSchema, updateSubjectSchema } = require('../validators/subjectValidator');

// Public / Student curriculum read routes (optionalAuth allows admins to see inactive subjects)
router.get('/', optionalAuth, subjectController.getAllSubjects);
router.get('/:id', subjectController.getSubjectById);
router.get('/:subjectId/units', subjectController.getUnitsForSubject);

// Legacy admin subject endpoints (guarded strictly by role=admin)
router.post('/', requireAuth, requireRole('admin'), validateBody(subjectSchema), adminSubjectController.createSubject);
router.put('/:id', requireAuth, requireRole('admin'), validateBody(updateSubjectSchema), adminSubjectController.updateSubject);
router.delete('/:id', requireAuth, requireRole('admin'), adminSubjectController.deleteSubject);

module.exports = router;
