# ==============================================================================
# Stage 1: Build the React + Vite Frontend SPA
# ==============================================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Install dependencies first (layer caching)
COPY frontend/package*.json ./
RUN npm ci || npm install

# Copy source and build production assets
COPY frontend/ ./
RUN npm run build

# ==============================================================================
# Stage 2: Production Python Backend + Static Asset Serving
# ==============================================================================
FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    PYTHONPATH=/app/backend

# Install system dependencies (curl for healthchecks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy backend source code
COPY backend /app/backend

# Copy built frontend assets from Stage 1 into the standard location
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Create persistent storage directory for SQLite database & uploaded documents
RUN mkdir -p /app/data

# Change working directory to backend
WORKDIR /app/backend

# Expose production port (Render sets $PORT dynamically, defaults to 8000)
ENV PORT=8000
EXPOSE 8000

# Container Healthcheck verifying FastAPI and SPA status
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/api/health || exit 1

# Launch production server with dynamic cloud PORT support
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
