const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');
const { unitSchema } = require('../validators/subjectValidator');

router.get('/', unitController.getAllUnits);
router.get('/:id', unitController.getUnitById);
router.post('/', requireAuth, requireRole('admin'), validateBody(unitSchema), unitController.createUnit);
router.put('/:id', requireAuth, requireRole('admin'), validateBody(unitSchema.partial()), unitController.updateUnit);
router.delete('/:id', requireAuth, requireRole('admin'), unitController.deleteUnit);

module.exports = router;
