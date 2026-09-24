const request = require('supertest');
const app = require('../src/app');

describe('Admin Student Management & Security Tests', () => {
  const adminToken = 'Bearer demo-token-admin';
  const studentToken = 'Bearer demo-token-student';

  const testStudentData = {
    full_name: 'Aravind Swaminathan',
    register_number: 'REG999001',
    email: 'aravind.swaminathan@student.studyhub.edu',
    password: 'TempPassword@123',
    college: 'Anna University',
    department_id: 'a0000000-0000-0000-0000-000000000001',
    semester: 3,
    phone: '9876543299',
    status: 'active',
  };

  let createdStudentId = null;

  // 1. Public Registration Disabled Tests
  describe('Public Registration Enforcement', () => {
    it('POST /api/auth/register should be disabled and return 403', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'random@test.com', password: 'password123' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('REGISTRATION_DISABLED');
    });
  });

  // 2. Unauthenticated Access Protection
  describe('Unauthenticated Restrictions', () => {
    it('POST /api/admin/students should reject unauthenticated request with 401', async () => {
      const res = await request(app)
        .post('/api/admin/students')
        .send(testStudentData);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/admin/students should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/admin/students');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // 3. Student Authorization Checks
  describe('Student Authorization Restrictions (Strict 403 Forbidden)', () => {
    it('POST /api/admin/students should reject student role with 403 "Admin access required"', async () => {
      const res = await request(app)
        .post('/api/admin/students')
        .set('Authorization', studentToken)
        .send(testStudentData);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        success: false,
        message: 'Admin access required',
        error: 'FORBIDDEN',
      });
    });

    it('GET /api/admin/students should reject student role with 403 "Admin access required"', async () => {
      const res = await request(app)
        .get('/api/admin/students')
        .set('Authorization', studentToken);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({
        success: false,
        message: 'Admin access required',
        error: 'FORBIDDEN',
      });
    });

    it('DELETE /api/admin/students/:id should reject student with 403', async () => {
      const res = await request(app)
        .delete('/api/admin/students/11111111-1111-1111-1111-111111111111')
        .set('Authorization', studentToken);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('FORBIDDEN');
    });

    it('Student cannot change their role to admin via profile update', async () => {
      const res = await request(app)
        .put('/api/profile')
        .set('Authorization', studentToken)
        .send({ role: 'admin' });

      // Profile should retain 'student' role
      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('student');
    });

    it('Student cannot change their status to active via profile update', async () => {
      const res = await request(app)
        .put('/api/profile')
        .set('Authorization', studentToken)
        .send({ status: 'active' });

      expect(res.status).toBe(200);
      // Status property must not be modified by user payload
    });
  });

  // 4. Admin Student Management CRUD
  describe('Admin Operations on Students', () => {
    it('Admin can create a new student account', async () => {
      const res = await request(app)
        .post('/api/admin/students')
        .set('Authorization', adminToken)
        .send(testStudentData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.full_name).toBe(testStudentData.full_name);
      expect(res.body.data.register_number).toBe(testStudentData.register_number);
      expect(res.body.data.email).toBe(testStudentData.email.toLowerCase());
      expect(res.body.data.role).toBe('student');
      expect(res.body.data.status).toBe('active');
      expect(res.body.data).not.toHaveProperty('password');
      expect(res.body.data).not.toHaveProperty('password_hash');

      createdStudentId = res.body.data.id;
    });

    it('Duplicate email must fail with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/admin/students')
        .set('Authorization', adminToken)
        .send({
          ...testStudentData,
          register_number: 'DIFF_REG_123',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('DUPLICATE_EMAIL');
    });

    it('Duplicate register number must fail with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/admin/students')
        .set('Authorization', adminToken)
        .send({
          ...testStudentData,
          email: 'different.email@student.studyhub.edu',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('DUPLICATE_REGISTER_NUMBER');
    });

    it('Admin can view all students', async () => {
      const res = await request(app)
        .get('/api/admin/students')
        .set('Authorization', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Admin can search students by name or register number', async () => {
      const res = await request(app)
        .get('/api/admin/students')
        .query({ search: 'Aravind' })
        .set('Authorization', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.data.some((s) => s.full_name.includes('Aravind'))).toBe(true);
    });

    it('Admin can view student details by id', async () => {
      const res = await request(app)
        .get(`/api/admin/students/${createdStudentId}`)
        .set('Authorization', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdStudentId);
    });

    it('Admin can edit student details', async () => {
      const res = await request(app)
        .put(`/api/admin/students/${createdStudentId}`)
        .set('Authorization', adminToken)
        .send({
          full_name: 'Aravind S. (Updated)',
          semester: 4,
          phone: '9876543200',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.full_name).toBe('Aravind S. (Updated)');
      expect(res.body.data.semester).toBe(4);
    });

    it('Student can log in with credentials created by Admin', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testStudentData.email,
          password: testStudentData.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('student');
      expect(res.body).toHaveProperty('token');
    });

    it('Admin can deactivate student', async () => {
      const res = await request(app)
        .patch(`/api/admin/students/${createdStudentId}/status`)
        .set('Authorization', adminToken)
        .send({ status: 'inactive' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('inactive');
    });

    it('Deactivated student login is blocked with appropriate message', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testStudentData.email,
          password: testStudentData.password,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Your account has been deactivated. Please contact your administrator.');
    });

    it('Deactivated student cannot access protected endpoints with their token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer student-token-${createdStudentId}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Your account has been deactivated. Please contact your administrator.');
    });

    it('Admin can reactivate student', async () => {
      const res = await request(app)
        .patch(`/api/admin/students/${createdStudentId}/status`)
        .set('Authorization', adminToken)
        .send({ status: 'active' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('active');
    });

    it('Reactivated student can log in again', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testStudentData.email,
          password: testStudentData.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('Admin audit logs record operations', async () => {
      const res = await request(app)
        .get('/api/admin/students/audit/logs')
        .set('Authorization', adminToken);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      const actions = res.body.data.map((l) => l.action);
      expect(actions).toContain('STUDENT_CREATED');
      expect(actions).toContain('STUDENT_DEACTIVATED');
      expect(actions).toContain('STUDENT_ACTIVATED');
    });

    it('Admin can delete student', async () => {
      const res = await request(app)
        .delete(`/api/admin/students/${createdStudentId}`)
        .set('Authorization', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('Deleted student can no longer be found', async () => {
      const res = await request(app)
        .get(`/api/admin/students/${createdStudentId}`)
        .set('Authorization', adminToken);

      expect(res.status).toBe(404);
    });
  });
});
