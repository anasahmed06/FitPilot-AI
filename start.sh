#!/bin/sh

# Start the FastAPI backend in the background
cd /app/backend
uvicorn app.main:app --host 127.0.0.1 --port 8000 &

# Start Nginx in the foreground
nginx -g 'daemon off;'
