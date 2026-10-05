import { EngineCard, UserProfile, WeatherData, CardFeedback, ActivityType } from '../types';
import { generateTopRecommendation } from './recommendations';
import { evaluateSuitability } from './suitability';
import { findBestTimeWindows } from './timeFinder';
import { processAlerts } from './alerts';

/**
 * PURE JS Personalization Engine (No React dependencies).
 * Takes (profile, weather, now, feedback, mode) and returns
 * a strictly ranked array of card descriptors.
 */
export function rankCards(
  profile: UserProfile,
  weather: WeatherData,
  now: Date | number = 17, // either Date or hour number (0-23)
  feedback: CardFeedback[] = [],
  mode?: ActivityType
): EngineCard[] {
  const currentHour = typeof now === 'number' ? now : now instanceof Date ? now.getHours() : 17;
  const activeActivity = mode || profile.primaryActivity || 'General';

  const cards: EngineCard[] = [];

  // Helper to adjust priority based on user feedback
  const getFeedbackModifier = (cardType: string) => {
    let mod = 0;
    for (const f of feedback) {
      if (f.cardType === cardType) {
        if (f.vote === 'up') mod += 25;
        if (f.vote === 'down') mod -= 40;
      }
    }
    return mod;
  };

  // 1. HERO WEATHER CARD (Current temperature, city, condition illustration, feels-like)
  cards.push({
    id: 'hero-current-weather',
    type: 'hero_weather',
    priority: 800 + getFeedbackModifier('hero_weather'),
    size: 'large',
    slot: 'hero',
    reason: `Real-time meteorological conditions for ${weather.city}, ${weather.state}.`,
    data: {
      city: weather.city,
      state: weather.state,
      temp: weather.temp,
      feelsLike: weather.feelsLike,
      condition: weather.condition,
      conditionText: weather.conditionText,
      rainfallMm: weather.rainfallMm,
      rainProb: weather.rainProb,
      high: weather.daily[0]?.tempMax ?? weather.temp + 2,
      low: weather.daily[0]?.tempMin ?? weather.temp - 4,
      lastUpdated: weather.lastUpdated,
    },
  });

  // 2. TOP ACTIONABLE RECOMMENDATION (The core "What this means for you")
  const topRec = generateTopRecommendation(profile, weather, currentHour, activeActivity);
  cards.push({
    id: `rec-${topRec.id}`,
    type: 'top_recommendation',
    priority: 850 + getFeedbackModifier('top_recommendation'),
    size: 'large',
    slot: 'primary',
    reason: topRec.reason,
    data: topRec,
  });

  // 3. OFFICIAL IMD ALERTS (If severe, priority is bumped to 950+ to dominate slot)
  const processedAlerts = processAlerts(weather, profile, currentHour);
  const severeOfficialAlert = processedAlerts.find(
    (a) => a.type === 'official' && (a.severity === 'orange' || a.severity === 'red')
  );

  if (severeOfficialAlert) {
    cards.push({
      id: severeOfficialAlert.id,
      type: 'official_alert',
      priority: 950 + getFeedbackModifier('official_alert'),
      size: 'large',
      slot: 'primary',
      reason: 'Official National Weather Service safety warning has statutory priority.',
      data: severeOfficialAlert,
    });
  } else if (processedAlerts.length > 0 && processedAlerts[0].type === 'official') {
    cards.push({
      id: processedAlerts[0].id,
      type: 'official_alert',
      priority: 720 + getFeedbackModifier('official_alert'),
      size: 'medium',
      slot: 'secondary',
      reason: 'Official advisory active for your metropolitan region.',
      data: processedAlerts[0],
    });
  }

  // 4. ACTIVITY CONDITIONS CARD (Explainable rating: Good/Moderate/Poor + Factor breakdown)
  const suitability = evaluateSuitability(activeActivity, weather, currentHour);
  let activityCardPriority = 700;

  // Running with rain or driving with rain gets high priority
  if (activeActivity === 'Running' || activeActivity === 'Driving') {
    activityCardPriority = 760;
  }
  activityCardPriority += getFeedbackModifier('activity_condition');

  cards.push({
    id: `activity-${activeActivity.toLowerCase()}`,
    type: 'activity_condition',
    priority: activityCardPriority,
    size: 'medium',
    slot: 'primary',
    reason: `Evaluated for your ${activeActivity.toLowerCase()} profile based on current wind, temperature, rain chance, and road grip.`,
    data: suitability,
  });

  // 5. HOURLY CHART (Dual axis: temp + rain prob, with activity window and dry window highlighted)
  let chartPriority = 650;
  if (weather.rainProb >= 40) {
    // If rain is expected, chart showing the rain curve is critical
    chartPriority += 60;
  }
  chartPriority += getFeedbackModifier('hourly_chart');

  // Identify marked windows on chart
  const userActivityWindow = profile.preferences.activityWindow
    ? {
        label: `${activeActivity} routine`,
        startHour: profile.preferences.activityWindow.startHour,
        endHour: profile.preferences.activityWindow.endHour,
      }
    : { label: 'Usual evening activity', startHour: 18, endHour: 19 };

  const dryWindow = {
    label: 'Dry running window',
    startHour: 17,
    endHour: 18,
  };

  cards.push({
    id: 'chart-hourly-forecast',
    type: 'hourly_chart',
    priority: chartPriority,
    size: 'large',
    slot: 'chart',
    reason: 'Hourly progression showing exactly when incoming rain bands hit your area.',
    data: {
      hourly: weather.hourly,
      userWindow: userActivityWindow,
      dryWindow: weather.rainProb > 40 ? dryWindow : undefined,
      currentTemp: weather.temp,
      currentHour: currentHour,
    },
  });

  // 6. SMART TIME FINDER CARD (Surfaces optimal contiguous windows for active runner/cyclist)
  if (activeActivity === 'Running' || activeActivity === 'Cycling' || activeActivity === 'Sports') {
    const bestWindows = findBestTimeWindows(activeActivity, weather, 1, 18);
    const topDryWindow = bestWindows.find((w) => w.isDryWindow);

    let timeFinderPriority = 620;
    if (weather.rainProb >= 50) {
      timeFinderPriority = 780; // High priority when it is going to rain!
    }
    timeFinderPriority += getFeedbackModifier('smart_time_window');

    cards.push({
      id: 'smart-time-finder-card',
      type: 'smart_time_window',
      priority: timeFinderPriority,
      size: 'medium',
      slot: 'primary',
      reason: 'Calculated by scanning 24 hours of radar & temperature data for optimal training windows.',
      data: {
        activity: activeActivity,
        recommendedWindow: topDryWindow || bestWindows[0],
        allWindows: bestWindows,
      },
    });
  }

  // 7. TRAVEL PACKING ADVISORY (If user is in Travel mode or activity is Travelling)
  if (activeActivity === 'Travelling') {
    cards.push({
      id: 'travel-packing-advisory',
      type: 'travel_packing',
      priority: 790 + getFeedbackModifier('travel_packing'),
      size: 'medium',
      slot: 'primary',
      reason: 'Personalized packing checklist generated for your destination climate and active warnings.',
      data: {
        destination: weather.city,
        temp: weather.temp,
        rainProb: weather.rainProb,
        items: [
          { name: 'Water-resistant compact jacket', why: 'Sudden monsoon showers likely in late afternoon' },
          { name: 'Breathable quick-dry shirts', why: `High relative humidity (${weather.humidity}%)` },
          { name: 'Quick-dry shoes / backup socks', why: 'Wet pavements and localized water accumulation' },
          { name: 'Power bank in sealed pouch', why: 'Extended transit buffers during wet weather' },
        ],
      },
    });
  }

  // 8. FARMING ADVISORY (If Farming activity)
  if (activeActivity === 'Farming') {
    cards.push({
      id: 'farming-advisory-card',
      type: 'farming_advisory',
      priority: 785 + getFeedbackModifier('farming_advisory'),
      size: 'medium',
      slot: 'primary',
      reason: 'Agronomic guidance linking rainfall accumulation to soil water retention and crop spraying.',
      data: {
        soilMoistureForecast: 'Adequate to surplus',
        irrigationNeed: 'Hold all sprinkler/drip irrigation for next 24 hours',
        sprayRecommendation: 'Unfavorable until Wednesday morning due to wind drift and wash-off',
        accumulatedRainfallExpected: `${weather.rainfallMm + 18} mm`,
      },
    });
  }

  // 9. WEATHER METRICS READOUT (UV, Wind, Air Quality, Humidity, Visibility)
  cards.push({
    id: 'weather-metrics-readout',
    type: 'weather_metrics',
    priority: 550 + getFeedbackModifier('weather_metrics'),
    size: 'medium',
    slot: 'secondary',
    reason: 'Essential environmental metrics contextualized for your respiratory and skin safety.',
    data: {
      aqi: weather.aqi,
      aqiStatus: weather.aqiStatus,
      uvIndex: weather.uvIndex,
      uvLevel: weather.uvLevel,
      windSpeedKm: weather.windSpeedKm,
      windDirection: weather.windDirection,
      humidity: weather.humidity,
      visibilityKm: weather.visibilityKm,
    },
  });

  // 10. DAILY 7-DAY FORECAST
  cards.push({
    id: 'daily-7-day-forecast',
    type: 'daily_forecast',
    priority: 520 + getFeedbackModifier('daily_forecast'),
    size: 'large',
    slot: 'secondary',
    reason: 'Week-ahead meteorological trend to help schedule upcoming travel and routines.',
    data: {
      days: weather.daily,
    },
  });

  // 11. ASK SKYORA ASSISTANT QUICK PROMPT CARD
  cards.push({
    id: 'ask-skyora-prompt-card',
    type: 'ask_skyora_prompt',
    priority: 500 + getFeedbackModifier('ask_skyora_prompt'),
    size: 'medium',
    slot: 'sidebar',
    reason: 'Quick contextual queries relevant to your current activity and weather conditions.',
    data: {
      suggestedQuestions:
        activeActivity === 'Running'
          ? [
              'Can I go running at 7 PM today?',
              'When is the driest running window in Mumbai?',
              'What running shoes should I wear today?',
            ]
          : activeActivity === 'Driving'
          ? [
              'Will it rain during my 6 PM commute?',
              'Which roads in Mumbai typically flood during this alert?',
              'Is visibility safe for expressway driving?',
            ]
          : activeActivity === 'Travelling'
          ? [
              'Will it rain at my destination in Delhi?',
              'What should I pack for this trip?',
              'Are flight delays expected due to thunderstorms?',
            ]
          : [
              'Will it rain in my neighborhood tonight?',
              'Why did I receive this weather alert?',
              'What is the best time for outdoor chores today?',
            ],
    },
  });

  // Sort strictly by priority descending
  cards.sort((a, b) => b.priority - a.priority);

  return cards;
}
