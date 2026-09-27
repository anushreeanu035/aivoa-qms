@echo off
echo ====================================================
echo Starting AIVOA QMS Backend (FastAPI on Port 8000)...
echo ====================================================
cd /d "%~dp0"
"%~dp0backend\venv\Scripts\python.exe" "%~dp0backend\run.py"
pause
