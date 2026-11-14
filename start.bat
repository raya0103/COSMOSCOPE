@echo off
title COSMOSCOPE Launcher - Explore the changing universe
cls
echo ===================================================
echo   COSMOSCOPE - Explore the changing universe
echo   Launching Full Stack (FastAPI + Vite)
echo ===================================================

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "COSMOSCOPE Backend" /D "%ROOT%\backend" cmd /k "python -m uvicorn app.main:app --reload --port 8000"

echo [2/2] Starting Vite Frontend on http://localhost:5173 ...
start "COSMOSCOPE Frontend" /D "%ROOT%\frontend" cmd /k "npm run dev"

echo.
echo ===================================================
echo   Both servers launched in separate windows!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000/docs
echo ===================================================
echo   Keep those two terminal windows open!
echo ===================================================
