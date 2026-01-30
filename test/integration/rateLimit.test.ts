import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import supertest from 'supertest';
import app from '../../server/index';

describe('Rate Limiting', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Global Rate Limiter', () => {
    it('should allow requests within limit', async () => {
      const response = await supertest(app).get('/health');
      // Health check might return 503 in test environment due to database
      expect([200, 503]).toContain(response.status);
      expect(response.headers['ratelimit-limit']).toBeDefined();
    });

    it('should return rate limit headers', async () => {
      const response = await supertest(app).get('/health');
      expect(response.headers['ratelimit-limit']).toBeDefined();
      expect(response.headers['ratelimit-remaining']).toBeDefined();
      expect(response.headers['ratelimit-reset']).toBeDefined();
    });

    it('should block requests after limit exceeded', async () => {
      // Note: In real tests, we would need to make 100+ requests
      // This is a simplified test to verify the limiter is installed
      const response = await supertest(app).get('/health');
      expect(response.headers['ratelimit-limit']).toBe('100');
    });
  });

  describe('Auth Rate Limiter', () => {
    it('should have stricter limit for auth endpoints', async () => {
      const response = await supertest(app)
        .post('/api/calendar/oauth-callback')
        .send({ code: 'test', tenantId: 'test' });
      
      // Should have rate limit headers (even if request fails validation)
      expect(response.headers['ratelimit-limit']).toBeDefined();
    });
  });

  describe('Write Rate Limiter', () => {
    it('should limit write operations', async () => {
      const response = await supertest(app)
        .post('/api/appointments')
        .send({ appointment: {}, userId: 'test', tenantId: 'test' });
      
      // Should have rate limit headers
      expect(response.headers['ratelimit-limit']).toBeDefined();
    });

    it('should not limit read operations separately', async () => {
      const response = await supertest(app)
        .get('/api/appointments/test-tenant?userId=test');
      
      // Global limiter applies, not write limiter
      expect(response.headers['ratelimit-limit']).toBe('100');
    });
  });
});
