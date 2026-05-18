@echo off
echo ========================================
echo   STARTING HRMS BACKEND SERVER
echo ========================================
echo.

cd HRMS-Backend

echo Setting environment variables...
set MONGODB_URI=mongodb+srv://hrms_user:yWkztlbtsW7RGube@cluster0.aexpf8t.mongodb.net/Data_base_hrms?retryWrites=true^&w=majority^&appName=Cluster0
set SPRING_MAIL_USERNAME=aishushettar95@gmail.com
set SPRING_MAIL_PASSWORD=bbfskhrhtnujkokk
set JWT_SECRET=MyFixedSecretKey123456

echo.
echo Environment variables set!
echo.
echo Starting backend server on port 8082...
echo Please wait, this may take 1-2 minutes...
echo.

mvn spring-boot:run

pause
