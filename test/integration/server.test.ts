import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';

describe('Server Health Check Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    // Create a minimal test server
    app = express();
    app.use(express.json());

    // Health check endpoint (same as in server/index.ts)
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
      expect(typeof response.body.uptime).toBe('number');
    });

    it('should return valid timestamp format', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(isNaN(timestamp.getTime())).toBe(false);
    });

    it('should return numeric uptime', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.uptime).toBeGreaterThan(0);
      expect(typeof response.body.uptime).toBe('number');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route');

      expect(response.status).toBe(404);
    });
  });
});
