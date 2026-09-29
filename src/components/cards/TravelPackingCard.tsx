import React from 'react';
import { EngineCard } from '../../types';
import { CardFeedbackButton } from '../ui/CardFeedbackButton';
import { Luggage, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TravelPackingCardProps {
  card: EngineCard;
}

export const TravelPackingCard: React.FC<TravelPackingCardProps> = ({ card }) => {
  const navigate = useNavigate();
  const { destination, temp, rainProb, items } = card.data;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs transition-all">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-50 text-sky-700 border border-sky-100">
            <Luggage className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Packing Checklist for {destination}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customized for {temp}°C and {rainProb}% precipitation forecast
            </p>
          </div>
        </div>

        <CardFeedbackButton
          cardId={card.id}
          cardType={card.type}
          reason={card.reason}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
        {items.map((item: any, idx: number) => (
          <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800">{item.name}</div>
              <div className="text-[11px] text-slate-500 leading-snug">{item.why}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/weather-details')}
          className="text-xs font-semibold text-slate-900 hover:text-amber-800 flex items-center gap-1"
        >
          <span>View full destination weather</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <span className="text-[11px] text-slate-400">Contextual luggage planner</span>
      </div>
    </div>
  );
};
