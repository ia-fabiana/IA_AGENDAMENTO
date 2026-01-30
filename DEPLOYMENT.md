# Deployment Verification Guide

## Overview
This document explains how the application is deployed to Google Cloud Run and how to verify the deployment.

## Deployment Architecture

### Components
1. **Cloud Build** - Builds and deploys the application automatically
2. **Container Registry** - Stores Docker images
3. **Cloud Run** - Hosts the application
4. **Nginx** - Serves the static React SPA

### Build Process
The deployment follows these steps (defined in `cloudbuild.yaml`):

1. **Install dependencies** - `npm install`
2. **Build the React app** - `npm run build` with environment variables baked in
3. **Build Docker image** - Creates a container with Nginx serving the built files
4. **Push to Container Registry** - Stores the image
5. **Deploy to Cloud Run** - Updates the service at https://ia-agendamentos-870139342019.us-central1.run.app/

### Environment Variables
The following environment variables are baked into the build:
- `VITE_SUPABASE_URL` - Supabase backend URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_EVOLUTION_API_URL` - Evolution API URL
- `VITE_EVOLUTION_API_KEY` - Evolution API key

⚠️ **Important**: These are set during the build step, not at runtime, since this is a static SPA.

## How to Trigger a Deployment

### Option 1: Push to Main Branch (Recommended)
If Cloud Build triggers are configured:
```bash
git push origin main
```

### Option 2: Manual Cloud Build Trigger
```bash
gcloud builds submit --config cloudbuild.yaml
```

### Option 3: Local Docker Build and Deploy
```bash
# Build the app
npm install
npm run build

# Build Docker image
docker build -t ia-agendamentos .

# Test locally
docker run -p 8080:8080 ia-agendamentos

# Deploy to Cloud Run
gcloud run deploy ia-agendamentos \
  --image gcr.io/YOUR_PROJECT_ID/ia-agendamentos:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

## Verification Checklist

### 1. Check Cloud Build Status
```bash
gcloud builds list --limit=5
```

### 2. Verify the Deployment
Visit: https://ia-agendamentos-870139342019.us-central1.run.app/

Expected behavior:
- ✅ Page loads successfully
- ✅ No console errors
- ✅ Application displays correctly
- ✅ Supabase connection works
- ✅ API integrations function

### 3. Check Cloud Run Logs
```bash
gcloud run services logs read ia-agendamentos \
  --region us-central1 \
  --limit 50
```

### 4. Test Health Endpoint
```bash
curl https://ia-agendamentos-870139342019.us-central1.run.app/health
```
Expected response: `healthy`

## Troubleshooting

### Build Fails
1. Check Cloud Build logs:
   ```bash
   gcloud builds log [BUILD_ID]
   ```
2. Verify all environment variables are set in `cloudbuild.yaml`
3. Ensure Dockerfile and nginx.conf exist

### Application Not Loading
1. Check if the service is running:
   ```bash
   gcloud run services describe ia-agendamentos --region us-central1
   ```
2. Verify the container is healthy
3. Check browser console for JavaScript errors
4. Verify environment variables were baked into the build

### 404 Errors on Routes
- This should be handled by nginx.conf which redirects all routes to index.html
- Verify nginx.conf was copied into the Docker image

### API Connection Issues
- Environment variables must be set during BUILD time, not deploy time
- Rebuild if you need to change API URLs or keys
- Check browser network tab for failed requests

## Files Added/Modified

### New Files
- `Dockerfile` - Multi-stage Docker build configuration
- `nginx.conf` - Nginx server configuration for SPA routing
- `.dockerignore` - Optimizes Docker build by excluding unnecessary files

### Modified Files
- `cloudbuild.yaml` - Removed runtime env vars (not needed for static SPA), added port specification
- `index.html` - Added script tag to load the React application entry point

## Next Steps

To verify changes are being deployed:
1. Make a small visible change (e.g., change a text in the UI)
2. Commit and push to trigger Cloud Build
3. Wait for build to complete (~2-5 minutes)
4. Visit the URL and verify the change appears
5. If changes don't appear, check browser cache or try incognito mode
