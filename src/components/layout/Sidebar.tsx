import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  CloudSun,
  Activity,
  Clock,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  MapPin,
  User,
  Users,
  Lock,
  CloudLightning,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const navItems = [
    { label: 'Personalized Home', path: '/', icon: Home },
    { label: 'Weather Details', path: '/weather-details', icon: CloudSun },
    { label: 'Activity Conditions', path: '/activities', icon: Activity },
    { label: 'Smart Time Finder', path: '/time-finder', icon: Clock },
    { label: 'Ask Skyora AI', path: '/ask-skyora', icon: MessageSquare },
    { label: 'Alerts & Warnings', path: '/alerts', icon: AlertTriangle },
    { label: 'Personal Habits', path: '/habits', icon: Sparkles },
    { label: 'Saved Locations', path: '/locations', icon: MapPin },
    { label: 'Profile & Preferences', path: '/profile', icon: User },
    { label: 'Test Personas', path: '/test-personas', icon: Users, badge: 'Demo' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col h-full shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-xs">
            <CloudLightning className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 font-display">
                Skyora
              </span>
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                IMD
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">
              India Meteorological Department
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
        {/* Sign Out Option */}
        <button
          type="button"
          onClick={async () => {
            if (onCloseMobile) onCloseMobile();
            await signOut();
            navigate('/login', { replace: true });
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </div>
        </button>
      </nav>

      {/* Privacy Note at Bottom */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-start gap-2 text-slate-500">
          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-semibold text-slate-700 block">Privacy First</span>
            Your routines and preferences stay encrypted on this device.
          </div>
        </div>
      </div>
    </aside>
  );
};
