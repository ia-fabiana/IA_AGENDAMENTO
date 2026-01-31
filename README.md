<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# IA Agendamento - Gestão Inteligente

Sistema de agendamento inteligente com integração ao Supabase e Google Calendar.

View your app in AI Studio: https://ai.studio/apps/drive/1kAeFkfoyjjXABDmDwPHcZzjpnSS-wHZO

## Prerequisites

- Node.js 18+ (tested with 18.x and 20.x)
- Conta Supabase (gratuita)
- Conta Google Cloud (para integração com Calendar - opcional)

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root of the project:
```bash
cp .env.example .env
```

Edit the `.env` file and configure your credentials:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Gemini API
# Note: Both variables should have the same value (GEMINI_API_KEY is mapped to API_KEY at build time)
GEMINI_API_KEY=your_gemini_api_key_here
API_KEY=your_gemini_api_key_here

# Google Calendar OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5173/oauth2callback

# Encryption (Required for production)
ENCRYPTION_KEY=your-secure-encryption-key-here-minimum-32-characters-long
```

#### How to get Supabase credentials:
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project or select an existing one
3. Go to Project Settings > API
4. Copy the **Project URL** to `VITE_SUPABASE_URL`
5. Copy the **anon/public** key to `VITE_SUPABASE_ANON_KEY`

### 3. Setup Database

Run the database migrations in your Supabase SQL Editor:

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of `migrations/sprint2_rbac_calendar.sql`
6. Paste into the SQL editor
7. Click **Run** or press `Ctrl+Enter`

This will create the necessary tables for tenants, users, roles, permissions, appointments, and services.

### 4. Run the Application

```bash
# Frontend only
npm run dev

# Backend only (for Google Calendar integration)
npm run dev:server

# Both together
npm run dev:all
```

The app will be available at: http://localhost:5173

## Troubleshooting

### "Banco de Dados Offline" Error

If you see this error message, it means the Supabase connection is not configured:

1. Verify that `.env` file exists in the project root
2. Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly
3. Ensure the values are not the placeholder values from `.env.example`
4. Restart the application after making changes

### Need Help?

For detailed setup instructions, see [QUICKSTART.md](./QUICKSTART.md)

## Documentation

- 📚 [Quick Start Guide](./QUICKSTART.md) - Get started in 15 minutes
- 🔧 [Server Documentation](./SERVER_README.md) - Backend API details
- 🏗️ [Architecture](./BACKEND_ARCHITECTURE.md) - System architecture
- 🚀 [Deployment Guide](./DEPLOYMENT.md) - Deploy to production
