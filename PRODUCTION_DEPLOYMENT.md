# Sprint 4 - Production Deployment Guide

## Overview
This guide covers the production deployment of IA Agendamentos with rate limiting, monitoring, and real client testing capabilities.

## New Features in Sprint 4

### 1. Rate Limiting
Comprehensive rate limiting has been implemented across all API endpoints:

- **Global Rate Limiter**: 100 requests per 15 minutes per IP
- **Write Operations Limiter**: 30 write operations per 15 minutes per IP
- **Auth Limiter**: 10 authentication attempts per 15 minutes per IP
- **API Limiter**: 20 API calls per minute per IP

All rate limiters return standard `RateLimit-*` headers and log violations.

### 2. Monitoring & Metrics
Prometheus-compatible metrics are exposed at `/metrics`:

**Default Metrics:**
- CPU usage
- Memory usage
- Event loop lag
- Process info

**Custom Metrics:**
- HTTP request count by method, route, and status
- HTTP request duration histogram
- Active connections gauge
- Database query count and duration
- Appointments created counter
- Google Calendar sync success/failure counter
- Error counter by type and route
- Rate limit hits counter

**Metrics Endpoints:**
- `GET /metrics` - Prometheus format (text/plain)
- `GET /metrics/json` - JSON format (for debugging)

### 3. Advanced Health Checks

**Endpoints:**
- `GET /health` - Comprehensive health check with all components
- `GET /health/ready` - Readiness probe (for load balancers)
- `GET /health/live` - Liveness probe (for container orchestration)

**Health Check Components:**
- Database connectivity with response time
- Memory usage monitoring
- Google Calendar configuration check

**Health Status:**
- `healthy` - All checks passing (200)
- `degraded` - Some warnings (200)
- `unhealthy` - Critical failures (503)

### 4. Feature Flags
Controlled rollout system for gradual feature deployment:

```typescript
import { isFeatureEnabled } from './server/featureFlags';

if (isFeatureEnabled('advancedAnalytics', tenantId)) {
  // Enable feature for this tenant
}
```

**Available Flags:**
- `googleCalendarSync`
- `aiScheduling`
- `whatsappIntegration`
- `advancedAnalytics`
- `multiTenancy`
- `rbacEnabled`

## Production Deployment

### Prerequisites
1. Google Cloud Project with Cloud Run enabled
2. Container Registry access
3. Environment variables configured in Cloud Build
4. Domain configured (optional)

### Environment Variables

**Production-specific:**
```bash
# Server
NODE_ENV=production
LOG_LEVEL=info
SERVER_PORT=3001

# Rate Limiting (optional overrides)
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090  # Optional separate metrics port
```

**Required (from .env.example):**
- `GEMINI_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `ENCRYPTION_KEY` (32+ characters, strong random string)

### Deployment Steps

#### 1. Manual Deployment
```bash
# Install dependencies
npm install

# Build the application
npm run build
npm run build:server

# Build Docker image
docker build -t gcr.io/PROJECT_ID/ia-agendamentos:v1.0 .

# Push to Container Registry
docker push gcr.io/PROJECT_ID/ia-agendamentos:v1.0

# Deploy to Cloud Run
gcloud run deploy ia-agendamentos \
  --image gcr.io/PROJECT_ID/ia-agendamentos:v1.0 \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production,LOG_LEVEL=info
```

#### 2. Automated Deployment (Cloud Build)
```bash
# Trigger Cloud Build
gcloud builds submit --config cloudbuild.yaml

# Or push to main branch (if trigger configured)
git push origin main
```

### Post-Deployment Verification

#### 1. Health Checks
```bash
# Comprehensive health check
curl https://your-app-url.run.app/health

# Expected: {"status":"healthy",...}

# Readiness check
curl https://your-app-url.run.app/health/ready

# Liveness check
curl https://your-app-url.run.app/health/live
```

#### 2. Metrics Validation
```bash
# Get Prometheus metrics
curl https://your-app-url.run.app/metrics

# Or JSON format for debugging
curl https://your-app-url.run.app/metrics/json
```

#### 3. Rate Limiting Test
```bash
# Send multiple requests quickly
for i in {1..15}; do
  curl -i https://your-app-url.run.app/api/appointments/test-tenant
done

# Should see 429 responses after limit
# Check RateLimit-* headers
```

#### 4. Smoke Tests
```bash
# Test main endpoints
curl https://your-app-url.run.app/health
curl https://your-app-url.run.app/api/auth/roles
curl https://your-app-url.run.app/api/calendar/auth-url
```

## Monitoring Setup

### 1. Prometheus Integration
If you have Prometheus set up:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'ia-agendamentos'
    scrape_interval: 30s
    static_configs:
      - targets: ['your-app-url.run.app:443']
    scheme: https
    metrics_path: /metrics
```

### 2. Cloud Run Metrics
Access Cloud Run metrics in Google Cloud Console:
- Request count
- Request latency
- Error rate
- Instance count
- CPU/Memory utilization

### 3. Cloud Logging
View structured logs:
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=ia-agendamentos" \
  --limit 50 \
  --format json
```

### 4. Alerts Configuration
Set up alerts for:
- High error rate (>5% in 5 minutes)
- High latency (p95 > 2 seconds)
- Memory usage (>90%)
- Rate limit hits (>100/hour from single IP)

## Real Client Testing

### Gradual Rollout Strategy

#### Phase 1: Beta Testing (Week 1)
1. Select 2-3 pilot tenants
2. Enable all features
3. Monitor closely for issues
4. Collect feedback daily

```typescript
// Enable beta features for specific tenants
enableFeatureForTenant('tenant-uuid-1', 'advancedAnalytics');
```

#### Phase 2: Extended Testing (Week 2)
1. Expand to 10-15 tenants
2. Monitor metrics and logs
3. Collect user feedback
4. Fix any issues found

#### Phase 3: Full Rollout (Week 3+)
1. Enable for all tenants
2. Continuous monitoring
3. Regular feedback collection

### Monitoring Real Usage

**Key Metrics to Track:**
1. Daily active users per tenant
2. Appointments created per day
3. Google Calendar sync success rate
4. API response times
5. Error rates by endpoint
6. Rate limit hits

**User Feedback Collection:**
```bash
# Track in activity_logs table
{
  "tenant_id": "...",
  "user_id": "...",
  "action": "user.feedback",
  "metadata": {
    "rating": 5,
    "comment": "Works great!",
    "feature": "calendar_sync"
  }
}
```

## Rollback Procedures

### Quick Rollback
```bash
# List recent deployments
gcloud run revisions list --service ia-agendamentos --region us-central1

# Rollback to previous revision
gcloud run services update-traffic ia-agendamentos \
  --to-revisions REVISION_NAME=100 \
  --region us-central1
```

### Complete Rollback
```bash
# Deploy previous image version
gcloud run deploy ia-agendamentos \
  --image gcr.io/PROJECT_ID/ia-agendamentos:PREVIOUS_TAG \
  --region us-central1
```

## Troubleshooting

### High Memory Usage
```bash
# Check memory metrics
curl https://your-app-url.run.app/health

# Increase memory allocation
gcloud run services update ia-agendamentos \
  --memory 1Gi \
  --region us-central1
```

### High Error Rate
```bash
# Check error logs
gcloud logging read "resource.type=cloud_run_revision AND severity>=ERROR" --limit 100

# Check metrics
curl https://your-app-url.run.app/metrics | grep error
```

### Rate Limit Issues
```bash
# Check rate limit metrics
curl https://your-app-url.run.app/metrics | grep rate_limit

# Adjust limits if needed (in server/rateLimit.ts)
```

### Database Connection Issues
```bash
# Check health
curl https://your-app-url.run.app/health

# Verify Supabase connection string
# Check firewall rules
```

## Security Checklist

- [ ] ENCRYPTION_KEY is strong and unique (32+ characters)
- [ ] All API keys are in Secret Manager (not in code)
- [ ] HTTPS only (Cloud Run default)
- [ ] Rate limiting enabled
- [ ] RBAC configured correctly
- [ ] CORS configured for production domain
- [ ] Logs don't contain sensitive data
- [ ] OAuth redirect URIs are whitelisted

## Performance Optimization

### Current Configuration
- Memory: 512Mi (adjustable)
- CPU: 1 (adjustable)
- Min instances: 1 (no cold starts)
- Max instances: 10 (auto-scaling)
- Request timeout: 300s (Cloud Run default)

### Recommendations
1. Monitor p95 latency - target <1s
2. Keep memory usage <70%
3. Use Cloud CDN for static assets
4. Optimize database queries
5. Implement caching for read-heavy endpoints

## Next Steps

1. **Week 1-2**: Beta testing with pilot clients
2. **Week 2**: Expand to more tenants
3. **Week 3**: Full production rollout
4. **Week 4**: Post-rollout review and optimization

## Support

### Monitoring Dashboards
- Cloud Run: https://console.cloud.google.com/run
- Metrics: https://your-app-url.run.app/metrics/json
- Logs: https://console.cloud.google.com/logs

### Incident Response
1. Check `/health` endpoint
2. Review recent logs
3. Check metrics for anomalies
4. Rollback if critical
5. Fix and redeploy

---

**Last Updated**: January 30, 2026
**Sprint**: Sprint 4 - Production
**Status**: Ready for Deployment
