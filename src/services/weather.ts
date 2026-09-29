import { WeatherData, TemperatureUnit } from '../types';
import { ALL_SCENARIOS, SCENARIO_MUMBAI, SCENARIO_DELHI, SCENARIO_LONDON, SCENARIO_BENGALURU } from './mockScenarios';

export function getWeatherData(
  cityName: string = 'Mumbai',
  simulatedHour?: number,
  unit: TemperatureUnit = 'C'
): WeatherData {
  // Normalize city name
  const scenarioKey = Object.keys(ALL_SCENARIOS).find(
    (k) => k.toLowerCase() === cityName.toLowerCase()
  );
  
  let baseData: WeatherData = scenarioKey ? ALL_SCENARIOS[scenarioKey] : SCENARIO_MUMBAI;
  // Clone to avoid mutating static data
  const data: WeatherData = JSON.parse(JSON.stringify(baseData));

  // If a simulated hour is passed, adjust current temp and condition to match that hour's forecast
  if (simulatedHour !== undefined) {
    const matchedHour = data.hourly.find((h) => h.hour === simulatedHour);
    if (matchedHour) {
      data.temp = matchedHour.temp;
      data.feelsLike = matchedHour.feelsLike;
      data.condition = matchedHour.condition;
      data.conditionText = matchedHour.conditionText;
      data.rainProb = matchedHour.rainProb;
      data.rainfallMm = matchedHour.rainfallMm;
      data.humidity = matchedHour.humidity;
      data.windSpeedKm = matchedHour.windSpeedKm;
      data.visibilityKm = matchedHour.visibilityKm;
      data.uvIndex = matchedHour.uvIndex;
    }
  }

  // Handle Fahrenheit conversion if needed
  if (unit === 'F') {
    const toF = (c: number) => Math.round((c * 9) / 5 + 32);
    data.temp = toF(data.temp);
    data.feelsLike = toF(data.feelsLike);
    data.hourly = data.hourly.map((h) => ({
      ...h,
      temp: toF(h.temp),
      feelsLike: toF(h.feelsLike),
    }));
    data.daily = data.daily.map((d) => ({
      ...d,
      tempMax: toF(d.tempMax),
      tempMin: toF(d.tempMin),
    }));
  }

  return data;
}
