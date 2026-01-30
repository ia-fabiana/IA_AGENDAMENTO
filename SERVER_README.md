# Backend Server - Setup Guide

This guide explains how to set up and run the backend server for the IA_AGENDAMENTO system.

## Overview

The backend server provides:
- **Google Calendar Integration**: OAuth flow and event management
- **RBAC (Role-Based Access Control)**: User permissions and access control
- **Structured Logging**: Production-ready logging with Pino
- **OAuth Token Encryption**: Secure storage of sensitive credentials
- **Activity Audit Trail**: Complete logging of all critical actions

## Architecture

```
/server
  ├── index.ts                    # Main Express server
  ├── routes/
  │   ├── appointments.ts         # Appointment CRUD with Calendar sync
  │   ├── calendar.ts             # Google Calendar OAuth and operations
  │   └── auth.ts                 # RBAC and user management
  ├── googleCalendar.ts           # Google Calendar service
  ├── encryption.ts               # AES-256-GCM encryption
  ├── logger.ts                   # Pino structured logging
  └── rbac.ts                     # Role-based access control
```

## Prerequisites

1. Node.js 18+ installed
2. Google Cloud Project with Calendar API enabled
3. Supabase project with database migrated
4. Environment variables configured

## Setup Steps

### 1. Install Dependencies

Already installed by npm install in the root directory.

### 2. Configure Google Calendar OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Calendar API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - `http://localhost:5173/oauth2callback` (development)
   - `https://your-domain.com/oauth2callback` (production)
7. Copy Client ID and Client Secret to `.env`

### 3. Run Database Migration

Execute the SQL migration to add RBAC tables and Google Calendar fields:

```bash
# Using psql
psql -h your-supabase-host -U postgres -d postgres -f migrations/sprint2_rbac_calendar.sql

# Or using Supabase dashboard SQL editor
# Copy and paste the contents of migrations/sprint2_rbac_calendar.sql
```

### 4. Set Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```env
# Google Calendar OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Encryption - MUST be 32+ characters in production
ENCRYPTION_KEY=your-very-secure-encryption-key-minimum-32-chars

# Logging
LOG_LEVEL=info  # or debug, warn, error
NODE_ENV=development  # or production

# Server
SERVER_PORT=3001
FRONTEND_URL=http://localhost:5173

# Supabase (same as frontend)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev:server
```

**Production mode:**
```bash
npm run build:server
npm run server
```

**Run both frontend and backend together:**
```bash
npm run dev:all
```

## API Endpoints

### Health Check
```
GET /health
Response: { status: "healthy", timestamp: "...", uptime: 123 }
```

### Appointments

**Create appointment with Google Calendar sync**
```
POST /api/appointments
Body: {
  appointment: { id, tenantId, customerName, ... },
  userId: "user-id",
  tenantId: "tenant-id"
}
```

**Get appointments**
```
GET /api/appointments/:tenantId?userId=user-id
```

**Delete appointment** (also removes from Google Calendar)
```
DELETE /api/appointments/:id?userId=user-id&tenantId=tenant-id
```

### Google Calendar

**Get OAuth authorization URL**
```
GET /api/calendar/auth-url
Response: { authUrl: "https://accounts.google.com/..." }
```

**Handle OAuth callback**
```
POST /api/calendar/oauth-callback
Body: { code: "auth-code", tenantId: "tenant-id" }
```

**Check availability**
```
POST /api/calendar/check-availability
Body: { tenantId, startTime, endTime }
Response: { isAvailable: true/false }
```

**Disconnect Google Calendar**
```
POST /api/calendar/disconnect
Body: { tenantId: "tenant-id" }
```

### Authentication & RBAC

**Get user with permissions**
```
GET /api/auth/user/:userId
Response: { user: { id, email, permissions, ... } }
```

**Check permission**
```
POST /api/auth/check-permission
Body: { userId, permission: { resource, action } }
Response: { hasPermission: true/false }
```

**Get all roles**
```
GET /api/auth/roles
Response: { roles: [...] }
```

**Create user**
```
POST /api/auth/users
Body: { email, name, tenantId, roleId, createdByUserId }
```

**Log user login**
```
POST /api/auth/login
Body: { userId, tenantId, ipAddress, userAgent }
```

## Google Calendar OAuth Flow

1. Frontend calls `GET /api/calendar/auth-url`
2. Redirect user to the returned `authUrl`
3. User authorizes and Google redirects back with `code`
4. Frontend calls `POST /api/calendar/oauth-callback` with the code
5. Backend exchanges code for tokens, encrypts them, and saves to database
6. Google Calendar is now connected for the tenant

## Security Features

### OAuth Token Encryption
- All OAuth tokens are encrypted using AES-256-GCM
- Encryption key derived using PBKDF2 with 100,000 iterations
- Each encrypted value includes authentication tag for integrity

### RBAC
- All sensitive endpoints check user permissions
- Five predefined roles: admin, owner, manager, staff, readonly
- Granular permissions per resource (create, read, update, delete)
- Tenant isolation - users can only access their tenant's data

### Logging
- Structured JSON logs for production
- Pretty logs for development
- All errors logged with context
- Activity audit trail for compliance

### Activity Logs
All critical actions are logged:
- User logins
- Appointment creation/deletion
- Permission changes
- Configuration updates

Query activity logs:
```typescript
import { getActivityLogs } from './server/rbac';
const logs = await getActivityLogs(tenantId, limit, offset);
```

## Development

### Testing API Endpoints

Use curl, Postman, or any HTTP client:

```bash
# Health check
curl http://localhost:3001/health

# Get OAuth URL
curl http://localhost:3001/api/calendar/auth-url
```

### Viewing Logs

Development mode shows pretty-printed logs:
```
[2024-01-30 16:14:49] INFO: Server started successfully
    port: 3001
```

Production mode outputs JSON:
```json
{"level":"info","time":1706632489821,"msg":"Server started","port":3001}
```

## Troubleshooting

### "Encryption key not set"
Set `ENCRYPTION_KEY` in `.env` with a secure 32+ character string.

### "Google OAuth credentials not configured"
Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`.

### "Database connection failed"
Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.

### Port already in use
Change `SERVER_PORT` in `.env` to a different port.

## Deployment

### Docker

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build:server
CMD ["npm", "run", "server"]
```

### Environment Variables in Production

**CRITICAL**: Set these securely in production:
- `ENCRYPTION_KEY`: Use a strong, unique 32+ character key
- `GOOGLE_CLIENT_SECRET`: Keep secret, never commit
- `NODE_ENV=production`
- `LOG_LEVEL=info` or `warn`

### Scaling Considerations

1. **Database Connection Pooling**: Consider using Supabase connection pooler
2. **Session Storage**: Add Redis for session management if needed
3. **Rate Limiting**: Add rate limiting middleware
4. **HTTPS**: Always use HTTPS in production
5. **CORS**: Configure CORS properly for production domains

## Monitoring

Monitor these metrics:
- Server uptime (`/health` endpoint)
- Error logs (level: error)
- Activity logs (suspicious patterns)
- Database connection status

## Support

For questions about the backend:
- See `SPRINT2_FEATURES.md` for feature documentation
- See `BACKEND_ARCHITECTURE.md` for architecture decisions
- Check logs for detailed error messages
