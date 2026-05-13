@echo off
echo ========================================
echo   Restarting HRMS Backend
echo ========================================
echo.

cd /d e:\HRMSProject\HRMS-Backend

echo Step 1: Cleaning project...
call mvn clean

echo.
echo Step 2: Building project...
call mvn install -DskipTests

echo.
echo Step 3: Starting backend...
echo.
echo Backend will start now. Press Ctrl+C to stop.
echo.
call mvn spring-boot:run

pause
