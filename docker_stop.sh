#!/usr/bin/env bash
echo "Stopping AIVOA QMS Docker containers..."
docker compose -f docker-compose.yml down
if [ -f "docker-compose.postgres.yml" ]; then
    docker compose -f docker-compose.postgres.yml down 2>/dev/null || true
fi
echo "Containers stopped."
