import { WeatherAlert, WeatherData, UserProfile, ActivityType } from '../types';

export interface PersonalizedAlert {
  id: string;
  type: 'official' | 'personal_impact';
  severity: 'yellow' | 'orange' | 'red' | 'info';
  title: string;
  officialSource?: string;
  originalWarning?: string;
  whatThisMeans: string;
  actionRecommendation: string;
  relevantActivity?: ActivityType;
  timeWindow?: string;
}

export function processAlerts(
  weather: WeatherData,
  profile: UserProfile,
  simulatedHour: number = 17
): PersonalizedAlert[] {
  const result: PersonalizedAlert[] = [];

  // 1. Process Official Meteorological Warnings (always top priority)
  if (weather.alerts && weather.alerts.length > 0) {
    for (const alert of weather.alerts) {
      result.push({
        id: `alert-${alert.id}`,
        type: 'official',
        severity: alert.severity,
        title: alert.title,
        officialSource: alert.officialSource,
        originalWarning: alert.description,
        whatThisMeans: alert.whatItMeans,
        actionRecommendation:
          alert.severity === 'orange' || alert.severity === 'red'
            ? 'Avoid non-essential transit through waterlogging-prone corridors. Shift evening outdoor workouts indoors.'
            : 'Stay prepared with wet-weather gear and monitor live cloud movement before departing.',
      });
    }
  }

  // 2. Personal Context Alert: Commuter rain overlap
  const isCommuter =
    profile.primaryActivity === 'Driving' ||
    profile.selectedActivities.includes('Driving') ||
    profile.preferences.commuteWindow;

  const commuteStart = profile.preferences.commuteWindow?.startHour ?? 18;
  const commuteEnd = profile.preferences.commuteWindow?.endHour ?? 19;

  // Check rain during commute window
  const commuteHourly = weather.hourly.filter(
    (h) => h.hour >= commuteStart && h.hour <= commuteEnd
  );
  const maxCommuteRain = Math.max(...commuteHourly.map((h) => h.rainProb), 0);

  if (isCommuter && maxCommuteRain >= 60) {
    result.push({
      id: 'personal-commute-rain',
      type: 'personal_impact',
      severity: 'orange',
      title: `Rain during your ${commuteStart}:00–${commuteEnd}:00 commute`,
      whatThisMeans: `Heavy rain bands (${maxCommuteRain}% probability) will hit your route starting around ${commuteStart}:15. Wet road conditions and lowered visibility will slow junction movement.`,
      actionRecommendation: 'Leave 20 minutes earlier or consider taking the metro to bypass surface congestion.',
      relevantActivity: 'Driving',
      timeWindow: `${commuteStart}:00 - ${commuteEnd}:00`,
    });
  }

  // 3. Personal Context Alert: Runner evening rain
  const isRunner =
    profile.primaryActivity === 'Running' ||
    profile.selectedActivities.includes('Running');

  const runStart = profile.preferences.activityWindow?.startHour ?? 18;
  const runHourly = weather.hourly.find((h) => h.hour === runStart);

  if (isRunner && runHourly && runHourly.rainProb >= 60) {
    result.push({
      id: 'personal-runner-rain',
      type: 'personal_impact',
      severity: 'yellow',
      title: `Rain forecast during your regular ${runStart}:00 run`,
      whatThisMeans: `Rain chance jumps to ${runHourly.rainProb}% with ${runHourly.rainfallMm}mm/hr intensity after 18:00. Pavements will be slick.`,
      actionRecommendation: 'Move your run forward to the 17:00–18:00 dry slot or switch to treadmill recovery.',
      relevantActivity: 'Running',
      timeWindow: `${runStart}:00 - ${runStart + 1}:00`,
    });
  }

  // 4. Travel Destination Alert
  const isTravel =
    profile.primaryActivity === 'Travelling' ||
    profile.selectedActivities.includes('Travelling');

  if (isTravel && weather.city === 'Delhi') {
    result.push({
      id: 'personal-travel-delhi',
      type: 'personal_impact',
      severity: 'yellow',
      title: 'Monsoon thundershowers active at your destination',
      whatThisMeans: 'Delhi is experiencing intermittent thundershowers with gusty winds up to 35 km/h. Airport approach roads may see temporary cab surges.',
      actionRecommendation: 'Pack a waterproof backpack cover, breathable layers, and keep flight status notifications on.',
      relevantActivity: 'Travelling',
    });
  }

  return result;
}
