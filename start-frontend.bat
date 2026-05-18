@echo off
echo ========================================
echo   STARTING HRMS FRONTEND SERVER
echo ========================================
echo.
echo Frontend will run on: http://localhost:5173
echo.
cd HRMS-Frontend
echo Installing dependencies (if needed)...
call npm install
echo.
echo Starting Vite dev server...
npm run dev
