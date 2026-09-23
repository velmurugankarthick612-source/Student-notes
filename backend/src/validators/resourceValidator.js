const { z } = require('zod');

const VALID_RESOURCE_TYPES = [
  'PDF Notes',
  'Lecture Notes',
  'Question Bank',
  '2-Mark Questions',
  '8-Mark Questions',
  '16-Mark Questions',
  'Previous Year Questions',
  'Lab Manual',
  'Assignment',
  'Cheat Sheet',
  'Video',
  'External Link',
  'Book',
];

const createResourceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional().nullable(),
  subject_id: z.string().uuid('Invalid subject ID'),
  unit_id: z.string().uuid('Invalid unit ID').optional().nullable(),
  resource_type: z.enum(VALID_RESOURCE_TYPES, {
    errorMap: () => ({ message: 'Invalid resource type selected' }),
  }),
  external_url: z.string().url('Invalid external URL').optional().nullable().or(z.literal('')),
});

const updateResourceSchema = createResourceSchema.partial().extend({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  rejection_reason: z.string().max(500).optional().nullable(),
});

const searchResourceSchema = z.object({
  q: z.string().optional(),
  department: z.string().optional(),
  semester: z.coerce.number().int().min(1).max(8).optional(),
  subject: z.string().optional(),
  unit: z.string().optional(),
  resourceType: z.string().optional(),
  sort: z.enum(['newest', 'views', 'downloads', 'rating']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

const approveRejectSchema = z.object({
  reason: z.string().max(500).optional().nullable(),
});

module.exports = {
  VALID_RESOURCE_TYPES,
  createResourceSchema,
  updateResourceSchema,
  searchResourceSchema,
  approveRejectSchema,
};
