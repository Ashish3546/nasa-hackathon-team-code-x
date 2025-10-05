const fs = require('fs');
const path = require('path');

console.log('Testing CSV loading...');

// Check if data directory exists
const dataDir = path.join(__dirname, 'data');
console.log('Data directory path:', dataDir);
console.log('Data directory exists:', fs.existsSync(dataDir));

if (fs.existsSync(dataDir)) {
    const files = fs.readdirSync(dataDir);
    console.log('Files in data directory:', files);
    
    // Try to read the CSV file
    const csvPath = path.join(dataDir, 'GlobalWeatherRepository.csv');
    console.log('CSV file path:', csvPath);
    console.log('CSV file exists:', fs.existsSync(csvPath));
    
    if (fs.existsSync(csvPath)) {
        try {
            const content = fs.readFileSync(csvPath, 'utf8');
            const lines = content.split('\n');
            console.log('Total lines in CSV:', lines.length);
            console.log('First line (headers):', lines[0].substring(0, 100) + '...');
            if (lines.length > 1) {
                console.log('Second line (sample data):', lines[1].substring(0, 100) + '...');
            }
        } catch (error) {
            console.error('Error reading CSV:', error.message);
        }
    }
}