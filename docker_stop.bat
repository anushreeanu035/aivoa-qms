@echo off
echo ==============================================================================
echo Stopping AIVOA QMS Docker containers...
echo ==============================================================================
docker compose -f "%~dp0docker-compose.yml" down
if exist "%~dp0docker-compose.postgres.yml" (
    docker compose -f "%~dp0docker-compose.postgres.yml" down >nul 2>&1
)
echo Containers stopped.
pause
