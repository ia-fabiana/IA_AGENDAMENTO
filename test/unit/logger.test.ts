import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  logger, 
  createLogger, 
  logAppointmentCreated, 
  logGoogleCalendarEvent, 
  logAuthEvent, 
  logError 
} from '../../server/logger';

describe('Logger Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('logger instance', () => {
    it('should create a logger instance', () => {
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    it('should log info messages', () => {
      const spy = vi.spyOn(logger, 'info');
      logger.info({ test: 'data' }, 'Test message');
      expect(spy).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      const spy = vi.spyOn(logger, 'error');
      logger.error({ error: 'test error' }, 'Error message');
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('createLogger', () => {
    it('should create a child logger with module name', () => {
      const moduleLogger = createLogger('test-module');
      expect(moduleLogger).toBeDefined();
      expect(typeof moduleLogger.info).toBe('function');
    });

    it('should create different loggers for different modules', () => {
      const logger1 = createLogger('module1');
      const logger2 = createLogger('module2');
      
      expect(logger1).toBeDefined();
      expect(logger2).toBeDefined();
    });
  });

  describe('logAppointmentCreated', () => {
    it('should log appointment creation with correct data', () => {
      const spy = vi.spyOn(logger, 'info');
      const tenantId = 'tenant-123';
      const appointmentId = 'appt-456';
      const customerName = 'John Doe';

      logAppointmentCreated(tenantId, appointmentId, customerName);

      expect(spy).toHaveBeenCalledWith(
        {
          event: 'appointment_created',
          tenantId,
          appointmentId,
          customerName
        },
        'Appointment created successfully'
      );
    });
  });

  describe('logGoogleCalendarEvent', () => {
    it('should log successful calendar event creation', () => {
      const spy = vi.spyOn(logger, 'info');
      const appointmentId = 'appt-123';
      const calendarEventId = 'cal-456';

      logGoogleCalendarEvent(appointmentId, calendarEventId, true);

      expect(spy).toHaveBeenCalledWith(
        {
          event: 'google_calendar_event_created',
          appointmentId,
          calendarEventId
        },
        'Google Calendar event created'
      );
    });

    it('should log failed calendar event creation', () => {
      const spy = vi.spyOn(logger, 'error');
      const appointmentId = 'appt-123';
      const calendarEventId = 'cal-456';

      logGoogleCalendarEvent(appointmentId, calendarEventId, false);

      expect(spy).toHaveBeenCalledWith(
        {
          event: 'google_calendar_event_failed',
          appointmentId
        },
        'Failed to create Google Calendar event'
      );
    });
  });

  describe('logAuthEvent', () => {
    it('should log successful auth event', () => {
      const spy = vi.spyOn(logger, 'info');
      const userId = 'user-123';

      logAuthEvent('login', userId, true);

      expect(spy).toHaveBeenCalledWith(
        {
          event: 'auth_login',
          userId
        },
        'Authentication event: login'
      );
    });

    it('should log failed auth event', () => {
      const spy = vi.spyOn(logger, 'warn');
      const userId = 'user-123';

      logAuthEvent('login', userId, false);

      expect(spy).toHaveBeenCalledWith(
        {
          event: 'auth_login_failed',
          userId
        },
        'Authentication failed: login'
      );
    });

    it('should handle auth event without userId', () => {
      const spy = vi.spyOn(logger, 'info');

      logAuthEvent('logout', undefined, true);

      expect(spy).toHaveBeenCalledWith(
        {
          event: 'auth_logout',
          userId: undefined
        },
        'Authentication event: logout'
      );
    });
  });

  describe('logError', () => {
    it('should log error with message and stack', () => {
      const spy = vi.spyOn(logger, 'error');
      const error = new Error('Test error');

      logError(error);

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Test error',
            name: 'Error'
          })
        }),
        'Error occurred'
      );
    });

    it('should log error with additional context', () => {
      const spy = vi.spyOn(logger, 'error');
      const error = new Error('Test error');
      const context = { userId: 'user-123', action: 'create-appointment' };

      logError(error, context);

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Test error'
          }),
          userId: 'user-123',
          action: 'create-appointment'
        }),
        'Error occurred'
      );
    });
  });
});
