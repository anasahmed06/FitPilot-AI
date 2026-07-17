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

# Install Nginx and gettext-base for envsubst
RUN apt-get update && \
    apt-get install -y nginx gettext-base && \
    rm -rf /var/lib/apt/lists/* && \
    rm -f /etc/nginx/sites-enabled/default && \
    rm -f /etc/nginx/sites-available/default

WORKDIR /app/backend

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend ./

# Copy compiled frontend from Stage 1 to Nginx default public directory
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Copy Nginx configuration as a template
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Copy startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Start Nginx and Uvicorn
CMD ["/app/start.sh"]
