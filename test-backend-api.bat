@echo off
echo ========================================
echo   Testing Backend API
echo ========================================
echo.

echo Testing: http://localhost:8080/api/offer-templates-simple/test
echo.

curl http://localhost:8080/api/offer-templates-simple/test

echo.
echo.
echo If you see "API is working!" above, backend is ready!
echo.
pause
