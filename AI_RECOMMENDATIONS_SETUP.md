# AI-Powered Sector Recommendations Setup Guide

## Overview
The weather app now includes AI-powered sector-specific recommendations using Google's Gemini AI API. Based on the weather prediction, location, and selected industry sector, the AI generates tailored, actionable recommendations.

## Supported Sectors
- 🌾 **Agriculture**: Crop planning, irrigation, harvesting recommendations
- 🚚 **Logistics**: Route planning, delivery scheduling, cargo protection
- 🏗️ **Construction**: Project scheduling, safety, resource planning
- ⚡ **Energy**: Renewable energy, grid management, demand planning
- 🚑 **Disaster Management**: Emergency preparedness, resource allocation
- 🏨 **Tourism**: Event planning, seasonal activities, visitor safety
- 🏭 **Industrial**: Manufacturing, equipment protection, operations
- 💧 **Water Management**: Conservation, flood control, supply planning

## Setup Instructions

### 1. Install Dependencies
Run the installation script:
```bash
# Windows
install-ai-dependencies.bat

# Or manually:
cd backend
npm install @google/generative-ai
```

### 2. Get Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 3. Configure Environment
Edit `backend/.env` and replace the placeholder:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 4. Restart Backend Server
```bash
cd backend
npm run dev
```

### 5. Test the Feature
```bash
cd backend
node test-ai-recommendations.js
```

## How to Use

1. **Get Weather Prediction**: Enter location and date, submit the form
2. **Select Sector**: Choose your industry from the dropdown in the AI Recommendations section
3. **Generate Recommendations**: Click "Get AI Recommendations" button
4. **Review Results**: AI-generated recommendations will appear with priority levels and timeframes

## API Endpoint

### POST `/api/recommendations/generate`

**Request Body:**
```json
{
  "sector": "agriculture",
  "location": "New York, US",
  "date": "2024-01-15",
  "weatherData": {
    "verdict": "Rain",
    "probability": 0.75,
    "confidence": "high",
    "details": {
      "daily": {
        "temp": 18,
        "humidity": 80,
        "windSpeed": 5.2
      }
    }
  }
}
```

**Response:**
```json
{
  "sector": "agriculture",
  "location": "New York, US",
  "date": "2024-01-15",
  "recommendations": [
    {
      "title": "Delay Field Operations",
      "description": "Postpone planting and harvesting activities due to high rain probability",
      "priority": "high",
      "timeframe": "immediate"
    }
  ],
  "generatedAt": "2024-01-15T10:30:00.000Z"
}
```

## Features

### Smart Recommendations
- **Context-Aware**: Considers location, weather conditions, and sector-specific needs
- **Priority Levels**: High, Medium, Low priority recommendations
- **Timeframes**: Immediate, Today, This Week action items
- **Actionable**: Specific, practical advice for each industry

### User Experience
- **Seamless Integration**: Works with existing weather predictions
- **Sector Selection**: Easy dropdown to choose your industry
- **Visual Design**: Color-coded priorities and clear formatting
- **Error Handling**: Graceful fallbacks if AI service is unavailable

## Troubleshooting

### Common Issues

**"Unable to generate AI recommendations"**
- Check if GEMINI_API_KEY is set correctly in .env
- Verify the backend server is running
- Ensure you have internet connectivity

**"Failed to generate recommendations"**
- API key might be invalid or expired
- Check the console for detailed error messages
- Try regenerating your Gemini API key

**Backend server not responding**
- Make sure backend is running on port 3001
- Check if all dependencies are installed
- Restart the backend server

### Testing
Use the test script to verify everything is working:
```bash
cd backend
node test-ai-recommendations.js
```

## Cost Considerations

- **Gemini API**: Free tier includes generous usage limits
- **Rate Limiting**: Built-in caching to minimize API calls
- **Efficient Prompts**: Optimized prompts to reduce token usage

## Future Enhancements

- **Caching**: Cache recommendations for similar weather conditions
- **Multiple AI Providers**: Support for OpenAI, Claude, etc.
- **Custom Sectors**: Allow users to define custom industry sectors
- **Historical Learning**: Learn from user feedback to improve recommendations