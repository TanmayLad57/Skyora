import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getWeatherData } from '../services/weather';
import { findBestTimeWindows } from '../engine/timeFinder';
import { ActivityType, TimeWindow } from '../types';
import { Clock, Check, Calendar, Sparkles, AlertCircle } from 'lucide-react';

export const SmartTimeFinderPage: React.FC = () => {
  const { profile, simulatedHour, updateProfile, logInteraction } = useAppStore();

  const [selectedActivity, setSelectedActivity] = useState<ActivityType>(
    profile.primaryActivity || 'Running'
  );
  const [durationHours, setDurationHours] = useState<number>(1);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [confirmedWindow, setConfirmedWindow] = useState<TimeWindow | null>(null);

  const activeLocation =
    profile.locations.find((l) => l.id === profile.activeLocationId) ||
    profile.locations[0] || { name: 'Mumbai', state: 'Maharashtra' };

  const weather = getWeatherData(activeLocation.name, simulatedHour, profile.units);

  const bestWindows = findBestTimeWindows(
    selectedActivity,
    weather,
    durationHours,
    profile.preferences.activityWindow?.startHour ?? 17
  );

  const handleApplyWindow = (window: TimeWindow) => {
    logInteraction('use_time_window', `${selectedActivity}_${window.startTime}`);
    updateProfile({
      preferences: {
        ...profile.preferences,
        activityWindow: {
          activity: selectedActivity,
          startHour: window.startHour,
          endHour: window.endHour,
        },
      },
    });
    setConfirmedWindow(window);
    setTimeout(() => setConfirmedWindow(null), 3500);
  };

  const days = [
    { label: 'Today', sub: weather.daily[0]?.date || 'Sep 28' },
    { label: 'Tomorrow', sub: weather.daily[1]?.date || 'Sep 29' },
    { label: 'Wednesday', sub: weather.daily[2]?.date || 'Sep 30' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Smart Time Finder
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Scan hourly precipitation patterns, temperature curves, and solar radiation to detect ideal windows
        </p>
      </div>

      {confirmedWindow && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>
              Routine updated: <strong>{confirmedWindow.startTime}–{confirmedWindow.endTime}</strong> set as your target window for {selectedActivity}.
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">Applied to Homepage</span>
        </div>
      )}

      {/* Query Controls Grid */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Activity */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            1. Select Activity
          </label>
          <div className="flex flex-wrap gap-1.5">
            {(['Running', 'Cycling', 'Driving', 'Farming', 'Sports', 'Outdoor work'] as ActivityType[]).map((act) => (
              <button
                key={act}
                type="button"
                onClick={() => setSelectedActivity(act)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedActivity === act
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {act}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Duration */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            2. Duration Target
          </label>
          <div className="flex items-center gap-2">
            {[
              { label: '30 mins', hours: 1 },
              { label: '1 hour', hours: 1 },
              { label: '2 hours', hours: 2 },
              { label: '3 hours', hours: 3 },
            ].map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setDurationHours(d.hours)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  durationHours === d.hours
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Day Selection */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            3. Scheduled Day
          </label>
          <div className="flex items-center gap-2">
            {days.map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedDayIndex(i)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all text-left ${
                  selectedDayIndex === i
                    ? 'bg-amber-100/70 border border-amber-300 text-amber-950 font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="leading-tight">{d.label}</div>
                <div className="text-[10px] text-slate-400 font-normal">{d.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Ranked Windows */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Ranked Recommended Windows for {selectedActivity}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bestWindows.map((win, idx) => (
            <div
              key={idx}
              className={`rounded-xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                idx === 0
                  ? 'bg-emerald-50/70 border-emerald-300'
                  : 'bg-white border-slate-200/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    idx === 0
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {idx === 0 ? 'Best Choice' : `Option #${idx + 1}`}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                    win.rating === 'Good'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {win.rating} ({win.score}/100)
                  </span>
                </div>

                <div className="text-xl font-bold font-mono text-slate-900 mt-1 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <span>{win.startTime} – {win.endTime}</span>
                </div>

                <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                  {win.reason}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center gap-3 text-xs font-mono text-slate-600">
                  <span>{win.temperature}°C avg</span>
                  <span>·</span>
                  <span className="text-sky-700 font-semibold">{win.rainProbability}% rain chance</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => handleApplyWindow(win)}
                  className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Use this time</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 24-Hour Day Timeline Visualizer */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-2">
          24-Hour Suitability Timeline
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Visual heat map of the day showing precipitation density and optimal activity bands
        </p>

        <div className="grid grid-cols-12 md:grid-cols-24 gap-1">
          {weather.hourly.map((h, i) => {
            const isGood = h.rainProb <= 30;
            const isModerate = h.rainProb > 30 && h.rainProb <= 55;
            const color = isGood ? 'bg-emerald-500' : isModerate ? 'bg-amber-400' : 'bg-rose-500';

            return (
              <div key={i} className="group relative text-center">
                <div className={`h-12 rounded-sm ${color} transition-all hover:opacity-80`} />
                <span className="text-[10px] font-mono text-slate-400 block mt-1">
                  {h.hour}
                </span>

                {/* Tooltip */}
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-slate-900 text-white rounded text-[11px] z-20 pointer-events-none shadow-lg text-left">
                  <div className="font-bold">{h.time}</div>
                  <div>{h.temp}°C · {h.rainProb}% rain</div>
                  <div className="text-slate-300 text-[10px]">{h.conditionText}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500" />
            <span>Optimal (Dry & Mild)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-amber-400" />
            <span>Caution (Passing Showers)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-rose-500" />
            <span>Unfavorable (Heavy Rain)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
