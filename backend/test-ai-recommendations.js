const axios = require('axios');

async function testAIRecommendations() {
    const testData = {
        sector: 'agriculture',
        location: 'New York, US',
        date: '2024-01-15',
        weatherData: {
            verdict: 'Rain',
            probability: 0.75,
            confidence: 'high',
            details: {
                daily: {
                    temp: 18,
                    humidity: 80,
                    windSpeed: 5.2
                }
            }
        }
    };

    try {
        console.log('Testing AI Recommendations API...');
        console.log('Test data:', JSON.stringify(testData, null, 2));
        
        const response = await axios.post('http://localhost:3001/api/recommendations/generate', testData);
        
        console.log('\n✅ Success! AI Recommendations Response:');
        console.log(JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('\n❌ Error testing AI recommendations:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 Make sure the backend server is running on port 3001');
        }
        
        if (error.response?.data?.error?.includes('API key')) {
            console.log('\n💡 Make sure to set your GEMINI_API_KEY in the .env file');
        }
    }
}

testAIRecommendations();