const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const ratingController = require('../controllers/ratingController');
const reportController = require('../controllers/reportController');

const { requireAuth, optionalAuth } = require('../middleware/authMiddleware');
const { upload, validatePdfSignature, handleUploadErrors } = require('../middleware/uploadMiddleware');
const { searchLimiter, uploadLimiter, reportLimiter } = require('../middleware/rateLimitMiddleware');
const { validateQuery, validateBody } = require('../middleware/validationMiddleware');
const { searchResourceSchema, createResourceSchema, updateResourceSchema } = require('../validators/resourceValidator');
const { createRatingSchema, createReportSchema } = require('../validators/reportValidator');

// Search & Catalog
router.get('/search', searchLimiter, optionalAuth, validateQuery(searchResourceSchema), resourceController.searchResourcesEndpoint);
router.get('/', optionalAuth, resourceController.getAllResources);
router.get('/my-uploads', requireAuth, resourceController.getMyUploads);
router.get('/:id', optionalAuth, resourceController.getResourceByIdEndpoint);

// Resource Management
router.post(
  '/',
  requireAuth,
  uploadLimiter,
  upload.single('file'),
  handleUploadErrors,
  validatePdfSignature,
  resourceController.createResource
);

router.put('/:id', requireAuth, validateBody(updateResourceSchema), resourceController.updateResource);
router.delete('/:id', requireAuth, resourceController.deleteResource);

// Counters
router.post('/:id/view', resourceController.recordView);
router.post('/:id/download', resourceController.recordDownload);

// Ratings & Reviews
router.get('/:id/ratings', ratingController.getResourceRatings);
router.post('/:id/ratings', requireAuth, validateBody(createRatingSchema), ratingController.submitRating);
router.put('/:id/ratings/:ratingId', requireAuth, validateBody(createRatingSchema), ratingController.updateRating);
router.delete('/:id/ratings/:ratingId', requireAuth, ratingController.deleteRating);

// Reports
router.post('/:id/reports', requireAuth, reportLimiter, validateBody(createReportSchema), reportController.createReport);

module.exports = router;
