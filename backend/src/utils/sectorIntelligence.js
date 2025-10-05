// Advanced Sector Intelligence Engine
// Provides context-aware recommendations based on weather, location, and sector-specific factors

const SECTOR_INTELLIGENCE = {
  agriculture: {
    riskFactors: {
      minimal: { equipment: 'low', crop: 'low', soil: 'optimal' },
      light: { equipment: 'low', crop: 'beneficial', soil: 'good' },
      moderate: { equipment: 'medium', crop: 'risk', soil: 'saturated' },
      heavy: { equipment: 'high', crop: 'damage', soil: 'flooded' }
    },
    seasonalFactors: {
      spring: { priority: 'planting', concern: 'soil_prep' },
      summer: { priority: 'irrigation', concern: 'heat_stress' },
      autumn: { priority: 'harvesting', concern: 'crop_drying' },
      winter: { priority: 'planning', concern: 'equipment_maintenance' }
    },
    criticalOperations: ['harvesting', 'spraying', 'planting', 'irrigation']
  },
  
  construction: {
    riskFactors: {
      minimal: { safety: 'low', materials: 'protected', schedule: 'on_track' },
      light: { safety: 'medium', materials: 'cover_needed', schedule: 'minor_delay' },
      moderate: { safety: 'high', materials: 'damage_risk', schedule: 'significant_delay' },
      heavy: { safety: 'critical', materials: 'high_damage', schedule: 'major_delay' }
    },
    criticalActivities: ['concrete_pouring', 'roofing', 'exterior_work', 'excavation'],
    safetyProtocols: {
      wet_conditions: ['slip_prevention', 'electrical_safety', 'equipment_inspection'],
      high_rain: ['work_suspension', 'site_securing', 'emergency_protocols']
    }
  },
  
  logistics: {
    riskFactors: {
      minimal: { visibility: 'excellent', roads: 'dry', delays: 'none' },
      light: { visibility: 'good', roads: 'wet', delays: 'minimal' },
      moderate: { visibility: 'reduced', roads: 'slippery', delays: 'moderate' },
      heavy: { visibility: 'poor', roads: 'dangerous', delays: 'severe' }
    },
    routeTypes: {
      highway: { rain_impact: 'low', safety_level: 'high' },
      urban: { rain_impact: 'medium', safety_level: 'medium' },
      rural: { rain_impact: 'high', safety_level: 'low' }
    },
    cargoSensitivity: {
      electronics: 'high_moisture_risk',
      food: 'temperature_humidity_sensitive',
      chemicals: 'safety_critical',
      general: 'standard_protection'
    }
  },
  
  energy: {
    renewableImpact: {
      minimal: { solar: 100, wind: 'variable', hydro: 'stable' },
      light: { solar: 70, wind: 'increased', hydro: 'stable' },
      moderate: { solar: 30, wind: 'high', hydro: 'increased' },
      heavy: { solar: 10, wind: 'extreme', hydro: 'flood_risk' }
    },
    gridStability: {
      minimal: 'stable',
      light: 'monitor',
      moderate: 'alert',
      heavy: 'emergency'
    }
  },
  
  disaster: {
    alertLevels: {
      minimal: { level: 'green', action: 'routine_monitoring' },
      light: { level: 'yellow', action: 'increased_awareness' },
      moderate: { level: 'orange', action: 'active_preparation' },
      heavy: { level: 'red', action: 'emergency_response' }
    },
    resourceDeployment: {
      minimal: 'standard_staffing',
      light: 'enhanced_monitoring',
      moderate: 'resource_positioning',
      heavy: 'full_deployment'
    }
  },
  
  tourism: {
    activityImpact: {
      minimal: { outdoor: 'excellent', indoor: 'normal', satisfaction: 'high' },
      light: { outdoor: 'good_with_gear', indoor: 'preferred', satisfaction: 'good' },
      moderate: { outdoor: 'cancelled', indoor: 'focus', satisfaction: 'managed' },
      heavy: { outdoor: 'unsafe', indoor: 'only_option', satisfaction: 'challenging' }
    },
    seasonalConsiderations: {
      peak_season: 'revenue_critical',
      off_season: 'maintenance_opportunity',
      shoulder_season: 'flexibility_available'
    }
  },
  
  industrial: {
    operationalImpact: {
      minimal: { outdoor_ops: 'full', indoor_ops: 'normal', efficiency: 100 },
      light: { outdoor_ops: 'protected', indoor_ops: 'normal', efficiency: 95 },
      moderate: { outdoor_ops: 'limited', indoor_ops: 'focus', efficiency: 80 },
      heavy: { outdoor_ops: 'suspended', indoor_ops: 'priority', efficiency: 60 }
    },
    materialSensitivity: {
      metals: 'rust_prevention',
      electronics: 'moisture_protection',
      chemicals: 'containment_critical',
      textiles: 'humidity_control'
    }
  },
  
  water: {
    systemImpact: {
      minimal: { supply: 'conservation_mode', demand: 'normal', quality: 'stable' },
      light: { supply: 'slight_increase', demand: 'normal', quality: 'monitor' },
      moderate: { supply: 'significant_increase', demand: 'reduced', quality: 'treatment_adjust' },
      heavy: { supply: 'flood_risk', demand: 'emergency', quality: 'contamination_risk' }
    },
    infrastructureRisk: {
      minimal: 'routine_maintenance',
      light: 'increased_monitoring',
      moderate: 'protective_measures',
      heavy: 'emergency_protocols'
    }
  }
};

function generateAdvancedRecommendations(sector, weatherData, location, additionalContext = {}) {
  const probability = weatherData.probability;
  const rainLevel = probability > 0.7 ? 'heavy' : probability > 0.4 ? 'moderate' : probability > 0.1 ? 'light' : 'minimal';
  
  // Extract weather parameters
  const temperature = weatherData.details?.daily?.temp || weatherData.details?.temperature || 25;
  const humidity = weatherData.details?.daily?.humidity || 60;
  const windSpeed = weatherData.details?.daily?.windSpeed || weatherData.details?.windSpeed || 5;
  const visibility = getVisibilityFromWeather(rainLevel, humidity);
  const precipitation = probability * 10; // Estimated mm based on probability
  
  const sectorData = SECTOR_INTELLIGENCE[sector];
  if (!sectorData) {
    return { error: 'Sector not supported' };
  }
  
  const recommendations = [];
  const currentSeason = getCurrentSeason();
  const timeOfDay = new Date().getHours();
  
  const weatherParams = {
    temperature,
    humidity,
    windSpeed,
    visibility,
    precipitation,
    rainLevel,
    probability
  };
  
  // Generate sector-specific recommendations
  switch (sector) {
    case 'agriculture':
      recommendations.push(...generateAgricultureRecommendations(sectorData, weatherParams, additionalContext));
      break;
    case 'construction':
      recommendations.push(...generateConstructionRecommendations(sectorData, weatherParams, additionalContext));
      break;
    case 'logistics':
      recommendations.push(...generateLogisticsRecommendations(sectorData, weatherParams, additionalContext));
      break;
    case 'energy':
      recommendations.push(...generateEnergyRecommendations(sectorData, weatherParams, additionalContext));
      break;
    case 'disaster':
      recommendations.push(...generateDisasterRecommendations(sectorData, weatherParams, additionalContext));
      break;
    case 'tourism':
      recommendations.push(...generateTourismRecommendations(sectorData, weatherParams, additionalContext));
      break;
    case 'industrial':
      recommendations.push(...generateIndustrialRecommendations(sectorData, weatherParams, additionalContext));
      break;
    case 'water':
      recommendations.push(...generateWaterRecommendations(sectorData, weatherParams, additionalContext));
      break;
  }
  
  return {
    workStatus: generateWorkStatus(sector, rainLevel, weatherData),
    recommendations: recommendations.slice(0, 4),
    contextualFactors: {
      season: currentSeason,
      timeOfDay: getTimeOfDayCategory(timeOfDay),
      rainLevel,
      location,
      weatherParams
    }
  };
}

function generateWorkStatus(sector, rainLevel, weatherData) {
  const canWorkMatrix = {
    agriculture: { minimal: true, light: true, moderate: false, heavy: false },
    construction: { minimal: true, light: true, moderate: false, heavy: false },
    logistics: { minimal: true, light: true, moderate: true, heavy: false },
    energy: { minimal: true, light: true, moderate: true, heavy: true },
    disaster: { minimal: true, light: true, moderate: true, heavy: true },
    tourism: { minimal: true, light: true, moderate: false, heavy: false },
    industrial: { minimal: true, light: true, moderate: true, heavy: false },
    water: { minimal: true, light: true, moderate: true, heavy: true }
  };
  
  const canWork = canWorkMatrix[sector]?.[rainLevel] ?? true;
  const probability = Math.round(weatherData.probability * 100);
  
  const adviceMatrix = {
    minimal: `✅ Excellent conditions for ${sector} operations`,
    light: `⚠️ Good conditions with minor precautions for ${sector}`,
    moderate: `❌ Challenging conditions - modify ${sector} operations`,
    heavy: `🛡️ Severe conditions - prioritize safety in ${sector}`
  };
  
  return {
    canWork,
    advice: adviceMatrix[rainLevel],
    weatherCondition: `${rainLevel.charAt(0).toUpperCase() + rainLevel.slice(1)} rain expected (${probability}% chance)`,
    rainLevel,
    probability
  };
}

function generateAgricultureRecommendations(sectorData, weatherParams, context) {
  const recommendations = [];
  const { precipitation, temperature, humidity, windSpeed, rainLevel } = weatherParams;
  
  // Precipitation-based recommendations (most critical for agriculture)
  if (precipitation < 2) {
    recommendations.push({
      title: "Irrigation & Spraying Operations",
      description: `Excellent conditions with ${precipitation.toFixed(1)}mm expected precipitation. Ideal for irrigation scheduling, pesticide/fertilizer application. Temperature ${temperature}°C and humidity ${humidity}% are optimal for chemical absorption.`,
      priority: "high",
      timeframe: "today",
      riskLevel: "low",
      expectedOutcome: "Maximum nutrient uptake and pest control effectiveness"
    });
  } else if (precipitation > 15) {
    recommendations.push({
      title: "Flood Protection Protocol",
      description: `Heavy precipitation expected (${precipitation.toFixed(1)}mm). Immediate drainage system activation required. Move livestock to higher ground, secure equipment, and protect stored grain from moisture damage.`,
      priority: "high",
      timeframe: "immediate",
      riskLevel: "high",
      expectedOutcome: "Prevent crop flooding and livestock safety"
    });
  }
  
  // Temperature-based recommendations
  if (temperature > 35) {
    recommendations.push({
      title: "Heat Stress Management",
      description: `High temperature (${temperature}°C) with ${humidity}% humidity. Increase irrigation frequency, provide livestock shade, and avoid midday field work. Monitor crops for heat stress symptoms.`,
      priority: "medium",
      timeframe: "today",
      riskLevel: "medium",
      expectedOutcome: "Prevent heat damage to crops and livestock"
    });
  }
  
  // Wind-based recommendations
  if (windSpeed > 15) {
    recommendations.push({
      title: "Wind Damage Prevention",
      description: `Strong winds (${windSpeed} m/s) expected. Postpone aerial spraying, secure greenhouse structures, and support tall crops. Risk of mechanical damage to plants and equipment.`,
      priority: "high",
      timeframe: "immediate",
      riskLevel: "high",
      expectedOutcome: "Prevent wind damage to crops and structures"
    });
  }
  
  return recommendations;
}

function generateConstructionRecommendations(sectorData, weatherParams, context) {
  const recommendations = [];
  const { precipitation, temperature, humidity, windSpeed, visibility, rainLevel } = weatherParams;
  
  // Wind speed critical for construction safety
  if (windSpeed > 15) {
    recommendations.push({
      title: "High Wind Safety Protocol",
      description: `🚨 DANGEROUS WINDS: ${windSpeed}m/s. STOP crane operations, secure scaffolding with additional ties, and halt roofing work. Workers must wear safety harnesses. Risk of falling objects and structural instability.`,
      priority: "high",
      timeframe: "immediate",
      riskLevel: "high",
      expectedOutcome: "Prevent wind-related accidents and structural damage"
    });
  }
  
  // Precipitation impact on concrete and materials
  if (precipitation > 5) {
    recommendations.push({
      title: "Concrete & Material Protection",
      description: `🌧️ RAIN ALERT: ${precipitation.toFixed(1)}mm expected. HALT concrete pours (minimum 24h cure time needed). Cover cement, drywall, and steel with waterproof tarps. Redirect work to interior finishing, electrical, and plumbing.`,
      priority: "high",
      timeframe: "immediate",
      riskLevel: "high",
      expectedOutcome: "Prevent material damage and maintain project quality"
    });
  }
  
  // Temperature effects on materials and workers
  if (temperature > 35) {
    recommendations.push({
      title: "Heat Safety & Material Management",
      description: `🌡️ HIGH TEMPERATURE: ${temperature}°C. Implement heat safety: frequent breaks, hydration stations, and avoid heavy work 11am-3pm. Concrete curing accelerated - adjust water ratios and use retarders.`,
      priority: "medium",
      timeframe: "today",
      riskLevel: "medium",
      expectedOutcome: "Worker safety and optimal concrete strength"
    });
  } else if (temperature < 5) {
    recommendations.push({
      title: "Cold Weather Construction Protocol",
      description: `❄️ COLD CONDITIONS: ${temperature}°C. Concrete requires heating and insulation. Use winter-grade materials, preheat tools, and provide heated break areas. Monitor for ice formation on surfaces.`,
      priority: "medium",
      timeframe: "today",
      riskLevel: "medium",
      expectedOutcome: "Maintain construction quality in cold conditions"
    });
  }
  
  // Visibility for equipment operation
  if (visibility < 5) {
    recommendations.push({
      title: "Equipment Operation Restriction",
      description: `🌫️ POOR VISIBILITY: ${visibility}km. SUSPEND heavy equipment operation, crane work, and material lifting. Use spotters for essential equipment movement and install additional lighting.`,
      priority: "high",
      timeframe: "immediate",
      riskLevel: "high",
      expectedOutcome: "Prevent equipment accidents and worker injuries"
    });
  }
  
  return recommendations;
}

function generateLogisticsRecommendations(sectorData, weatherParams, context) {
  const recommendations = [];
  const { precipitation, temperature, humidity, windSpeed, visibility, rainLevel } = weatherParams;
  
  // Visibility-critical recommendations (most important for logistics)
  if (visibility < 3) {
    recommendations.push({
      title: "Critical Visibility Alert",
      description: `🚨 DANGEROUS CONDITIONS: Visibility only ${visibility}km. SUSPEND non-emergency deliveries. If travel essential: use hazard lights, reduce speed to 40km/h, increase following distance to 6+ seconds, and maintain radio contact every 30 minutes.`,
      priority: "high",
      timeframe: "immediate",
      riskLevel: "high",
      expectedOutcome: "Prevent accidents and ensure driver safety"
    });
  } else if (visibility < 8) {
    recommendations.push({
      title: "Reduced Visibility Protocol",
      description: `⚠️ LIMITED VISIBILITY: ${visibility}km range. Reduce speeds by 25%, increase following distance, use headlights, and avoid overtaking. Brief drivers on fog/rain driving techniques.`,
      priority: "high",
      timeframe: "immediate",
      riskLevel: "medium",
      expectedOutcome: "Safe operations with controlled risk"
    });
  }
  
  // Wind speed impact on high-profile vehicles
  if (windSpeed > 25) {
    recommendations.push({
      title: "High-Profile Vehicle Restriction",
      description: `🌪️ STRONG WINDS: ${windSpeed}m/s. RESTRICT trucks, trailers, and empty vehicles on exposed routes. Use alternative routes through valleys/urban areas. Consider postponing deliveries of light cargo.`,
      priority: "high",
      timeframe: "immediate",
      riskLevel: "high",
      expectedOutcome: "Prevent vehicle overturning and cargo damage"
    });
  }
  
  // Temperature-based cargo protection
  if (temperature > 35 || temperature < -5) {
    recommendations.push({
      title: "Temperature-Sensitive Cargo Protocol",
      description: `🌡️ EXTREME TEMPERATURE: ${temperature}°C. ${temperature > 35 ? 'Activate cooling systems, avoid midday loading, and prioritize refrigerated goods' : 'Prevent freezing of liquids, use engine block heaters, and check tire pressure'}. Monitor cargo temperature continuously.`,
      priority: "medium",
      timeframe: "today",
      riskLevel: "medium",
      expectedOutcome: "Maintain cargo quality and vehicle reliability"
    });
  }
  
  // Precipitation-based route planning
  if (precipitation > 20) {
    recommendations.push({
      title: "Flood Route Avoidance",
      description: `🌊 HEAVY RAIN: ${precipitation.toFixed(1)}mm expected. Avoid low-lying areas, river crossings, and unpaved roads. Use highway routes only. Carry emergency supplies: food, water, blankets, and communication devices.`,
      priority: "high",
      timeframe: "immediate",
      riskLevel: "high",
      expectedOutcome: "Avoid flood-related delays and emergencies"
    });
  }
  
  return recommendations;
}

function generateEnergyRecommendations(sectorData, weatherParams, context) {
  const recommendations = [];
  const { precipitation, temperature, humidity, windSpeed, visibility, rainLevel } = weatherParams;
  
  // Solar generation impact (most affected by precipitation and visibility)
  const solarEfficiency = visibility > 10 ? 100 : visibility > 5 ? 60 : visibility > 2 ? 30 : 10;
  recommendations.push({
    title: "Solar Generation Forecast",
    description: `☀️ SOLAR OUTPUT: ${solarEfficiency}% efficiency expected (visibility: ${visibility}km, precipitation: ${precipitation.toFixed(1)}mm). ${solarEfficiency < 50 ? 'INCREASE conventional generation by ' + (100-solarEfficiency) + '% to compensate' : 'Normal grid operations expected'}.`,
    priority: solarEfficiency < 50 ? "high" : "medium",
    timeframe: "immediate",
    riskLevel: solarEfficiency < 30 ? "high" : "medium",
    expectedOutcome: "Maintain grid stability and power supply"
  });
  
  // Wind generation (optimal range 15-25 m/s)
  if (windSpeed > 25) {
    recommendations.push({
      title: "Wind Turbine Safety Shutdown",
      description: `💨 EXTREME WINDS: ${windSpeed}m/s exceeds safe operating limits. SHUTDOWN wind turbines to prevent damage. Activate backup conventional generation. Monitor for equipment damage after storm passes.`,
      priority: "high",
      timeframe: "immediate",
      riskLevel: "high",
      expectedOutcome: "Protect wind infrastructure and maintain power supply"
    });
  } else if (windSpeed > 15) {
    recommendations.push({
      title: "Optimal Wind Generation",
      description: `💨 EXCELLENT WIND: ${windSpeed}m/s in optimal range. Maximize wind generation capacity. Reduce conventional generation where possible to optimize renewable energy mix and reduce costs.`,
      priority: "medium",
      timeframe: "today",
      riskLevel: "low",
      expectedOutcome: "Maximize renewable energy utilization"
    });
  }
  
  // Grid infrastructure protection
  if (precipitation > 15 || windSpeed > 20) {
    recommendations.push({
      title: "Grid Infrastructure Alert",
      description: `⚡ INFRASTRUCTURE RISK: Heavy weather (${precipitation.toFixed(1)}mm rain, ${windSpeed}m/s wind). Deploy emergency crews, inspect power lines for damage, and prepare for potential outages. Activate customer communication protocols.`,
      priority: "high",
      timeframe: "immediate",
      riskLevel: "high",
      expectedOutcome: "Minimize power outages and restore service quickly"
    });
  }
  
  return recommendations;
}

function generateDisasterRecommendations(sectorData, rainLevel, weatherData, context) {
  const recommendations = [];
  const alertLevel = sectorData.alertLevels[rainLevel];
  
  recommendations.push({
    title: `Alert Level ${alertLevel.level.toUpperCase()}`,
    description: `Activate ${alertLevel.action} protocols. Deploy resources according to ${sectorData.resourceDeployment[rainLevel]} guidelines. Monitor vulnerable areas closely.`,
    priority: "high",
    timeframe: "immediate",
    riskLevel: rainLevel === 'heavy' ? "high" : "medium",
    expectedOutcome: "Effective emergency response and public safety"
  });
  
  return recommendations;
}

function generateTourismRecommendations(sectorData, weatherParams, context) {
  const recommendations = [];
  const { precipitation, temperature, humidity, windSpeed, visibility, rainLevel } = weatherParams;
  
  // Flight safety assessment (visibility and wind speed critical)
  if (visibility < 5 || windSpeed > 20) {
    recommendations.push({
      title: "Flight Safety Alert",
      description: `⚠️ FLIGHT RISK: Visibility ${visibility}km, wind speed ${windSpeed}m/s. Airlines may delay/cancel flights. Advise guests to check flight status, arrive early at airport, and have backup travel plans. Consider travel insurance.`,
      priority: "high",
      timeframe: "immediate",
      riskLevel: "high",
      expectedOutcome: "Prevent travel disruptions and guest inconvenience"
    });
  } else if (visibility > 10 && windSpeed < 10) {
    recommendations.push({
      title: "Ideal Travel Conditions",
      description: `✅ EXCELLENT FOR TRAVEL: Clear visibility (${visibility}km), calm winds (${windSpeed}m/s). Perfect for flights, sightseeing, and outdoor photography. Promote scenic tours and outdoor activities.`,
      priority: "medium",
      timeframe: "today",
      riskLevel: "low",
      expectedOutcome: "Enhanced guest experience and satisfaction"
    });
  }
  
  // Tour safety based on precipitation and temperature
  if (precipitation > 10) {
    recommendations.push({
      title: "Tour Modification Required",
      description: `❌ OUTDOOR TOURS UNSAFE: ${precipitation.toFixed(1)}mm rain expected. Cancel hiking, beach activities, and open-air tours. Activate indoor alternatives: museums, shopping, cultural centers. Provide rain gear for essential outdoor movement.`,
      priority: "high",
      timeframe: "immediate",
      riskLevel: "high",
      expectedOutcome: "Guest safety and alternative entertainment"
    });
  } else if (temperature > 40 || temperature < 0) {
    recommendations.push({
      title: "Extreme Temperature Protocol",
      description: `🌡️ EXTREME CONDITIONS: Temperature ${temperature}°C. ${temperature > 40 ? 'Heat stroke risk - provide cooling centers, frequent water breaks, and avoid midday activities' : 'Hypothermia risk - ensure warm clothing, heated transport, and indoor warming stations'}.`,
      priority: "high",
      timeframe: "immediate",
      riskLevel: "high",
      expectedOutcome: "Prevent temperature-related health issues"
    });
  }
  
  // Comfort-based recommendations
  if (humidity > 80 && temperature > 25) {
    recommendations.push({
      title: "Comfort Enhancement Measures",
      description: `High humidity (${humidity}%) and temperature (${temperature}°C) create discomfort. Provide air-conditioned rest areas, increase hydration stations, and schedule activities during cooler hours (early morning/evening).`,
      priority: "medium",
      timeframe: "today",
      riskLevel: "medium",
      expectedOutcome: "Improved guest comfort and experience"
    });
  }
  
  return recommendations;
}

function generateIndustrialRecommendations(sectorData, rainLevel, weatherData, context) {
  const recommendations = [];
  const operationalImpact = sectorData.operationalImpact[rainLevel];
  
  recommendations.push({
    title: "Production Optimization",
    description: `Outdoor operations: ${operationalImpact.outdoor_ops}. Expected efficiency: ${operationalImpact.efficiency}%. Focus on ${operationalImpact.indoor_ops} production lines.`,
    priority: "high",
    timeframe: "today",
    riskLevel: "medium",
    expectedOutcome: "Maintain production targets with safety"
  });
  
  return recommendations;
}

function generateWaterRecommendations(sectorData, weatherParams, context) {
  const recommendations = [];
  const { precipitation, temperature, humidity, windSpeed, visibility, rainLevel } = weatherParams;
  
  // Precipitation is critical for water management
  if (precipitation > 20) {
    recommendations.push({
      title: "Flood Management Activation",
      description: `🌊 HEAVY RAINFALL: ${precipitation.toFixed(1)}mm expected. ACTIVATE flood control systems, open spillways gradually, and monitor dam safety. Issue flood warnings to downstream communities. Deploy emergency response teams.`,
      priority: "high",
      timeframe: "immediate",
      riskLevel: "high",
      expectedOutcome: "Prevent flooding and ensure public safety"
    });
  } else if (precipitation > 10) {
    recommendations.push({
      title: "Reservoir Level Management",
      description: `💧 MODERATE RAINFALL: ${precipitation.toFixed(1)}mm will increase reservoir levels. Adjust water release schedules, monitor intake systems for debris, and prepare treatment plants for increased turbidity.`,
      priority: "medium",
      timeframe: "today",
      riskLevel: "medium",
      expectedOutcome: "Optimal water storage and quality maintenance"
    });
  } else if (precipitation < 1) {
    recommendations.push({
      title: "Drought Management Protocol",
      description: `🏜️ DRY CONDITIONS: Only ${precipitation.toFixed(1)}mm expected. Implement water conservation measures, reduce non-essential usage, and monitor reservoir levels closely. Consider drought restrictions if conditions persist.`,
      priority: "medium",
      timeframe: "this_week",
      riskLevel: "medium",
      expectedOutcome: "Conserve water resources for essential needs"
    });
  }
  
  // Temperature impact on water quality
  if (temperature > 30) {
    recommendations.push({
      title: "Water Quality Temperature Alert",
      description: `🌡️ HIGH TEMPERATURE: ${temperature}°C increases algae growth risk and reduces dissolved oxygen. Increase water treatment monitoring, adjust chlorination levels, and monitor for algal blooms in reservoirs.`,
      priority: "medium",
      timeframe: "today",
      riskLevel: "medium",
      expectedOutcome: "Maintain water quality standards"
    });
  }
  
  // Wind impact on water treatment
  if (windSpeed > 20) {
    recommendations.push({
      title: "Infrastructure Protection",
      description: `💨 STRONG WINDS: ${windSpeed}m/s may damage water treatment facilities and distribution systems. Secure outdoor equipment, inspect pipelines for damage, and prepare repair crews for potential breaks.`,
      priority: "high",
      timeframe: "immediate",
      riskLevel: "high",
      expectedOutcome: "Protect water infrastructure and maintain service"
    });
  }
  
  return recommendations;
}

function getCurrentSeason() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

function getVisibilityFromWeather(rainLevel, humidity) {
  // Estimate visibility based on rain level and humidity
  if (rainLevel === 'heavy') return 2;
  if (rainLevel === 'moderate') return 5;
  if (rainLevel === 'light' && humidity > 80) return 8;
  if (humidity > 90) return 6;
  return 15; // Clear conditions
}

function getTimeOfDayCategory(hour) {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

module.exports = {
  generateAdvancedRecommendations,
  SECTOR_INTELLIGENCE
};