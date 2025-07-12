@echo off
echo ========================================
echo    ArenaPulse Social Media Application
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo Installing dependencies...
npm install

echo.
echo Starting ArenaPulse server...
echo.
echo The application will be available at:
echo http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

npm start

pause 