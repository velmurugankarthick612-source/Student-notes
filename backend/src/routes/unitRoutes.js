const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');
const adminSubjectController = require('../controllers/adminSubjectController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');
const { unitSchema, updateUnitSchema } = require('../validators/subjectValidator');

router.get('/', unitController.getAllUnits);
router.get('/:id', unitController.getUnitById);
router.post('/', requireAuth, requireRole('admin'), validateBody(unitSchema), unitController.createUnit);
router.put('/:id', requireAuth, requireRole('admin'), validateBody(updateUnitSchema), adminSubjectController.updateUnit);
router.delete('/:id', requireAuth, requireRole('admin'), adminSubjectController.deleteUnit);

module.exports = router;
