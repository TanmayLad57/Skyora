import React, { useState } from 'react';
import { useAppStore, DEMO_PERSONAS } from '../../store/useAppStore';
import { POPULAR_LOCATIONS } from '../../services/mockScenarios';
import { ActivityType } from '../../types';
import {
  MapPin,
  Clock,
  User,
  ChevronDown,
  Menu,
  Check,
  Compass,
  SlidersHorizontal,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onOpenMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const {
    profile,
    activePersonaId,
    simulatedHour,
    activeModeOverride,
    setPersona,
    setSimulatedHour,
    setModeOverride,
    setActiveLocation,
    setCityDirectly,
    clearUserSessionData,
  } = useAppStore();

  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showTimeMenu, setShowTimeMenu] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  // Active location name
  const activeLocation =
    profile.locations.find((l) => l.id === profile.activeLocationId) ||
    profile.locations[0] || { name: 'Mumbai', state: 'Maharashtra' };

  // Mode switcher options
  const modes: { label: string; mode?: ActivityType }[] = [
    { label: 'Auto (Profile)', mode: undefined },
    { label: 'Running', mode: 'Running' },
    { label: 'Work Commute', mode: 'Driving' },
    { label: 'Travel', mode: 'Travelling' },
  ];

  // Preset demo times
  const timePresets = [
    { label: '08:00 AM · Morning Overview', hour: 8 },
    { label: '01:00 PM · Afternoon Peak', hour: 13 },
    { label: '05:30 PM · Evening Commute & Run', hour: 17 },
    { label: '09:00 PM · Night Outlook', hour: 21 },
  ];

  const formatHourString = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayH = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayH}:00 ${period}`;
  };

  const isDemoPersona =
    activePersonaId === 'aarav' ||
    activePersonaId === 'neha' ||
    activePersonaId === 'rahul';

  const currentDisplayName = isDemoPersona
    ? profile.name
    : (user?.user_metadata?.full_name || profile.name || 'User');
  const firstName = currentDisplayName.split(' ')[0];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 select-none">
      {/* Left zone: Mobile trigger + Location Switcher */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Location Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowLocationMenu(!showLocationMenu);
              setShowTimeMenu(false);
              setShowPersonaMenu(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <div className="leading-none">
              <span className="text-xs font-bold text-slate-900 block truncate max-w-[130px] sm:max-w-[180px]">
                {activeLocation.name}
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                {activeLocation.state || 'India'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {showLocationMenu && (
            <div className="absolute left-0 mt-1.5 w-60 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in duration-100">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Saved Locations
              </div>
              {profile.locations.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => {
                    setActiveLocation(loc.id);
                    setShowLocationMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                    loc.id === profile.activeLocationId ? 'font-semibold text-slate-900 bg-amber-50/50' : 'text-slate-700'
                  }`}
                >
                  <div className="truncate">
                    <div>{loc.name}</div>
                    <div className="text-[10px] text-slate-400">{loc.type} · {loc.state}</div>
                  </div>
                  {loc.id === profile.activeLocationId && (
                    <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  )}
                </button>
              ))}

              <div className="border-t border-slate-100 mt-1 pt-1">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch City (Mock Scenarios)
                </div>
                {POPULAR_LOCATIONS.slice(0, 4).map((p) => (
                  <button
                    key={p.city}
                    type="button"
                    onClick={() => {
                      setCityDirectly(p.city);
                      setShowLocationMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 truncate"
                  >
                    {p.city}, {p.state}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Middle Zone: Mode Segmented Switcher (Visible on desktop) */}
      <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
        {modes.map((m) => {
          const isActive = activeModeOverride === m.mode;
          return (
            <button
              key={m.label}
              type="button"
              onClick={() => setModeOverride(m.mode)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Right Zone: Time Simulation Chip & Demo Persona Switcher */}
      <div className="flex items-center gap-2.5">
        {/* Simulated Time Chip */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowTimeMenu(!showTimeMenu);
              setShowLocationMenu(false);
              setShowPersonaMenu(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors"
            title="Set simulated time of day"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-mono tabular-nums">{formatHourString(simulatedHour)}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showTimeMenu && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in duration-100">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Demo Time Simulation
              </div>
              {timePresets.map((tp) => (
                <button
                  key={tp.hour}
                  type="button"
                  onClick={() => {
                    setSimulatedHour(tp.hour);
                    setShowTimeMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                    simulatedHour === tp.hour ? 'font-semibold text-slate-900 bg-amber-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>{tp.label}</span>
                  {simulatedHour === tp.hour && (
                    <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  )}
                </button>
              ))}
              <div className="px-3 py-2 border-t border-slate-100 text-[11px] text-slate-500">
                Simulates radar progression across the day
              </div>
            </div>
          )}
        </div>

        {/* User Account / Persona Switcher Button */}
        <div className="relative">
          <button
            type="button"
            id="topbar-user-menu-btn"
            onClick={() => {
              setShowPersonaMenu(!showPersonaMenu);
              setShowLocationMenu(false);
              setShowTimeMenu(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">
              {isDemoPersona ? `Demo: ${firstName}` : firstName} ({profile.primaryActivity || 'Overview'})
            </span>
            <span className="sm:hidden">{firstName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 text-slate-800 animate-in fade-in duration-100">
              {user && (
                <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/70">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Logged in as
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {user.user_metadata?.full_name || profile.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate font-mono">
                    {user.email}
                  </div>
                </div>
              )}

              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Switch Demo Persona
              </div>

              {/* Persona 1: Aarav */}
              <button
                type="button"
                onClick={() => {
                  setPersona('aarav');
                  setShowPersonaMenu(false);
                }}
                className={`w-full text-left px-3 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100 ${
                  activePersonaId === 'aarav' ? 'bg-amber-50/60 font-semibold' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Aarav Mehta · Runner</span>
                  {activePersonaId === 'aarav' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                  Mumbai · Evening run · Dry slot 5–6 PM vs 6 PM rain
                </p>
              </button>

              {/* Persona 2: Neha */}
              <button
                type="button"
                onClick={() => {
                  setPersona('neha');
                  setShowPersonaMenu(false);
                }}
                className={`w-full text-left px-3 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100 ${
                  activePersonaId === 'neha' ? 'bg-amber-50/60 font-semibold' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Neha Sharma · Commuter</span>
                  {activePersonaId === 'neha' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                  Mumbai · Drives 6–7 PM · Rain starts 6:15 PM · Traffic warning
                </p>
              </button>

              {/* Persona 3: Rahul */}
              <button
                type="button"
                onClick={() => {
                  setPersona('rahul');
                  setShowPersonaMenu(false);
                }}
                className={`w-full text-left px-3 py-2.5 hover:bg-slate-50 transition-colors ${
                  activePersonaId === 'rahul' ? 'bg-amber-50/60 font-semibold' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Rahul Varma · Traveller</span>
                  {activePersonaId === 'rahul' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                  Delhi destination · 32°C thundershowers · Packing list
                </p>
              </button>

              {/* Sign Out Button */}
              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  type="button"
                  id="topbar-signout-btn"
                  onClick={async () => {
                    setShowPersonaMenu(false);
                    clearUserSessionData();
                    await signOut();
                    navigate('/login', { replace: true });
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out of Skyora</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
