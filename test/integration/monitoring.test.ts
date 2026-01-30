import { describe, it, expect, vi } from 'vitest';
import supertest from 'supertest';
import app from '../../server/index';

describe('Monitoring', () => {
  describe('Metrics Endpoint', () => {
    it('should return Prometheus metrics', async () => {
      const response = await supertest(app).get('/metrics');
      expect(response.status).toBe(200);
      expect(response.type).toBe('text/plain');
      expect(response.text).toContain('# HELP');
      expect(response.text).toContain('# TYPE');
    });

    it('should include default metrics', async () => {
      const response = await supertest(app).get('/metrics');
      expect(response.text).toContain('ia_agendamentos_');
      expect(response.text).toContain('process_cpu_user_seconds_total');
      expect(response.text).toContain('nodejs_heap_size_total_bytes');
    });

    it('should include custom HTTP metrics', async () => {
      // Make a request to generate metrics
      await supertest(app).get('/health');
      
      const response = await supertest(app).get('/metrics');
      expect(response.text).toContain('ia_agendamentos_http_requests_total');
      expect(response.text).toContain('ia_agendamentos_http_request_duration_seconds');
    });

    it('should include active connections metric', async () => {
      const response = await supertest(app).get('/metrics');
      expect(response.text).toContain('ia_agendamentos_active_connections');
    });
  });

  describe('Metrics JSON Endpoint', () => {
    it('should return metrics in JSON format', async () => {
      const response = await supertest(app).get('/metrics/json');
      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should include metric metadata', async () => {
      const response = await supertest(app).get('/metrics/json');
      const metrics = response.body;
      
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics[0]).toHaveProperty('name');
      expect(metrics[0]).toHaveProperty('help');
      expect(metrics[0]).toHaveProperty('type');
    });
  });

  describe('Metrics Tracking', () => {
    it('should track HTTP requests', async () => {
      // Make a request
      await supertest(app).get('/health');
      
      // Check metrics
      const response = await supertest(app).get('/metrics');
      expect(response.text).toContain('ia_agendamentos_http_requests_total');
      expect(response.text).toContain('method="GET"');
      expect(response.text).toContain('status_code="200"');
    });

    it('should track request duration', async () => {
      await supertest(app).get('/health');
      
      const response = await supertest(app).get('/metrics');
      expect(response.text).toContain('ia_agendamentos_http_request_duration_seconds_bucket');
      expect(response.text).toContain('ia_agendamentos_http_request_duration_seconds_sum');
      expect(response.text).toContain('ia_agendamentos_http_request_duration_seconds_count');
    });

    it('should track active connections', async () => {
      const response = await supertest(app).get('/metrics');
      expect(response.text).toContain('ia_agendamentos_active_connections');
    });
  });
});
