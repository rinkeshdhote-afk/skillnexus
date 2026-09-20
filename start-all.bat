@echo off
echo =========================================================================
echo  SKILLNEXUS - Smart India Hackathon 2026 (SIH26044) Full Stack Launcher
echo =========================================================================
echo.
echo Starting Backend (FastAPI on Port 8000)...
start "SKILLNEXUS Backend" cmd /k "cd backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Student Portal (React + Vite on Port 5173)...
start "SKILLNEXUS Student Portal" cmd /k "cd student-app && npm.cmd run dev"

echo Starting Professional & Academician Portal (React + Vite on Port 5174)...
start "SKILLNEXUS Pro Portal" cmd /k "cd professional-app && npm.cmd run dev"

echo.
echo =========================================================================
echo  All 3 services launched in separate windows!
echo.
echo  - Student Portal:      http://localhost:5173
echo  - Professional Portal: http://localhost:5174
echo  - Backend API Docs:    http://localhost:8000/docs
echo =========================================================================
