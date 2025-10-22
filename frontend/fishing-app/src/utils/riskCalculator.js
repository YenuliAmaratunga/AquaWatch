// Risk Calculation Utility Functions
// AI Safety & Risk Analysis Component

/**
 * Calculate overall risk score based on multiple factors
 * Returns a score from 0-100 (0 = safest, 100 = most dangerous)
 */
export const calculateOverallRisk = (factors) => {
  const {
    boatAge = 0,
    fuelAmount = 0,
    fuelEfficiency = 0,
    crewCount = 0,
    lifeJacketsCount = 0,
    engineStatus = "Good",
    weatherRisk = 0,
    distanceKm = 0,
    pastViolations = 0,
  } = factors;

  let riskScore = 0;

  // Boat Age Risk (0-20 points)
  if (boatAge > 15) riskScore += 20;
  else if (boatAge > 10) riskScore += 15;
  else if (boatAge > 5) riskScore += 8;
  else riskScore += 3;

  // Fuel Adequacy Risk (0-15 points)
  const requiredFuel = (distanceKm / fuelEfficiency) * 1.2; // 20% buffer
  if (fuelAmount < requiredFuel * 0.7) riskScore += 15;
  else if (fuelAmount < requiredFuel) riskScore += 10;
  else if (fuelAmount < requiredFuel * 1.1) riskScore += 5;
  else riskScore += 0;

  // Life Jackets Risk (0-15 points)
  if (lifeJacketsCount < crewCount) riskScore += 15;
  else if (lifeJacketsCount === crewCount) riskScore += 3;
  else riskScore += 0;

  // Engine Status Risk (0-20 points)
  if (engineStatus === "Critical") riskScore += 20;
  else if (engineStatus === "Needs Maintenance") riskScore += 12;
  else riskScore += 2;

  // Weather Risk (0-25 points) - most critical factor
  riskScore += weatherRisk;

  // Past Violations Risk (0-10 points)
  riskScore += Math.min(pastViolations * 2, 10);

  return Math.min(Math.round(riskScore), 100);
};

/**
 * Calculate weather-based risk from weather data
 */
export const calculateWeatherRisk = (weatherData) => {
  if (!weatherData) return 12; // Default moderate risk if no data

  let weatherScore = 0;
  const { weather, marine } = weatherData;

  // Wind Speed Risk (0-10 points)
  const windSpeed = weather?.windSpeed || 0;
  if (windSpeed > 40) weatherScore += 10;
  else if (windSpeed > 30) weatherScore += 8;
  else if (windSpeed > 20) weatherScore += 5;
  else if (windSpeed > 15) weatherScore += 3;
  else weatherScore += 0;

  // Wave Height Risk (0-15 points)
  const waveHeight = marine?.current?.wave_height || 0;
  if (waveHeight > 3) weatherScore += 15;
  else if (waveHeight > 2) weatherScore += 10;
  else if (waveHeight > 1.5) weatherScore += 6;
  else if (waveHeight > 1) weatherScore += 3;
  else weatherScore += 0;

  return Math.min(weatherScore, 25);
};

/**
 * Get risk level category
 */
export const getRiskLevel = (score) => {
  if (score >= 70) return { level: "CRITICAL", color: "#EF4444", emoji: "🔴" };
  if (score >= 50) return { level: "HIGH", color: "#F59E0B", emoji: "🟠" };
  if (score >= 30) return { level: "MODERATE", color: "#FBBF24", emoji: "🟡" };
  return { level: "LOW", color: "#10B981", emoji: "🟢" };
};

/**
 * Get trip recommendation based on risk score
 */
export const getTripRecommendation = (score) => {
  if (score >= 70) {
    return {
      decision: "DENIED",
      color: "#EF4444",
      icon: "close-circle",
      message: "Trip is too dangerous. Please address critical issues before departure.",
    };
  }
  if (score >= 50) {
    return {
      decision: "CAUTION",
      color: "#F59E0B",
      icon: "alert-circle",
      message: "Proceed with extreme caution. Monitor conditions closely.",
    };
  }
  if (score >= 30) {
    return {
      decision: "APPROVED",
      color: "#FBBF24",
      icon: "checkmark-circle",
      message: "Approved with conditions. Stay alert to changing conditions.",
    };
  }
  return {
    decision: "APPROVED",
    color: "#10B981",
    icon: "checkmark-circle",
    message: "Safe conditions. Trip approved. Have a safe journey!",
  };
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Get detailed breakdown of risk factors
 */
export const getRiskBreakdown = (factors) => {
  const {
    boatAge = 0,
    fuelAmount = 0,
    fuelEfficiency = 0,
    crewCount = 0,
    lifeJacketsCount = 0,
    engineStatus = "Good",
    weatherRisk = 0,
    distanceKm = 0,
    pastViolations = 0,
  } = factors;

  const breakdown = [];

  // Boat Age
  if (boatAge > 15) {
    breakdown.push({
      factor: "Boat Age",
      value: `${boatAge} years`,
      status: "critical",
      icon: "boat",
      message: "Boat exceeds maximum safe age (15 years)",
    });
  } else if (boatAge > 10) {
    breakdown.push({
      factor: "Boat Age",
      value: `${boatAge} years`,
      status: "warning",
      icon: "boat",
      message: "Boat is aging, regular maintenance required",
    });
  } else {
    breakdown.push({
      factor: "Boat Age",
      value: `${boatAge} years`,
      status: "safe",
      icon: "boat",
      message: "Boat age is within safe limits",
    });
  }

  // Fuel Status
  const requiredFuel = (distanceKm / fuelEfficiency) * 1.2;
  if (fuelAmount < requiredFuel * 0.7) {
    breakdown.push({
      factor: "Fuel Supply",
      value: `${fuelAmount}L / ${requiredFuel.toFixed(0)}L needed`,
      status: "critical",
      icon: "water",
      message: "Insufficient fuel for journey",
    });
  } else if (fuelAmount < requiredFuel) {
    breakdown.push({
      factor: "Fuel Supply",
      value: `${fuelAmount}L / ${requiredFuel.toFixed(0)}L needed`,
      status: "warning",
      icon: "water",
      message: "Fuel is below recommended level",
    });
  } else {
    breakdown.push({
      factor: "Fuel Supply",
      value: `${fuelAmount}L`,
      status: "safe",
      icon: "water",
      message: "Sufficient fuel for journey",
    });
  }

  // Life Jackets
  if (lifeJacketsCount < crewCount) {
    breakdown.push({
      factor: "Life Jackets",
      value: `${lifeJacketsCount}/${crewCount}`,
      status: "critical",
      icon: "shield-checkmark",
      message: "Not enough life jackets for all crew",
    });
  } else {
    breakdown.push({
      factor: "Life Jackets",
      value: `${lifeJacketsCount}/${crewCount}`,
      status: "safe",
      icon: "shield-checkmark",
      message: "Life jackets available for all crew",
    });
  }

  // Engine Status
  if (engineStatus === "Critical") {
    breakdown.push({
      factor: "Engine Status",
      value: engineStatus,
      status: "critical",
      icon: "construct",
      message: "Engine in critical condition",
    });
  } else if (engineStatus === "Needs Maintenance") {
    breakdown.push({
      factor: "Engine Status",
      value: engineStatus,
      status: "warning",
      icon: "construct",
      message: "Engine maintenance required soon",
    });
  } else {
    breakdown.push({
      factor: "Engine Status",
      value: engineStatus,
      status: "safe",
      icon: "construct",
      message: "Engine in good condition",
    });
  }

  // Weather
  if (weatherRisk > 18) {
    breakdown.push({
      factor: "Weather Conditions",
      value: "Dangerous",
      status: "critical",
      icon: "thunderstorm",
      message: "Severe weather conditions detected",
    });
  } else if (weatherRisk > 10) {
    breakdown.push({
      factor: "Weather Conditions",
      value: "Moderate",
      status: "warning",
      icon: "partly-sunny",
      message: "Weather conditions need monitoring",
    });
  } else {
    breakdown.push({
      factor: "Weather Conditions",
      value: "Good",
      status: "safe",
      icon: "sunny",
      message: "Weather conditions are favorable",
    });
  }

  // Past Violations
  if (pastViolations > 0) {
    breakdown.push({
      factor: "Past Violations",
      value: `${pastViolations} recorded`,
      status: "warning",
      icon: "warning",
      message: "Previous safety violations on record",
    });
  }

  return breakdown;
};

/**
 * Generate safety recommendations
 */
export const generateSafetyRecommendations = (riskBreakdown) => {
  const recommendations = [];

  riskBreakdown.forEach((item) => {
    if (item.status === "critical") {
      recommendations.push({
        priority: "HIGH",
        action: `⚠️ ${item.factor}: ${item.message}`,
      });
    } else if (item.status === "warning") {
      recommendations.push({
        priority: "MEDIUM",
        action: `⚡ ${item.factor}: ${item.message}`,
      });
    }
  });

  // Add general recommendations
  recommendations.push({
    priority: "INFO",
    action: "📍 Always inform marine police of your route before departure",
  });
  recommendations.push({
    priority: "INFO",
    action: "📱 Keep emergency contact numbers readily available",
  });

  return recommendations;
};

