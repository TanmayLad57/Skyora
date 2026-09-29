import { TimeWindow, ActivityType, WeatherData } from '../types';

export function findBestTimeWindows(
  activity: ActivityType,
  weather: WeatherData,
  durationHours: number = 1,
  userTargetStartHour: number = 17
): TimeWindow[] {
  const hourly = weather.hourly;
  if (!hourly || hourly.length === 0) return [];

  const candidates: TimeWindow[] = [];

  // Scan across the 24 hours for contiguous blocks of `durationHours`
  for (let startH = 5; startH <= 22 - durationHours; startH++) {
    const endH = startH + durationHours;
    const slice = hourly.slice(startH, endH);

    const avgTemp = Math.round(slice.reduce((acc, h) => acc + h.temp, 0) / slice.length);
    const maxRainProb = Math.max(...slice.map((h) => h.rainProb));
    const avgWind = Math.round(slice.reduce((acc, h) => acc + h.windSpeedKm, 0) / slice.length);

    let score = 90;

    // Rain penalty
    if (maxRainProb > 60) score -= 45;
    else if (maxRainProb > 30) score -= 25;
    else if (maxRainProb > 15) score -= 10;

    // Heat penalty for daytime cardio
    if (activity === 'Running' || activity === 'Cycling' || activity === 'Sports') {
      if (avgTemp > 31) score -= 25;
      else if (avgTemp > 28) score -= 10;
      else if (avgTemp >= 20 && avgTemp <= 26) score += 5;

      // Prefer non-noon hours
      if (startH >= 11 && startH <= 15) score -= 20;
    }

    // Commuter driving preferences
    if (activity === 'Driving') {
      if (maxRainProb > 50) score -= 30; // heavy rain commute is worse
    }

    score = Math.max(15, Math.min(100, score));

    let rating: 'Good' | 'Moderate' | 'Poor' = 'Good';
    if (score < 50) rating = 'Poor';
    else if (score < 75) rating = 'Moderate';

    let reason = '';
    const isDry = maxRainProb <= 30;
    const isUserWindow = Math.abs(startH - userTargetStartHour) <= 1;

    if (maxRainProb <= 25) {
      reason = `Dry window (${maxRainProb}% rain), comfortable ${avgTemp}°C and steady breeze.`;
    } else if (maxRainProb <= 50) {
      reason = `Moderate rain probability (${maxRainProb}%); paved surfaces should remain clear.`;
    } else {
      reason = `Rain likely (${maxRainProb}%); high chance of wet roads.`;
    }

    const startTimeStr = `${startH.toString().padStart(2, '0')}:00`;
    const endTimeStr = `${endH.toString().padStart(2, '0')}:00`;

    candidates.push({
      startTime: startTimeStr,
      endTime: endTimeStr,
      startHour: startH,
      endHour: endH,
      rating,
      score,
      temperature: avgTemp,
      rainProbability: maxRainProb,
      reason,
      isDryWindow: isDry,
      isUserWindow,
    });
  }

  // Sort candidates by score descending, but prioritize windows close to user target hour if score is good
  candidates.sort((a, b) => {
    // If one is the user's preferred time and score is decent, give subtle bump
    const aDist = Math.abs(a.startHour - userTargetStartHour);
    const bDist = Math.abs(b.startHour - userTargetStartHour);

    const adjustedScoreA = a.score - aDist * 2;
    const adjustedScoreB = b.score - bDist * 2;
    return adjustedScoreB - adjustedScoreA;
  });

  return candidates.slice(0, 3);
}
