export type TemperatureUnit = 'C' | 'F';

export type ActivityType =
  | 'Running'
  | 'Cycling'
  | 'Driving'
  | 'Travelling'
  | 'Farming'
  | 'Sports'
  | 'Outdoor work'
  | 'Family'
  | 'General';

export type LocationType = 'Home' | 'Work' | 'College' | 'Farm' | 'Travel destination' | 'Current';

export interface SavedLocation {
  id: string;
  name: string;
  state: string;
  type: LocationType;
  lat: number;
  lon: number;
  isPrimary?: boolean;
}

export interface UserPreferences {
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  commuteWindow: {
    startHour: number; // e.g., 8 (8 AM) or 18 (6 PM)
    endHour: number;   // e.g., 9 or 19
  };
  activityWindow: {
    activity: ActivityType;
    startHour: number;
    endHour: number;
  };
  notificationsEnabled: boolean;
  rainThresholdSensitivity: 'low' | 'moderate' | 'high';
}

export interface UserProfile {
  id: string;
  name: string;
  units: TemperatureUnit;
  primaryActivity: ActivityType;
  selectedActivities: ActivityType[];
  locations: SavedLocation[];
  activeLocationId: string;
  preferences: UserPreferences;
  inferredPreferences: {
    frequentActivity?: ActivityType;
    checkedPeakHours?: number[];
    dislikedCardTypes?: string[];
    travelIntent?: boolean;
  };
}

export type WeatherConditionCode =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'light-rain'
  | 'heavy-rain'
  | 'thunderstorm'
  | 'fog'
  | 'drizzle';

export interface HourlyForecast {
  time: string; // e.g. "17:00"
  hour: number; // 0-23
  temp: number;
  feelsLike: number;
  rainProb: number; // 0-100
  rainfallMm: number;
  condition: WeatherConditionCode;
  conditionText: string;
  windSpeedKm: number;
  humidity: number;
  uvIndex: number;
  visibilityKm: number;
}

export interface DailyForecast {
  day: string; // "Today", "Tue", "Wed"
  date: string; // "Sep 28"
  tempMax: number;
  tempMin: number;
  condition: WeatherConditionCode;
  conditionText: string;
  rainProb: number;
  rainfallMm: number;
  summary: string;
}

export interface WeatherAlert {
  id: string;
  title: string;
  severity: 'yellow' | 'orange' | 'red';
  severityLabel: string;
  description: string;
  whatItMeans: string;
  officialSource: string;
  issuedAt: string;
  validUntil: string;
  isOfficial: boolean;
  area: string;
}

export interface WeatherData {
  city: string;
  state: string;
  country: string;
  temp: number;
  feelsLike: number;
  condition: WeatherConditionCode;
  conditionText: string;
  humidity: number;
  rainProb: number;
  rainfallMm: number;
  windSpeedKm: number;
  windDirection: string;
  uvIndex: number;
  uvLevel: string;
  visibilityKm: number;
  aqi: number;
  aqiStatus: 'Good' | 'Moderate' | 'Poor' | 'Unhealthy';
  sunrise: string;
  sunset: string;
  alerts: WeatherAlert[];
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  lastUpdated: string;
}

export type FactorStatus = 'optimal' | 'caution' | 'poor';

export interface ActivityFactor {
  name: string;
  value: string;
  status: FactorStatus;
  explanation: string;
}

export interface ActivitySuitability {
  activity: ActivityType;
  overallRating: 'Good' | 'Moderate' | 'Poor';
  score: number; // 0 - 100
  headline: string;
  summary: string;
  factors: ActivityFactor[];
  bestWindowToday?: string;
}

export interface TimeWindow {
  startTime: string; // "17:00"
  endTime: string;   // "18:00"
  startHour: number;
  endHour: number;
  rating: 'Good' | 'Moderate' | 'Poor';
  score: number;
  temperature: number;
  rainProbability: number;
  reason: string;
  isDryWindow?: boolean;
  isUserWindow?: boolean;
}

export interface EngineCard {
  id: string;
  type:
    | 'hero_weather'
    | 'top_recommendation'
    | 'official_alert'
    | 'activity_condition'
    | 'hourly_chart'
    | 'daily_forecast'
    | 'weather_metrics'
    | 'smart_time_window'
    | 'travel_packing'
    | 'farming_advisory'
    | 'ask_skyora_prompt';
  priority: number; // higher = higher priority
  size: 'full' | 'large' | 'medium' | 'small';
  slot: 'hero' | 'primary' | 'chart' | 'secondary' | 'sidebar';
  reason: string;
  feedbackImpact?: 'neutral' | 'boosted' | 'suppressed';
  data: any;
}

export interface CardFeedback {
  cardId: string;
  cardType: string;
  vote: 'up' | 'down';
  timestamp: number;
}

export interface UserInteraction {
  id: string;
  type: 'view_screen' | 'click_card' | 'switch_mode' | 'ask_question' | 'use_time_window';
  target: string;
  timestamp: number;
  hourOfDay: number;
}
