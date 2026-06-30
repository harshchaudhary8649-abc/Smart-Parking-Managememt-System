@echo off
title Smart Parking Management System
echo Starting Smart Parking Management System...
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
start "Smart Parking Backend" cmd /k "cd /d %~dp0backend && npm start"
start "Smart Parking Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
echo Open http://localhost:5173 in your browser.
pause
