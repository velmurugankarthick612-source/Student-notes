const request = require('supertest');
const app = require('../src/app');

describe('Security & Authorization Protection', () => {
  it('GET /api/auth/me should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('UNAUTHORIZED_NO_TOKEN');
  });

  it('GET /api/bookmarks should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/bookmarks');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/resources should reject upload without auth token', async () => {
    const res = await request(app)
      .post('/api/resources')
      .field('title', 'Unauthorized Upload');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/admin/statistics should reject unauthenticated access with 401', async () => {
    const res = await request(app).get('/api/admin/statistics');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/departments should reject unauthenticated modification with 401', async () => {
    const res = await request(app)
      .post('/api/departments')
      .send({ name: 'Hacked Department', code: 'HACK' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
