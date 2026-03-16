const { pool } = require('../config/db');
beforeAll(() => { jest.spyOn(console, 'error').mockImplementation(() => {}); jest.spyOn(console, 'log').mockImplementation(() => {}); });
afterAll(async () => { console.error.mockRestore(); console.log.mockRestore(); await pool.end(); });

const request = require('supertest');
const app = require('../app');

describe('Auth API - Negative Testing', () => {

  describe('POST /api/auth/signup', () => {
    it('should return 400 if name is missing', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@test.com', password: 'password123' });
      expect(res.statusCode).toBe(400);
    });

    it('should return 400 if email is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Test', email: 'invalid-email', password: 'password123' });
      expect(res.statusCode).toBe(400);
    });

    it('should return 400 if password too short', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Test', email: 'test@test.com', password: '123' });
      expect(res.statusCode).toBe(400);
    });

    it('should return 400 if email already exists', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Rishi', email: 'Rishi@gmail.com', password: 'password123' });
      expect(res.statusCode).toBe(400);
    });

    it('should return 400 if all fields missing', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({});
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'Rishi@gmail.com', password: 'wrongpassword' });
      expect(res.statusCode).toBe(401);
    });

    it('should return 401 for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nouser@test.com', password: 'password123' });
      expect(res.statusCode).toBe(401);
    });

    it('should return 400 if email missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });
      expect(res.statusCode).toBe(400);
    });

    it('should return 400 if password missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'Rishi@gmail.com' });
      expect(res.statusCode).toBe(400);
    });

    it('should return 400 if empty body', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/health', () => {
    it('should return 200', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

});

describe('Security Tests', () => {
  it('should return 401 for boards without token', async () => {
    const res = await request(app).get('/api/boards/fake-id');
    expect(res.statusCode).toBe(401);
  });

  it('should return 401 for cards without token', async () => {
    const res = await request(app).get('/api/cards/fake-id');
    expect(res.statusCode).toBe(401);
  });

  it('should return 401 for workspaces without token', async () => {
    const res = await request(app).get('/api/workspaces');
    expect(res.statusCode).toBe(401);
  });

  it('should return 401 for users without token', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(401);
  });

  it('should return 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/workspaces')
      .set('Authorization', 'Bearer invalidtoken123');
    expect(res.statusCode).toBe(401);
  });
});
