@echo off
echo Testing Pincode Functionality...
echo.
echo 1. Starting backend server (if not already running)...
cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo 2. Testing pincode API directly...
node -e "
const axios = require('axios');
async function testPincode() {
  try {
    console.log('Testing pincode 400001...');
    const response = await axios.get('http://localhost:3001/api/geocode?postal_code=400001');
    console.log('✅ Success! Response:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Backend server is not running. Please wait for it to start.');
    }
  }
}
testPincode();
"

echo.
echo 3. Opening frontend in browser...
start http://localhost:5173/app.html

echo.
echo Instructions:
echo - Backend server should be running on port 3001
echo - Frontend should be accessible at http://localhost:5173/app.html
echo - Try entering pincode 400001 in the postal code field
echo - Or click the "Test Pincode" button
echo.
pause