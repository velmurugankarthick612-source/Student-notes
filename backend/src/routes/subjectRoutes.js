const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');
const { subjectSchema } = require('../validators/subjectValidator');

router.get('/', subjectController.getAllSubjects);
router.get('/:id', subjectController.getSubjectById);
router.post('/', requireAuth, requireRole('admin'), validateBody(subjectSchema), subjectController.createSubject);
router.put('/:id', requireAuth, requireRole('admin'), validateBody(subjectSchema.partial()), subjectController.updateSubject);
router.delete('/:id', requireAuth, requireRole('admin'), subjectController.deleteSubject);

module.exports = router;
