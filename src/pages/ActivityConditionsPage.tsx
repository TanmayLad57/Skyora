import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getWeatherData } from '../services/weather';
import { evaluateSuitability } from '../engine/suitability';
import { findBestTimeWindows } from '../engine/timeFinder';
import { ActivityType, FactorStatus } from '../types';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ActivityConditionsPage: React.FC = () => {
  const { profile, simulatedHour } = useAppStore();
  const navigate = useNavigate();

  const [selectedActivity, setSelectedActivity] = useState<ActivityType>(
    profile.primaryActivity || 'Running'
  );

  const activeLocation =
    profile.locations.find((l) => l.id === profile.activeLocationId) ||
    profile.locations[0] || { name: 'Mumbai', state: 'Maharashtra' };

  const weather = getWeatherData(activeLocation.name, simulatedHour, profile.units);
  const suitability = evaluateSuitability(selectedActivity, weather, simulatedHour);
  const betterWindows = findBestTimeWindows(selectedActivity, weather, 1, simulatedHour);

  const allActivities: ActivityType[] = [
    'Running',
    'Driving',
    'Cycling',
    'Travelling',
    'Farming',
    'Sports',
    'Outdoor work',
  ];

  const ratingBadgeClass = {
    Good: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Moderate: 'bg-amber-50 text-amber-800 border-amber-200',
    Poor: 'bg-rose-50 text-rose-800 border-rose-200',
  }[suitability.overallRating];

  const getStatusIcon = (status: FactorStatus) => {
    switch (status) {
      case 'optimal':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'caution':
        return <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'poor':
        return <XCircle className="w-4 h-4 text-rose-600 shrink-0" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Activity Conditions
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Explainable meteorological suitability matrix and factor breakdown for {weather.city}
        </p>
      </div>

      {/* Activity Selector Buttons */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-xl">
        {allActivities.map((act) => {
          const isSelected = selectedActivity === act;
          return (
            <button
              key={act}
              type="button"
              onClick={() => setSelectedActivity(act)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {act}
            </button>
          );
        })}
      </div>

      {/* Main Suitability Assessment Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Evaluation for {selectedActivity}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${ratingBadgeClass}`}>
                {suitability.overallRating}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {suitability.headline}
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {suitability.summary}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Suitability Score</span>
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {suitability.score}
              <span className="text-sm text-slate-400 font-normal">/100</span>
            </span>
          </div>
        </div>

        {/* Explainable Factors Breakdown Grid */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Explainable Factor Breakdown (Why is it {suitability.overallRating}?)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suitability.factors.map((factor, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-3"
              >
                {getStatusIcon(factor.status)}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      {factor.name}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {factor.value}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-snug">
                    {factor.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Better Times Today Section */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Better Times for {selectedActivity} Today
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked windows with lowest precipitation risk and optimal temperatures
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/time-finder')}
            className="text-xs font-semibold text-slate-900 hover:text-amber-800 flex items-center gap-1"
          >
            <span>Custom Duration Scanner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {betterWindows.map((win, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border transition-all ${
                win.isDryWindow
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-slate-50 border-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 font-mono flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  {win.startTime} – {win.endTime}
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                  win.rating === 'Good' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {win.rating}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-snug">
                {win.reason}
              </p>
              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>{win.temperature}°C</span>
                <span className="text-sky-700 font-semibold">{win.rainProbability}% rain</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
