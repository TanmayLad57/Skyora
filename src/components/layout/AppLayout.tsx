import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAuth } from '../../context/AuthContext';
import { useAppStore } from '../../store/useAppStore';
import { recordInteraction } from '../../services/interactionsService';
import { X } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { logInteraction } = useAppStore();
  const lastTrackedPathRef = useRef<string>('');

  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath === lastTrackedPathRef.current) return;
    lastTrackedPathRef.current = currentPath;

    // Map path to meaningful screen name
    const screenMap: Record<string, string> = {
      '/': 'dashboard',
      '/weather-details': 'weather_details',
      '/activities': 'activities',
      '/time-finder': 'time_finder',
      '/ask-skyora': 'ask_skyora',
      '/alerts': 'alerts',
      '/habits': 'habits',
      '/locations': 'locations',
      '/profile': 'profile',
      '/test-personas': 'test_personas',
    };

    const screenName = screenMap[currentPath] || currentPath.replace('/', '') || 'dashboard';

    // Log locally in store
    logInteraction('view_screen', screenName);

    // Persist to Supabase interactions table
    if (user) {
      recordInteraction(user.id, screenName).catch((err) => {
        console.error('Failed to record screen interaction to Supabase:', err);
      });
    }
  }, [location.pathname, user, logInteraction]);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      {/* Desktop Sidebar (Fixed left) */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 shadow-xl">
            <div className="absolute top-3 right-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
