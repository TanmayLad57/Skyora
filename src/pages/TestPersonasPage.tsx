import React from 'react';
import { useAppStore, DEMO_PERSONAS } from '../store/useAppStore';
import { getWeatherData } from '../services/weather';
import { rankCards } from '../engine/rank';
import { Check, ArrowRight, Sparkles, Activity, Car, Plane, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TestPersonasPage: React.FC = () => {
  const { setPersona, activePersonaId } = useAppStore();
  const navigate = useNavigate();

  // Load weather scenarios
  const weatherMumbai = getWeatherData('Mumbai', 17, 'C');
  const weatherDelhi = getWeatherData('Delhi', 17, 'C');

  // Evaluate engine ranking for each persona
  const cardsAarav = rankCards(DEMO_PERSONAS.aarav, weatherMumbai, 17, []);
  const cardsNeha = rankCards(DEMO_PERSONAS.neha, weatherMumbai, 17, []);
  const cardsRahul = rankCards(DEMO_PERSONAS.rahul, weatherDelhi, 17, []);

  const handleSelectPersona = (key: 'aarav' | 'neha' | 'rahul') => {
    setPersona(key);
    navigate('/');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Proof of Concept Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>SIH PS 26076 Demo Verification</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          Same Meteorological Radar Data → Visibly Different Personalized Outcomes
        </h1>
        <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
          In Mumbai right now, temperature is 28°C and rain starts at 6:00 PM. Notice how Aarav sees an urgent 5:00 PM dry running window, while Neha sees commute lane visibility warnings, and Rahul in Delhi receives flight packing intelligence.
        </p>
      </div>

      {/* 3-Column Comparative Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMN 1: AARAV (RUNNER) */}
        <div className={`rounded-xl border p-5 bg-white shadow-xs transition-all flex flex-col justify-between ${
          activePersonaId === 'aarav' ? 'ring-2 ring-amber-500 border-transparent' : 'border-slate-200/80'
        }`}>
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-800 font-bold text-xs">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Aarav Mehta</h2>
                  <span className="text-[11px] text-slate-500">Runner · Mumbai</span>
                </div>
              </div>
              {activePersonaId === 'aarav' && (
                <span className="text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded">
                  Active
                </span>
              )}
            </div>

            {/* Context Conditions */}
            <div className="my-3 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
              <div className="font-semibold text-slate-700">Weather: 28°C, 70% Evening Rain</div>
              <div className="text-slate-500 text-[11px] mt-0.5">Usual routine: 6:00 PM – 7:00 PM outdoor run</div>
            </div>

            {/* Top Engine Recommendation */}
            <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs">
              <div className="text-[10px] font-bold text-amber-900 uppercase">Engine Output</div>
              <div className="font-bold text-slate-900 text-sm mt-1">
                {cardsAarav.find((c) => c.type === 'top_recommendation')?.data.headline}
              </div>
              <div className="text-slate-600 mt-1 leading-snug">
                Dry window identified: <strong>17:00 – 18:00</strong> before downpour hits.
              </div>
            </div>

            {/* Engine Card Priorities List */}
            <div className="mt-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Ranked Slot Hierarchy
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                {cardsAarav.slice(0, 5).map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-50 text-[11px]">
                    <span className="truncate max-w-[170px] text-slate-700 font-sans">
                      {i + 1}. {c.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">p:{c.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleSelectPersona('aarav')}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <span>View Aarav's Homepage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* COLUMN 2: NEHA (COMMUTER) */}
        <div className={`rounded-xl border p-5 bg-white shadow-xs transition-all flex flex-col justify-between ${
          activePersonaId === 'neha' ? 'ring-2 ring-amber-500 border-transparent' : 'border-slate-200/80'
        }`}>
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-sky-50 text-sky-800 font-bold text-xs">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Neha Sharma</h2>
                  <span className="text-[11px] text-slate-500">Commuter / Driver · Mumbai</span>
                </div>
              </div>
              {activePersonaId === 'neha' && (
                <span className="text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded">
                  Active
                </span>
              )}
            </div>

            {/* Context Conditions */}
            <div className="my-3 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
              <div className="font-semibold text-slate-700">Weather: 28°C, 70% Rain (Same Mumbai data)</div>
              <div className="text-slate-500 text-[11px] mt-0.5">Usual routine: 6:00 PM – 7:00 PM expressway drive</div>
            </div>

            {/* Top Engine Recommendation */}
            <div className="p-3.5 rounded-lg bg-sky-50/70 border border-sky-200 text-xs">
              <div className="text-[10px] font-bold text-sky-900 uppercase">Engine Output</div>
              <div className="font-bold text-slate-900 text-sm mt-1">
                {cardsNeha.find((c) => c.type === 'top_recommendation')?.data.headline}
              </div>
              <div className="text-slate-600 mt-1 leading-snug">
                Rain hits route at 6:15 PM; recommended departure by 5:45 PM.
              </div>
            </div>

            {/* Engine Card Priorities List */}
            <div className="mt-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Ranked Slot Hierarchy
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                {cardsNeha.slice(0, 5).map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-50 text-[11px]">
                    <span className="truncate max-w-[170px] text-slate-700 font-sans">
                      {i + 1}. {c.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">p:{c.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleSelectPersona('neha')}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <span>View Neha's Homepage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* COLUMN 3: RAHUL (TRAVELLER) */}
        <div className={`rounded-xl border p-5 bg-white shadow-xs transition-all flex flex-col justify-between ${
          activePersonaId === 'rahul' ? 'ring-2 ring-amber-500 border-transparent' : 'border-slate-200/80'
        }`}>
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs">
                  <Plane className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Rahul Varma</h2>
                  <span className="text-[11px] text-slate-500">Traveller · Delhi Destination</span>
                </div>
              </div>
              {activePersonaId === 'rahul' && (
                <span className="text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded">
                  Active
                </span>
              )}
            </div>

            {/* Context Conditions */}
            <div className="my-3 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
              <div className="font-semibold text-slate-700">Weather: 32°C, 60% Thundershowers</div>
              <div className="text-slate-500 text-[11px] mt-0.5">Active Alert: Yellow Watch with 40 km/h gusts</div>
            </div>

            {/* Top Engine Recommendation */}
            <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs">
              <div className="text-[10px] font-bold text-emerald-900 uppercase">Engine Output</div>
              <div className="font-bold text-slate-900 text-sm mt-1">
                {cardsRahul.find((c) => c.type === 'top_recommendation')?.data.headline}
              </div>
              <div className="text-slate-600 mt-1 leading-snug">
                Luggage checklist + airport transit delay buffer prioritized.
              </div>
            </div>

            {/* Engine Card Priorities List */}
            <div className="mt-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Ranked Slot Hierarchy
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                {cardsRahul.slice(0, 5).map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-50 text-[11px]">
                    <span className="truncate max-w-[170px] text-slate-700 font-sans">
                      {i + 1}. {c.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">p:{c.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleSelectPersona('rahul')}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <span>View Rahul's Homepage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
