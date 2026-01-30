import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import appointmentsRouter from './routes/appointments';
import calendarRouter from './routes/calendar';
import authRouter from './routes/auth';
import { logger } from './logger';
import { globalLimiter, writeLimiter } from './rateLimit';
import { 
  httpRequestCounter, 
  httpRequestDuration, 
  activeConnections,
  getMetrics,
  getMetricsJSON 
} from './monitoring';
import { performHealthCheck, checkReadiness, checkLiveness } from './health';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Trust proxy for rate limiting behind load balancers/proxies (Cloud Run, etc.)
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Metrics middleware - track active connections (before all routes)
app.use((req, res, next) => {
  activeConnections.inc();
  
  const decrementConnection = () => {
    activeConnections.dec();
  };
  
  // Decrement on both finish and close to handle unexpected closures
  res.on('finish', decrementConnection);
  res.on('close', decrementConnection);
  
  next();
});

// Request logging and metrics middleware (before all routes)
app.use((req, res, next) => {
  const startTime = Date.now();

  logger.info({
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip
  }, 'Incoming request');

  // Track request completion
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    const route = req.route?.path || req.path;

    // Record metrics
    httpRequestCounter.labels(req.method, route, res.statusCode.toString()).inc();
    httpRequestDuration.labels(req.method, route, res.statusCode.toString()).observe(duration);
  });

  next();
});

// Health checks (excluded from rate limiting - before rate limiters)
app.get('/health', async (req, res) => {
  const health = await performHealthCheck();
  const statusCode = health.status === 'healthy' ? 200 : 
                     health.status === 'degraded' ? 200 : 503;
  res.status(statusCode).json(health);
});

app.get('/health/ready', async (req, res) => {
  const ready = await checkReadiness();
  res.status(ready ? 200 : 503).json({ ready });
});

app.get('/health/live', (req, res) => {
  const alive = checkLiveness();
  res.status(alive ? 200 : 503).json({ alive });
});

// Metrics endpoint (excluded from rate limiting - before rate limiters)
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', 'text/plain');
    const metrics = await getMetrics();
    res.send(metrics);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

// Metrics JSON endpoint (for debugging - before rate limiters)
app.get('/metrics/json', async (req, res) => {
  try {
    const metrics = await getMetricsJSON();
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Apply rate limiting after health/metrics endpoints
app.use(globalLimiter);
app.use(writeLimiter);

// API Routes
app.use('/api/appointments', appointmentsRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/auth', authRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({
    error: {
      message: err.message,
      stack: err.stack
    },
    path: req.path
  }, 'Error handling request');

  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Not found',
      path: req.path
    }
  });
});

// Start server
app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server started successfully');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
});

export default app;
