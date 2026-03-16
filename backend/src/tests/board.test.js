const { pool } = require('../config/db');
beforeAll(() => { jest.spyOn(console, 'error').mockImplementation(() => {}); jest.spyOn(console, 'log').mockImplementation(() => {}); });
afterAll(async () => { console.error.mockRestore(); console.log.mockRestore(); await pool.end(); });

const request = require('supertest');
const app = require('../app');

describe('Board API', () => {

  describe('GET /api/boards/:boardId', () => {
    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/boards/fake-board-id');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/cards/:cardId', () => {
    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/cards/fake-card-id');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/workspaces', () => {
    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/workspaces');
      expect(res.statusCode).toBe(401);
    });
  });

});
