// Simple test to verify frontend-backend communication
fetch('http://localhost:4000/')
  .then(response => response.json())
  .then(data => console.log('Success:', data))
  .catch(error => console.error('Error:', error));