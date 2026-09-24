const { z } = require('zod');

const departmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters').max(150),
  code: z.string().min(2, 'Department code must be at least 2 characters').max(20).toUpperCase(),
  description: z.string().max(500).optional().nullable(),
});

const subjectSchema = z.object({
  department_id: z.string({ required_error: 'Department is required.' }).uuid('Department is required.').min(1, 'Department is required.'),
  semester: z.coerce.number({ invalid_type_error: 'Invalid semester.', required_error: 'Invalid semester.' })
    .int('Invalid semester.')
    .min(1, 'Invalid semester.')
    .max(8, 'Invalid semester.'),
  name: z.string({ required_error: 'Subject name is required.' }).trim().min(1, 'Subject name is required.').max(150, 'Subject name must not exceed 150 characters'),
  code: z.string({ required_error: 'Subject code is required.' }).trim().min(1, 'Subject code is required.').max(20, 'Subject code must not exceed 20 characters').toUpperCase(),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional().nullable(),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

const updateSubjectSchema = z.object({
  department_id: z.string().uuid('Department is required.').optional(),
  semester: z.coerce.number().int('Invalid semester.').min(1, 'Invalid semester.').max(8, 'Invalid semester.').optional(),
  name: z.string().trim().min(1, 'Subject name is required.').max(150, 'Subject name must not exceed 150 characters').optional(),
  code: z.string().trim().min(1, 'Subject code is required.').max(20, 'Subject code must not exceed 20 characters').toUpperCase().optional(),
  description: z.string().max(1000).optional().nullable(),
  status: z.enum(['active', 'inactive']).optional(),
});

const updateSubjectStatusSchema = z.object({
  status: z.enum(['active', 'inactive'], { required_error: 'Status must be active or inactive' }),
});

const unitSchema = z.object({
  subject_id: z.string().uuid('Subject ID is required.').optional(),
  unit_number: z.coerce.number({ required_error: 'Unit number is required.' }).int().min(1, 'Unit number must be between 1 and 20').max(20, 'Unit number must be between 1 and 20'),
  title: z.string({ required_error: 'Unit title is required.' }).trim().min(1, 'Unit title is required.').max(200, 'Unit title must not exceed 200 characters'),
  description: z.string().max(1000).optional().nullable(),
});

const updateUnitSchema = z.object({
  subject_id: z.string().uuid().optional(),
  unit_number: z.coerce.number().int().min(1).max(20).optional(),
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
});

module.exports = {
  departmentSchema,
  subjectSchema,
  updateSubjectSchema,
  updateSubjectStatusSchema,
  unitSchema,
  updateUnitSchema,
};
