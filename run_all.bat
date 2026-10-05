@echo off
title Smart Parking System Launcher
echo ========================================================
echo Starting Fog Computing Smart Parking System...
echo ========================================================
cd /d "%~dp0"
start "Smart Parking - Backend" cmd /k "run_backend.bat"
timeout /t 3 /nobreak >nul
start "Smart Parking - Frontend" cmd /k "run_frontend.bat"
echo.
echo Both servers have been launched in separate windows!
echo Backend Swagger API: http://localhost:8000/docs
echo Frontend Web App:   http://localhost:5173
echo ========================================================
pause
