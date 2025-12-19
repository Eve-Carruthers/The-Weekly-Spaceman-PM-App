@echo off
title Stopping Weekly Spaceman App

echo Stopping servers...

:: Kill node processes running on ports 4000 and 5173
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000 ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5174 ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>&1

echo.
echo Servers stopped!
pause
