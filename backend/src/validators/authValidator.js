const { z } = require('zod');

const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100).optional(),
  college: z.string().max(150).optional().nullable(),
  department_id: z.string().uuid('Invalid department ID').optional().nullable(),
  semester: z.number().int().min(1).max(8).optional().nullable(),
  avatar_url: z.string().url('Invalid avatar URL').optional().nullable().or(z.literal('')),
});

const userRoleUpdateSchema = z.object({
  role: z.enum(['student', 'moderator', 'admin'], {
    errorMap: () => ({ message: 'Role must be student, moderator, or admin' }),
  }),
});

module.exports = {
  updateProfileSchema,
  userRoleUpdateSchema,
};
