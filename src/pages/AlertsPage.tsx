import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getWeatherData } from '../services/weather';
import { processAlerts, PersonalizedAlert } from '../engine/alerts';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  MapPin,
  ExternalLink,
  Info,
  CheckCircle,
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { profile, simulatedHour } = useAppStore();

  const activeLocation =
    profile.locations.find((l) => l.id === profile.activeLocationId) ||
    profile.locations[0] || { name: 'Mumbai', state: 'Maharashtra' };

  const weather = getWeatherData(activeLocation.name, simulatedHour, profile.units);
  const alerts = processAlerts(weather, profile, simulatedHour);

  const officialAlerts = alerts.filter((a) => a.type === 'official');
  const personalAlerts = alerts.filter((a) => a.type === 'personal_impact');

  const [modalAlert, setModalAlert] = useState<PersonalizedAlert | null>(null);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Alerts & Weather Warnings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Official statutory advisories paired with contextual impact notifications for {weather.city}
        </p>
      </div>

      {/* 1. Official Meteorological Alerts (Always Top Priority) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Official National Alerts (IMD)
          </h2>
        </div>

        {officialAlerts.length === 0 ? (
          <div className="p-6 bg-white rounded-xl border border-slate-200/80 text-center shadow-xs">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-800">No Active Official Warnings</div>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              The India Meteorological Department has not issued any Orange or Red severe weather watches for {weather.city} at this time.
            </p>
          </div>
        ) : (
          officialAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-xl border p-6 shadow-xs transition-all ${
                alert.severity === 'orange' || alert.severity === 'red'
                  ? 'bg-amber-50/70 border-amber-300'
                  : 'bg-yellow-50/70 border-yellow-200'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-amber-600 text-white">
                      {alert.severity === 'orange' ? 'Orange Warning' : 'Yellow Watch'}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-xs font-semibold text-slate-700">
                      {alert.officialSource}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {alert.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setModalAlert(alert)}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>View Official IMD Bulletin</span>
                </button>
              </div>

              {/* Original Warning Box */}
              <div className="mt-4 p-4 rounded-lg bg-white/90 border border-amber-200 text-xs text-slate-800 leading-relaxed font-sans">
                <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider mb-1">
                  Original Bulletin Statement:
                </span>
                <p>{alert.originalWarning}</p>
              </div>

              {/* What this means block */}
              <div className="mt-3.5 p-3 rounded-lg bg-amber-100/50 text-xs text-slate-900 leading-relaxed">
                <strong className="font-bold text-amber-950">What this means for you: </strong>
                <span>{alert.whatThisMeans}</span>
              </div>

              {/* Action recommendation */}
              <div className="mt-3 text-xs text-slate-700 flex items-center gap-1.5">
                <strong className="font-semibold text-slate-900">Recommended action:</strong>
                <span>{alert.actionRecommendation}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 2. Personalized Context Alerts */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-slate-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Personalized Routine Alerts
          </h2>
        </div>

        {personalAlerts.length === 0 ? (
          <div className="p-5 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-500">
            No weather conflicts detected with your current daily routine windows.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personalAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {alert.relevantActivity} Advisory
                    </span>
                    {alert.timeWindow && (
                      <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {alert.timeWindow}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    {alert.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {alert.whatThisMeans}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-800">
                  <span className="font-semibold text-amber-900">Tip: </span>
                  {alert.actionRecommendation}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Official Bulletin Modal */}
      {modalAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="text-sm font-bold text-slate-900 uppercase">
                India Meteorological Department Bulletin
              </div>
              <button
                type="button"
                onClick={() => setModalAlert(null)}
                className="text-xs text-slate-500 hover:text-slate-800 p-1"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700 leading-relaxed font-mono">
              <div><strong>Issuing Office:</strong> {modalAlert.officialSource}</div>
              <div><strong>Warning Level:</strong> {modalAlert.severity.toUpperCase()}</div>
              <div><strong>Headline:</strong> {modalAlert.title}</div>
              <div className="pt-2 border-t border-slate-100 font-sans text-xs text-slate-800">
                {modalAlert.originalWarning}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setModalAlert(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Acknowledge Bulletin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
