@echo off
title Smart Parking - Frontend Server (Vite React)
echo ========================================================
echo Starting Smart Parking Frontend (Vite + React)...
echo ========================================================
cd /d "%~dp0\frontend"
npm run dev -- --host
pause
