import React from 'react';
import { EngineCard, TimeWindow } from '../../types';
import { CardFeedbackButton } from '../ui/CardFeedbackButton';
import { Clock, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

interface SmartTimeFinderCardProps {
  card: EngineCard;
}

export const SmartTimeFinderCard: React.FC<SmartTimeFinderCardProps> = ({ card }) => {
  const navigate = useNavigate();
  const { logInteraction } = useAppStore();
  const { activity, recommendedWindow, allWindows } = card.data;

  const handleUseTime = (window: TimeWindow) => {
    logInteraction('use_time_window', `${window.startTime}-${window.endTime}`);
    navigate('/time-finder');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs transition-all">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Smart Time Finder
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Optimal Dry Slot
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Best {activity} Window Today
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Identified by scanning hourly precipitation radar and thermal conditions
          </p>
        </div>

        <CardFeedbackButton
          cardId={card.id}
          cardType={card.type}
          reason={card.reason}
        />
      </div>

      {/* Hero Window Box */}
      {recommendedWindow && (
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 mt-2">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg font-mono">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>{recommendedWindow.startTime} – {recommendedWindow.endTime}</span>
            </div>
            <p className="text-xs text-slate-700 mt-1">
              {recommendedWindow.reason}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 font-mono">
              <span>{recommendedWindow.temperature}°C</span>
              <span>·</span>
              <span className="text-emerald-700 font-medium">{recommendedWindow.rainProbability}% rain chance</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleUseTime(recommendedWindow)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Use this window</span>
          </button>
        </div>
      )}

      {/* Alternative Windows */}
      {allWindows && allWindows.length > 1 && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-500">Other options:</span>
          <div className="flex items-center gap-2">
            {allWindows.slice(1, 3).map((w: TimeWindow, i: number) => (
              <button
                key={i}
                type="button"
                onClick={() => handleUseTime(w)}
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded text-xs font-mono transition-colors"
              >
                {w.startTime} ({w.rainProbability}% rain)
              </button>
            ))}
            <button
              type="button"
              onClick={() => navigate('/time-finder')}
              className="text-xs font-semibold text-slate-900 hover:underline flex items-center ml-2"
            >
              <span>Explore all</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
