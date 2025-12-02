@echo off
echo Starting Nebula Portal Backend Server...
echo.
cd /d "%~dp0"
"C:\Program Files\nodejs\node.exe" server.js
pause
