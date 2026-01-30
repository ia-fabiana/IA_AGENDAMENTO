# Quick Start Guide - Sprint 2 Features

Get the Sprint 2 features up and running in 15 minutes!

## Prerequisites

- Node.js 18+ installed
- Supabase account
- Google Cloud account (for Calendar integration)

## Step 1: Install Dependencies (1 minute)

```bash
npm install
```

## Step 2: Database Setup (2 minutes)

1. Log into your [Supabase Dashboard](https://app.supabase.com/)
2. Go to SQL Editor
3. Copy and paste the contents of `migrations/sprint2_rbac_calendar.sql`
4. Click "Run"

✅ This creates: roles, users, permissions, activity_logs tables

## Step 3: Google OAuth Setup (5 minutes)

### 3.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project (or select existing)
3. Enable Google Calendar API:
   - APIs & Services → Library
   - Search "Google Calendar API"
   - Click "Enable"

### 3.2 Create OAuth Credentials
1. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
2. Configure consent screen:
   - User Type: External
   - App name: IA Agendamento
   - User support email: your email
   - Developer contact: your email
3. Application type: Web application
4. Name: IA Agendamento Web Client
5. Authorized redirect URIs:
   ```
   http://localhost:5173/oauth2callback
   ```
   (Add production URL when deploying)
6. Click Create
7. **Copy Client ID and Client Secret** (you'll need these next)

## Step 4: Environment Configuration (2 minutes)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in these values:
   ```env
   # Google Calendar
   GOOGLE_CLIENT_ID=paste-your-client-id-here
   GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
   
   # Encryption (generate a random 32+ character string)
   ENCRYPTION_KEY=your-random-32-character-minimum-encryption-key-here
   
   # Supabase (from your Supabase dashboard)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   
   # Gemini API (from Google AI Studio)
   API_KEY=your-gemini-api-key
   ```

💡 **Tip**: Generate a secure encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 5: Start the Application (1 minute)

Run both frontend and backend:

```bash
npm run dev:all
```

Or run separately:
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run dev:server
```

✅ Frontend: http://localhost:5173
✅ Backend API: http://localhost:3001
✅ Health check: http://localhost:3001/health

## Step 6: Connect Google Calendar (2 minutes)

Now test the Google Calendar integration:

1. Make a request to get the OAuth URL:
   ```bash
   curl http://localhost:3001/api/calendar/auth-url
   ```

2. Open the returned `authUrl` in your browser

3. Authorize the app

4. You'll be redirected with a `code` parameter

5. Send the code to complete setup:
   ```bash
   curl -X POST http://localhost:3001/api/calendar/oauth-callback \
     -H "Content-Type: application/json" \
     -d '{
       "code": "paste-the-code-from-redirect-here",
       "tenantId": "550e8400-e29b-41d4-a716-446655440000"
     }'
   ```

✅ Google Calendar is now connected!

## Step 7: Test the Features (2 minutes)

### Test Appointment Creation with Calendar Sync

```bash
curl -X POST http://localhost:3001/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "admin-user-id",
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "appointment": {
      "id": "test-appointment-1",
      "tenantId": "550e8400-e29b-41d4-a716-446655440000",
      "customerName": "João Silva",
      "phoneNumber": "+5511999999999",
      "serviceId": "service-id",
      "serviceName": "Corte de Cabelo",
      "date": "2024-02-15T14:00:00Z",
      "status": "confirmed",
      "value": 80.00
    }
  }'
```

✅ Appointment created in database AND Google Calendar!

### Test RBAC

```bash
# Check user permissions
curl http://localhost:3001/api/auth/user/admin-user-id

# List all roles
curl http://localhost:3001/api/auth/roles
```

### Check Logs

Watch the pretty-printed logs in your backend terminal:
```
[2024-01-30 16:14:49] INFO: Google Calendar event created
    appointmentId: "test-appointment-1"
    calendarEventId: "abc123"
```

## 🎉 You're All Set!

You now have:
- ✅ Appointments saving to Supabase
- ✅ Google Calendar integration working
- ✅ RBAC system configured
- ✅ Structured logging active
- ✅ OAuth tokens encrypted

## Next Steps

1. **Integrate with Frontend**: Update your React components to call the backend APIs
2. **Add Users**: Create users with different roles to test RBAC
3. **Monitor Logs**: Watch the activity logs to track all actions
4. **Deploy**: Follow deployment guides for production

## Troubleshooting

### "Encryption key not set"
Generate and set `ENCRYPTION_KEY` in `.env`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### "Google OAuth credentials not configured"
Double-check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`

### "Database connection failed"
Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct

### Port already in use
Change `SERVER_PORT=3001` to a different port in `.env`

### Migration errors
Make sure you're using PostgreSQL (Supabase uses PostgreSQL by default)

## Need Help?

- 📚 Full documentation: `SERVER_README.md`
- 🔧 Feature guide: `SPRINT2_FEATURES.md`
- 🏗️ Architecture: `BACKEND_ARCHITECTURE.md`
- 📝 Implementation details: `IMPLEMENTATION_SUMMARY.md`

## Development Commands

```bash
# Frontend only
npm run dev

# Backend only  
npm run dev:server

# Both together
npm run dev:all

# Build frontend
npm run build

# Build backend
npm run build:server

# Production backend
npm run server
```

Happy coding! 🚀
