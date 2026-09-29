import React from 'react';
import { EngineCard } from '../../types';
import { CardFeedbackButton } from '../ui/CardFeedbackButton';
import { ArrowRight, Clock, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

interface TopRecommendationCardProps {
  card: EngineCard;
}

export const TopRecommendationCard: React.FC<TopRecommendationCardProps> = ({ card }) => {
  const navigate = useNavigate();
  const { logInteraction } = useAppStore();
  const rec = card.data;

  const handleAction = () => {
    logInteraction('click_card', `rec_action_${rec.id}`);
    if (rec.actionType === 'schedule') {
      navigate('/time-finder');
    } else if (rec.actionType === 'alert_details') {
      navigate('/alerts');
    } else if (rec.actionType === 'view_chart') {
      navigate('/weather-details');
    } else if (rec.actionType === 'pack') {
      navigate('/weather-details');
    } else {
      navigate('/activities');
    }
  };

  return (
    <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-5 shadow-xs relative overflow-hidden transition-all">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
          <span className="text-xs font-semibold text-amber-900 tracking-wide">
            {rec.contextTag}
          </span>
          {rec.dryWindowNotice && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded font-medium">
              <Clock className="w-3 h-3" />
              {rec.dryWindowNotice}
            </span>
          )}
        </div>

        <CardFeedbackButton
          cardId={card.id}
          cardType={card.type}
          reason={card.reason}
        />
      </div>

      {/* Main Headline & Meaning */}
      <div className="mt-1">
        <h2 className="text-base md:text-lg font-bold text-slate-900 leading-snug">
          {rec.headline}
        </h2>
        <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">
          {rec.subtext}
        </p>
      </div>

      {/* Action Bar */}
      <div className="mt-4 pt-3 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
        >
          <span>{rec.actionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <span className="text-[11px] text-slate-500">
          Personalized for your activity & routine
        </span>
      </div>
    </div>
  );
};
