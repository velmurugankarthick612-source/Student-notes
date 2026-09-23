const { z } = require('zod');

const VALID_REPORT_REASONS = [
  'Incorrect content',
  'Wrong subject',
  'Copyright concern',
  'Inappropriate content',
  'Broken file',
  'Other',
];

const createReportSchema = z.object({
  reason: z.enum(VALID_REPORT_REASONS, {
    errorMap: () => ({ message: 'Please select a valid report reason' }),
  }),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional().nullable(),
});

const updateReportStatusSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'resolved', 'dismissed'], {
    errorMap: () => ({ message: 'Invalid report status' }),
  }),
});

const createRatingSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1 star').max(5, 'Rating cannot exceed 5 stars'),
  review: z.string().max(1000, 'Review cannot exceed 1000 characters').optional().nullable(),
});

module.exports = {
  VALID_REPORT_REASONS,
  createReportSchema,
  updateReportStatusSchema,
  createRatingSchema,
};
