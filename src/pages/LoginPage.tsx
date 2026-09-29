import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { CloudLightning, ArrowRight, UserCheck, Shield } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setPersona, updateProfile } = useAppStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleQuickLogin = (personaKey: 'aarav' | 'neha' | 'rahul') => {
    setPersona(personaKey);
    navigate('/');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      updateProfile({ name: name.trim() });
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans select-none">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-xs">
            <CloudLightning className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {mode === 'login' ? 'Sign in to Skyora' : 'Create Local Profile'}
          </h1>
          <p className="text-xs text-slate-500">
            Intelligent weather personalization stored strictly on this device
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            New Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tanmay Sharma"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Email or Phone Number
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@skyora.imd.gov.in"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            {mode === 'login' ? 'Sign In Locally' : 'Start Personalization'}
          </button>
        </form>

        {/* Quick Demo Personas */}
        <div className="pt-4 border-t border-slate-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
            Or One-Click Demo Sign In:
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('aarav')}
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-center transition-colors"
            >
              <span className="text-xs font-bold text-slate-900 block">Aarav</span>
              <span className="text-[10px] text-slate-500">Runner</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('neha')}
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-center transition-colors"
            >
              <span className="text-xs font-bold text-slate-900 block">Neha</span>
              <span className="text-[10px] text-slate-500">Commuter</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('rahul')}
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-center transition-colors"
            >
              <span className="text-xs font-bold text-slate-900 block">Rahul</span>
              <span className="text-[10px] text-slate-500">Traveller</span>
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate('/onboarding')}
            className="text-xs text-amber-800 hover:underline font-semibold"
          >
            Want to complete custom onboarding wizard instead?
          </button>
        </div>
      </div>
    </div>
  );
};
