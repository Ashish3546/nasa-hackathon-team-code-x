# Will It Rain? - Backend

Backend API server for the Will It Rain weather prediction app.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your OpenWeather API key:
   ```
   OPENWEATHER_API_KEY=your_api_key_here
   PORT=3001
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### GET /api/predict

Get rain prediction for a specific location and date.

**Query Parameters:**
- `lat` (number): Latitude
- `lon` (number): Longitude
- `date` (string): Date in YYYY-MM-DD format

**Response:**
```json
{
  "location": "New York, US",
  "date": "2025-09-18",
  "verdict": "Rain",
  "probability": 0.68,
  "confidence": "medium",
  "source": ["openweathermap"],
  "details": {
    "hourly": [...],
    "daily": {...}
  }
}
```

## Caching

The server implements an in-memory LRU cache with a 30-minute TTL for weather predictions to respect API rate limits.

## Dependencies

- Express.js
- Axios
- CORS
- Dotenv