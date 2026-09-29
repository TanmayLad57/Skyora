import { ActivitySuitability, ActivityType, ActivityFactor, WeatherData, HourlyForecast } from '../types';

export function evaluateSuitability(
  activity: ActivityType,
  weather: WeatherData,
  targetHour?: number
): ActivitySuitability {
  // If target hour is specified, inspect that hour's forecast, otherwise current weather
  const currentHour = targetHour !== undefined ? targetHour : 17; // default 17:30
  const hourData = weather.hourly.find((h) => h.hour === currentHour) || weather.hourly[17] || weather.hourly[0];

  const temp = hourData ? hourData.temp : weather.temp;
  const rainProb = hourData ? hourData.rainProb : weather.rainProb;
  const wind = hourData ? hourData.windSpeedKm : weather.windSpeedKm;
  const humidity = hourData ? hourData.humidity : weather.humidity;
  const uv = hourData ? hourData.uvIndex : weather.uvIndex;
  const visibility = hourData ? hourData.visibilityKm : weather.visibilityKm;
  const aqi = weather.aqi;

  const factors: ActivityFactor[] = [];
  let score = 85;

  switch (activity) {
    case 'Running':
    case 'Sports': {
      // Temperature
      if (temp >= 16 && temp <= 26) {
        factors.push({ name: 'Temperature', value: `${temp}°C`, status: 'optimal', explanation: 'Comfortable thermal zone for high cardio output.' });
      } else if (temp < 16) {
        factors.push({ name: 'Temperature', value: `${temp}°C`, status: 'caution', explanation: 'Brisk conditions; light windbreaker suggested.' });
        score -= 10;
      } else if (temp <= 31) {
        factors.push({ name: 'Temperature', value: `${temp}°C`, status: 'caution', explanation: 'Warm and humid; stay hydrated and pace yourself.' });
        score -= 15;
      } else {
        factors.push({ name: 'Temperature', value: `${temp}°C`, status: 'poor', explanation: 'High heat stress risk; avoid vigorous outdoor sprints.' });
        score -= 30;
      }

      // Rain
      if (rainProb < 20) {
        factors.push({ name: 'Precipitation', value: `${rainProb}% chance`, status: 'optimal', explanation: 'Dry running tracks with reliable grip.' });
      } else if (rainProb <= 50) {
        factors.push({ name: 'Precipitation', value: `${rainProb}% chance`, status: 'caution', explanation: 'Passing showers possible; water-resistant gear recommended.' });
        score -= 20;
      } else {
        factors.push({ name: 'Precipitation', value: `${rainProb}% chance`, status: 'poor', explanation: 'High probability of wet roads, puddles, and low visibility.' });
        score -= 40;
      }

      // Air Quality
      if (aqi <= 50) {
        factors.push({ name: 'Air Quality', value: `AQI ${aqi}`, status: 'optimal', explanation: 'Clean ambient air; deep breathing is safe.' });
      } else if (aqi <= 100) {
        factors.push({ name: 'Air Quality', value: `AQI ${aqi}`, status: 'optimal', explanation: 'Acceptable air quality for most individuals.' });
      } else {
        factors.push({ name: 'Air Quality', value: `AQI ${aqi}`, status: 'caution', explanation: 'Sensitive groups should consider an indoor session.' });
        score -= 15;
      }

      // Wind & Humidity
      if (humidity > 80 && temp > 27) {
        factors.push({ name: 'Humidity', value: `${humidity}%`, status: 'caution', explanation: 'Sweat evaporation is slow; take regular water breaks.' });
        score -= 10;
      } else {
        factors.push({ name: 'Wind & Air', value: `${wind} km/h`, status: 'optimal', explanation: 'Gentle breeze helps cooling.' });
      }
      break;
    }

    case 'Driving': {
      // Visibility
      if (visibility >= 8) {
        factors.push({ name: 'Road Visibility', value: `${visibility} km`, status: 'optimal', explanation: 'Clear line of sight on highways and expressways.' });
      } else if (visibility >= 4) {
        factors.push({ name: 'Road Visibility', value: `${visibility} km`, status: 'caution', explanation: 'Moderate visibility; use dipped headlights in rain.' });
        score -= 15;
      } else {
        factors.push({ name: 'Road Visibility', value: `${visibility} km`, status: 'poor', explanation: 'Heavy fog or downpours reducing braking sightlines.' });
        score -= 35;
      }

      // Rain / Slippery roads
      if (rainProb < 30) {
        factors.push({ name: 'Surface Traction', value: 'Dry roads', status: 'optimal', explanation: 'Normal stopping distances and standard tire grip.' });
      } else if (rainProb <= 65) {
        factors.push({ name: 'Surface Traction', value: `${rainProb}% rain chance`, status: 'caution', explanation: 'Wet asphalt; allow 20% greater braking distance.' });
        score -= 20;
      } else {
        factors.push({ name: 'Surface Traction', value: `${rainProb}% rain chance`, status: 'poor', explanation: 'Water accumulation likely on low-lying junctions; expect congestion.' });
        score -= 35;
      }

      // Wind
      if (wind > 35) {
        factors.push({ name: 'Crosswinds', value: `${wind} km/h`, status: 'caution', explanation: 'Gusts on elevated flyovers and sea links.' });
        score -= 10;
      } else {
        factors.push({ name: 'Wind Stability', value: `${wind} km/h`, status: 'optimal', explanation: 'Stable vehicle dynamics.' });
      }
      break;
    }

    case 'Travelling': {
      // General comfort & delays
      if (weather.alerts.length > 0) {
        factors.push({ name: 'Weather Alerts', value: weather.alerts[0].severityLabel, status: 'caution', explanation: weather.alerts[0].title });
        score -= 25;
      } else {
        factors.push({ name: 'Transit Alerts', value: 'No active warnings', status: 'optimal', explanation: 'Air and rail departures operating smoothly.' });
      }

      if (rainProb > 50) {
        factors.push({ name: 'Rain Impact', value: `${rainProb}% chance`, status: 'caution', explanation: 'Carry a sturdy umbrella and allow 25 mins buffer for airport/station commute.' });
        score -= 20;
      } else {
        factors.push({ name: 'Precipitation', value: 'Low probability', status: 'optimal', explanation: 'Pleasant sightseeing and seamless city transfers.' });
      }

      factors.push({ name: 'Comfort Index', value: `${temp}°C (Feels ${hourData ? hourData.feelsLike : weather.feelsLike}°C)`, status: temp > 33 ? 'caution' : 'optimal', explanation: temp > 33 ? 'Pack breathable cotton layers and sun protection.' : 'Comfortable ambient temperature.' });
      break;
    }

    case 'Cycling': {
      if (rainProb > 50) {
        factors.push({ name: 'Traction & Mud', value: `${rainProb}% rain`, status: 'poor', explanation: 'Slippery lane markings, spray from traffic.' });
        score -= 35;
      } else {
        factors.push({ name: 'Traction', value: 'Dry roads', status: 'optimal', explanation: 'Predictable braking and cornering.' });
      }

      if (wind > 20) {
        factors.push({ name: 'Headwinds', value: `${wind} km/h`, status: 'caution', explanation: 'Noticeable resistance on open stretches.' });
        score -= 15;
      } else {
        factors.push({ name: 'Wind', value: `${wind} km/h`, status: 'optimal', explanation: 'Calm riding conditions.' });
      }

      factors.push({ name: 'Visibility', value: `${visibility} km`, status: visibility < 5 ? 'caution' : 'optimal', explanation: visibility < 5 ? 'Use front and rear strobe lights.' : 'Good daylight visibility.' });
      break;
    }

    case 'Farming': {
      factors.push({ name: 'Soil Moisture / Rain', value: `${rainProb}% chance (${hourData ? hourData.rainfallMm : weather.rainfallMm} mm)`, status: rainProb > 60 ? 'optimal' : 'caution', explanation: rainProb > 60 ? 'Natural precipitation benefits kharif crops; hold artificial irrigation.' : 'Dry spell; monitor field moisture.' });
      factors.push({ name: 'Spraying Window', value: wind > 18 ? 'High wind' : 'Favorable', status: wind > 18 ? 'poor' : 'optimal', explanation: wind > 18 ? 'Avoid pesticide spray due to high drift.' : 'Gentle wind supports uniform pesticide application.' });
      factors.push({ name: 'Soil Heat', value: `${temp}°C`, status: 'optimal', explanation: 'Favorable temperature for current seasonal stage.' });
      break;
    }

    default: {
      factors.push({ name: 'Overall Comfort', value: `${temp}°C`, status: 'optimal', explanation: 'Standard weather conditions for daily activities.' });
      factors.push({ name: 'Precipitation', value: `${rainProb}% rain`, status: rainProb > 50 ? 'caution' : 'optimal', explanation: rainProb > 50 ? 'Keep an umbrella handy.' : 'No rain interruption expected.' });
      factors.push({ name: 'Air Quality', value: `AQI ${aqi}`, status: 'optimal', explanation: 'Suitable for outdoor chores and leisure.' });
      break;
    }
  }

  score = Math.max(10, Math.min(100, score));

  let overallRating: 'Good' | 'Moderate' | 'Poor' = 'Good';
  if (score < 50) overallRating = 'Poor';
  else if (score < 75) overallRating = 'Moderate';

  let headline = '';
  let summary = '';

  if (activity === 'Running') {
    if (overallRating === 'Good') {
      headline = 'Optimal running conditions';
      summary = 'Dry pavement, comfortable temperatures, and good air quality.';
    } else if (overallRating === 'Moderate') {
      headline = 'Moderate running window';
      summary = rainProb > 50
        ? `Rain expected soon (${rainProb}%). Best to complete your run before the showers intensify.`
        : 'Warm and humid conditions. Keep hydration ready and monitor heart rate.';
    } else {
      headline = 'Poor running conditions';
      summary = 'Heavy rain, slick surfaces, and reduced visibility make outdoor running risky.';
    }
  } else if (activity === 'Driving') {
    if (overallRating === 'Good') {
      headline = 'Clear driving conditions';
      summary = 'Dry highways, good visibility, and standard traffic flow expected.';
    } else if (overallRating === 'Moderate') {
      headline = 'Rain expected during commute';
      summary = 'Showers starting around 6:15 PM will cause wet roads and slower transit. Allow an extra 15 minutes.';
    } else {
      headline = 'Challenging commute conditions';
      summary = 'Waterlogged junctions and severely reduced visibility. Drive cautiously with dipped beams.';
    }
  } else if (activity === 'Travelling') {
    if (overallRating === 'Good') {
      headline = 'Smooth travel weather';
      summary = 'No delays anticipated for flights, trains, or inter-city road journeys.';
    } else {
      headline = 'Variable transit conditions';
      summary = 'Monsoon showers and localized weather alerts active at your destination.';
    }
  } else {
    headline = `${overallRating} conditions for ${activity.toLowerCase()}`;
    summary = `Temperature is ${temp}°C with ${rainProb}% precipitation probability.`;
  }

  return {
    activity,
    overallRating,
    score,
    headline,
    summary,
    factors,
  };
}
