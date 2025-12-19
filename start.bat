@echo off
title Weekly Spaceman - Project Management App

echo ========================================
echo   Weekly Spaceman PM App - Setup
echo ========================================
echo.

:: Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [1/5] Installing backend dependencies...
cd /d "%~dp0"
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo [2/5] Installing frontend dependencies...
cd /d "%~dp0frontend"
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo [3/5] Installing Tailwind CSS...
call npm install -D tailwindcss @tailwindcss/postcss postcss autoprefixer lucide-react
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Tailwind CSS
    pause
    exit /b 1
)

echo.
echo [4/5] Starting backend server...
cd /d "%~dp0"
start "Backend Server" cmd /k "npm start"

echo.
echo [5/5] Starting frontend server...
cd /d "%~dp0frontend"
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo   Waiting for servers to start...
echo ========================================
timeout /t 5 /nobreak >nul

echo.
echo Opening app in browser...
start http://localhost:5173

echo.
echo ========================================
echo   App is running!
echo ========================================
echo.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:4000
echo.
echo   To stop: Close the server windows
echo ========================================
echo.
pause
