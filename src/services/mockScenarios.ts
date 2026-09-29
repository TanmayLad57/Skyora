import { WeatherData, HourlyForecast, DailyForecast, WeatherAlert } from '../types';

function generateHourly(
  baseTemp: number,
  rainProfile: (hour: number) => { prob: number; mm: number; condition: any; text: string }
): HourlyForecast[] {
  const hours: HourlyForecast[] = [];
  for (let h = 0; h < 24; h++) {
    const timeStr = `${h.toString().padStart(2, '0')}:00`;
    // diurnal temp variation: lowest at 5am, highest at 14pm
    const tempOffset = Math.sin(((h - 8) / 24) * 2 * Math.PI) * 4;
    const temp = Math.round(baseTemp + tempOffset);
    const rain = rainProfile(h);
    
    // UV index logic
    let uv = 0;
    if (h >= 10 && h <= 16) {
      uv = Math.round(7 - Math.abs(h - 13) * 1.5);
      if (rain.prob > 50) uv = Math.max(1, uv - 3);
    }

    hours.push({
      time: timeStr,
      hour: h,
      temp,
      feelsLike: temp + (rain.prob > 40 ? 3 : 1),
      rainProb: rain.prob,
      rainfallMm: rain.mm,
      condition: rain.condition,
      conditionText: rain.text,
      windSpeedKm: Math.round(10 + Math.sin(h) * 4),
      humidity: rain.prob > 50 ? 86 : 72,
      uvIndex: uv,
      visibilityKm: rain.prob > 60 ? 4.5 : 8.0,
    });
  }
  return hours;
}

// 1. MUMBAI: Evening Rain scenario (70% rain starting around 18:00, dry 17:00-18:00)
const mumbaiAlert: WeatherAlert = {
  id: 'imd-mum-0928',
  title: 'Heavy Rainfall Warning across Coastal Konkan',
  severity: 'orange',
  severityLabel: 'Orange Alert',
  description: 'Moderate to intense spells of rain very likely to occur in isolated pockets of Mumbai, Thane, and Palghar during evening and night hours.',
  whatItMeans: 'Expect localized waterlogging on arterial roads, slow-moving vehicular traffic after 6:30 PM, and wet running tracks. Public transit may experience minor delays.',
  officialSource: 'India Meteorological Department (Regional Centre Colaba)',
  issuedAt: 'Today, 06:00 IST',
  validUntil: 'Tomorrow, 08:30 IST',
  isOfficial: true,
  area: 'Mumbai & Coastal Maharashtra',
};

const mumbaiHourly = generateHourly(28, (h) => {
  if (h >= 18 && h <= 22) {
    return { prob: 75, mm: 14.5, condition: 'heavy-rain', text: 'Heavy Monsoon Rain' };
  } else if (h === 17) {
    return { prob: 25, mm: 0.2, condition: 'partly-cloudy', text: 'Dry & Overcast' };
  } else if (h >= 12 && h < 17) {
    return { prob: 35, mm: 1.0, condition: 'cloudy', text: 'Cloudy with Breezes' };
  } else if (h >= 6 && h < 12) {
    return { prob: 20, mm: 0, condition: 'partly-cloudy', text: 'Humid & Overcast' };
  } else {
    return { prob: 60, mm: 6.0, condition: 'light-rain', text: 'Intermittent Showers' };
  }
});

const mumbaiDaily: DailyForecast[] = [
  { day: 'Today', date: 'Mon, 28 Sep', tempMax: 30, tempMin: 25, condition: 'heavy-rain', conditionText: 'Evening Heavy Showers', rainProb: 75, rainfallMm: 24, summary: 'Dry afternoon turning to heavy rain after 6 PM.' },
  { day: 'Tue', date: '29 Sep', tempMax: 29, tempMin: 25, condition: 'heavy-rain', conditionText: 'Monsoon Rain Spells', rainProb: 80, rainfallMm: 35, summary: 'Continuous rain bands throughout the day.' },
  { day: 'Wed', date: '30 Sep', tempMax: 30, tempMin: 26, condition: 'light-rain', conditionText: 'Scattered Showers', rainProb: 55, rainfallMm: 12, summary: 'Rain frequency tapering off towards afternoon.' },
  { day: 'Thu', date: '01 Oct', tempMax: 31, tempMin: 26, condition: 'partly-cloudy', conditionText: 'Humid with Sun Breaks', rainProb: 30, rainfallMm: 3, summary: 'Long dry intervals, ideal for outdoor training.' },
  { day: 'Fri', date: '02 Oct', tempMax: 32, tempMin: 26, condition: 'partly-cloudy', conditionText: 'Warm & Partly Sunny', rainProb: 20, rainfallMm: 0, summary: 'Pleasant morning conditions.' },
  { day: 'Sat', date: '03 Oct', tempMax: 31, tempMin: 25, condition: 'light-rain', conditionText: 'Evening Light Rain', rainProb: 40, rainfallMm: 4, summary: 'Brief coastal shower at sunset.' },
  { day: 'Sun', date: '04 Oct', tempMax: 31, tempMin: 26, condition: 'partly-cloudy', conditionText: 'Passing Clouds', rainProb: 25, rainfallMm: 1, summary: 'Comfortable day for travel.' },
];

export const SCENARIO_MUMBAI: WeatherData = {
  city: 'Mumbai',
  state: 'Maharashtra',
  country: 'India',
  temp: 28,
  feelsLike: 31,
  condition: 'light-rain',
  conditionText: 'Overcast with Approaching Rain Bands',
  humidity: 84,
  rainProb: 70,
  rainfallMm: 4.8,
  windSpeedKm: 14,
  windDirection: 'WSW',
  uvIndex: 4,
  uvLevel: 'Moderate',
  visibilityKm: 6.0,
  aqi: 72,
  aqiStatus: 'Moderate',
  sunrise: '06:27',
  sunset: '18:31',
  alerts: [mumbaiAlert],
  hourly: mumbaiHourly,
  daily: mumbaiDaily,
  lastUpdated: 'Just now (17:30 IST)',
};

// 2. DELHI: Warm + Monsoon Thundershowers + Official Yellow Alert
const delhiAlert: WeatherAlert = {
  id: 'imd-del-0928',
  title: 'Thunderstorm with Gusty Winds Warning',
  severity: 'yellow',
  severityLabel: 'Yellow Watch',
  description: 'Thunderstorm accompanied with lightning and gusty winds (speed 30-40 kmph) likely over NCR Delhi, Noida, and Gurugram.',
  whatItMeans: 'Sudden downpours may reduce visibility abruptly on expressways. Secure loose rooftop objects and carry durable wet-weather gear.',
  officialSource: 'India Meteorological Department (National Weather Forecasting Centre, New Delhi)',
  issuedAt: 'Today, 11:30 IST',
  validUntil: 'Tomorrow, 00:00 IST',
  isOfficial: true,
  area: 'Delhi NCR',
};

const delhiHourly = generateHourly(32, (h) => {
  if (h >= 14 && h <= 19) {
    return { prob: 60, mm: 8.0, condition: 'thunderstorm', text: 'Scattered Thunderstorms' };
  } else if (h >= 6 && h < 14) {
    return { prob: 20, mm: 0, condition: 'partly-cloudy', text: 'Hazy Sunshine & Warm' };
  } else {
    return { prob: 30, mm: 1.5, condition: 'cloudy', text: 'Overcast & Humid' };
  }
});

const delhiDaily: DailyForecast[] = [
  { day: 'Today', date: 'Mon, 28 Sep', tempMax: 34, tempMin: 26, condition: 'thunderstorm', conditionText: 'Afternoon Thundershowers', rainProb: 60, rainfallMm: 14, summary: 'Humid day with sudden stormy spells in the afternoon.' },
  { day: 'Tue', date: '29 Sep', tempMax: 33, tempMin: 25, condition: 'light-rain', conditionText: 'Passing Rain', rainProb: 45, rainfallMm: 6, summary: 'Cooler breeze with occasional drizzle.' },
  { day: 'Wed', date: '30 Sep', tempMax: 35, tempMin: 26, condition: 'clear', conditionText: 'Sunny & Hot', rainProb: 10, rainfallMm: 0, summary: 'Clear sunny sky, high afternoon heat index.' },
  { day: 'Thu', date: '01 Oct', tempMax: 36, tempMin: 27, condition: 'clear', conditionText: 'Dry & Clear', rainProb: 5, rainfallMm: 0, summary: 'Dry conditions, low humidity.' },
  { day: 'Fri', date: '02 Oct', tempMax: 34, tempMin: 25, condition: 'partly-cloudy', conditionText: 'Pleasant Clouds', rainProb: 15, rainfallMm: 0, summary: 'Good evening breeze.' },
  { day: 'Sat', date: '03 Oct', tempMax: 33, tempMin: 24, condition: 'partly-cloudy', conditionText: 'Mild Autumn Sun', rainProb: 10, rainfallMm: 0, summary: 'Optimal weekend travel conditions.' },
  { day: 'Sun', date: '04 Oct', tempMax: 33, tempMin: 24, condition: 'clear', conditionText: 'Bright & Pleasant', rainProb: 5, rainfallMm: 0, summary: 'Clear and comfortable.' },
];

export const SCENARIO_DELHI: WeatherData = {
  city: 'Delhi',
  state: 'Delhi NCR',
  country: 'India',
  temp: 32,
  feelsLike: 36,
  condition: 'thunderstorm',
  conditionText: 'Gusty Winds & Rain Spells',
  humidity: 78,
  rainProb: 60,
  rainfallMm: 9.2,
  windSpeedKm: 22,
  windDirection: 'ESE',
  uvIndex: 5,
  uvLevel: 'Moderate',
  visibilityKm: 5.5,
  aqi: 118,
  aqiStatus: 'Moderate',
  sunrise: '06:12',
  sunset: '18:14',
  alerts: [delhiAlert],
  hourly: delhiHourly,
  daily: delhiDaily,
  lastUpdated: 'Just now (17:30 IST)',
};

// 3. LONDON: Autumn Cool & Rain Tomorrow
const londonHourly = generateHourly(15, (h) => {
  if (h >= 15 && h <= 19) {
    return { prob: 20, mm: 0, condition: 'cloudy', text: 'Brisk & Overcast' };
  } else if (h >= 20) {
    return { prob: 45, mm: 2.0, condition: 'drizzle', text: 'Late Evening Drizzle' };
  } else {
    return { prob: 10, mm: 0, condition: 'partly-cloudy', text: 'Cool Autumn Air' };
  }
});

const londonDaily: DailyForecast[] = [
  { day: 'Today', date: 'Mon, 28 Sep', tempMax: 16, tempMin: 10, condition: 'cloudy', conditionText: 'Dry & Overcast', rainProb: 20, rainfallMm: 0.5, summary: 'Cool overcast conditions today, rain arriving tomorrow.' },
  { day: 'Tue', date: '29 Sep', tempMax: 14, tempMin: 9, condition: 'light-rain', conditionText: 'Steady Autumn Rain', rainProb: 80, rainfallMm: 12, summary: 'Persistent rain and gusty winds throughout Tuesday.' },
  { day: 'Wed', date: '30 Sep', tempMax: 15, tempMin: 8, condition: 'partly-cloudy', conditionText: 'Sunny Intervals', rainProb: 30, rainfallMm: 2, summary: 'Cool, crisp autumn afternoon.' },
  { day: 'Thu', date: '01 Oct', tempMax: 16, tempMin: 9, condition: 'clear', conditionText: 'Crisp & Bright', rainProb: 15, rainfallMm: 0, summary: 'Great running weather in morning.' },
  { day: 'Fri', date: '02 Oct', tempMax: 17, tempMin: 11, condition: 'cloudy', conditionText: 'Mild Clouds', rainProb: 25, rainfallMm: 1, summary: 'Gentle breeze, comfortable.' },
  { day: 'Sat', date: '03 Oct', tempMax: 15, tempMin: 9, condition: 'light-rain', conditionText: 'Weekend Showers', rainProb: 65, rainfallMm: 7, summary: 'Scattered afternoon rain.' },
  { day: 'Sun', date: '04 Oct', tempMax: 14, tempMin: 8, condition: 'partly-cloudy', conditionText: 'Clear & Chilly', rainProb: 20, rainfallMm: 0, summary: 'Brisk wind, layer up.' },
];

export const SCENARIO_LONDON: WeatherData = {
  city: 'London',
  state: 'Greater London',
  country: 'United Kingdom',
  temp: 15,
  feelsLike: 14,
  condition: 'cloudy',
  conditionText: 'Overcast & Crisp',
  humidity: 68,
  rainProb: 20,
  rainfallMm: 0.2,
  windSpeedKm: 18,
  windDirection: 'WSW',
  uvIndex: 2,
  uvLevel: 'Low',
  visibilityKm: 10.0,
  aqi: 34,
  aqiStatus: 'Good',
  sunrise: '06:58',
  sunset: '18:47',
  alerts: [],
  hourly: londonHourly,
  daily: londonDaily,
  lastUpdated: 'Just now (13:00 BST)',
};

// 4. BENGALURU: Pleasant & Breezy
const bengaluruHourly = generateHourly(23, (h) => {
  return { prob: 20, mm: 0.2, condition: 'partly-cloudy', text: 'Mild Breeze & Clouds' };
});

const bengaluruDaily: DailyForecast[] = [
  { day: 'Today', date: 'Mon, 28 Sep', tempMax: 26, tempMin: 19, condition: 'partly-cloudy', conditionText: 'Pleasant & Cool', rainProb: 20, rainfallMm: 0.8, summary: 'Ideal weather for outdoor activities all day.' },
  { day: 'Tue', date: '29 Sep', tempMax: 26, tempMin: 19, condition: 'partly-cloudy', conditionText: 'Scattered Clouds', rainProb: 25, rainfallMm: 1.2, summary: 'Comfortable temperature and light breeze.' },
  { day: 'Wed', date: '30 Sep', tempMax: 27, tempMin: 20, condition: 'clear', conditionText: 'Sunny & Crisp', rainProb: 15, rainfallMm: 0, summary: 'Clear morning skies.' },
  { day: 'Thu', date: '01 Oct', tempMax: 26, tempMin: 19, condition: 'light-rain', conditionText: 'Evening Drizzle', rainProb: 40, rainfallMm: 3, summary: 'Brief light shower at dusk.' },
  { day: 'Fri', date: '02 Oct', tempMax: 25, tempMin: 18, condition: 'partly-cloudy', conditionText: 'Gentle Breezes', rainProb: 20, rainfallMm: 0, summary: 'Very pleasant running conditions.' },
  { day: 'Sat', date: '03 Oct', tempMax: 26, tempMin: 19, condition: 'clear', conditionText: 'Bright Morning', rainProb: 10, rainfallMm: 0, summary: 'Optimal weekend outing weather.' },
  { day: 'Sun', date: '04 Oct', tempMax: 26, tempMin: 19, condition: 'partly-cloudy', conditionText: 'Mild Weather', rainProb: 15, rainfallMm: 0, summary: 'Consistent pleasant conditions.' },
];

export const SCENARIO_BENGALURU: WeatherData = {
  city: 'Bengaluru',
  state: 'Karnataka',
  country: 'India',
  temp: 23,
  feelsLike: 23,
  condition: 'partly-cloudy',
  conditionText: 'Pleasant Breeze & Mild Sun',
  humidity: 64,
  rainProb: 20,
  rainfallMm: 0.4,
  windSpeedKm: 14,
  windDirection: 'E',
  uvIndex: 6,
  uvLevel: 'High',
  visibilityKm: 9.0,
  aqi: 45,
  aqiStatus: 'Good',
  sunrise: '06:09',
  sunset: '18:16',
  alerts: [],
  hourly: bengaluruHourly,
  daily: bengaluruDaily,
  lastUpdated: 'Just now (17:30 IST)',
};

export const ALL_SCENARIOS: Record<string, WeatherData> = {
  Mumbai: SCENARIO_MUMBAI,
  Delhi: SCENARIO_DELHI,
  London: SCENARIO_LONDON,
  Bengaluru: SCENARIO_BENGALURU,
};

export const POPULAR_LOCATIONS = [
  { city: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 19.076, lon: 72.8777 },
  { city: 'Delhi', state: 'Delhi NCR', country: 'India', lat: 28.6139, lon: 77.209 },
  { city: 'Bengaluru', state: 'Karnataka', country: 'India', lat: 12.9716, lon: 77.5946 },
  { city: 'Kolkata', state: 'West Bengal', country: 'India', lat: 22.5726, lon: 88.3639 },
  { city: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: 13.0827, lon: 80.2707 },
  { city: 'Pune', state: 'Maharashtra', country: 'India', lat: 18.5204, lon: 73.8567 },
  { city: 'Jaipur', state: 'Rajasthan', country: 'India', lat: 26.9124, lon: 75.7873 },
  { city: 'London', state: 'Greater London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
];
