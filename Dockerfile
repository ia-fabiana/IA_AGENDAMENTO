# Multi-stage build for React/Vite application

# Stage 1: Build stage is handled by Cloud Build
# The dist folder is already created by the npm run build step

# Stage 2: Production stage - Serve with nginx
FROM nginx:alpine

# Copy the built application from the dist folder
COPY dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
