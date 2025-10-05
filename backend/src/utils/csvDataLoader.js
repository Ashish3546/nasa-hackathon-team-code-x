const fs = require('fs');
const path = require('path');

class WeatherDataLoader {
    constructor() {
        this.data = [];
        this.loaded = false;
    }

    loadCSVData() {
        try {
            const csvFileName = process.env.CSV_FILENAME || 'weather_dataset.csv';
            let csvPath = path.join(__dirname, '../../data/', csvFileName);
            
            // Try with .csv extension if file doesn't exist
            if (!fs.existsSync(csvPath)) {
                csvPath = path.join(__dirname, '../../data/', csvFileName + '.csv');
            }
            
            if (!fs.existsSync(csvPath)) {
                console.log(`CSV dataset not found at: ${csvPath}`);
                console.log('Available files in data directory:');
                const dataDir = path.join(__dirname, '../../data/');
                if (fs.existsSync(dataDir)) {
                    const files = fs.readdirSync(dataDir);
                    console.log(files);
                } else {
                    console.log('Data directory does not exist');
                }
                return false;
            }
            
            console.log(`Loading CSV from: ${csvPath}`);

            const csvContent = fs.readFileSync(csvPath, 'utf8');
            const lines = csvContent.split('\n');
            const headers = lines[0].split(',');

            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim()) {
                    const values = lines[i].split(',');
                    const record = {};
                    
                    headers.forEach((header, index) => {
                        record[header.trim()] = values[index]?.trim();
                    });
                    
                    this.data.push(record);
                }
            }

            this.loaded = true;
            console.log(`✅ Successfully loaded ${this.data.length} weather records from CSV`);
            if (this.data.length > 0) {
                console.log(`Sample record:`, this.data[0].location_name, this.data[0].country);
            }
            return true;
        } catch (error) {
            console.error('Error loading CSV data:', error.message);
            return false;
        }
    }

    findNearestLocation(targetLat, targetLon, targetDate) {
        if (!this.loaded || this.data.length === 0) {
            return null;
        }

        let nearest = null;
        let minDistance = Infinity;

        for (const record of this.data) {
            const lat = parseFloat(record.latitude);
            const lon = parseFloat(record.longitude);
            
            if (isNaN(lat) || isNaN(lon)) continue;

            // Calculate distance using Haversine formula (simplified)
            const distance = Math.sqrt(
                Math.pow(lat - targetLat, 2) + Math.pow(lon - targetLon, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearest = record;
            }
        }

        return nearest;
    }

    getHistoricalPattern(lat, lon, targetDate) {
        const nearestRecord = this.findNearestLocation(lat, lon, targetDate);
        
        if (!nearestRecord) {
            return {
                rainProbability: 0.3,
                avgTemp: 20,
                humidity: 60,
                pressure: 1013,
                windSpeed: 5
            };
        }

        // Extract weather data from CSV
        const precipMm = parseFloat(nearestRecord.precip_mm) || 0;
        const humidity = parseFloat(nearestRecord.humidity) || 60;
        const temp = parseFloat(nearestRecord.temperature_celsius) || 20;
        const pressure = parseFloat(nearestRecord.pressure_mb) || 1013;
        const windSpeed = parseFloat(nearestRecord.wind_kph) || 5;
        const cloudCover = parseFloat(nearestRecord.cloud) || 30;

        // Calculate rain probability based on precipitation and conditions
        let rainProbability = 0;
        if (precipMm > 0) {
            rainProbability = Math.min(0.9, 0.3 + (precipMm / 10));
        } else {
            // Use cloud cover and humidity to estimate rain probability
            rainProbability = Math.min(0.8, (cloudCover / 100) * 0.4 + (humidity / 100) * 0.3);
        }

        return {
            rainProbability,
            avgTemp: temp,
            humidity,
            pressure,
            windSpeed: windSpeed / 3.6, // Convert kph to m/s
            cloudCover,
            condition: nearestRecord.condition_text || 'Unknown',
            location: nearestRecord.location_name || 'Unknown'
        };
    }

    getLocationData(lat, lon) {
        return this.findNearestLocation(lat, lon, null);
    }
}

const weatherDataLoader = new WeatherDataLoader();

module.exports = { weatherDataLoader };