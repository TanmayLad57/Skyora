import { WeatherData, TemperatureUnit, HourlyForecast, DailyForecast, WeatherAlert, WeatherConditionCode } from '../types';
import { ALL_SCENARIOS, SCENARIO_MUMBAI, SCENARIO_DELHI, SCENARIO_LONDON, SCENARIO_BENGALURU, POPULAR_LOCATIONS } from './mockScenarios';
import { useAppStore } from '../store/useAppStore';

/**
 * Feature flag for live vs mock weather data.
 * Can be overridden via environment variable VITE_USE_MOCK_WEATHER=true.
 */
export const USE_MOCK_DATA = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK_WEATHER === 'true') || false;

// In-memory cache for live weather data
interface WeatherCacheEntry {
  data: WeatherData;
  timestamp: number;
}

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache freshness
const weatherCache = new Map<string, WeatherCacheEntry>();
const pendingFetches = new Map<string, Promise<WeatherData | null>>();
const geocodeCache = new Map<string, { lat: number; lon: number; state: string; country: string }>();

// Seed geocoding cache with known locations
POPULAR_LOCATIONS.forEach((loc) => {
  geocodeCache.set(loc.city.toLowerCase(), {
    lat: loc.lat,
    lon: loc.lon,
    state: loc.state,
    country: loc.country,
  });
});

// Seed additional known locations from demo personas
geocodeCache.set('pune', { lat: 18.5204, lon: 73.8567, state: 'Maharashtra', country: 'India' });
geocodeCache.set('bandra kurla complex', { lat: 19.066, lon: 72.868, state: 'Maharashtra', country: 'India' });

// Initialize local storage cache if in browser environment
const STORAGE_CACHE_KEY = 'skyora_weather_cache_v1';

function loadStoredCache(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw = localStorage.getItem(STORAGE_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const now = Date.now();
      for (const [key, entry] of Object.entries(parsed)) {
        const item = entry as WeatherCacheEntry;
        if (now - item.timestamp < CACHE_TTL_MS * 4) { // keep slightly older cache as instant baseline
          weatherCache.set(key, item);
        }
      }
    }
  } catch (e) {
    console.warn('[Skyora Weather] Could not load localStorage cache:', e);
  }
}

function saveStoredCache(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const obj: Record<string, WeatherCacheEntry> = {};
    weatherCache.forEach((val, key) => {
      obj[key] = val;
    });
    localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(obj));
  } catch (e) {
    // Ignore storage quota warnings
  }
}

// Load storage cache on initial script execution
loadStoredCache();

/**
 * WMO Weather interpretation code mapping
 */
const WMO_CODE_MAP: Record<number, { code: WeatherConditionCode; text: string }> = {
  0: { code: 'clear', text: 'Clear Sky' },
  1: { code: 'partly-cloudy', text: 'Mainly Clear' },
  2: { code: 'partly-cloudy', text: 'Partly Cloudy' },
  3: { code: 'cloudy', text: 'Overcast' },
  45: { code: 'fog', text: 'Fog' },
  48: { code: 'fog', text: 'Depositing Rime Fog' },
  51: { code: 'drizzle', text: 'Light Drizzle' },
  53: { code: 'drizzle', text: 'Moderate Drizzle' },
  55: { code: 'drizzle', text: 'Dense Drizzle' },
  56: { code: 'drizzle', text: 'Light Freezing Drizzle' },
  57: { code: 'drizzle', text: 'Dense Freezing Drizzle' },
  61: { code: 'light-rain', text: 'Light Rain Showers' },
  63: { code: 'light-rain', text: 'Moderate Rain' },
  65: { code: 'heavy-rain', text: 'Heavy Rain' },
  66: { code: 'light-rain', text: 'Light Freezing Rain' },
  67: { code: 'heavy-rain', text: 'Heavy Freezing Rain' },
  71: { code: 'light-rain', text: 'Slight Snow' },
  73: { code: 'light-rain', text: 'Moderate Snow' },
  75: { code: 'heavy-rain', text: 'Heavy Snow' },
  77: { code: 'light-rain', text: 'Snow Grains' },
  80: { code: 'light-rain', text: 'Scattered Showers' },
  81: { code: 'light-rain', text: 'Moderate Showers' },
  82: { code: 'heavy-rain', text: 'Violent Rain Showers' },
  85: { code: 'light-rain', text: 'Light Snow Showers' },
  86: { code: 'heavy-rain', text: 'Heavy Snow Showers' },
  95: { code: 'thunderstorm', text: 'Thunderstorm' },
  96: { code: 'thunderstorm', text: 'Thunderstorm with Hail' },
  99: { code: 'thunderstorm', text: 'Severe Thunderstorm with Hail' },
};

function mapWmo(code: number): { code: WeatherConditionCode; text: string } {
  return WMO_CODE_MAP[code] || { code: 'partly-cloudy', text: 'Partly Cloudy' };
}

function getWindCompass(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(deg / 22.5) % 16;
  return directions[idx] || 'N';
}

function getUvLevelText(uv: number): string {
  if (uv < 3) return 'Low';
  if (uv < 6) return 'Moderate';
  if (uv < 8) return 'High';
  if (uv < 11) return 'Very High';
  return 'Extreme';
}

function getAqiStatus(aqi: number): 'Good' | 'Moderate' | 'Poor' | 'Unhealthy' {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Poor';
  return 'Unhealthy';
}

/**
 * Resolve coordinates and metadata for a city name.
 */
export async function resolveLocationCoords(
  cityName: string
): Promise<{ lat: number; lon: number; state: string; country: string }> {
  const normalized = cityName.trim().toLowerCase();

  // 1. Check local geocoding cache
  if (geocodeCache.has(normalized)) {
    return geocodeCache.get(normalized)!;
  }

  // 2. Check saved locations in the store
  try {
    const storeState = useAppStore.getState();
    const saved = storeState?.profile?.locations?.find(
      (l) => l.name.toLowerCase() === normalized
    );
    if (saved && saved.lat && saved.lon) {
      const info = {
        lat: saved.lat,
        lon: saved.lon,
        state: saved.state || 'Region',
        country: 'India',
      };
      geocodeCache.set(normalized, info);
      return info;
    }
  } catch (e) {
    // Store might not be ready
  }

  // 3. Fall back to Open-Meteo Geocoding API
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      cityName
    )}&count=1&language=en&format=json`;
    const res = await fetch(geoUrl);
    if (res.ok) {
      const data = await res.json();
      if (data?.results && data.results.length > 0) {
        const item = data.results[0];
        const info = {
          lat: item.latitude,
          lon: item.longitude,
          state: item.admin1 || item.country || 'Region',
          country: item.country || 'Global',
        };
        geocodeCache.set(normalized, info);
        return info;
      }
    }
  } catch (err) {
    console.warn(`[Skyora Weather] Geocoding lookup failed for "${cityName}":`, err);
  }

  // 4. Ultimate fallback to Mumbai coordinates
  return { lat: 19.076, lon: 72.8777, state: 'Maharashtra', country: 'India' };
}

/**
 * Fetch live data from Open-Meteo Forecast & Air Quality APIs and merge into WeatherData.
 */
export async function fetchLiveWeatherData(
  cityName: string,
  latOverride?: number,
  lonOverride?: number
): Promise<WeatherData | null> {
  const normalizedKey = cityName.trim().toLowerCase();

  // Deduplicate ongoing network fetches
  if (pendingFetches.has(normalizedKey)) {
    return pendingFetches.get(normalizedKey)!;
  }

  const fetchPromise = (async () => {
    try {
      let lat = latOverride;
      let lon = lonOverride;
      let state = 'Region';
      let country = 'India';

      if (lat === undefined || lon === undefined) {
        const loc = await resolveLocationCoords(cityName);
        lat = loc.lat;
        lon = loc.lon;
        state = loc.state;
        country = loc.country;
      }

      // Open-Meteo Forecast API URL
      const forecastUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,precipitation_probability,weather_code,wind_speed_10m,wind_direction_10m,uv_index,visibility` +
        `&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m,uv_index,visibility` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,sunrise,sunset` +
        `&timezone=auto&forecast_days=7`;

      // Open-Meteo Air Quality API URL (separate endpoint as requested)
      const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,european_aqi,pm2_5,pm10&timezone=auto`;

      const [forecastRes, aqiRes] = await Promise.all([
        fetch(forecastUrl),
        fetch(airQualityUrl).catch((err) => {
          console.warn('[Skyora Weather] AQI sub-endpoint error, using default AQI:', err);
          return null;
        }),
      ]);

      if (!forecastRes.ok) {
        throw new Error(`Open-Meteo API HTTP error ${forecastRes.status}`);
      }

      const fData = await forecastRes.json();
      let aqiData: any = null;
      if (aqiRes && aqiRes.ok) {
        try {
          aqiData = await aqiRes.json();
        } catch {
          aqiData = null;
        }
      }

      const current = fData.current || {};
      const hourly = fData.hourly || {};
      const daily = fData.daily || {};

      // AQI: Default to 45 (Good) if endpoint unavailable or unpopulated
      const aqiValue = Math.round(aqiData?.current?.us_aqi ?? 45);
      const aqiStatus = getAqiStatus(aqiValue);

      // Construct Hourly Array (24 hours of today)
      const hourlyList: HourlyForecast[] = [];
      for (let h = 0; h < 24; h++) {
        const wmoCode = hourly.weather_code?.[h] ?? 0;
        const wmo = mapWmo(wmoCode);
        const tempVal = Math.round(hourly.temperature_2m?.[h] ?? current.temperature_2m ?? 25);
        const feelsVal = Math.round(hourly.apparent_temperature?.[h] ?? tempVal);
        const rainP = Math.round(hourly.precipitation_probability?.[h] ?? 0);
        const rainMm = Number((hourly.precipitation?.[h] ?? 0).toFixed(1));
        const windSpd = Math.round(hourly.wind_speed_10m?.[h] ?? 10);
        const hum = Math.round(hourly.relative_humidity_2m?.[h] ?? 65);
        const uv = Math.round(hourly.uv_index?.[h] ?? 0);
        const vis = Number(((hourly.visibility?.[h] ?? 10000) / 1000).toFixed(1));

        hourlyList.push({
          time: `${h.toString().padStart(2, '0')}:00`,
          hour: h,
          temp: tempVal,
          feelsLike: feelsVal,
          rainProb: rainP,
          rainfallMm: rainMm,
          condition: wmo.code,
          conditionText: wmo.text,
          windSpeedKm: windSpd,
          humidity: hum,
          uvIndex: uv,
          visibilityKm: vis,
        });
      }

      // Construct Daily Array (7 days)
      const dailyList: DailyForecast[] = [];
      const daysCount = daily.time?.length || 7;
      for (let d = 0; d < Math.min(daysCount, 7); d++) {
        const dateStr = daily.time?.[d] || '';
        const parsedDate = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
        const dayName = d === 0 ? 'Today' : parsedDate.toLocaleDateString('en-US', { weekday: 'short' });
        const formattedDate = parsedDate.toLocaleDateString('en-US', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
        });

        const wmoCode = daily.weather_code?.[d] ?? 0;
        const wmo = mapWmo(wmoCode);
        const tMax = Math.round(daily.temperature_2m_max?.[d] ?? 30);
        const tMin = Math.round(daily.temperature_2m_min?.[d] ?? 22);
        const rainProbMax = Math.round(daily.precipitation_probability_max?.[d] ?? 0);
        const rainSum = Number((daily.precipitation_sum?.[d] ?? 0).toFixed(1));

        let summary = 'Standard seasonal conditions with steady breezes.';
        if (rainProbMax >= 65) summary = 'Frequent showers and elevated wet pavement probability.';
        else if (rainProbMax >= 35) summary = 'Scattered showers with dry intervals.';
        else if (wmo.code === 'clear') summary = 'Clear sunny skies and optimal visibility.';
        else if (wmo.code === 'partly-cloudy') summary = 'Pleasant cloud cover with gentle breezes.';
        else if (wmo.code === 'thunderstorm') summary = 'Thunderstorm risk with gusty winds.';

        dailyList.push({
          day: dayName,
          date: formattedDate,
          tempMax: tMax,
          tempMin: tMin,
          condition: wmo.code,
          conditionText: wmo.text,
          rainProb: rainProbMax,
          rainfallMm: rainSum,
          summary,
        });
      }

      // Current condition details
      const curWmo = mapWmo(current.weather_code ?? 0);
      const sunriseStr = daily.sunrise?.[0] ? daily.sunrise[0].split('T')[1]?.slice(0, 5) : '06:15';
      const sunsetStr = daily.sunset?.[0] ? daily.sunset[0].split('T')[1]?.slice(0, 5) : '18:25';

      // Evaluate any dynamic alerts based on live severe conditions
      const liveAlerts: WeatherAlert[] = [];
      if (curWmo.code === 'thunderstorm') {
        liveAlerts.push({
          id: `live-alert-${Date.now()}`,
          title: 'Thunderstorm & Gusty Winds Advisory',
          severity: 'yellow',
          severityLabel: 'Yellow Watch',
          description: `Active thunderstorm clusters detected over ${cityName} and surrounding districts.`,
          whatItMeans: 'Sudden downpours may reduce visibility abruptly on roadways. Take precautions for outdoor travel.',
          officialSource: 'Live Meteorological Alert Stream',
          issuedAt: 'Live Open-Meteo Radar',
          validUntil: 'Next 6 Hours',
          isOfficial: true,
          area: `${cityName} & Vicinity`,
        });
      } else if (curWmo.code === 'heavy-rain' || (current.precipitation_probability ?? 0) >= 80) {
        liveAlerts.push({
          id: `live-alert-${Date.now()}`,
          title: 'Heavy Rainfall Warning',
          severity: 'orange',
          severityLabel: 'Orange Alert',
          description: `Intense precipitation bands impacting ${cityName}.`,
          whatItMeans: 'Localized waterlogging on low-lying roads. High road spray and reduced traction.',
          officialSource: 'Live Meteorological Alert Stream',
          issuedAt: 'Live Open-Meteo Radar',
          validUntil: 'Next 8 Hours',
          isOfficial: true,
          area: `${cityName} Metropolitan Area`,
        });
      }

      const nowTime = new Date();
      const timeHours = nowTime.getHours().toString().padStart(2, '0');
      const timeMins = nowTime.getMinutes().toString().padStart(2, '0');

      // Ensure the current hour bucket in hourlyList matches the canonical live current observation
      const currentHourIdx = nowTime.getHours();
      if (hourlyList[currentHourIdx]) {
        hourlyList[currentHourIdx].temp = Math.round(current.temperature_2m ?? 28);
        hourlyList[currentHourIdx].feelsLike = Math.round(current.apparent_temperature ?? current.temperature_2m ?? 28);
      }

      const liveData: WeatherData = {
        city: cityName,
        state,
        country,
        temp: Math.round(current.temperature_2m ?? 28),
        feelsLike: Math.round(current.apparent_temperature ?? current.temperature_2m ?? 28),
        condition: curWmo.code,
        conditionText: curWmo.text,
        humidity: Math.round(current.relative_humidity_2m ?? 70),
        rainProb: Math.round(current.precipitation_probability ?? hourlyList[nowTime.getHours()]?.rainProb ?? 0),
        rainfallMm: Number((current.precipitation ?? 0).toFixed(1)),
        windSpeedKm: Math.round(current.wind_speed_10m ?? 12),
        windDirection: getWindCompass(current.wind_direction_10m ?? 0),
        uvIndex: Math.round(current.uv_index ?? 0),
        uvLevel: getUvLevelText(current.uv_index ?? 0),
        visibilityKm: Number(((current.visibility ?? 10000) / 1000).toFixed(1)),
        aqi: aqiValue,
        aqiStatus,
        sunrise: sunriseStr,
        sunset: sunsetStr,
        alerts: liveAlerts,
        hourly: hourlyList,
        daily: dailyList,
        lastUpdated: `Live · ${timeHours}:${timeMins}`,
      };

      // Update cache
      weatherCache.set(normalizedKey, { data: liveData, timestamp: Date.now() });
      saveStoredCache();

      return liveData;
    } catch (error) {
      console.warn(`[Skyora Weather] Live weather fetch failed for "${cityName}", falling back to mock scenario:`, error);
      return null;
    } finally {
      pendingFetches.delete(normalizedKey);
    }
  })();

  pendingFetches.set(normalizedKey, fetchPromise);
  return fetchPromise;
}

/**
 * Returns fallback mock data for a given city name
 */
function getFallbackMock(cityName: string): WeatherData {
  const scenarioKey = Object.keys(ALL_SCENARIOS).find(
    (k) => k.toLowerCase() === cityName.toLowerCase()
  );
  const baseData = scenarioKey ? ALL_SCENARIOS[scenarioKey] : SCENARIO_MUMBAI;
  const cloned: WeatherData = JSON.parse(JSON.stringify(baseData));
  cloned.city = cityName;
  return cloned;
}

/**
 * Primary synchronous weather accessor for the engine and UI components.
 * Returns live data if cached/available, triggers background sync, and falls back gracefully.
 */
export function getWeatherData(
  cityName: string = 'Mumbai',
  simulatedHour?: number,
  unit: TemperatureUnit = 'C'
): WeatherData {
  // If feature flag is explicitly enabled, return mock scenario directly
  if (USE_MOCK_DATA) {
    const mock = getFallbackMock(cityName);
    return applyAdjustments(mock, simulatedHour, unit);
  }

  const normalizedKey = cityName.trim().toLowerCase();
  const cached = weatherCache.get(normalizedKey);
  const now = Date.now();

  let baseData: WeatherData;

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    // Fresh cached live data
    baseData = JSON.parse(JSON.stringify(cached.data));
  } else if (cached) {
    // Stale cached data: use immediately while refreshing in background
    baseData = JSON.parse(JSON.stringify(cached.data));
    fetchLiveWeatherData(cityName);
  } else {
    // No cache yet: trigger background live fetch and use mock scenario for this render
    fetchLiveWeatherData(cityName);
    baseData = getFallbackMock(cityName);
  }

  return applyAdjustments(baseData, simulatedHour, unit);
}

/**
 * Adjust simulated hour and temperature unit without mutating base data
 */
function applyAdjustments(
  data: WeatherData,
  simulatedHour?: number,
  unit: TemperatureUnit = 'C'
): WeatherData {
  const result: WeatherData = JSON.parse(JSON.stringify(data));

  // If a simulated hour is passed, adjust current metrics to match that hour's forecast
  if (simulatedHour !== undefined && result.hourly && result.hourly.length > 0) {
    const matchedHour = result.hourly.find((h) => h.hour === simulatedHour) || result.hourly[simulatedHour];
    if (matchedHour) {
      result.temp = matchedHour.temp;
      result.feelsLike = matchedHour.feelsLike;
      result.condition = matchedHour.condition;
      result.conditionText = matchedHour.conditionText;
      result.rainProb = matchedHour.rainProb;
      result.rainfallMm = matchedHour.rainfallMm;
      result.humidity = matchedHour.humidity;
      result.windSpeedKm = matchedHour.windSpeedKm;
      result.visibilityKm = matchedHour.visibilityKm;
      result.uvIndex = matchedHour.uvIndex;
      result.uvLevel = getUvLevelText(matchedHour.uvIndex);
    }
  }

  // Handle Fahrenheit conversion if needed
  if (unit === 'F') {
    const toF = (c: number) => Math.round((c * 9) / 5 + 32);
    result.temp = toF(result.temp);
    result.feelsLike = toF(result.feelsLike);
    if (result.hourly) {
      result.hourly = result.hourly.map((h) => ({
        ...h,
        temp: toF(h.temp),
        feelsLike: toF(h.feelsLike),
      }));
    }
    if (result.daily) {
      result.daily = result.daily.map((d) => ({
        ...d,
        tempMax: toF(d.tempMax),
        tempMin: toF(d.tempMin),
      }));
    }
  }

  return result;
}

// Proactively prefetch common locations and active location upon module load
if (typeof window !== 'undefined' && !USE_MOCK_DATA) {
  // Initial immediate prefetch
  const initialCities = ['Mumbai', 'Delhi', 'London', 'Bengaluru', 'Pune'];
  initialCities.forEach((city) => {
    fetchLiveWeatherData(city);
  });

  // Listen to store updates to prefetch newly selected locations
  try {
    useAppStore.subscribe((state, prevState) => {
      const activeLoc = state.profile?.locations?.find(
        (l) => l.id === state.profile?.activeLocationId
      );
      const prevActiveLoc = prevState.profile?.locations?.find(
        (l) => l.id === prevState.profile?.activeLocationId
      );
      if (activeLoc && activeLoc.name !== prevActiveLoc?.name) {
        fetchLiveWeatherData(activeLoc.name, activeLoc.lat, activeLoc.lon);
      }
    });
  } catch (e) {
    // Ignore if store listener setup fails in headless environments
  }
}
