import React from 'react';
import { EngineCard, FactorStatus } from '../../types';
import { CardFeedbackButton } from '../ui/CardFeedbackButton';
import { CheckCircle2, AlertCircle, XCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActivityConditionCardProps {
  card: EngineCard;
}

export const ActivityConditionCard: React.FC<ActivityConditionCardProps> = ({ card }) => {
  const navigate = useNavigate();
  const suitability = card.data;

  const ratingColor = {
    Good: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    Moderate: 'text-amber-800 bg-amber-50 border-amber-200',
    Poor: 'text-rose-800 bg-rose-50 border-rose-200',
  }[suitability.overallRating as 'Good' | 'Moderate' | 'Poor'];

  const getStatusIcon = (status: FactorStatus) => {
    switch (status) {
      case 'optimal':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      case 'caution':
        return <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
      case 'poor':
        return <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs transition-all">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {suitability.activity} Conditions
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className={`text-xs px-2 py-0.5 rounded font-semibold border ${ratingColor}`}>
              {suitability.overallRating}
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            {suitability.headline}
          </h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {suitability.summary}
          </p>
        </div>

        <CardFeedbackButton
          cardId={card.id}
          cardType={card.type}
          reason={card.reason}
        />
      </div>

      {/* Factor Breakdown Grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
        {suitability.factors.map((factor: any, idx: number) => (
          <div
            key={idx}
            className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2.5"
          >
            {getStatusIcon(factor.status)}
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {factor.name}
                </span>
                <span className="text-xs font-mono text-slate-600 font-medium shrink-0">
                  {factor.value}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                {factor.explanation}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Navigation */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/activities')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-amber-800 transition-colors"
        >
          <span>View all activity parameters</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <span className="text-[11px] text-slate-400">
          Scored by rule-based suitability matrix
        </span>
      </div>
    </div>
  );
};
