import promClient from 'prom-client';
import { logger } from './logger';

/**
 * Application monitoring and metrics
 * Sprint 4 - Production: Prometheus metrics
 */

// Create a Registry to register metrics
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({
  register,
  prefix: 'ia_agendamentos_',
});

// Custom metrics

// HTTP request counter
export const httpRequestCounter = new promClient.Counter({
  name: 'ia_agendamentos_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// HTTP request duration histogram
export const httpRequestDuration = new promClient.Histogram({
  name: 'ia_agendamentos_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10], // Buckets in seconds
  registers: [register],
});

// Active connections gauge
export const activeConnections = new promClient.Gauge({
  name: 'ia_agendamentos_active_connections',
  help: 'Number of active connections',
  registers: [register],
});

// Database query counter
export const dbQueryCounter = new promClient.Counter({
  name: 'ia_agendamentos_db_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table'],
  registers: [register],
});

// Database query duration histogram
export const dbQueryDuration = new promClient.Histogram({
  name: 'ia_agendamentos_db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2], // Buckets in seconds
  registers: [register],
});

// Appointments created counter
export const appointmentsCreated = new promClient.Counter({
  name: 'ia_agendamentos_appointments_created_total',
  help: 'Total number of appointments created',
  labelNames: ['tenant_id'],
  registers: [register],
});

// Google Calendar sync counter
export const calendarSyncCounter = new promClient.Counter({
  name: 'ia_agendamentos_calendar_sync_total',
  help: 'Total number of calendar sync attempts',
  labelNames: ['success', 'operation'],
  registers: [register],
});

// Error counter
export const errorCounter = new promClient.Counter({
  name: 'ia_agendamentos_errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'route'],
  registers: [register],
});

// Rate limit hits counter
export const rateLimitCounter = new promClient.Counter({
  name: 'ia_agendamentos_rate_limit_hits_total',
  help: 'Total number of rate limit hits',
  labelNames: ['route', 'ip'],
  registers: [register],
});

/**
 * Get metrics in Prometheus format
 */
export async function getMetrics(): Promise<string> {
  try {
    return await register.metrics();
  } catch (error) {
    logger.error({ error }, 'Failed to get metrics');
    throw error;
  }
}

/**
 * Get metrics as JSON for debugging
 */
export async function getMetricsJSON() {
  try {
    return await register.getMetricsAsJSON();
  } catch (error) {
    logger.error({ error }, 'Failed to get metrics JSON');
    throw error;
  }
}

/**
 * Reset all metrics (useful for testing)
 */
export function resetMetrics(): void {
  register.resetMetrics();
}

export default register;
