import { WeatherData, UserProfile, ActivityType } from '../types';

export interface ActionableRecommendation {
  id: string;
  headline: string;
  subtext: string;
  actionText: string;
  actionType: 'schedule' | 'navigate' | 'pack' | 'alert_details' | 'view_chart';
  contextTag: string; // e.g. "Running window", "Commute advisory"
  dryWindowNotice?: string;
  reason: string;
}

export function generateTopRecommendation(
  profile: UserProfile,
  weather: WeatherData,
  nowHour: number = 17,
  activeMode?: ActivityType
): ActionableRecommendation {
  const activity = activeMode || profile.primaryActivity || 'General';
  const rainProb = weather.rainProb;
  const temp = weather.temp;

  // 1. RUNNING
  if (activity === 'Running') {
    // Check if rain starts at 18:00
    const rainAt6 = weather.hourly.find((h) => h.hour === 18)?.rainProb ?? rainProb;
    const rainAt5 = weather.hourly.find((h) => h.hour === 17)?.rainProb ?? 25;

    if (nowHour >= 16 && nowHour <= 19 && rainAt6 >= 60 && rainAt5 <= 35) {
      return {
        id: 'rec-runner-dry-window',
        headline: 'Heavy rain expected after 6:00 PM in Mumbai',
        subtext: 'Your regular 6:00 PM run falls right into the incoming monsoon rain band (75% probability). The 5:00–6:00 PM window remains dry with 28°C and good asphalt grip.',
        actionText: 'Use 5:00 PM – 6:00 PM Window',
        actionType: 'schedule',
        contextTag: 'Dry Running Window',
        dryWindowNotice: '17:00 – 18:00 (25% rain vs 75% at 18:00)',
        reason: 'Recommended because you usually run in the evening and rain spikes from 18:00 onwards.',
      };
    }

    if (rainProb > 50) {
      return {
        id: 'rec-runner-rain',
        headline: 'Showers throughout the evening',
        subtext: `Current rain probability is ${rainProb}%. Pavements will be slippery. If running outdoors, wear reflective shoes and avoid open promenades.`,
        actionText: 'Find Tomorrow Morning Slot',
        actionType: 'schedule',
        contextTag: 'Running Advisory',
        reason: 'Generated for runner profile with elevated precipitation forecast.',
      };
    }

    return {
      id: 'rec-runner-clear',
      headline: 'Great conditions for an outdoor run',
      subtext: `Moderate temperature (${temp}°C) and mild breezes (${weather.windSpeedKm} km/h). Air quality is ${weather.aqiStatus.toLowerCase()} (AQI ${weather.aqi}).`,
      actionText: 'Plan 45-min Run Route',
      actionType: 'schedule',
      contextTag: 'Running Advisory',
      reason: 'Standard optimal conditions matched to your fitness profile.',
    };
  }

  // 2. DRIVING / COMMUTER
  if (activity === 'Driving') {
    const commuteStart = profile.preferences.commuteWindow?.startHour ?? 18;
    const rainDuringCommute = weather.hourly.find((h) => h.hour === commuteStart)?.rainProb ?? rainProb;

    if (rainDuringCommute >= 60) {
      return {
        id: 'rec-commuter-rain',
        headline: 'Rain arriving around 6:15 PM across your route',
        subtext: 'Moderate to heavy rain will reduce lane visibility and create bottleneck delays on major junctions and flyovers.',
        actionText: 'Leave by 5:45 PM to Avoid Delay',
        actionType: 'alert_details',
        contextTag: 'Evening Commute Alert',
        dryWindowNotice: 'Dry departure window: Before 18:00',
        reason: 'Shown because your saved commute window is 6:00–7:00 PM and heavy showers start at 18:15.',
      };
    }

    return {
      id: 'rec-commuter-clear',
      headline: 'Smooth road conditions for your commute',
      subtext: `Visibility is ${weather.visibilityKm} km and surface traction is optimal. No transit-impacting weather warnings active.`,
      actionText: 'View Traffic Weather Details',
      actionType: 'view_chart',
      contextTag: 'Commute Overview',
      reason: 'Evaluated against your daily transit routine.',
    };
  }

  // 3. TRAVELLING
  if (activity === 'Travelling') {
    if (weather.city === 'Delhi' || weather.alerts.length > 0) {
      return {
        id: 'rec-travel-delhi',
        headline: 'Thundershowers and gusty winds at your destination',
        subtext: 'Delhi has an active Yellow Watch with wind gusts up to 35 km/h and 32°C humidity. Local cab delays expected near terminals.',
        actionText: 'Pack Rain Gear & Check Delays',
        actionType: 'pack',
        contextTag: 'Travel Intelligence',
        reason: 'Customized because Delhi is marked as your travel destination and active weather warnings are in effect.',
      };
    }

    return {
      id: 'rec-travel-general',
      headline: `Destination weather: ${weather.conditionText.toLowerCase()}`,
      subtext: `Temperatures reaching ${weather.temp}°C with comfortable humidity (${weather.humidity}%). Ideal for exploring.`,
      actionText: 'View 7-Day Destination Outlook',
      actionType: 'view_chart',
      contextTag: 'Travel Advisory',
      reason: 'Derived from your saved destination schedule.',
    };
  }

  // 4. FARMING
  if (activity === 'Farming') {
    return {
      id: 'rec-farming',
      headline: 'Heavy monsoon spells expected: Hold irrigation',
      subtext: 'Incoming rain bands will provide 15–25mm of natural soil moisture over the next 18 hours. Avoid pesticide spraying due to wind gusts.',
      actionText: 'View Soil Moisture & Spraying Timers',
      actionType: 'view_chart',
      contextTag: 'Agricultural Advisory',
      reason: 'Generated based on agrarian profile and precipitation threshold.',
    };
  }

  // 5. GENERAL DEFAULT
  return {
    id: 'rec-general',
    headline: weather.rainProb > 50 ? 'Keep an umbrella handy today' : 'Pleasant day for outdoor plans',
    subtext: weather.rainProb > 50
      ? `Rain probability peaks at ${weather.rainProb}% in the evening. Temperatures remain warm at ${temp}°C.`
      : `Expect ${weather.conditionText.toLowerCase()} with gentle breezes and ${weather.aqiStatus.toLowerCase()} air quality.`,
    actionText: 'Check Hourly Weather Timeline',
    actionType: 'view_chart',
    contextTag: 'Daily Outlook',
    reason: 'Standard daily summary matched to current weather in your area.',
  };
}
