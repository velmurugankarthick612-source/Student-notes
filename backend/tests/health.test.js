const request = require('supertest');
const app = require('../src/app');

describe('StudyHub API Health & Base Endpoints', () => {
  it('GET /api/health should return 200 OK with success status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('StudyHub API is operational');
    expect(res.body.environment).toBeDefined();
  });

  it('GET /api/nonexistent should return 404 with standard error JSON', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('NOT_FOUND');
  });
});
