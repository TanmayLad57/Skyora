import React, { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getWeatherData } from '../services/weather';
import { rankCards } from '../engine/rank';
import { EngineCard } from '../types';

// Card Renderers
import { HeroWeatherCard } from '../components/cards/HeroWeatherCard';
import { TopRecommendationCard } from '../components/cards/TopRecommendationCard';
import { OfficialAlertCard } from '../components/cards/OfficialAlertCard';
import { ActivityConditionCard } from '../components/cards/ActivityConditionCard';
import { HourlyChartCard } from '../components/cards/HourlyChartCard';
import { DailyForecastCard } from '../components/cards/DailyForecastCard';
import { WeatherMetricsCard } from '../components/cards/WeatherMetricsCard';
import { SmartTimeFinderCard } from '../components/cards/SmartTimeFinderCard';
import { TravelPackingCard } from '../components/cards/TravelPackingCard';
import { FarmingAdvisoryCard } from '../components/cards/FarmingAdvisoryCard';
import { AskSkyoraPromptCard } from '../components/cards/AskSkyoraPromptCard';

export const HomePage: React.FC = () => {
  const {
    profile,
    simulatedHour,
    activeModeOverride,
    feedbacks,
  } = useAppStore();

  // Find active location name
  const activeLocation =
    profile.locations.find((l) => l.id === profile.activeLocationId) ||
    profile.locations[0] || { name: 'Mumbai', state: 'Maharashtra' };

  // Fetch meteorological data through service (with unit & simulated hour awareness)
  const weather = useMemo(() => {
    return getWeatherData(activeLocation.name, simulatedHour, profile.units);
  }, [activeLocation.name, simulatedHour, profile.units]);

  // PURE JS ENGINE: takes (profile, weather, now, feedback, mode) and returns ranked card descriptors
  const rankedCards: EngineCard[] = useMemo(() => {
    return rankCards(
      profile,
      weather,
      simulatedHour,
      feedbacks,
      activeModeOverride
    );
  }, [profile, weather, simulatedHour, feedbacks, activeModeOverride]);

  // Map each engine card descriptor to its component
  const renderCard = (card: EngineCard) => {
    switch (card.type) {
      case 'hero_weather':
        return <HeroWeatherCard key={card.id} card={card} />;
      case 'top_recommendation':
        return <TopRecommendationCard key={card.id} card={card} />;
      case 'official_alert':
        return <OfficialAlertCard key={card.id} card={card} />;
      case 'activity_condition':
        return <ActivityConditionCard key={card.id} card={card} />;
      case 'hourly_chart':
        return <HourlyChartCard key={card.id} card={card} />;
      case 'daily_forecast':
        return <DailyForecastCard key={card.id} card={card} />;
      case 'weather_metrics':
        return <WeatherMetricsCard key={card.id} card={card} />;
      case 'smart_time_window':
        return <SmartTimeFinderCard key={card.id} card={card} />;
      case 'travel_packing':
        return <TravelPackingCard key={card.id} card={card} />;
      case 'farming_advisory':
        return <FarmingAdvisoryCard key={card.id} card={card} />;
      case 'ask_skyora_prompt':
        return <AskSkyoraPromptCard key={card.id} card={card} />;
      default:
        return null;
    }
  };

  // Group cards for the exact presentation sequence requested:
  // 1. Official Alerts (if present, at the very top)
  const officialAlertCards = rankedCards.filter((c) => c.type === 'official_alert');

  // 2. Running Advisory (Top Recommendation) + Activity Conditions (Grouped together)
  const recommendationCards = rankedCards.filter((c) => c.type === 'top_recommendation');
  const activityConditionCards = rankedCards.filter((c) => c.type === 'activity_condition');

  // 3. Smart Time Finder / Context Advisories
  const timeFinderCards = rankedCards.filter(
    (c) =>
      c.type === 'smart_time_window' ||
      c.type === 'travel_packing' ||
      c.type === 'farming_advisory'
  );

  // 4. Hero weather summary card (Location, greeting, condition, temperature, precipitation potential)
  const heroCards = rankedCards.filter((c) => c.type === 'hero_weather');

  // 5. Hourly Chart Card
  const chartCards = rankedCards.filter((c) => c.type === 'hourly_chart');

  // 6. Atmospheric Indicators + 7-Day Outlook + Ask Skyora Panel (Relative layout preserved)
  const secondaryCards = rankedCards.filter(
    (c) => c.type === 'weather_metrics' || c.type === 'daily_forecast'
  );
  const sidebarCards = rankedCards.filter((c) => c.type === 'ask_skyora_prompt');

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. OFFICIAL ALERTS (Severe weather warnings remain at the very top) */}
      {officialAlertCards.length > 0 && (
        <section className="space-y-4">
          {officialAlertCards.map(renderCard)}
        </section>
      )}

      {/* 2. TOP RECOMMENDATION + ACTIVITY CONDITIONS (Grouped together) */}
      {(recommendationCards.length > 0 || activityConditionCards.length > 0) && (
        <section className="space-y-4">
          {recommendationCards.map(renderCard)}
          {activityConditionCards.map(renderCard)}
        </section>
      )}

      {/* 3. SMART TIME FINDER CARD */}
      {timeFinderCards.length > 0 && (
        <section className="space-y-4">
          {timeFinderCards.map(renderCard)}
        </section>
      )}

      {/* 4. HERO WEATHER SUMMARY CARD */}
      {heroCards.length > 0 && (
        <section className="space-y-4">
          {heroCards.map(renderCard)}
        </section>
      )}

      {/* 5. HOURLY CHART CARD */}
      {chartCards.length > 0 && (
        <section className="space-y-4">
          {chartCards.map(renderCard)}
        </section>
      )}

      {/* 6. ATMOSPHERIC INDICATORS + 7-DAY OUTLOOK + ASK SKYORA (2-Column Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {secondaryCards.map(renderCard)}
        </div>

        <div className="space-y-6">
          {sidebarCards.map(renderCard)}
          
          {/* Engine transparency badge */}
          <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200/80 text-xs text-slate-600">
            <div className="font-semibold text-slate-800 mb-1">
              Personalization Engine Active
            </div>
            <p className="leading-relaxed text-[11px] text-slate-500">
              Homepage composition is dynamically generated from your active activity ({activeModeOverride || profile.primaryActivity}), saved routine windows, and incoming radar alerts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
