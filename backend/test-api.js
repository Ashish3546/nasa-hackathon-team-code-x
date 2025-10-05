const axios = require('axios');

async function testApi() {
  try {
    // Test the predict endpoint
    const response = await axios.get('http://localhost:3001/api/predict?lat=40.7128&lon=-74.0060&date=2025-10-05');
    console.log('API Response:', response.data);
  } catch (error) {
    console.error('Error testing API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
    }
  }
}

testApi();