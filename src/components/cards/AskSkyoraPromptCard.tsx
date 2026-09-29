import React from 'react';
import { EngineCard } from '../../types';
import { CardFeedbackButton } from '../ui/CardFeedbackButton';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AskSkyoraPromptCardProps {
  card: EngineCard;
}

export const AskSkyoraPromptCard: React.FC<AskSkyoraPromptCardProps> = ({ card }) => {
  const navigate = useNavigate();
  const { suggestedQuestions } = card.data;

  const handleAsk = (q: string) => {
    navigate('/ask-skyora', { state: { prefilledQuery: q } });
  };

  return (
    <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs transition-all">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-white/10 text-amber-300">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Ask Skyora
            </h2>
            <p className="text-xs text-slate-300">
              Contextual weather questions answered for your routine
            </p>
          </div>
        </div>

        <CardFeedbackButton
          cardId={card.id}
          cardType={card.type}
          reason={card.reason}
          className="text-slate-400"
        />
      </div>

      <div className="space-y-2 mt-3 pt-3 border-t border-slate-800">
        {suggestedQuestions.map((q: string, idx: number) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleAsk(q)}
            className="w-full text-left p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-200 hover:text-white transition-colors flex items-center justify-between group"
          >
            <span>"{q}"</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-colors shrink-0 ml-2" />
          </button>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => navigate('/ask-skyora')}
          className="text-amber-300 hover:text-amber-200 font-semibold underline underline-offset-4"
        >
          Open assistant chat
        </button>
        <span className="text-[11px] text-slate-400">
          Template & rule engine
        </span>
      </div>
    </div>
  );
};
