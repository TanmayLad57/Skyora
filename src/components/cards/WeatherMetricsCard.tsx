import React from 'react';
import { EngineCard } from '../../types';
import { CardFeedbackButton } from '../ui/CardFeedbackButton';
import { Wind, Sun, Activity, Droplets, Eye } from 'lucide-react';

interface WeatherMetricsCardProps {
  card: EngineCard;
}

export const WeatherMetricsCard: React.FC<WeatherMetricsCardProps> = ({ card }) => {
  const { aqi, aqiStatus, uvIndex, uvLevel, windSpeedKm, windDirection, humidity, visibilityKm } = card.data;

  const aqiColor = {
    Good: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    Moderate: 'text-amber-700 bg-amber-50 border-amber-200',
    Poor: 'text-orange-700 bg-orange-50 border-orange-200',
    Unhealthy: 'text-rose-700 bg-rose-50 border-rose-200',
  }[aqiStatus as 'Good' | 'Moderate' | 'Poor' | 'Unhealthy'] || 'text-slate-700 bg-slate-50 border-slate-200';

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs transition-all">
      <div className="flex items-center justify-between gap-4 mb-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Atmospheric Indicators
        </h2>

        <CardFeedbackButton
          cardId={card.id}
          cardType={card.type}
          reason={card.reason}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Air Quality */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span>Air Quality</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              {aqi}
            </span>
            <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium border ${aqiColor}`}>
              {aqiStatus}
            </span>
          </div>
        </div>

        {/* UV Index */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>UV Radiation</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              {uvIndex}
            </span>
            <span className="text-xs text-slate-600 font-medium">
              {uvLevel}
            </span>
          </div>
        </div>

        {/* Wind */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Wind className="w-3.5 h-3.5 text-sky-500" />
            <span>Wind Flow</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              {windSpeedKm}
            </span>
            <span className="text-xs text-slate-500">km/h {windDirection}</span>
          </div>
        </div>

        {/* Humidity & Visibility */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            <span>Humidity / Vis</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              {humidity}%
            </span>
            <span className="text-xs text-slate-500 font-mono">{visibilityKm} km</span>
          </div>
        </div>
      </div>
    </div>
  );
};
