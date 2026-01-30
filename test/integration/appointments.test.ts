import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import appointmentsRouter from '../../server/routes/appointments';
import { supabase } from '../../services/supabase';
import { canAccess, logActivity } from '../../server/rbac';

// Mock dependencies
vi.mock('../../services/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('../../server/rbac', () => ({
  canAccess: vi.fn(),
  logActivity: vi.fn(),
}));

vi.mock('../../server/googleCalendar', () => ({
  createCalendarEvent: vi.fn(),
  deleteCalendarEvent: vi.fn(),
}));

describe('Appointments API Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/appointments', appointmentsRouter);
  });

  describe('POST /api/appointments', () => {
    it('should return 401 if no userId provided', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .send({
          appointment: {
            id: 'test-id',
            customerName: 'John Doe',
            phoneNumber: '1234567890',
            serviceId: 'service-1',
            serviceName: 'Test Service',
            date: new Date().toISOString(),
            status: 'confirmed',
            value: 100
          },
          tenantId: 'tenant-1'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });

    it('should return 403 if user lacks permission', async () => {
      vi.mocked(canAccess).mockResolvedValue(false);

      const response = await request(app)
        .post('/api/appointments')
        .send({
          appointment: {
            id: 'test-id',
            customerName: 'John Doe',
            phoneNumber: '1234567890',
            serviceId: 'service-1',
            serviceName: 'Test Service',
            date: new Date().toISOString(),
            status: 'confirmed',
            value: 100
          },
          userId: 'user-1',
          tenantId: 'tenant-1'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Permission denied');
    });

    it('should create appointment successfully', async () => {
      vi.mocked(canAccess).mockResolvedValue(true);
      
      const mockAppointment = {
        id: 'test-id',
        tenant_id: 'tenant-1',
        cliente_nome: 'John Doe',
        cliente_fone: '1234567890',
        servico_id: 'service-1',
        servico_nome: 'Test Service',
        data_hora: new Date().toISOString(),
        status: 'confirmed',
        valor: 100
      };

      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockAppointment,
              error: null
            })
          })
        }),
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
        .post('/api/appointments')
        .send({
          appointment: {
            id: 'test-id',
            customerName: 'John Doe',
            phoneNumber: '1234567890',
            serviceId: 'service-1',
            serviceName: 'Test Service',
            date: new Date().toISOString(),
            status: 'confirmed',
            value: 100
          },
          userId: 'user-1',
          tenantId: 'tenant-1'
        });

      expect(response.status).toBe(200);
      expect(response.body.appointment).toBeDefined();
      expect(response.body.appointment.cliente_nome).toBe('John Doe');
    });
  });

  describe('GET /api/appointments/:tenantId', () => {
    it('should return 401 if no userId provided', async () => {
      const response = await request(app)
        .get('/api/appointments/tenant-1');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });

    it('should return 403 if user lacks permission', async () => {
      vi.mocked(canAccess).mockResolvedValue(false);

      const response = await request(app)
        .get('/api/appointments/tenant-1?userId=user-1');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Permission denied');
    });

    it('should return appointments for tenant', async () => {
      vi.mocked(canAccess).mockResolvedValue(true);

      const mockAppointments = [
        {
          id: 'appt-1',
          tenant_id: 'tenant-1',
          cliente_nome: 'John Doe',
          data_hora: new Date().toISOString()
        },
        {
          id: 'appt-2',
          tenant_id: 'tenant-1',
          cliente_nome: 'Jane Smith',
          data_hora: new Date().toISOString()
        }
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockAppointments,
              error: null
            })
          })
        })
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const response = await request(app)
        .get('/api/appointments/tenant-1?userId=user-1');

      expect(response.status).toBe(200);
      expect(response.body.appointments).toHaveLength(2);
      expect(response.body.appointments[0].cliente_nome).toBe('John Doe');
    });
  });

  describe('DELETE /api/appointments/:id', () => {
    it('should return 401 if no userId provided', async () => {
      const response = await request(app)
        .delete('/api/appointments/appt-1');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });

    it('should return 403 if user lacks permission', async () => {
      vi.mocked(canAccess).mockResolvedValue(false);

      const response = await request(app)
        .delete('/api/appointments/appt-1?userId=user-1&tenantId=tenant-1');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Permission denied');
    });

    it('should delete appointment successfully', async () => {
      vi.mocked(canAccess).mockResolvedValue(true);

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'appt-1',
                google_calendar_event_id: null
              },
              error: null
            })
          })
        }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null
          })
        })
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const response = await request(app)
        .delete('/api/appointments/appt-1?userId=user-1&tenantId=tenant-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
