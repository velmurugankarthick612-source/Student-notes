const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');
const { departmentSchema } = require('../validators/subjectValidator');

router.get('/', departmentController.getAllDepartments);
router.get('/:id', departmentController.getDepartmentById);
router.post('/', requireAuth, requireRole('admin'), validateBody(departmentSchema), departmentController.createDepartment);
router.put('/:id', requireAuth, requireRole('admin'), validateBody(departmentSchema.partial()), departmentController.updateDepartment);
router.delete('/:id', requireAuth, requireRole('admin'), departmentController.deleteDepartment);

module.exports = router;
