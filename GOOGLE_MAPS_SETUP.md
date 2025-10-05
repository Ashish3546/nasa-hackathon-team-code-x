# Google Maps API Setup Guide

To enable accurate postal code geocoding, you need to set up Google Maps Geocoding API:

## Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Geocoding API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Geocoding API"
   - Click on it and press "Enable"

4. Create API credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

## Step 2: Configure API Key

1. Open `backend/.env` file
2. Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key:
   ```
   GOOGLE_MAPS_API_KEY=AIzaSyBvOkBwGyD...your_actual_key_here
   ```

## Step 3: Secure Your API Key (Recommended)

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click on your API key to edit it
3. Under "API restrictions", select "Restrict key"
4. Choose "Geocoding API" from the list
5. Under "Application restrictions", you can:
   - Add your server's IP address for HTTP referrers
   - Or leave unrestricted for development

## Step 4: Test the Integration

1. Restart your backend server: `npm run dev`
2. Try searching with postal codes like:
   - `10001` (New York, US)
   - `SW1A 1AA` (London, UK)
   - `400001` (Mumbai, India)
   - `75001` (Paris, France)

## Benefits of Google Maps Integration

- **Global Coverage**: Supports postal codes from all countries
- **High Accuracy**: More precise location data than OpenWeatherMap
- **Rich Details**: Returns city, state, country, and formatted addresses
- **Fallback Support**: OpenWeatherMap is used as backup if Google Maps fails

## API Usage Limits

- Google Maps Geocoding API: 40,000 requests per month free
- After free tier: $5 per 1,000 requests
- For production, consider implementing request limits and user authentication

## Troubleshooting

If geocoding fails:
1. Check your API key is correct in `.env`
2. Ensure Geocoding API is enabled in Google Cloud Console
3. Check browser console for error messages
4. The app will fallback to OpenWeatherMap geocoding automatically