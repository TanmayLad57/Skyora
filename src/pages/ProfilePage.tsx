import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ActivityType, TemperatureUnit } from '../types';
import {
  User,
  Shield,
  Trash2,
  RotateCcw,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  Clock,
  Activity,
  Bell,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const {
    profile,
    updateProfile,
    toggleActivity,
    setUnits,
    resetPersonalization,
    deleteUserData,
  } = useAppStore();

  const [nameInput, setNameInput] = useState(profile.name);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const allActivities: ActivityType[] = [
    'Running',
    'Driving',
    'Cycling',
    'Travelling',
    'Farming',
    'Sports',
    'Outdoor work',
    'Family',
    'General',
  ];

  const handleSaveName = () => {
    updateProfile({ name: nameInput });
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  const handleRemoveInferred = (key: string) => {
    updateProfile({
      inferredPreferences: {
        ...profile.inferredPreferences,
        travelIntent: false,
      },
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Profile & Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Full control over your explicit routines, inferred behavioral signals, and local data storage
        </p>
      </div>

      {showSavedToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Profile configuration saved successfully.</span>
        </div>
      )}

      {/* 1. Basic Identity & Units */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-4">
          Personal Identity & Meteorology Units
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Your Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="flex-1 text-xs p-2.5 rounded-lg border border-slate-200 text-slate-900"
              />
              <button
                type="button"
                onClick={handleSaveName}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Update
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Temperature Scale
            </label>
            <div className="flex items-center gap-2 mt-1">
              {(['C', 'F'] as TemperatureUnit[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnits(u)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                    profile.units === u
                      ? 'bg-amber-500 border-amber-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Celsius (°C)
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tracked Activities */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-1">
          Your Tracked Activities
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          The engine prioritizes cards and notifications matching your active interests
        </p>

        <div className="flex flex-wrap gap-2">
          {allActivities.map((act) => {
            const isSelected = profile.selectedActivities.includes(act);
            const isPrimary = profile.primaryActivity === act;

            return (
              <button
                key={act}
                type="button"
                onClick={() => toggleActivity(act)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-amber-400" />}
                <span>{act}</span>
                {isPrimary && (
                  <span className="text-[10px] bg-amber-400 text-slate-900 font-bold px-1 rounded">
                    Primary
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. "You Told Us" (Explicit) vs "We Noticed" (Inferred) Preferences Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Explicit preferences */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              "You Told Us" (Explicit Settings)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Direct configurations entered by you during setup or preferences.
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Primary Activity</span>
                <span className="text-slate-500">{profile.primaryActivity}</span>
              </div>
              <span className="text-emerald-700 font-medium text-[11px]">Active</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Commute Transit Window</span>
                <span className="text-slate-500 font-mono">
                  {profile.preferences.commuteWindow?.startHour}:00 – {profile.preferences.commuteWindow?.endHour}:00
                </span>
              </div>
              <span className="text-emerald-700 font-medium text-[11px]">Active</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 block">Precipitation Sensitivity</span>
                <span className="text-slate-500 capitalize">{profile.preferences.rainThresholdSensitivity}</span>
              </div>
              <span className="text-emerald-700 font-medium text-[11px]">Active</span>
            </div>
          </div>
        </div>

        {/* Inferred preferences */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">
              "We Noticed" (Inferred Preferences)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Patterns deduced by the engine from app interaction and card feedback.
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
              <div>
                <span className="font-semibold text-slate-800 block">Check Time Window Habit</span>
                <span className="text-slate-500 leading-snug">
                  Peak usage around 17:30 IST before workout departure.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveInferred('checkedPeakHours')}
                className="text-slate-400 hover:text-slate-700 p-1"
                title="Remove inferred habit"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
              <div>
                <span className="font-semibold text-slate-800 block">Dry Window Bias</span>
                <span className="text-slate-500 leading-snug">
                  Consistently prefers 5:00–6:00 PM dry slots when rain exceeds 50%.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveInferred('dryBias')}
                className="text-slate-400 hover:text-slate-700 p-1"
                title="Remove inferred habit"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
              <div>
                <span className="font-semibold text-slate-800 block">Travel Destination Detection</span>
                <span className="text-slate-500 leading-snug">
                  Frequent lookups for Delhi destination thundershowers.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveInferred('travelIntent')}
                className="text-slate-400 hover:text-slate-700 p-1"
                title="Remove inferred habit"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Danger Zone: Reset & Delete */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-1">
          Privacy & Storage Administration
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          All preferences, habits, and location hubs are stored exclusively inside your browser's localStorage.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={resetPersonalization}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Personalization Engine</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-800 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Delete All My Data</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Erase All Local Data?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This will completely wipe your profile, saved locations, interactions, and feedback from this browser.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteUserData();
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
              >
                Yes, Delete Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
