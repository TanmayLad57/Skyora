import React from 'react';
import { EngineCard } from '../../types';
import { CardFeedbackButton } from '../ui/CardFeedbackButton';
import { AlertTriangle, ShieldAlert, ArrowRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OfficialAlertCardProps {
  card: EngineCard;
}

export const OfficialAlertCard: React.FC<OfficialAlertCardProps> = ({ card }) => {
  const navigate = useNavigate();
  const alert = card.data;

  const isOrangeOrRed = alert.severity === 'orange' || alert.severity === 'red';

  return (
    <div
      className={`rounded-xl border p-5 shadow-xs transition-all ${
        isOrangeOrRed
          ? 'bg-amber-50/70 border-amber-300 text-slate-900'
          : 'bg-yellow-50/60 border-yellow-200 text-slate-900'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-md ${
              isOrangeOrRed ? 'bg-amber-500 text-white' : 'bg-yellow-500 text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-amber-900">
                Official Meteorological Alert
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-[11px] font-medium text-slate-600">
                {alert.officialSource || 'IMD National Weather Service'}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              {alert.title}
            </h2>
          </div>
        </div>

        <CardFeedbackButton
          cardId={card.id}
          cardType={card.type}
          reason={card.reason}
        />
      </div>

      {/* Original Warning Statement */}
      <div className="mt-3.5 bg-white/80 rounded-lg p-3 border border-amber-200/60 text-xs text-slate-700 leading-relaxed font-sans">
        <div className="font-semibold text-slate-900 mb-1 text-[11px] uppercase tracking-wide">
          Official Warning Bulletin
        </div>
        <p>{alert.originalWarning || alert.description}</p>
      </div>

      {/* Plain Language "What this means" block */}
      <div className="mt-3 text-xs leading-relaxed text-slate-800">
        <strong className="font-semibold text-slate-900">What this means for you: </strong>
        <span>{alert.whatThisMeans}</span>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/alerts')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-950 hover:text-black underline underline-offset-4"
        >
          <span>View full advisory & timeline</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <span className="text-[11px] text-slate-500">
          Statutory safety priority
        </span>
      </div>
    </div>
  );
};
