import { supabase } from '../services/supabase';
import { logger } from './logger';

/**
 * Health check service
 * Sprint 4 - Production: Advanced health checks
 */

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: CheckResult;
    memory: CheckResult;
    googleCalendar?: CheckResult;
  };
}

export interface CheckResult {
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  responseTime?: number;
  details?: any;
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<CheckResult> {
  const startTime = Date.now();
  try {
    // Simple query to test database connection
    const { error } = await supabase
      .from('tenants')
      .select('id')
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        status: 'fail',
        message: `Database error: ${error.message}`,
        responseTime,
      };
    }

    if (responseTime > 1000) {
      return {
        status: 'warn',
        message: 'Database response time is slow',
        responseTime,
      };
    }

    return {
      status: 'pass',
      message: 'Database connection OK',
      responseTime,
    };
  } catch (error: any) {
    return {
      status: 'fail',
      message: `Database connection failed: ${error.message}`,
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * Check memory usage
 */
function checkMemory(): CheckResult {
  const usage = process.memoryUsage();
  const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
  const usagePercent = (usage.heapUsed / usage.heapTotal) * 100;

  if (usagePercent > 90) {
    return {
      status: 'warn',
      message: `High memory usage: ${usagePercent.toFixed(1)}%`,
      details: {
        heapUsedMB,
        heapTotalMB,
        usagePercent: Math.round(usagePercent),
      },
    };
  }

  return {
    status: 'pass',
    message: `Memory usage: ${usagePercent.toFixed(1)}%`,
    details: {
      heapUsedMB,
      heapTotalMB,
      usagePercent: Math.round(usagePercent),
    },
  };
}

/**
 * Check Google Calendar API availability (optional)
 */
async function checkGoogleCalendar(): Promise<CheckResult> {
  try {
    // We don't want to make actual API calls in health checks
    // Just verify the OAuth configuration is available
    const hasConfig = !!(
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET
    );

    if (!hasConfig) {
      return {
        status: 'warn',
        message: 'Google Calendar OAuth not configured',
      };
    }

    return {
      status: 'pass',
      message: 'Google Calendar configuration OK',
    };
  } catch (error: any) {
    return {
      status: 'fail',
      message: `Google Calendar check failed: ${error.message}`,
    };
  }
}

/**
 * Perform all health checks
 */
export async function performHealthCheck(): Promise<HealthStatus> {
  const checks = {
    database: await checkDatabase(),
    memory: checkMemory(),
    googleCalendar: await checkGoogleCalendar(),
  };

  // Determine overall status
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  const hasFailure = Object.values(checks).some(check => check.status === 'fail');
  const hasWarning = Object.values(checks).some(check => check.status === 'warn');

  if (hasFailure) {
    status = 'unhealthy';
  } else if (hasWarning) {
    status = 'degraded';
  }

  const result: HealthStatus = {
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
  };

  // Log warnings and failures
  if (status !== 'healthy') {
    logger.warn({ healthCheck: result }, `Health check status: ${status}`);
  }

  return result;
}

/**
 * Simple readiness check (for load balancers)
 */
export async function checkReadiness(): Promise<boolean> {
  try {
    const dbCheck = await checkDatabase();
    return dbCheck.status === 'pass';
  } catch (error) {
    return false;
  }
}

/**
 * Simple liveness check (for container orchestration)
 */
export function checkLiveness(): boolean {
  // Basic check - process is alive and responsive
  return true;
}
