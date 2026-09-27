@echo off
echo ====================================================
echo Starting AIVOA QMS Frontend (Vite on Port 3000)...
echo ====================================================
cd /d "%~dp0frontend"
call npm run dev
pause
