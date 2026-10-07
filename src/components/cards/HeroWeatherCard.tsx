import React from 'react';
import { EngineCard, TemperatureUnit } from '../../types';
import { WeatherArt } from '../ui/WeatherArt';
import { CardFeedbackButton } from '../ui/CardFeedbackButton';
import { MapPin, ArrowUp, ArrowDown } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useAuth } from '../../context/AuthContext';

interface HeroWeatherCardProps {
  card: EngineCard;
}

export const HeroWeatherCard: React.FC<HeroWeatherCardProps> = ({ card }) => {
  const { user } = useAuth();
  const { profile, simulatedHour, activePersonaId } = useAppStore();
  const { city, state, temp, feelsLike, condition, conditionText, rainfallMm, rainProb, high, low } = card.data;

  // Determine greeting based on simulated time
  let greeting = 'Good morning';
  if (simulatedHour >= 12 && simulatedHour < 17) greeting = 'Good afternoon';
  else if (simulatedHour >= 17 && simulatedHour < 21) greeting = 'Good evening';
  else if (simulatedHour >= 21 || simulatedHour < 5) greeting = 'Good night';

  const unitSymbol = profile.units === 'F' ? '°F' : '°C';
  const isDemoPersona = activePersonaId === 'aarav' || activePersonaId === 'neha' || activePersonaId === 'rahul';
  const displayName = isDemoPersona ? profile.name : (user?.user_metadata?.full_name || profile.name || 'User');
  const firstName = displayName.split(' ')[0];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden transition-all">
      {/* Top row: Greeting & Location */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{city}, {state}</span>
            <span aria-hidden="true">·</span>
            <span>{greeting}, {firstName}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            {conditionText}
          </h1>
        </div>

        <CardFeedbackButton
          cardId={card.id}
          cardType={card.type}
          reason={card.reason}
        />
      </div>

      {/* Main Meteorological Metrics Grid */}
      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-6">
        <div className="flex items-center gap-6">
          <WeatherArt condition={condition} size="hero" />
          <div>
            <div className="flex items-baseline">
              <span className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
                {temp}
              </span>
              <span className="text-2xl md:text-3xl font-medium text-slate-500 ml-1">
                {unitSymbol}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
              <span>Feels like <strong className="font-semibold text-slate-700 font-mono">{feelsLike}{unitSymbol}</strong></span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-0.5">
                <ArrowUp className="w-3 h-3 text-amber-600" /> {high}°
                <ArrowDown className="w-3 h-3 text-sky-600 ml-1" /> {low}°
              </span>
            </div>
          </div>
        </div>

        {/* Rain probability summary block */}
        <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100 min-w-[200px]">
          <div className="text-xs text-slate-500 font-medium">Precipitation Potential</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5 font-mono tabular-nums">
            {rainProb}%
          </div>
          <div className="text-xs text-slate-600 mt-1 leading-snug">
            {rainfallMm > 0 ? `${rainfallMm} mm accumulation expected` : 'No rainfall in current hour'}
          </div>
        </div>
      </div>
    </div>
  );
};
