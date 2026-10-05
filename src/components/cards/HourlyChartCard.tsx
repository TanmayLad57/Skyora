import React from 'react';
import { EngineCard } from '../../types';
import { CardFeedbackButton } from '../ui/CardFeedbackButton';
import { HourlyChart } from '../charts/HourlyChart';

interface HourlyChartCardProps {
  card: EngineCard;
}

export const HourlyChartCard: React.FC<HourlyChartCardProps> = ({ card }) => {
  const { hourly, userWindow, dryWindow, currentTemp, currentHour } = card.data;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs transition-all">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Hourly Weather & Precipitation Outlook
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            24-hour temperature curve with rain probability and contextual routine markers
          </p>
        </div>

        <CardFeedbackButton
          cardId={card.id}
          cardType={card.type}
          reason={card.reason}
        />
      </div>

      <HourlyChart
        hourly={hourly}
        userWindow={userWindow}
        dryWindow={dryWindow}
        currentTemp={currentTemp}
        currentHour={currentHour}
      />
    </div>
  );
};
