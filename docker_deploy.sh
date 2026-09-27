#!/usr/bin/env bash
set -e

echo "=============================================================================="
echo "          AIVOA Pharmaceutical QMS - Docker Deployment"
echo "=============================================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker CLI was not found. Please install Docker."
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "[ERROR] Docker daemon is not running. Please start Docker and retry."
    exit 1
fi

# Copy template if .env does not exist
if [ ! -f ".env" ] && [ -f ".env.docker.example" ]; then
    echo "Creating .env configuration from template..."
    cp .env.docker.example .env
fi

echo "Building container image and starting AIVOA QMS..."
docker compose -f docker-compose.yml up -d --build

echo ""
echo "=============================================================================="
echo "[SUCCESS] AIVOA QMS is deployed and running in Docker!"
echo ""
echo "Application URL:       http://localhost:8000"
echo "API Health Check:      http://localhost:8000/api/health"
echo "Swagger Documentation: http://localhost:8000/docs"
echo "=============================================================================="
