#!/bin/sh

# Default PORT to 10000 if not provided by Render
export PORT=${PORT:-10000}

# Substitute the PORT variable in nginx.conf
envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start the FastAPI backend in the background
cd /app/backend
uvicorn app.main:app --host 127.0.0.1 --port 8000 &

# Start Nginx in the foreground
nginx -g 'daemon off;'
