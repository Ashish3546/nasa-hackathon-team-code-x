# How to Run the Application Locally

## Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Running the Application

### 1. Start the Backend Server
Open a terminal/command prompt and navigate to the backend directory:
```bash
cd backend
```

Install dependencies (if not already installed):
```bash
npm install
```

Start the backend server:
```bash
npm run dev
```

The backend server will start on port 4000: http://localhost:4000

### 2. Start the Frontend Server
Open a new terminal/command prompt and navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies (if not already installed):
```bash
npm install
```

Start the frontend development server:
```bash
npm run dev
```

The frontend server will start on port 5174: http://localhost:5174

### 3. Access the Application
Open your web browser and go to: http://localhost:5174

## API Endpoints

### Health Check
- GET http://localhost:4000/
- Returns: `{"message":"Will It Rain API is running!"}`

### Weather Prediction
- GET http://localhost:4000/api/predict?lat={latitude}&lon={longitude}&date={YYYY-MM-DD}
- Example: http://localhost:4000/api/predict?lat=40.7128&lon=-74.0060&date=2025-10-05

## Adding OpenWeather API Key

To get real weather data, you need to:

1. Sign up for a free API key at https://openweathermap.org/api
2. Add your API key to the backend `.env` file:
   ```
   OPENWEATHER_API_KEY=your_actual_api_key_here
   PORT=4000
   ```

## Troubleshooting

### Port Conflicts
If you get "port already in use" errors:
1. Check which process is using the port: `netstat -ano | findstr :PORT_NUMBER`
2. Kill the process: `taskkill /PID PROCESS_ID /F`
3. Or change the port in the server.js file and .env file

### Common Issues
- Make sure both frontend and backend servers are running
- Check that your firewall isn't blocking the ports
- Ensure you have a stable internet connection for API calls