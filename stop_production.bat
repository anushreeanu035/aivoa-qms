@echo off
setlocal
echo ==============================================================================
echo             AIVOA QMS - Stop Production Server
echo ==============================================================================
echo.

set found=0
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    set found=1
    echo Terminating server process PID: %%a ...
    taskkill /F /PID %%a >nul 2>&1
)

if %found% equ 1 (
    echo [OK] AIVOA QMS server on port 8000 has been stopped successfully.
) else (
    echo [INFO] No active server found listening on port 8000.
)

echo.
timeout /t 2 >nul
