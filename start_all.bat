@echo off
echo ====================================================
echo Starting AIVOA Full-Stack QMS Application...
echo ====================================================
start "AIVOA Backend" cmd /k "%~dp0start_backend.bat"
timeout /t 3 /nobreak >nul
start "AIVOA Frontend" cmd /k "%~dp0start_frontend.bat"
echo Applications launched! Opening browser...
timeout /t 2 /nobreak >nul
start http://localhost:3000
