# Pincode Functionality Troubleshooting Guide

## Issue Description
The pincode auto-fill feature may not be working as expected. This guide helps identify and fix common issues.

## Quick Test Steps

### 1. Test Backend Server
```bash
# Navigate to backend directory
cd backend

# Start the server
npm run dev

# Server should show: "Server is running on port 3001"
```

### 2. Test Pincode API Directly
```bash
# In a new terminal, run:
cd backend
node -e "
const axios = require('axios');
async function test() {
  try {
    const response = await axios.get('http://localhost:3001/api/geocode?postal_code=400001');
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}
test();
"
```

### 3. Test Frontend
1. Open `http://localhost:5173/app.html`
2. Enter `400001` in the Postal/ZIP Code field
3. Location should auto-fill with "Mumbai, Maharashtra, India"
4. Or click the "Test Pincode (400001)" button

## Common Issues & Solutions

### Issue 1: Backend Server Not Running
**Symptoms:**
- Console shows "Backend server not running"
- Test pincode button shows connection error

**Solution:**
```bash
cd backend
npm install
npm run dev
```

### Issue 2: Post Office API Not Responding
**Symptoms:**
- Backend logs show "Post Office API error"
- Indian pincodes don't work

**Solution:**
- The Post Office API (api.postalpincode.in) might be down
- The system will fallback to Google Maps API
- Check internet connectivity

### Issue 3: Invalid Pincode Format
**Symptoms:**
- Auto-fill doesn't trigger
- No API calls in console

**Solution:**
- Indian pincodes: Use 6 digits (e.g., 400001)
- US ZIP codes: Use 5 digits (e.g., 10001)
- UK postcodes: Use format like SW1A 1AA
- Add country code for better results

### Issue 4: CORS Issues
**Symptoms:**
- Browser console shows CORS errors
- API calls fail from frontend

**Solution:**
- Backend already includes CORS middleware
- Ensure backend is running on port 3001
- Check if any firewall is blocking the connection

## Supported Postal Code Formats

### Indian Pincodes
- Format: 6 digits (e.g., 400001, 110001, 560001)
- Auto-detected when no country code provided
- Uses Post Office API for accurate results

### US ZIP Codes
- Format: 5 digits (e.g., 10001, 90210)
- Requires country code "US" for best results
- Uses Google Maps API

### UK Postcodes
- Format: Letter-Number-Letter Space Number-Letter-Number (e.g., SW1A 1AA)
- Requires country code "GB"
- Uses Google Maps API

### Other Countries
- Various formats supported
- Always include country code for best results
- Uses Google Maps API

## Debug Mode

### Enable Console Logging
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Enter pincode in the form
4. Watch for debug messages:
   - "Pincode input: [value]"
   - "Valid postal code detected"
   - "Response status: [code]"
   - "Location auto-filled: [location]"

### Backend Logging
Backend shows detailed logs:
```
=== Geocoding Request ===
Query params: { postal_code: '400001' }
✅ Geocoding successful: { lat: 19.7515, lon: 75.7139, name: 'Mumbai, Maharashtra, India' }
```

## Test Cases

### Test Case 1: Indian Pincode
- Input: `400001`
- Expected: "Mumbai, Maharashtra, India"

### Test Case 2: US ZIP Code
- Input: `10001` + Country: `US`
- Expected: "New York, NY, USA"

### Test Case 3: UK Postcode
- Input: `SW1A 1AA` + Country: `GB`
- Expected: "London, UK"

## API Endpoints

### Geocoding Endpoint
```
GET /api/geocode?postal_code=400001
GET /api/geocode?postal_code=10001&country=US
GET /api/geocode?location_name=Paris,France
```

### Response Format
```json
{
  "success": true,
  "location": {
    "lat": 19.7515,
    "lon": 75.7139,
    "name": "Mumbai, Maharashtra, India",
    "details": {
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "postal_code": "400001"
    }
  }
}
```

## Still Having Issues?

1. **Check Network**: Ensure internet connectivity
2. **Check Ports**: Backend (3001) and Frontend (5173) ports should be free
3. **Check Dependencies**: Run `npm install` in backend directory
4. **Check Logs**: Look at both browser console and backend terminal
5. **Try Manual Test**: Use the "Test Pincode" button for debugging

## Contact & Support

If issues persist:
1. Check the browser console for error messages
2. Check the backend terminal for error logs
3. Try different postal codes from different countries
4. Verify all dependencies are installed correctly