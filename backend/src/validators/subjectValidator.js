const { z } = require('zod');

const departmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters').max(150),
  code: z.string().min(2, 'Department code must be at least 2 characters').max(20).toUpperCase(),
  description: z.string().max(500).optional().nullable(),
});

const subjectSchema = z.object({
  department_id: z.string().uuid('Invalid department ID'),
  semester: z.number().int().min(1).max(8),
  name: z.string().min(2, 'Subject name must be at least 2 characters').max(150),
  code: z.string().max(20).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
});

const unitSchema = z.object({
  subject_id: z.string().uuid('Invalid subject ID'),
  unit_number: z.number().int().min(1).max(20),
  title: z.string().min(2, 'Unit title must be at least 2 characters').max(200),
  description: z.string().max(1000).optional().nullable(),
});

module.exports = {
  departmentSchema,
  subjectSchema,
  unitSchema,
};
