@echo off
echo ========================================
echo   STARTING HRMS BACKEND SERVER
echo ========================================
echo.
echo Backend will run on: http://localhost:8082
echo.
cd HRMS-Backend
echo Starting Maven Spring Boot...
mvn spring-boot:run
