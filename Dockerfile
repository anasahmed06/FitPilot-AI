# Stage 1: Build the React Frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

# Install dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

# Copy source and build (We pass VITE_API_URL empty so it uses relative paths for API calls via Nginx)
COPY frontend ./
ENV VITE_API_URL=""
RUN npm run build


# Stage 2: Build the FastAPI Backend and Nginx Server
FROM python:3.11-slim

# Install Nginx
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend ./

# Copy compiled frontend from Stage 1 to Nginx default public directory
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose port 8080 for AWS App Runner
EXPOSE 8080

# Run the startup script to start both Uvicorn and Nginx
CMD ["/app/start.sh"]
