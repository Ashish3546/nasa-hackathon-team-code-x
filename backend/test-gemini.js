require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    try {
        console.log('Testing Gemini API...');
        console.log('API Key:', process.env.GEMINI_API_KEY ? 'Found' : 'Missing');
        
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Test with simple request
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Generate a simple weather recommendation for farmers in JSON format with title and description fields.");
        const response = await result.response;
        const text = response.text();
        
        console.log('✅ Gemini API working!');
        console.log('Response:', text.substring(0, 200) + '...');
    } catch (error) {
        console.error('❌ Gemini API error:', error.message);
        if (error.message.includes('API_KEY_INVALID')) {
            console.log('Please check your Gemini API key in .env file');
        }
    }
}

testGemini();