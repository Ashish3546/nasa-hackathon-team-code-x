@echo off
echo 🚀 Starting Weather AI System...
echo.

echo 1. Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo 2. Testing System Integration...
node test-full-integration.js

echo.
echo 3. Starting Frontend (if needed)...
echo Frontend should be accessible at: http://localhost:5173
echo.
echo 📋 Available Portals:
echo - Main App: http://localhost:5173/app.html
echo - Agriculture: http://localhost:5173/agriculture.html
echo - Logistics: http://localhost:5173/logistics.html
echo - Construction: http://localhost:5173/construction.html
echo.
echo ✅ System is ready! Backend running on port 3001
pause