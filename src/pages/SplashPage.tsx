import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudLightning, ArrowRight, ShieldCheck, Sparkles, Compass } from 'lucide-react';
import { WeatherArt } from '../components/ui/WeatherArt';

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6 md:p-12 font-sans select-none">
      {/* Top Bar */}
      <header className="flex items-center justify-between max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs">
            <CloudLightning className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 font-display">
                Skyora
              </span>
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                IMD
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              India Meteorological Department
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition-colors shadow-xs"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="max-w-4xl w-full mx-auto my-auto text-center py-12 space-y-8">
        <div className="flex justify-center gap-4">
          <WeatherArt condition="clear" size="lg" />
          <WeatherArt condition="heavy-rain" size="lg" />
          <WeatherArt condition="thunderstorm" size="lg" />
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100/70 px-3 py-1 rounded-full border border-amber-200 inline-block">
            Smart India Hackathon · PS 26076
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Weather isn't one-size-fits-all. Neither should your homepage be.
          </h1>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed">
            Skyora transforms generic meteorological radar data into actionable, routine-aware guidance. Whether you're an evening runner beating monsoon downpours or a highway commuter avoiding waterlogged lanes, see only what matters to you right now.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-sm flex items-center gap-2"
          >
            <span>Launch Live Interactive Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/onboarding')}
            className="px-5 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold rounded-xl text-sm transition-all shadow-xs"
          >
            Customize New Profile (4 Steps)
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-left border-t border-slate-200">
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-500 mb-1.5" />
            <h2 className="text-xs font-bold text-slate-900">Explainable Personalization</h2>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Every recommendation has an audit reason and feedback thumb so the engine earns your trust.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
            <Compass className="w-4 h-4 text-sky-500 mb-1.5" />
            <h2 className="text-xs font-bold text-slate-900">Smart Time Finder</h2>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Scans hourly radar to identify optimal dry slots before incoming clouds intensify.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-500 mb-1.5" />
            <h2 className="text-xs font-bold text-slate-900">Zero Cloud Storage</h2>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Your routines, locations, and habits stay strictly on this device inside local storage.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 max-w-6xl w-full mx-auto pt-6 border-t border-slate-200">
        Skyora Intelligent Personalization Prototype · Built for Smart India Hackathon
      </footer>
    </div>
  );
};
