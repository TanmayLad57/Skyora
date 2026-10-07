import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppStore } from '../../store/useAppStore';
import { CloudLightning, Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { session, isLoading } = useAuth();
  const { activePersonaId } = useAppStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md animate-pulse">
            <CloudLightning className="w-7 h-7" />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
            <span>Initializing Skyora session...</span>
          </div>
        </div>
      </div>
    );
  }

  const isDemoPersona =
    activePersonaId === 'aarav' ||
    activePersonaId === 'neha' ||
    activePersonaId === 'rahul';

  if (!session && !isDemoPersona) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export const PublicOnlyRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs animate-pulse">
            <CloudLightning className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  }

  if (session) {
    const from = (location.state as any)?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return children;
};
