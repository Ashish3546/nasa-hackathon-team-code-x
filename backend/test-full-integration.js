require('dotenv').config();
const axios = require('axios');

async function testFullIntegration() {
    console.log('🧪 Testing Full Weather + AI Integration...\n');
    
    try {
        // Test 1: Get weather data
        console.log('1️⃣ Testing weather prediction...');
        const weatherResponse = await axios.get('http://localhost:3001/api/predict?lat=28.6139&lon=77.2090&date=2024-01-20');
        const weatherData = weatherResponse.data;
        console.log('✅ Weather data:', {
            verdict: weatherData.verdict,
            probability: Math.round(weatherData.probability * 100) + '%',
            confidence: weatherData.confidence
        });
        
        // Test 2: Get AI recommendations
        console.log('\n2️⃣ Testing AI recommendations...');
        const recResponse = await axios.post('http://localhost:3001/api/recommendations/generate', {
            sector: 'agriculture',
            location: 'Delhi, India',
            date: '2024-01-20',
            weatherData: weatherData,
            cropType: 'wheat'
        });
        
        const recData = recResponse.data;
        console.log('✅ AI Recommendations:');
        console.log('Source:', recData.source);
        console.log('Recommendations count:', recData.recommendations.length);
        
        recData.recommendations.forEach((rec, index) => {
            console.log(`\n${index + 1}. ${rec.title}`);
            console.log(`   Priority: ${rec.priority}`);
            console.log(`   Timeframe: ${rec.timeframe}`);
            console.log(`   Description: ${rec.description.substring(0, 100)}...`);
        });
        
        console.log('\n🎉 Full integration test successful!');
        
    } catch (error) {
        console.error('❌ Integration test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testFullIntegration();