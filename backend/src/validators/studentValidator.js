const { z } = require('zod');

const createStudentSchema = z.object({
  full_name: z.string({ required_error: 'Full name is required' }).trim().min(2, 'Full name must be at least 2 characters').max(100),
  register_number: z.string({ required_error: 'Register number is required' }).trim().min(3, 'Register number must be at least 3 characters').max(50),
  email: z.string({ required_error: 'Email is required' }).trim().email('Invalid email address format'),
  password: z.string({ required_error: 'Temporary password is required' }).min(6, 'Password must be at least 6 characters'),
  college: z.string({ required_error: 'College name is required' }).trim().min(2, 'College name must be at least 2 characters').max(150),
  department_id: z.string({ required_error: 'Department is required' }).min(1, 'Department is required'),
  semester: z.coerce.number({ required_error: 'Semester is required' }).int().min(1, 'Semester must be between 1 and 8').max(8, 'Semester must be between 1 and 8'),
  phone: z.string().trim().max(20).optional().nullable().or(z.literal('')),
  status: z.enum(['active', 'inactive'], {
    errorMap: () => ({ message: "Status must be 'active' or 'inactive'" }),
  }).optional().default('active'),
});

const updateStudentSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100).optional(),
  register_number: z.string().trim().min(3, 'Register number must be at least 3 characters').max(50).optional(),
  email: z.string().trim().email('Invalid email address format').optional(),
  college: z.string().trim().min(2).max(150).optional(),
  department_id: z.string().min(1).optional(),
  semester: z.coerce.number().int().min(1).max(8).optional(),
  phone: z.string().trim().max(20).optional().nullable().or(z.literal('')),
  status: z.enum(['active', 'inactive']).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['active', 'inactive'], {
    errorMap: () => ({ message: "Status must be either 'active' or 'inactive'" }),
  }),
});

module.exports = {
  createStudentSchema,
  updateStudentSchema,
  updateStatusSchema,
};
