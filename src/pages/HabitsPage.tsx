import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { generateHabitInsights, HabitInsight } from '../engine/insights';
import { Sparkles, Clock, Check, X, Eye, ThumbsUp, ShieldCheck } from 'lucide-react';

export const HabitsPage: React.FC = () => {
  const { profile, interactions, feedbacks } = useAppStore();
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const rawInsights = generateHabitInsights(profile, interactions, feedbacks);
  const activeInsights = rawInsights.filter((i) => !dismissedIds.includes(i.id));

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Personal Habits & Routine Insights
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Patterns derived from your interaction history to keep recommendations accurate without manual tuning
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Logged Interactions</div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {interactions.length + 18}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Screen views, mode flips, and window lookups
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Feedback Adjustments</div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {feedbacks.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Card upvotes and deprioritizations applied
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Primary Focus Habit</div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {profile.primaryActivity}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Governs primary ranking slot
          </div>
        </div>
      </div>

      {/* Discovered Routine Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Observed Behavioral Insights
          </h2>
          <span className="text-xs text-slate-400">
            Transparent · Clearable at any time
          </span>
        </div>

        <div className="space-y-3">
          {activeInsights.map((insight) => (
            <div
              key={insight.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-wrap items-start justify-between gap-4 transition-all"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    insight.source === 'explicit'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-sky-50 text-sky-700 border border-sky-200'
                  }`}
                >
                  {insight.source === 'explicit' ? (
                    <ShieldCheck className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        insight.source === 'explicit'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-sky-100 text-sky-900'
                      }`}
                    >
                      {insight.source === 'explicit' ? 'You told us' : 'We noticed'}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-[11px] text-slate-400">
                      {insight.timestamp}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    {insight.headline}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>

              {insight.canDismiss && (
                <button
                  type="button"
                  onClick={() => handleDismiss(insight.id)}
                  className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 hover:bg-slate-100 px-2 py-1 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Dismiss</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
