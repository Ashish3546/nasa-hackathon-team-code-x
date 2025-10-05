const axios = require('axios');

// Google Maps Geocoding API
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';

// Cache for geocoding results
const geocodeCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function geocodeWithPostOffice(pincode) {
    const cacheKey = `postoffice_${pincode}`;
    const cached = geocodeCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }

    try {
        const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = response.data;
        
        if (data && data.length > 0 && data[0].Status === 'Success') {
            const postOffice = data[0].PostOffice[0];
            
            // Use approximate coordinates for Indian locations
            const stateCoords = {
                'Maharashtra': { lat: 19.7515, lon: 75.7139 },
                'Delhi': { lat: 28.7041, lon: 77.1025 },
                'Karnataka': { lat: 15.3173, lon: 75.7139 },
                'Tamil Nadu': { lat: 11.1271, lon: 78.6569 },
                'Gujarat': { lat: 22.2587, lon: 71.1924 },
                'Rajasthan': { lat: 27.0238, lon: 74.2179 },
                'Uttar Pradesh': { lat: 26.8467, lon: 80.9462 },
                'West Bengal': { lat: 22.9868, lon: 87.8550 },
                'Madhya Pradesh': { lat: 22.9734, lon: 78.6569 },
                'Bihar': { lat: 25.0961, lon: 85.3131 }
            };
            
            const coords = stateCoords[postOffice.State] || { lat: 20.5937, lon: 78.9629 };
            
            const geocodeResult = {
                lat: coords.lat,
                lon: coords.lon,
                name: `${postOffice.Name}, ${postOffice.District}, ${postOffice.State}`,
                details: {
                    city: postOffice.Name,
                    district: postOffice.District,
                    state: postOffice.State,
                    country: 'India',
                    postal_code: pincode,
                    division: postOffice.Division,
                    region: postOffice.Region
                }
            };

            geocodeCache.set(cacheKey, {
                data: geocodeResult,
                timestamp: Date.now()
            });

            return geocodeResult;
        } else {
            throw new Error('Invalid pincode');
        }
    } catch (error) {
        console.error('Post Office API error:', error.message);
        throw error;
    }
}

async function geocodeWithGoogle(address) {
    const cacheKey = address.toLowerCase();
    const cached = geocodeCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }

    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: address,
                key: GOOGLE_MAPS_API_KEY
            }
        });

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const result = response.data.results[0];
            const location = result.geometry.location;
            
            const geocodeResult = {
                lat: location.lat,
                lon: location.lng,
                name: result.formatted_address,
                details: {
                    formatted_address: result.formatted_address,
                    place_id: result.place_id
                }
            };

            geocodeCache.set(cacheKey, {
                data: geocodeResult,
                timestamp: Date.now()
            });

            return geocodeResult;
        } else {
            throw new Error(`Google Maps API error: ${response.data.status}`);
        }
    } catch (error) {
        console.error('Google Maps geocoding error:', error.message);
        throw error;
    }
}

async function geocodeWithOpenWeather(query, isPostalCode = false, country = '') {
    const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
    
    try {
        let url;
        if (isPostalCode && country) {
            url = `https://api.openweathermap.org/geo/1.0/zip?zip=${encodeURIComponent(query)},${encodeURIComponent(country.toUpperCase())}&appid=${OPENWEATHER_API_KEY}`;
        } else {
            url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${OPENWEATHER_API_KEY}`;
        }

        const response = await axios.get(url);
        const data = response.data;

        if (isPostalCode && data.lat && data.lon) {
            return {
                lat: data.lat,
                lon: data.lon,
                name: `${data.name || query}, ${data.country || country.toUpperCase()}`
            };
        } else if (!isPostalCode && data.length > 0) {
            const result = data[0];
            return {
                lat: result.lat,
                lon: result.lon,
                name: `${result.name}${result.state ? ', ' + result.state : ''}, ${result.country}`
            };
        }

        throw new Error('No results found');
    } catch (error) {
        console.error('OpenWeather geocoding error:', error.message);
        throw error;
    }
}

const geocodeLocation = async (req, res) => {
    try {
        const { address, postal_code, country, location_name } = req.query;
        console.log('\n=== Geocoding Request ===');
        console.log('Query params:', { address, postal_code, country, location_name });
        console.log('Full URL:', req.url);

        if (!address && !postal_code && !location_name) {
            return res.status(400).json({
                error: 'Please provide address, postal_code, or location_name parameter'
            });
        }

        let result;

        // Try Post Office API for Indian pincodes first
        if (postal_code) {
            // Check if it's an Indian pincode (6 digits)
            if (/^\d{6}$/.test(postal_code) && (!country || country.toUpperCase() === 'IN')) {
                try {
                    result = await geocodeWithPostOffice(postal_code);
                } catch (error) {
                    console.log('Post Office API failed, trying Google Maps');
                    const query = country ? `${postal_code}, ${country}` : postal_code;
                    try {
                        result = await geocodeWithGoogle(query);
                    } catch (error2) {
                        console.log('Google Maps failed, trying OpenWeather');
                        result = await geocodeWithOpenWeather(postal_code, true, country || 'IN');
                    }
                }
            } else {
                // Non-Indian postal codes - use Google Maps
                const query = country ? `${postal_code}, ${country}` : postal_code;
                try {
                    result = await geocodeWithGoogle(query);
                } catch (error) {
                    console.log('Google Maps failed, trying OpenWeather for postal code');
                    result = await geocodeWithOpenWeather(postal_code, true, country);
                }
            }
        }
        // Try Google Maps for general addresses
        else if (address || location_name) {
            const query = address || location_name;
            try {
                result = await geocodeWithGoogle(query);
            } catch (error) {
                console.log('Google Maps failed, trying OpenWeather for location');
                result = await geocodeWithOpenWeather(query, false);
            }
        }

        console.log('✅ Geocoding successful:', result);
        res.json({
            success: true,
            location: result
        });

    } catch (error) {
        console.error('Geocoding error:', error);
        res.status(500).json({
            error: 'Failed to geocode location',
            message: error.message
        });
    }
};

module.exports = {
    geocodeLocation
};