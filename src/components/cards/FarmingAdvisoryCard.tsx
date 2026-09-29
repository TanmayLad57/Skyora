import React from 'react';
import { EngineCard } from '../../types';
import { CardFeedbackButton } from '../ui/CardFeedbackButton';
import { Sprout, Droplets, Wind, AlertCircle } from 'lucide-react';

interface FarmingAdvisoryCardProps {
  card: EngineCard;
}

export const FarmingAdvisoryCard: React.FC<FarmingAdvisoryCardProps> = ({ card }) => {
  const { soilMoistureForecast, irrigationNeed, sprayRecommendation, accumulatedRainfallExpected } = card.data;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs transition-all">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Sprout className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Agricultural Advisory & Irrigation Guidance
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Field meteorological parameters tailored to seasonal sowing and spraying
            </p>
          </div>
        </div>

        <CardFeedbackButton
          cardId={card.id}
          cardType={card.type}
          reason={card.reason}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
        <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900 mb-1">
            <Droplets className="w-3.5 h-3.5 text-emerald-600" />
            <span>Soil Moisture & Irrigation</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {irrigationNeed}
          </p>
          <span className="text-[11px] text-emerald-800 mt-1 block">
            Expected rain accumulation: {accumulatedRainfallExpected}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 mb-1">
            <Wind className="w-3.5 h-3.5 text-amber-600" />
            <span>Pesticide Spray Window</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {sprayRecommendation}
          </p>
          <span className="text-[11px] text-amber-800 mt-1 block">
            High drift risk during evening gusts
          </span>
        </div>
      </div>
    </div>
  );
};
