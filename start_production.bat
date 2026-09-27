@echo off
setlocal
echo ==============================================================================
echo             AIVOA QMS - Local Production Server Launcher
echo ==============================================================================
echo.

:: Check if server is already running on port 8000
netstat -ano | findstr :8000 | findstr LISTENING >nul 2>&1
if not errorlevel 1 (
    echo [OK] AIVOA QMS production server is already running on http://localhost:8000!
    echo Opening application in browser...
    start http://localhost:8000
    goto :eof
)

:: 1. Build frontend if dist does not exist
if not exist "%~dp0frontend\dist\index.html" (
    echo Building React frontend for production...
    cd "%~dp0frontend"
    call npm run build
    cd "%~dp0"
)

:: 2. Launch production server
echo Starting unified production server on http://localhost:8000 ...
set ENVIRONMENT=production
set PORT=8000
set RELOAD=false
set PYTHONPATH=%~dp0backend;%PYTHONPATH%

echo Opening application in browser...
start http://localhost:8000

if exist "%~dp0backend\venv\Scripts\python.exe" (
    "%~dp0backend\venv\Scripts\python.exe" "%~dp0backend\run.py"
) else (
    python "%~dp0backend\run.py"
)
