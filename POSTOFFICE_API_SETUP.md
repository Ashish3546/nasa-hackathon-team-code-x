# Indian Post Office API Integration

The app now uses the free Indian Post Office API for accurate pincode lookup without requiring any API key.

## Features

- **Free API**: No registration or API key required
- **Accurate Data**: Official postal data from India Post
- **Rich Details**: Returns post office name, district, state, division, and region
- **Automatic Detection**: 6-digit codes are automatically treated as Indian pincodes

## Supported Pincode Examples

- `400001` - Mumbai, Maharashtra
- `110001` - New Delhi, Delhi  
- `560001` - Bangalore, Karnataka
- `600001` - Chennai, Tamil Nadu
- `700001` - Kolkata, West Bengal
- `500001` - Hyderabad, Telangana

## API Details

- **Endpoint**: `https://api.postalpincode.in/pincode/{pincode}`
- **Method**: GET
- **Rate Limit**: No official limit
- **Response Format**: JSON with post office details

## How It Works

1. **Pincode Detection**: 6-digit numbers are identified as Indian pincodes
2. **Post Office Lookup**: API returns official postal data
3. **Coordinate Mapping**: State-level coordinates are used for weather lookup
4. **Fallback Chain**: Google Maps → OpenWeatherMap if Post Office API fails

## Benefits

- **No API Key Required**: Works out of the box
- **Official Data**: Accurate postal information from India Post
- **Comprehensive Coverage**: All Indian pincodes supported
- **Fast Response**: Cached results for 24 hours

## Example Response

```json
{
  "success": true,
  "location": {
    "lat": 19.7515,
    "lon": 75.7139,
    "name": "Mumbai GPO, Mumbai, Maharashtra",
    "details": {
      "city": "Mumbai GPO",
      "district": "Mumbai",
      "state": "Maharashtra", 
      "country": "India",
      "postal_code": "400001",
      "division": "Mumbai",
      "region": "Mumbai"
    }
  }
}
```

This integration provides accurate location data for Indian users without requiring additional API setup.