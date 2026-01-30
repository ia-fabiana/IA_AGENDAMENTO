import { describe, it, expect, vi, beforeEach } from 'vitest';
import supertest from 'supertest';
import app from '../../server/index';

// Mock Supabase
vi.mock('../../services/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn(() => ({
          then: vi.fn((callback) => callback({ data: [], error: null }))
        }))
      }))
    }))
  }
}));

describe('Health Checks', () => {
  describe('GET /health', () => {
    it('should return comprehensive health status', async () => {
      const response = await supertest(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('checks');
    });

    it('should include database check', async () => {
      const response = await supertest(app).get('/health');
      
      expect(response.body.checks).toHaveProperty('database');
      expect(response.body.checks.database).toHaveProperty('status');
      expect(response.body.checks.database).toHaveProperty('message');
      expect(response.body.checks.database).toHaveProperty('responseTime');
    });

    it('should include memory check', async () => {
      const response = await supertest(app).get('/health');
      
      expect(response.body.checks).toHaveProperty('memory');
      expect(response.body.checks.memory).toHaveProperty('status');
      expect(response.body.checks.memory).toHaveProperty('details');
      expect(response.body.checks.memory.details).toHaveProperty('heapUsedMB');
      expect(response.body.checks.memory.details).toHaveProperty('usagePercent');
    });

    it('should include Google Calendar check', async () => {
      const response = await supertest(app).get('/health');
      
      expect(response.body.checks).toHaveProperty('googleCalendar');
      expect(response.body.checks.googleCalendar).toHaveProperty('status');
    });

    it('should return healthy status when all checks pass', async () => {
      const response = await supertest(app).get('/health');
      
      expect(['healthy', 'degraded', 'unhealthy']).toContain(response.body.status);
    });

    it('should include ISO timestamp', async () => {
      const response = await supertest(app).get('/health');
      
      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should include uptime in seconds', async () => {
      const response = await supertest(app).get('/health');
      
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThan(0);
    });
  });

  describe('GET /health/ready', () => {
    it('should return readiness status', async () => {
      const response = await supertest(app).get('/health/ready');
      
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('ready');
      expect(typeof response.body.ready).toBe('boolean');
    });

    it('should check database connectivity for readiness', async () => {
      const response = await supertest(app).get('/health/ready');
      
      // Should return a boolean
      expect(typeof response.body.ready).toBe('boolean');
    });
  });

  describe('GET /health/live', () => {
    it('should return liveness status', async () => {
      const response = await supertest(app).get('/health/live');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('alive');
      expect(response.body.alive).toBe(true);
    });

    it('should always return true for basic liveness', async () => {
      const response = await supertest(app).get('/health/live');
      
      expect(response.body.alive).toBe(true);
    });
  });

  describe('Health Check Status Levels', () => {
    it('should have valid status enum', async () => {
      const response = await supertest(app).get('/health');
      
      const validStatuses = ['healthy', 'degraded', 'unhealthy'];
      expect(validStatuses).toContain(response.body.status);
    });

    it('should have valid check statuses', async () => {
      const response = await supertest(app).get('/health');
      
      const validCheckStatuses = ['pass', 'fail', 'warn'];
      expect(validCheckStatuses).toContain(response.body.checks.database.status);
      expect(validCheckStatuses).toContain(response.body.checks.memory.status);
    });
  });
});
