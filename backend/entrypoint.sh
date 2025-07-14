#!/bin/sh

# Apply database migrations
python manage.py migrate

# Start server
uvicorn chatproject.asgi:application --host 0.0.0.0 --port 8000
