import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, HelpCircle, Check, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useAuth } from '../../context/AuthContext';
import { submitFeedback as submitSupabaseFeedback } from '../../services/feedbackService';

interface CardFeedbackButtonProps {
  cardId: string;
  cardType: string;
  reason: string;
  className?: string;
}

export const CardFeedbackButton: React.FC<CardFeedbackButtonProps> = ({
  cardId,
  cardType,
  reason,
  className = '',
}) => {
  const { user } = useAuth();
  const { feedbacks, submitFeedback } = useAppStore();
  const [showReason, setShowReason] = useState(false);
  const [justVoted, setJustVoted] = useState<string | null>(null);

  const existingVote = feedbacks.find((f) => f.cardId === cardId)?.vote;

  const handleVote = async (vote: 'up' | 'down') => {
    // 1. Instant local store update for immediate reactivity
    submitFeedback(cardId, cardType, vote);
    setJustVoted(vote);
    setTimeout(() => setJustVoted(null), 2500);

    // 2. Persist to Supabase feedback table
    if (user) {
      try {
        await submitSupabaseFeedback(
          user.id,
          cardId,
          vote === 'up' ? 'positive' : 'negative'
        );
      } catch (err) {
        console.error('Failed to submit feedback to Supabase:', err);
      }
    }
  };

  return (
    <div className={`relative inline-flex items-center gap-1.5 text-xs text-slate-500 ${className}`}>
      {justVoted && (
        <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded transition-opacity flex items-center gap-1">
          <Check className="w-3 h-3 text-emerald-600" />
          {justVoted === 'up' ? 'Preference saved' : 'Deprioritized'}
        </span>
      )}

      {/* Thumbs Up */}
      <button
        type="button"
        onClick={() => handleVote('up')}
        title="Show more cards like this"
        className={`p-1.5 rounded hover:bg-slate-100 transition-colors ${
          existingVote === 'up' ? 'text-emerald-700 bg-emerald-50 font-medium' : 'text-slate-400 hover:text-slate-700'
        }`}
        aria-label="Helpful recommendation"
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>

      {/* Thumbs Down */}
      <button
        type="button"
        onClick={() => handleVote('down')}
        title="Show fewer cards like this"
        className={`p-1.5 rounded hover:bg-slate-100 transition-colors ${
          existingVote === 'down' ? 'text-rose-700 bg-rose-50 font-medium' : 'text-slate-400 hover:text-slate-700'
        }`}
        aria-label="Not helpful recommendation"
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>

      {/* Why am I seeing this? */}
      <button
        type="button"
        onClick={() => setShowReason(!showReason)}
        className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1"
        title="Why am I seeing this card?"
      >
        <HelpCircle className="w-3.5 h-3.5" />
        <span className="hidden sm:inline text-[11px] font-normal text-slate-500">Why?</span>
      </button>

      {/* Popover */}
      {showReason && (
        <div
          role="dialog"
          aria-label="Why this card is displayed"
          className="absolute right-0 bottom-full mb-2 w-72 p-3 bg-white rounded-lg shadow-lg border border-slate-200 z-50 text-left text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <span className="font-semibold text-slate-900 text-[11px] tracking-wide uppercase">
              Why you're seeing this
            </span>
            <button
              onClick={() => setShowReason(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="leading-relaxed text-slate-600">{reason}</p>
          <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
            Powered by Skyora's Rule-based Personalization Engine
          </div>
        </div>
      )}
    </div>
  );
};
