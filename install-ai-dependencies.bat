@echo off
echo Installing AI dependencies for weather app...
cd backend
npm install @google/generative-ai
echo.
echo Installation complete!
echo.
echo To use AI recommendations:
echo 1. Get a free Gemini API key from https://makersuite.google.com/app/apikey
echo 2. Replace YOUR_GEMINI_API_KEY in backend/.env with your actual key
echo 3. Restart the backend server
echo.
pause