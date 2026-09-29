import { UserProfile, WeatherData, ActivityType } from '../types';

export interface EngineRule {
  id: string;
  name: string;
  description: string;
  applies: (profile: UserProfile, weather: WeatherData, nowHour: number, mode?: ActivityType) => boolean;
  priorityBoost: number;
  targetCardType: string;
}

export const ENGINE_RULES: EngineRule[] = [
  {
    id: 'rule-official-severe-alert',
    name: 'Official Meteorological Severe Alert Override',
    description: 'When IMD issues an Orange or Red severe weather warning, promote official warning to the top regardless of user activity.',
    applies: (_profile, weather) => weather.alerts.some((a) => a.severity === 'orange' || a.severity === 'red'),
    priorityBoost: 950,
    targetCardType: 'official_alert',
  },
  {
    id: 'rule-runner-evening-rain',
    name: 'Runner Evening Rain Preemption',
    description: 'When an active runner faces rain probability >= 60% during their workout window, surface the dry window card and running conditions prominently.',
    applies: (profile, weather, nowHour, mode) => {
      const act = mode || profile.primaryActivity;
      return (
        act === 'Running' &&
        nowHour >= 15 &&
        nowHour <= 20 &&
        weather.hourly.some((h) => h.hour >= 18 && h.rainProb >= 60)
      );
    },
    priorityBoost: 400,
    targetCardType: 'smart_time_window',
  },
  {
    id: 'rule-commuter-rain-traffic',
    name: 'Commuter Highway Visibility & Delay Warning',
    description: 'When driving or commuting during rain with lowered visibility, highlight the driving conditions card.',
    applies: (profile, weather, _nowHour, mode) => {
      const act = mode || profile.primaryActivity;
      return act === 'Driving' && (weather.rainProb >= 50 || weather.visibilityKm < 7);
    },
    priorityBoost: 450,
    targetCardType: 'activity_condition',
  },
  {
    id: 'rule-travel-destination',
    name: 'Travel Destination Hero & Luggage Advisor',
    description: 'When in travel mode, emphasize destination weather conditions and luggage packing suggestions.',
    applies: (profile, _weather, _nowHour, mode) => {
      const act = mode || profile.primaryActivity;
      return act === 'Travelling';
    },
    priorityBoost: 500,
    targetCardType: 'travel_packing',
  },
  {
    id: 'rule-farming-precipitation',
    name: 'Agricultural Soil Moisture & Spraying Advisory',
    description: 'When the user has an agrarian profile, surface precipitation totals and crop spraying suitability.',
    applies: (profile, _weather, _nowHour, mode) => {
      const act = mode || profile.primaryActivity;
      return act === 'Farming';
    },
    priorityBoost: 480,
    targetCardType: 'farming_advisory',
  },
];
