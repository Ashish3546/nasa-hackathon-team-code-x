const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const { generateAdvancedRecommendations } = require('../utils/sectorIntelligence');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fallback function using direct API call
async function callGeminiDirect(prompt) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Direct Gemini API error:', error.response?.data || error.message);
    throw error;
  }
}

const SECTOR_PROMPTS = {
  agriculture: "As an expert agricultural advisor with 20+ years experience, analyze the weather conditions and provide 4 specific, actionable recommendations for farmers. Consider crop stages, soil conditions, equipment operations, and seasonal factors. Focus on: crop protection strategies, irrigation optimization, harvesting timing, field operations, pest management, and yield protection.",
  logistics: "As a senior logistics operations manager, provide 4 detailed recommendations for transportation and supply chain operations. Consider route safety, cargo protection, delivery scheduling, driver safety, fuel efficiency, and customer service. Address: route optimization, vehicle safety, cargo handling, delivery timing, and contingency planning.",
  construction: "As a certified construction project manager, analyze weather impact and provide 4 comprehensive recommendations for construction activities. Consider worker safety, material protection, equipment operation, project timeline, and quality control. Focus on: safety protocols, material handling, work scheduling, equipment protection, and project continuity.",
  energy: "As an energy sector operations expert, provide 4 strategic recommendations for energy production and distribution. Consider renewable energy output, grid stability, demand forecasting, equipment protection, and emergency preparedness. Address: solar/wind generation, grid management, demand planning, infrastructure protection, and system reliability.",
  disaster: "As an emergency management director, provide 4 critical recommendations for disaster preparedness and response operations. Consider risk assessment, resource allocation, public safety, communication protocols, and emergency response. Focus on: threat assessment, resource deployment, public warnings, evacuation planning, and inter-agency coordination.",
  tourism: "As a tourism industry consultant, provide 4 practical recommendations for tourism businesses and visitor management. Consider guest safety, activity planning, facility operations, customer satisfaction, and revenue protection. Address: activity modifications, guest communication, safety protocols, indoor alternatives, and service continuity.",
  industrial: "As an industrial operations director, provide 4 operational recommendations for manufacturing and industrial facilities. Consider production continuity, worker safety, equipment protection, supply chain impact, and quality control. Focus on: production scheduling, facility protection, worker safety, supply chain management, and operational efficiency.",
  water: "As a water resource management expert, provide 4 strategic recommendations for water system operations. Consider reservoir management, flood control, water quality, infrastructure protection, and public safety. Address: water level management, flood prevention, quality monitoring, infrastructure protection, and emergency response."
};

// Weather-specific actionable recommendations
function getWeatherSpecificRecommendations(sector, weatherData) {
  const probability = weatherData.probability * 100;
  const rainLevel = probability > 70 ? 'heavy' : probability > 40 ? 'moderate' : probability > 10 ? 'light' : 'minimal';
  
  const recommendations = {
    agriculture: {
      minimal: {
        canWork: true,
        workAdvice: "✅ Excellent farming conditions - proceed with all activities",
        actions: [
          { title: "Irrigation & Fertilization", description: "Perfect day for irrigation and fertilizer application. Soil will absorb nutrients effectively without waterlogging risk.", priority: "high", timeframe: "today" },
          { title: "Harvesting Operations", description: "Ideal conditions for harvesting mature crops. Equipment can operate efficiently on dry ground.", priority: "high", timeframe: "today" },
          { title: "Field Preparation", description: "Excellent for plowing, seeding, and field maintenance. Take advantage of optimal soil conditions.", priority: "medium", timeframe: "today" },
          { title: "Equipment Maintenance", description: "Use dry conditions for outdoor equipment servicing and repairs.", priority: "low", timeframe: "this_week" }
        ]
      },
      light: {
        canWork: true,
        workAdvice: "⚠️ Good conditions with minor precautions - continue most activities",
        actions: [
          { title: "Complete Morning Tasks", description: "Finish irrigation and spraying early in the day before rain arrives. Light rain won't harm most crops.", priority: "high", timeframe: "immediate" },
          { title: "Protect Harvested Crops", description: "Cover any harvested crops stored outdoors. Light rain can damage dried grains and hay.", priority: "medium", timeframe: "immediate" },
          { title: "Beneficial for New Plantings", description: "Light rain is actually beneficial for recently planted seeds and young crops.", priority: "low", timeframe: "today" },
          { title: "Monitor Soil Conditions", description: "Check soil moisture after rain to adjust irrigation schedules accordingly.", priority: "medium", timeframe: "today" }
        ]
      },
      moderate: {
        canWork: false,
        workAdvice: "❌ Postpone outdoor activities - focus on indoor tasks",
        actions: [
          { title: "Halt Outdoor Operations", description: "Stop all irrigation, spraying, and harvesting activities. Moderate rain will interfere with equipment operation.", priority: "high", timeframe: "immediate" },
          { title: "Equipment Maintenance", description: "Use this time for indoor equipment maintenance, planning, and record keeping.", priority: "medium", timeframe: "today" },
          { title: "Livestock Care", description: "Ensure livestock have adequate shelter and dry feeding areas.", priority: "high", timeframe: "immediate" },
          { title: "Drainage Check", description: "Monitor field drainage systems to prevent waterlogging in low-lying areas.", priority: "medium", timeframe: "today" }
        ]
      },
      heavy: {
        canWork: false,
        workAdvice: "🛡️ Stay indoors - protect assets and wait for clearing",
        actions: [
          { title: "Complete Work Stoppage", description: "Halt all outdoor farming activities. Heavy rain poses safety risks and equipment damage.", priority: "high", timeframe: "immediate" },
          { title: "Secure Livestock & Equipment", description: "Ensure all animals are in secure shelters and equipment is protected from flooding.", priority: "high", timeframe: "immediate" },
          { title: "Monitor Weather Updates", description: "Stay informed about weather progression and plan resumption of activities.", priority: "medium", timeframe: "today" },
          { title: "Emergency Preparedness", description: "Check emergency supplies and communication systems in case of severe weather.", priority: "high", timeframe: "immediate" }
        ]
      }
    },
    construction: {
      minimal: {
        canWork: true,
        workAdvice: "✅ Perfect construction weather - proceed with all activities",
        actions: [
          { title: "Concrete & Masonry Work", description: "Excellent conditions for concrete pouring, curing, and masonry work. Optimal temperature and humidity for material setting.", priority: "high", timeframe: "today" },
          { title: "Exterior Finishing", description: "Ideal for painting, roofing, and exterior finishing work. Materials will cure properly without weather interference.", priority: "high", timeframe: "today" },
          { title: "Material Deliveries", description: "Schedule deliveries of weather-sensitive materials. No risk of damage during transport or storage.", priority: "medium", timeframe: "today" },
          { title: "Site Preparation", description: "Perfect for excavation, grading, and site preparation activities.", priority: "medium", timeframe: "today" }
        ]
      },
      light: {
        canWork: true,
        workAdvice: "⚠️ Proceed with caution - prioritize covered work",
        actions: [
          { title: "Indoor Construction Focus", description: "Continue interior work, electrical, plumbing, and HVAC installation. Light rain won't affect indoor activities.", priority: "high", timeframe: "today" },
          { title: "Cover Materials", description: "Protect cement, drywall, and other moisture-sensitive materials with tarps or move to covered areas.", priority: "high", timeframe: "immediate" },
          { title: "Complete Urgent Exterior Tasks", description: "Finish any critical exterior work early in the day before rain intensifies.", priority: "medium", timeframe: "immediate" },
          { title: "Safety Precautions", description: "Increase slip hazard awareness and ensure proper footwear for workers.", priority: "medium", timeframe: "immediate" }
        ]
      },
      moderate: {
        canWork: false,
        workAdvice: "❌ Suspend outdoor construction - safety first",
        actions: [
          { title: "Stop Outdoor Work", description: "Halt concrete pouring, roofing, and exterior work. Moderate rain creates unsafe working conditions.", priority: "high", timeframe: "immediate" },
          { title: "Focus on Interior Tasks", description: "Continue indoor finishing, planning, and administrative work. Use downtime productively.", priority: "medium", timeframe: "today" },
          { title: "Equipment Protection", description: "Cover or secure all outdoor equipment and materials to prevent damage.", priority: "high", timeframe: "immediate" },
          { title: "Safety Training", description: "Conduct indoor safety training sessions and equipment maintenance.", priority: "low", timeframe: "today" }
        ]
      },
      heavy: {
        canWork: false,
        workAdvice: "🛡️ Construction site shutdown - secure everything",
        actions: [
          { title: "Complete Site Shutdown", description: "Stop all construction activities. Heavy rain poses serious safety risks and equipment damage.", priority: "high", timeframe: "immediate" },
          { title: "Secure Structures", description: "Secure scaffolding, temporary structures, and loose materials that could become hazardous.", priority: "high", timeframe: "immediate" },
          { title: "Project Planning", description: "Use downtime for project planning, permit applications, and administrative tasks.", priority: "medium", timeframe: "today" },
          { title: "Emergency Protocols", description: "Review emergency procedures and ensure communication systems are functional.", priority: "high", timeframe: "immediate" }
        ]
      }
    },
    logistics: {
      minimal: {
        canWork: true,
        workAdvice: "✅ Optimal transportation conditions - full operations",
        actions: [
          { title: "Maximize Deliveries", description: "Perfect visibility and road conditions for all delivery routes. Schedule time-sensitive shipments.", priority: "high", timeframe: "today" },
          { title: "Outdoor Loading Operations", description: "Ideal conditions for outdoor loading, unloading, and cargo handling activities.", priority: "medium", timeframe: "today" },
          { title: "Route Optimization", description: "Take advantage of clear conditions to optimize routes and reduce delivery times.", priority: "medium", timeframe: "today" },
          { title: "Vehicle Maintenance", description: "Schedule outdoor vehicle maintenance and inspections during favorable weather.", priority: "low", timeframe: "this_week" }
        ]
      },
      light: {
        canWork: true,
        workAdvice: "⚠️ Normal operations with increased awareness",
        actions: [
          { title: "Continue Regular Schedule", description: "Maintain normal delivery schedules with increased following distance and reduced speeds.", priority: "medium", timeframe: "today" },
          { title: "Cargo Protection", description: "Use covered loading areas when possible and ensure weather-sensitive cargo is properly protected.", priority: "high", timeframe: "immediate" },
          { title: "Driver Safety Briefing", description: "Brief drivers on wet weather driving techniques and route conditions.", priority: "medium", timeframe: "immediate" },
          { title: "Monitor Rural Routes", description: "Pay extra attention to rural and unpaved routes that may become slippery.", priority: "medium", timeframe: "today" }
        ]
      },
      moderate: {
        canWork: true,
        workAdvice: "⚠️ Enhanced safety protocols - proceed with caution",
        actions: [
          { title: "Implement Safety Protocols", description: "Activate enhanced safety measures: reduced speeds, increased following distance, and frequent check-ins.", priority: "high", timeframe: "immediate" },
          { title: "Allow Extra Time", description: "Build additional time into delivery schedules to account for slower travel and potential delays.", priority: "high", timeframe: "today" },
          { title: "Avoid Secondary Roads", description: "Stick to main highways when possible. Avoid unpaved or poorly maintained secondary roads.", priority: "medium", timeframe: "today" },
          { title: "Consider Rescheduling", description: "Evaluate non-urgent deliveries for potential rescheduling to safer weather windows.", priority: "medium", timeframe: "today" }
        ]
      },
      heavy: {
        canWork: false,
        workAdvice: "❌ Minimize travel - safety is priority",
        actions: [
          { title: "Emergency Deliveries Only", description: "Limit operations to critical and emergency deliveries only. Heavy rain creates dangerous driving conditions.", priority: "high", timeframe: "immediate" },
          { title: "Secure Outdoor Assets", description: "Protect outdoor inventory, equipment, and vehicles from potential flooding or damage.", priority: "high", timeframe: "immediate" },
          { title: "Communication Protocol", description: "Maintain regular communication with drivers and monitor their safety status.", priority: "high", timeframe: "immediate" },
          { title: "Route Planning", description: "Use downtime for route optimization and vehicle maintenance planning.", priority: "low", timeframe: "today" }
        ]
      }
    },
    energy: {
      minimal: {
        canWork: true,
        workAdvice: "✅ Optimal conditions for energy operations",
        actions: [
          { title: "Solar Panel Maintenance", description: "Perfect conditions for solar panel cleaning and maintenance. Maximum efficiency expected.", priority: "medium", timeframe: "today" },
          { title: "Wind Turbine Operations", description: "Monitor wind patterns for optimal turbine performance and scheduling maintenance.", priority: "medium", timeframe: "today" },
          { title: "Grid Optimization", description: "Ideal conditions for grid maintenance and infrastructure upgrades.", priority: "low", timeframe: "this_week" },
          { title: "Demand Planning", description: "Adjust energy production forecasts based on clear weather conditions.", priority: "medium", timeframe: "today" }
        ]
      },
      light: {
        canWork: true,
        workAdvice: "⚠️ Monitor renewable energy output",
        actions: [
          { title: "Solar Output Monitoring", description: "Expect reduced solar panel efficiency due to cloud cover. Adjust grid supply accordingly.", priority: "high", timeframe: "immediate" },
          { title: "Equipment Protection", description: "Ensure outdoor electrical equipment has adequate weather protection.", priority: "medium", timeframe: "immediate" },
          { title: "Maintenance Scheduling", description: "Complete urgent outdoor maintenance before conditions worsen.", priority: "medium", timeframe: "immediate" },
          { title: "Backup Systems", description: "Verify backup power systems are operational in case of weather-related outages.", priority: "medium", timeframe: "today" }
        ]
      },
      moderate: {
        canWork: true,
        workAdvice: "⚠️ Enhanced monitoring required",
        actions: [
          { title: "Grid Stability Monitoring", description: "Increase monitoring of power lines and substations for weather-related issues.", priority: "high", timeframe: "immediate" },
          { title: "Renewable Energy Adjustment", description: "Significantly reduced solar output expected. Increase conventional generation.", priority: "high", timeframe: "immediate" },
          { title: "Emergency Preparedness", description: "Prepare emergency response teams for potential power outages.", priority: "medium", timeframe: "today" },
          { title: "Customer Communication", description: "Inform customers about potential service disruptions.", priority: "medium", timeframe: "today" }
        ]
      },
      heavy: {
        canWork: false,
        workAdvice: "🛡️ Emergency protocols activated",
        actions: [
          { title: "Emergency Response Mode", description: "Activate emergency response protocols. Heavy rain may cause power outages.", priority: "high", timeframe: "immediate" },
          { title: "Equipment Shutdown", description: "Safely shutdown non-essential outdoor equipment to prevent damage.", priority: "high", timeframe: "immediate" },
          { title: "Crew Safety", description: "Recall field crews and suspend outdoor maintenance activities.", priority: "high", timeframe: "immediate" },
          { title: "System Monitoring", description: "Maintain 24/7 monitoring of critical infrastructure from control centers.", priority: "high", timeframe: "immediate" }
        ]
      }
    },
    disaster: {
      minimal: {
        canWork: true,
        workAdvice: "✅ Good conditions for preparedness activities",
        actions: [
          { title: "Equipment Inspection", description: "Conduct routine inspection and maintenance of emergency equipment and vehicles.", priority: "medium", timeframe: "today" },
          { title: "Training Exercises", description: "Ideal conditions for outdoor emergency response training and drills.", priority: "low", timeframe: "this_week" },
          { title: "Supply Inventory", description: "Check and restock emergency supplies and relief materials.", priority: "medium", timeframe: "today" },
          { title: "Community Outreach", description: "Conduct community preparedness programs and safety education.", priority: "low", timeframe: "this_week" }
        ]
      },
      light: {
        canWork: true,
        workAdvice: "⚠️ Monitor conditions closely",
        actions: [
          { title: "Weather Monitoring", description: "Increase weather monitoring frequency and update forecasts regularly.", priority: "high", timeframe: "immediate" },
          { title: "Resource Positioning", description: "Begin positioning emergency resources in potentially affected areas.", priority: "medium", timeframe: "today" },
          { title: "Communication Check", description: "Test emergency communication systems and alert networks.", priority: "medium", timeframe: "immediate" },
          { title: "Public Awareness", description: "Issue weather awareness advisories to the public.", priority: "medium", timeframe: "immediate" }
        ]
      },
      moderate: {
        canWork: true,
        workAdvice: "⚠️ Elevated alert status",
        actions: [
          { title: "Alert Level Increase", description: "Raise alert level and activate additional emergency response personnel.", priority: "high", timeframe: "immediate" },
          { title: "Resource Deployment", description: "Deploy emergency resources to high-risk areas proactively.", priority: "high", timeframe: "immediate" },
          { title: "Evacuation Planning", description: "Review and prepare evacuation plans for flood-prone areas.", priority: "high", timeframe: "immediate" },
          { title: "Inter-agency Coordination", description: "Coordinate with other emergency services and government agencies.", priority: "medium", timeframe: "today" }
        ]
      },
      heavy: {
        canWork: true,
        workAdvice: "🛡️ Full emergency response mode",
        actions: [
          { title: "Emergency Declaration", description: "Consider declaring local emergency and activating all response protocols.", priority: "high", timeframe: "immediate" },
          { title: "Rescue Operations", description: "Deploy rescue teams and establish emergency shelters as needed.", priority: "high", timeframe: "immediate" },
          { title: "Public Warnings", description: "Issue urgent public warnings and evacuation orders for high-risk areas.", priority: "high", timeframe: "immediate" },
          { title: "Resource Coordination", description: "Coordinate all available emergency resources and mutual aid agreements.", priority: "high", timeframe: "immediate" }
        ]
      }
    },
    tourism: {
      minimal: {
        canWork: true,
        workAdvice: "✅ Perfect conditions for outdoor activities",
        actions: [
          { title: "Outdoor Event Promotion", description: "Promote outdoor activities, tours, and events. Excellent weather for visitor satisfaction.", priority: "medium", timeframe: "today" },
          { title: "Extended Operating Hours", description: "Consider extending outdoor attraction operating hours to maximize visitor experience.", priority: "low", timeframe: "today" },
          { title: "Photography Services", description: "Ideal conditions for outdoor photography sessions and scenic tours.", priority: "low", timeframe: "today" },
          { title: "Equipment Maintenance", description: "Perfect time for outdoor equipment maintenance and facility upgrades.", priority: "medium", timeframe: "today" }
        ]
      },
      light: {
        canWork: true,
        workAdvice: "⚠️ Prepare backup indoor activities",
        actions: [
          { title: "Indoor Alternatives", description: "Prepare indoor activity options for guests in case rain increases.", priority: "medium", timeframe: "immediate" },
          { title: "Guest Communication", description: "Inform guests about weather conditions and provide appropriate gear recommendations.", priority: "high", timeframe: "immediate" },
          { title: "Event Contingency", description: "Have contingency plans ready for outdoor events and activities.", priority: "medium", timeframe: "immediate" },
          { title: "Safety Briefing", description: "Brief outdoor activity guides about wet weather safety protocols.", priority: "medium", timeframe: "immediate" }
        ]
      },
      moderate: {
        canWork: false,
        workAdvice: "❌ Cancel outdoor activities",
        actions: [
          { title: "Activity Cancellation", description: "Cancel or postpone outdoor tours, events, and activities for guest safety.", priority: "high", timeframe: "immediate" },
          { title: "Indoor Programming", description: "Activate indoor entertainment programs and activities for guests.", priority: "high", timeframe: "immediate" },
          { title: "Refund Policy", description: "Implement weather-related refund or rescheduling policies for affected bookings.", priority: "medium", timeframe: "today" },
          { title: "Facility Safety", description: "Ensure indoor facilities are safe and comfortable for increased occupancy.", priority: "medium", timeframe: "immediate" }
        ]
      },
      heavy: {
        canWork: false,
        workAdvice: "🛡️ Guest safety priority",
        actions: [
          { title: "Guest Safety Protocols", description: "Implement emergency guest safety protocols and restrict outdoor access.", priority: "high", timeframe: "immediate" },
          { title: "Transportation Safety", description: "Suspend or modify transportation services based on road conditions.", priority: "high", timeframe: "immediate" },
          { title: "Emergency Services", description: "Ensure emergency services are available and accessible to guests.", priority: "high", timeframe: "immediate" },
          { title: "Communication Updates", description: "Provide regular updates to guests about weather conditions and facility status.", priority: "medium", timeframe: "immediate" }
        ]
      }
    },
    industrial: {
      minimal: {
        canWork: true,
        workAdvice: "✅ Optimal conditions for all operations",
        actions: [
          { title: "Outdoor Production", description: "Excellent conditions for outdoor manufacturing processes and material handling.", priority: "high", timeframe: "today" },
          { title: "Equipment Maintenance", description: "Schedule outdoor equipment maintenance and facility repairs.", priority: "medium", timeframe: "today" },
          { title: "Material Storage", description: "Organize outdoor material storage and inventory management.", priority: "medium", timeframe: "today" },
          { title: "Supply Chain Optimization", description: "Optimize supply chain operations with reliable transportation conditions.", priority: "low", timeframe: "this_week" }
        ]
      },
      light: {
        canWork: true,
        workAdvice: "⚠️ Protect sensitive operations",
        actions: [
          { title: "Cover Sensitive Materials", description: "Protect moisture-sensitive materials and products from light rain exposure.", priority: "high", timeframe: "immediate" },
          { title: "Indoor Focus", description: "Prioritize indoor manufacturing processes and quality control activities.", priority: "medium", timeframe: "today" },
          { title: "Equipment Protection", description: "Ensure outdoor equipment has adequate weather protection.", priority: "medium", timeframe: "immediate" },
          { title: "Supply Chain Monitoring", description: "Monitor supply chain for potential weather-related delays.", priority: "medium", timeframe: "today" }
        ]
      },
      moderate: {
        canWork: true,
        workAdvice: "⚠️ Modify outdoor operations",
        actions: [
          { title: "Outdoor Operation Suspension", description: "Suspend weather-sensitive outdoor manufacturing processes.", priority: "high", timeframe: "immediate" },
          { title: "Indoor Production Focus", description: "Shift focus to indoor production lines and covered manufacturing areas.", priority: "high", timeframe: "immediate" },
          { title: "Material Protection", description: "Secure all outdoor materials and equipment from rain damage.", priority: "high", timeframe: "immediate" },
          { title: "Worker Safety", description: "Implement enhanced safety protocols for workers in wet conditions.", priority: "medium", timeframe: "immediate" }
        ]
      },
      heavy: {
        canWork: false,
        workAdvice: "🛡️ Protect facilities and equipment",
        actions: [
          { title: "Facility Protection", description: "Secure all outdoor facilities and equipment from potential flood damage.", priority: "high", timeframe: "immediate" },
          { title: "Production Adjustment", description: "Adjust production schedules to focus on indoor, weather-independent processes.", priority: "high", timeframe: "immediate" },
          { title: "Emergency Protocols", description: "Activate emergency protocols for facility protection and worker safety.", priority: "high", timeframe: "immediate" },
          { title: "Supply Chain Contingency", description: "Implement supply chain contingency plans for weather-related disruptions.", priority: "medium", timeframe: "today" }
        ]
      }
    },
    water: {
      minimal: {
        canWork: true,
        workAdvice: "✅ Good conditions for water management",
        actions: [
          { title: "Infrastructure Maintenance", description: "Ideal conditions for water infrastructure maintenance and repairs.", priority: "medium", timeframe: "today" },
          { title: "Conservation Measures", description: "Implement water conservation strategies during dry conditions.", priority: "medium", timeframe: "today" },
          { title: "System Optimization", description: "Optimize water distribution systems for efficiency.", priority: "low", timeframe: "this_week" },
          { title: "Quality Testing", description: "Conduct routine water quality testing and system inspections.", priority: "medium", timeframe: "today" }
        ]
      },
      light: {
        canWork: true,
        workAdvice: "⚠️ Monitor water levels",
        actions: [
          { title: "Reservoir Monitoring", description: "Monitor reservoir levels and adjust water release schedules accordingly.", priority: "high", timeframe: "immediate" },
          { title: "Drainage System Check", description: "Inspect drainage systems and storm water management infrastructure.", priority: "medium", timeframe: "today" },
          { title: "Supply Adjustment", description: "Adjust water supply distribution based on expected precipitation.", priority: "medium", timeframe: "today" },
          { title: "Flood Preparation", description: "Prepare flood control measures in low-lying areas.", priority: "medium", timeframe: "today" }
        ]
      },
      moderate: {
        canWork: true,
        workAdvice: "⚠️ Activate flood management",
        actions: [
          { title: "Flood Control Activation", description: "Activate flood control systems and monitor water levels closely.", priority: "high", timeframe: "immediate" },
          { title: "Reservoir Management", description: "Adjust reservoir operations to accommodate increased water inflow.", priority: "high", timeframe: "immediate" },
          { title: "Emergency Preparedness", description: "Prepare emergency response teams for potential flooding scenarios.", priority: "medium", timeframe: "today" },
          { title: "Public Communication", description: "Issue water level advisories and flood warnings to affected communities.", priority: "medium", timeframe: "immediate" }
        ]
      },
      heavy: {
        canWork: true,
        workAdvice: "🛡️ Emergency water management",
        actions: [
          { title: "Emergency Flood Response", description: "Implement emergency flood response protocols and dam safety measures.", priority: "high", timeframe: "immediate" },
          { title: "Critical Infrastructure Protection", description: "Protect critical water infrastructure from flood damage.", priority: "high", timeframe: "immediate" },
          { title: "Evacuation Coordination", description: "Coordinate with emergency services for potential evacuations in flood zones.", priority: "high", timeframe: "immediate" },
          { title: "Water Quality Monitoring", description: "Increase water quality monitoring due to potential contamination from flooding.", priority: "medium", timeframe: "immediate" }
        ]
      }
    }
  };

  const sectorRecs = recommendations[sector]?.[rainLevel];
  if (!sectorRecs) {
    return {
      canWork: rainLevel === 'minimal' || rainLevel === 'light',
      workAdvice: "Monitor weather conditions and adjust activities accordingly",
      actions: [{ title: "Weather Monitoring", description: "Stay updated on weather conditions", priority: "medium", timeframe: "today" }]
    };
  }

  return sectorRecs;
}

async function generateRecommendations(req, res) {
  try {
    const { sector, location, date, weatherData } = req.body;

    if (!sector || !location || !date || !weatherData) {
      return res.status(400).json({
        error: 'Missing required parameters: sector, location, date, weatherData'
      });
    }

    if (!SECTOR_PROMPTS[sector]) {
      return res.status(400).json({
        error: 'Invalid sector. Must be one of: ' + Object.keys(SECTOR_PROMPTS).join(', ')
      });
    }

    // Try AI first, fallback to mock data
    try {
      const weatherContext = `
Weather Analysis for ${location} on ${date}:
- Rain Prediction: ${weatherData.verdict} with ${Math.round(weatherData.probability * 100)}% probability
- Confidence Level: ${weatherData.confidence}
- Temperature: ${weatherData.details?.daily?.temp || weatherData.details?.temperature || 'N/A'}°C
- Humidity: ${weatherData.details?.daily?.humidity || 'N/A'}%
- Wind Speed: ${weatherData.details?.daily?.windSpeed || weatherData.details?.windSpeed || 'N/A'} m/s
- Weather Source: ${weatherData.source?.join(', ') || 'Weather API'}
${req.body.cropType ? `- Crop Type: ${req.body.cropType}` : ''}
${req.body.cargoType ? `- Cargo Type: ${req.body.cargoType}` : ''}
${req.body.workType ? `- Work Type: ${req.body.workType}` : ''}
`;

      const prompt = `${SECTOR_PROMPTS[sector]}

${weatherContext}

Based on this weather data, provide 4 specific, actionable recommendations. Return ONLY a JSON object in this exact format:
{
  "recommendations": [
    {
      "title": "Brief actionable title",
      "description": "Detailed practical recommendation with specific steps",
      "priority": "high",
      "timeframe": "immediate"
    }
  ]
}`;

      // Try direct API call first
      let text;
      try {
        text = await callGeminiDirect(prompt);
      } catch (directError) {
        // Fallback to SDK
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
      }

      // Clean up the response to extract JSON
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').replace(/```/g, '').trim();
      
      // Find JSON object in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const recommendations = JSON.parse(jsonMatch[0]);
      
      res.json({
        sector,
        location,
        date,
        recommendations: recommendations.recommendations || [],
        generatedAt: new Date().toISOString(),
        source: 'ai',
        weatherData: {
          verdict: weatherData.verdict,
          probability: weatherData.probability,
          confidence: weatherData.confidence
        }
      });
    } catch (aiError) {
      console.log('AI failed, using advanced sector intelligence:', aiError.message);
      
      // Use advanced sector intelligence system
      const advancedRecs = generateAdvancedRecommendations(sector, weatherData, location, {
        cropType: req.body.cropType,
        cargoType: req.body.cargoType,
        workType: req.body.workType,
        endDate: req.body.endDate
      });
      
      if (advancedRecs.error) {
        // Fallback to original weather-specific recommendations
        const weatherRecs = getWeatherSpecificRecommendations(sector, weatherData);
        const probability = Math.round(weatherData.probability * 100);
        
        res.json({
          sector,
          location,
          date,
          workStatus: {
            canWork: weatherRecs.canWork,
            advice: weatherRecs.workAdvice,
            rainLevel: probability > 70 ? 'heavy' : probability > 40 ? 'moderate' : probability > 10 ? 'light' : 'minimal',
            probability: probability,
            weatherCondition: `${probability > 70 ? 'Heavy' : probability > 40 ? 'Moderate' : probability > 10 ? 'Light' : 'Minimal'} rain expected (${probability}% chance)`
          },
          recommendations: weatherRecs.actions,
          generatedAt: new Date().toISOString(),
          source: 'fallback_weather_specific',
          weatherData: {
            verdict: weatherData.verdict,
            probability: weatherData.probability,
            confidence: weatherData.confidence
          }
        });
      } else {
        // Use advanced recommendations
        res.json({
          sector,
          location,
          date,
          workStatus: advancedRecs.workStatus,
          recommendations: advancedRecs.recommendations,
          contextualFactors: advancedRecs.contextualFactors,
          generatedAt: new Date().toISOString(),
          source: 'advanced_sector_intelligence',
          weatherData: {
            verdict: weatherData.verdict,
            probability: weatherData.probability,
            confidence: weatherData.confidence,
            temperature: weatherData.details?.daily?.temp || weatherData.details?.temperature,
            humidity: weatherData.details?.daily?.humidity,
            windSpeed: weatherData.details?.daily?.windSpeed || weatherData.details?.windSpeed
          }
        });
      }
    }

  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({
      error: 'Failed to generate recommendations',
      details: error.message
    });
  }
}

module.exports = {
  generateRecommendations
};