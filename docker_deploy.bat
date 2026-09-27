@echo off
setlocal

echo ==============================================================================
echo           AIVOA Pharmaceutical QMS - Docker Deployment
echo ==============================================================================
echo.

:: 1. Check if Docker is installed
where docker >nul 2>&1
if errorlevel 1 goto docker_not_found

:: 2. Check if Docker Daemon is running
docker info >nul 2>&1
if not errorlevel 1 goto docker_ready

echo [WARNING] Docker engine is not currently running.
echo Please ensure Docker Desktop is open from your Start Menu.
echo Waiting up to 30 seconds for Docker engine to initialize...
echo.

set /a attempts=0

:check_engine_loop
ping 127.0.0.1 -n 3 >nul
docker info >nul 2>&1
if not errorlevel 1 goto docker_ready

set /a attempts+=1
if %attempts% lss 10 goto check_engine_loop

echo.
echo [NOTICE] Docker engine is still not responding.
echo Step 1: Open Docker Desktop from your Windows Start Menu or Desktop.
echo Step 2: Wait until Docker Desktop displays "Engine running" in green.
echo Step 3: Run docker_deploy.bat again.
echo.
pause
exit /b 1

:docker_not_found
echo [ERROR] Docker CLI was not found on your system PATH.
echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop/
pause
exit /b 1

:docker_ready
echo [OK] Docker engine is active and ready!
echo.

:: 3. Prepare .env if needed
if not exist "%~dp0.env" (
    if exist "%~dp0.env.docker.example" (
        echo Creating .env configuration from template...
        copy "%~dp0.env.docker.example" "%~dp0.env" >nul
    )
)

:: 4. Build and start containers
echo Building container image and starting AIVOA QMS...
echo (Compiling React frontend and packaging FastAPI backend...)
echo.
docker compose -f "%~dp0docker-compose.yml" up -d --build

if errorlevel 1 (
    echo.
    echo [ERROR] Docker build or startup failed. Please inspect the log messages above.
    pause
    exit /b 1
)

echo.
echo ==============================================================================
echo [SUCCESS] AIVOA QMS is deployed and running in Docker!
echo.
echo Application URL:       http://localhost:8000
echo API Health Check:      http://localhost:8000/api/health
echo Swagger Documentation: http://localhost:8000/docs
echo.
echo To stop the container, run: docker_stop.bat
echo ==============================================================================
echo.
ping 127.0.0.1 -n 2 >nul
start http://localhost:8000
