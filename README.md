# Will It Rain? - Weather Prediction App

A fast, attractive, accessible web app that answers a simple question: **Given a location (lat/lon or place name) and a date (YYYY-MM-DD), will it rain at that location on that date?**

## Features

- **Location Input**: Search by place name, postal code, or use geolocation
- **Google Maps Integration**: Accurate geocoding for postal codes worldwide
- **Date Selection**: Choose a date (with constraints for forecast horizon)
- **Rain Prediction**: Clear verdict with probability and confidence
- **Visualizations**: 
  - Hourly precipitation chart
  - Location map (placeholder)
  - Weather details panel
- **Responsive Design**: Works on mobile and desktop

## Tech Stack

### Backend
- **Node.js + Express**: API server
- **OpenWeather API**: Weather data source
- **Google Maps API**: Accurate postal code geocoding
- **In-memory caching**: For rate limiting

### Frontend
- **React + Vite**: Fast, modern SPA
- **TailwindCSS**: Utility-first styling
- **Recharts**: Data visualization
- **Framer Motion**: Smooth animations

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── utils/
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── package.json
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your API keys:
   ```
   OPENWEATHER_API_KEY=your_openweather_key_here
   GOOGLE_MAPS_API_KEY=your_google_maps_key_here
   PORT=3001
   ```
   
   **Note**: For Google Maps API setup, see [GOOGLE_MAPS_SETUP.md](GOOGLE_MAPS_SETUP.md)

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

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

## Development

### Components

- **App.jsx**: Main application component
- **LocationInput.jsx**: Location search and geolocation
- **DateInput.jsx**: Date selection with constraints
- **RainPredictionCard.jsx**: Animated prediction display
- **VisualizationPanel.jsx**: Charts and map visualization

### Styling

- TailwindCSS classes for styling
- Responsive design with grid and flexbox
- Color palette:
  - Primary: indigo (#4338CA)
  - Rain: blue (#0369A1)
  - Uncertain: gray (#6B7280)
  - No rain: yellow (#F59E0B)

## Future Enhancements

- [ ] Integrate real geocoding service
- [ ] Add map visualization with Leaflet
- [ ] Implement multiple weather data sources
- [ ] Add historical data and climatology
- [ ] Create downloadable reports (PNG/CSV)
- [ ] Add shareable links
- [ ] Implement dark mode
- [ ] Add unit tests
- [ ] Add CI/CD pipeline

## Deployment

- **Frontend**: Vercel, Netlify, or similar static hosting
- **Backend**: Railway, Heroku, or similar Node.js hosting
- **Environment variables**: Set API keys and configuration

## License

MIT