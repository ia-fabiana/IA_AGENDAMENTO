import pino from 'pino';

// Create logger instance with production-ready configuration
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  } : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    }
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: process.env.NODE_ENV || 'development'
  }
});

// Create child loggers for different modules
export const createLogger = (module: string) => {
  return logger.child({ module });
};

// Logging helpers for common operations
export const logAppointmentCreated = (tenantId: string, appointmentId: string, customerName: string) => {
  logger.info({
    event: 'appointment_created',
    tenantId,
    appointmentId,
    customerName
  }, 'Appointment created successfully');
};

export const logGoogleCalendarEvent = (appointmentId: string, calendarEventId: string, success: boolean) => {
  if (success) {
    logger.info({
      event: 'google_calendar_event_created',
      appointmentId,
      calendarEventId
    }, 'Google Calendar event created');
  } else {
    logger.error({
      event: 'google_calendar_event_failed',
      appointmentId
    }, 'Failed to create Google Calendar event');
  }
};

export const logAuthEvent = (event: string, userId?: string, success: boolean = true) => {
  if (success) {
    logger.info({
      event: `auth_${event}`,
      userId
    }, `Authentication event: ${event}`);
  } else {
    logger.warn({
      event: `auth_${event}_failed`,
      userId
    }, `Authentication failed: ${event}`);
  }
};

export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error({
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    ...context
  }, 'Error occurred');
};
