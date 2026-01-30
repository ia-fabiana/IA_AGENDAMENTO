import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import calendarRouter from '../../server/routes/calendar';
import { supabase } from '../../services/supabase';
import { getAuthUrl, getTokensFromCode, checkAvailability } from '../../server/googleCalendar';

// Mock dependencies
vi.mock('../../services/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('../../server/googleCalendar', () => ({
  getAuthUrl: vi.fn(),
  getTokensFromCode: vi.fn(),
  checkAvailability: vi.fn(),
}));

describe('Calendar API Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/calendar', calendarRouter);
  });

  describe('GET /api/calendar/auth-url', () => {
    it('should return Google OAuth authorization URL', async () => {
      const mockAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=test';
      vi.mocked(getAuthUrl).mockReturnValue(mockAuthUrl);

      const response = await request(app)
        .get('/api/calendar/auth-url');

      expect(response.status).toBe(200);
      expect(response.body.authUrl).toBe(mockAuthUrl);
    });

    it('should handle errors when generating auth URL', async () => {
      vi.mocked(getAuthUrl).mockImplementation(() => {
        throw new Error('Failed to generate auth URL');
      });

      const response = await request(app)
        .get('/api/calendar/auth-url');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to generate auth URL');
    });
  });

  describe('POST /api/calendar/oauth-callback', () => {
    it('should return 400 if code is missing', async () => {
      const response = await request(app)
        .post('/api/calendar/oauth-callback')
        .send({ tenantId: 'tenant-1' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing code or tenantId');
    });

    it('should return 400 if tenantId is missing', async () => {
      const response = await request(app)
        .post('/api/calendar/oauth-callback')
        .send({ code: 'test-code' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing code or tenantId');
    });

    it('should return 400 if code format is invalid', async () => {
      const response = await request(app)
        .post('/api/calendar/oauth-callback')
        .send({ code: 'short', tenantId: 'tenant-1' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid authorization code format');
    });

    it('should return 400 if tenantId format is invalid', async () => {
      const response = await request(app)
        .post('/api/calendar/oauth-callback')
        .send({ code: 'valid-code-that-is-long-enough', tenantId: 'invalid-uuid' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid tenantId format');
    });

    it('should return 404 if tenant does not exist', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Tenant not found' }
            })
          })
        })
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const response = await request(app)
        .post('/api/calendar/oauth-callback')
        .send({
          code: 'valid-code-that-is-long-enough-for-google',
          tenantId: '12345678-1234-1234-1234-123456789abc'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Tenant not found');
    });

    it('should successfully save OAuth tokens', async () => {
      const mockEncryptedTokens = 'encrypted-token-data';
      vi.mocked(getTokensFromCode).mockResolvedValue(mockEncryptedTokens);

      const mockFrom = vi.fn()
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'tenant-1' },
                error: null
              })
            })
          })
        })
        .mockReturnValueOnce({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: null
            })
          })
        });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const response = await request(app)
        .post('/api/calendar/oauth-callback')
        .send({
          code: 'valid-code-that-is-long-enough-for-google',
          tenantId: '12345678-1234-1234-1234-123456789abc'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Google Calendar connected successfully');
    });
  });

  describe('POST /api/calendar/check-availability', () => {
    it('should return 400 if Google Calendar not connected', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { google_calendar_sync_enabled: false },
              error: null
            })
          })
        })
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const response = await request(app)
        .post('/api/calendar/check-availability')
        .send({
          tenantId: 'tenant-1',
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 3600000).toISOString()
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Google Calendar not connected');
    });

    it('should check availability successfully', async () => {
      vi.mocked(checkAvailability).mockResolvedValue(true);

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                google_calendar_sync_enabled: true,
                google_oauth_token: 'encrypted-token'
              },
              error: null
            })
          })
        })
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const response = await request(app)
        .post('/api/calendar/check-availability')
        .send({
          tenantId: 'tenant-1',
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 3600000).toISOString()
        });

      expect(response.status).toBe(200);
      expect(response.body.isAvailable).toBe(true);
    });
  });

  describe('POST /api/calendar/disconnect', () => {
    it('should disconnect Google Calendar successfully', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null
          })
        })
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const response = await request(app)
        .post('/api/calendar/disconnect')
        .send({ tenantId: 'tenant-1' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Google Calendar disconnected');
    });
  });
});
