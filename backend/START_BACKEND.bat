@echo off
title Nebula Backend Server
echo ========================================
echo   Nebula Portal - Backend Server
echo ========================================
echo.
echo Starting MongoDB connection check...
echo.

cd /d "%~dp0"

"C:\Program Files\nodejs\node.exe" check-mongodb.js

echo.
echo ========================================
echo   Starting Backend Server
echo ========================================
echo.

"C:\Program Files\nodejs\node.exe" server.js

echo.
echo Server stopped.
pause
