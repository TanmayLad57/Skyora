import { UserProfile, WeatherData } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'skyora';
  text: string;
  timestamp: string;
  contextSources?: string[];
  suggestedAction?: {
    label: string;
    path: string;
  };
}

export function generateSkyoraResponse(
  query: string,
  profile: UserProfile,
  weather: WeatherData,
  currentHour: number = 17
): ChatMessage {
  const q = query.toLowerCase();
  const act = profile.primaryActivity;
  const city = weather.city;

  let answer = '';
  let contextSources: string[] = ['IMD Regional Radar', `${city} Hourly Forecast`];
  let suggestedAction: { label: string; path: string } | undefined;

  if (q.includes('running at 7') || q.includes('run at 7') || (q.includes('running') && q.includes('7'))) {
    const rainAt7 = weather.hourly.find((h) => h.hour === 19)?.rainProb ?? 75;
    answer = `I wouldn't recommend running outdoors at 7:00 PM in ${city}. Heavy rain bands are forecast with a ${rainAt7}% chance of continuous rainfall and wet pavements. 

Instead, the **5:00 PM to 6:00 PM window** is relatively dry (only 25% rain probability) with comfortable 28°C temperatures. If you can head out earlier, that's your best opportunity today. Otherwise, an indoor treadmill or strength session will be much safer!`;
    contextSources.push('Running Suitability Scorer', 'Dry Window Detector');
    suggestedAction = { label: 'Check 5:00–6:00 PM Window', path: '/time-finder' };
  } else if (q.includes('driest running window') || (q.includes('best time') && q.includes('run'))) {
    answer = `The optimal dry window for running in ${city} today is **between 5:00 PM and 6:00 PM (17:00–18:00)**. 

Rain probability drops to 25% during this one-hour gap before heavy monsoon clouds converge after 6:00 PM (spiking up to 75%). Winds are gentle at 12 km/h and road grip remains good.`;
    contextSources.push('Smart Time Finder Engine');
    suggestedAction = { label: 'View Today\'s Timetable', path: '/time-finder' };
  } else if (q.includes('commute') || q.includes('journey') || q.includes('traffic') || q.includes('driving')) {
    const commuteStart = profile.preferences.commuteWindow?.startHour ?? 18;
    answer = `Yes, expect rain during your evening journey. Showers are expected to intensify right around **6:15 PM** in ${city}. 

With current coastal warnings, low-lying arterial corridors and flyovers may experience slowed traffic and reduced braking visibility. **My recommendation:** If your schedule permits, depart by **5:45 PM** to stay ahead of the heaviest downpours, or keep an extra 20–25 minutes buffer.`;
    contextSources.push('Driving Traction Index', 'Commuter Preference Rule');
    suggestedAction = { label: 'View Commute Conditions', path: '/activities' };
  } else if (q.includes('alert') || q.includes('warning')) {
    if (weather.alerts.length > 0) {
      const alert = weather.alerts[0];
      answer = `You received the **${alert.title}** (${alert.severityLabel}) because the India Meteorological Department detected moderate to intense cloud clusters over coastal Konkan. 

**What this means for you:** Localized waterlogging on road junctions, slippery cycling and running tracks, and slower transit after sunset. The warning is active until tomorrow morning.`;
      contextSources.push('Official IMD Alert Stream', 'Area Impact Mapping');
      suggestedAction = { label: 'View Official Alert Details', path: '/alerts' };
    } else {
      answer = `There are currently no active severe weather alerts for ${city}. Atmospheric conditions are stable, with normal seasonal patterns prevailing.`;
    }
  } else if (q.includes('pack') || q.includes('carry')) {
    if (weather.city === 'Delhi') {
      answer = `For your travels in Delhi right now, here is your customized packing checklist:
1. **Lightweight waterproof jacket or poncho** (intermittent thundershowers active).
2. **Breathable cotton or linen clothes** (warm 32°C with high humidity).
3. **Water-resistant shoes** to handle puddles near terminals.
4. **Compact umbrella & ziplock phone pouch** for sudden afternoon downpours.`;
      contextSources.push('Travel Destination Engine', 'Delhi Yellow Alert');
      suggestedAction = { label: 'View Travel Outlook', path: '/weather-details' };
    } else {
      answer = `For today in ${city}:
- **Essential:** Sturdy umbrella or rain shell (evening rain probability is ${weather.rainProb}%).
- **Footwear:** Water-resistant sneakers or footwear with anti-slip soles.
- **Hydration:** Reusable water bottle, as humidity is high at ${weather.humidity}%.`;
      contextSources.push('Daily Recommendation Engine');
    }
  } else if (q.includes('why') && q.includes('see')) {
    answer = `Your Skyora homepage is tailored to you based on three factors:
1. **Your Profile:** You told us your primary focus is **${act}** and you commute around 6 PM.
2. **Real-time Radar:** The IMD forecast shows a rain band hitting right during normal workout hours.
3. **Your Feedback:** Cards you upvote get higher priority, while downvoted cards are minimized.`;
    contextSources.push('Personalization Engine Weight Rules');
    suggestedAction = { label: 'Review My Profile & Preferences', path: '/profile' };
  } else {
    answer = `Based on the latest weather data for **${city}**, current temperature is **${weather.temp}°C** (feels like ${weather.feelsLike}°C) with **${weather.rainProb}% rain chance** and **${weather.conditionText.toLowerCase()}**.

For your **${act}** profile, conditions are currently ranked as **Moderate**. Is there a specific time or activity you'd like me to analyze for you?`;
    contextSources.push('Current Meteorology Model', 'Personal Context Layer');
  }

  return {
    id: `msg-${Date.now()}`,
    sender: 'skyora',
    text: answer,
    timestamp: 'Just now',
    contextSources,
    suggestedAction,
  };
}
