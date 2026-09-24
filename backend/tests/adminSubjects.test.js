const request = require('supertest');
const app = require('../src/app');

describe('Admin Subject & Curriculum Management API', () => {
  const adminToken = 'demo-token-admin';
  const moderatorToken = 'demo-token-moderator';
  const studentToken = 'demo-token-student';

  const testDeptId = 'a0000000-0000-0000-0000-000000000001'; // CSE
  const uniqueCode = 'JEST' + Math.floor(1000 + Math.random() * 9000);
  let createdSubjectId = null;
  let createdUnitId = null;

  describe('Authorization & Role Guards', () => {
    it('should reject unauthenticated request to POST /api/admin/subjects with 401', async () => {
      const res = await request(app)
        .post('/api/admin/subjects')
        .send({
          name: 'Cloud Computing',
          code: uniqueCode,
          department_id: testDeptId,
          semester: 7,
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject student request to POST /api/admin/subjects with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/admin/subjects')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'Cloud Computing',
          code: uniqueCode,
          department_id: testDeptId,
          semester: 7,
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Admin access required');
      expect(res.body.error).toBe('FORBIDDEN');
    });

    it('should reject moderator request to POST /api/admin/subjects with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/admin/subjects')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({
          name: 'Cloud Computing',
          code: uniqueCode,
          department_id: testDeptId,
          semester: 7,
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Admin access required');
      expect(res.body.error).toBe('FORBIDDEN');
    });
  });

  describe('Validation Rules', () => {
    it('should return 422 if subject name is missing', async () => {
      const res = await request(app)
        .post('/api/admin/subjects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: uniqueCode,
          department_id: testDeptId,
          semester: 5,
        });

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 422 if semester is invalid (e.g. 9)', async () => {
      const res = await request(app)
        .post('/api/admin/subjects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Compiler Design',
          code: uniqueCode,
          department_id: testDeptId,
          semester: 9,
        });

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Admin CRUD Operations', () => {
    it('should allow Admin to create a subject with 201 Created', async () => {
      const res = await request(app)
        .post('/api/admin/subjects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Distributed Systems & Cloud',
          code: uniqueCode,
          department_id: testDeptId,
          semester: 7,
          description: 'Distributed consensus algorithms, MapReduce, and cloud virtualization.',
          status: 'active',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.code).toBe(uniqueCode);
      expect(res.body.data.status).toBe('active');
      createdSubjectId = res.body.data.id;
    });

    it('should reject duplicate subject code with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/admin/subjects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Another Subject with Same Code',
          code: uniqueCode,
          department_id: testDeptId,
          semester: 7,
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('should allow Admin to update the subject details', async () => {
      const res = await request(app)
        .put(`/api/admin/subjects/${createdSubjectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Distributed Systems & Cloud Computing',
          description: 'Updated comprehensive syllabus and cloud architectures.',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Distributed Systems & Cloud Computing');
    });

    it('should allow Admin to toggle subject status to inactive', async () => {
      const res = await request(app)
        .patch(`/api/admin/subjects/${createdSubjectId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'inactive' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('inactive');
    });

    it('should exclude inactive subjects from student curriculum queries', async () => {
      const res = await request(app)
        .get(`/api/subjects?department_id=${testDeptId}&semester=7`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(200);
      const found = (res.body.data || []).find((s) => s.id === createdSubjectId);
      expect(found).toBeUndefined();
    });

    it('should allow Admin to reactivate the subject', async () => {
      const res = await request(app)
        .patch(`/api/admin/subjects/${createdSubjectId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'active' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('active');
    });
  });

  describe('Unit Management within Subject', () => {
    it('should allow Admin to add a unit to the subject with 201 Created', async () => {
      const res = await request(app)
        .post(`/api/admin/subjects/${createdSubjectId}/units`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          unit_number: 1,
          title: 'Introduction to Distributed Architectures',
          description: 'Models of distributed computing, RPC, and IPC.',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Introduction to Distributed Architectures');
      createdUnitId = res.body.data.id;
    });

    it('should allow retrieving all units for a subject via GET /api/subjects/:subjectId/units', async () => {
      const res = await request(app).get(`/api/subjects/${createdSubjectId}/units`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should allow Admin to update a unit', async () => {
      const res = await request(app)
        .put(`/api/admin/units/${createdUnitId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Distributed System Models & Remote Procedure Calls',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.title).toBe('Distributed System Models & Remote Procedure Calls');
    });

    it('should allow Admin to delete a unit', async () => {
      const res = await request(app)
        .delete(`/api/admin/units/${createdUnitId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Subject Deletion', () => {
    it('should allow Admin to delete the created subject', async () => {
      const res = await request(app)
        .delete(`/api/admin/subjects/${createdSubjectId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
