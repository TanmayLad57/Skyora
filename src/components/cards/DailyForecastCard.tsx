import React from 'react';
import { EngineCard, DailyForecast } from '../../types';
import { CardFeedbackButton } from '../ui/CardFeedbackButton';
import { WeatherArt } from '../ui/WeatherArt';

interface DailyForecastCardProps {
  card: EngineCard;
}

export const DailyForecastCard: React.FC<DailyForecastCardProps> = ({ card }) => {
  const days: DailyForecast[] = card.data.days || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs transition-all">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            7-Day Extended Outlook
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Plan ahead with daily rain probability and anticipated seasonal trends
          </p>
        </div>

        <CardFeedbackButton
          cardId={card.id}
          cardType={card.type}
          reason={card.reason}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
        {days.map((day, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border text-center transition-all ${
              idx === 0
                ? 'bg-amber-50/50 border-amber-200'
                : 'bg-slate-50 border-slate-100 hover:bg-slate-100/60'
            }`}
          >
            <div className="text-xs font-semibold text-slate-800">
              {day.day}
            </div>
            <div className="text-[10px] text-slate-500 mb-2">
              {day.date}
            </div>

            <div className="flex justify-center my-1">
              <WeatherArt condition={day.condition} size="sm" />
            </div>

            <div className="mt-2 text-xs font-mono font-bold text-slate-900 tabular-nums">
              {day.tempMax}°{' '}
              <span className="text-slate-400 font-normal">{day.tempMin}°</span>
            </div>

            <div className="text-[10px] text-sky-700 font-mono mt-1 font-medium">
              {day.rainProb > 0 ? `${day.rainProb}% rain` : 'Dry'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
