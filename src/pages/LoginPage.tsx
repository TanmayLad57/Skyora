import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAppStore } from '../store/useAppStore';
import {
  CloudLightning,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  User,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setPersona, updateProfile } = useAppStore();

  const [email, setEmail] = useState((location.state as any)?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    (location.state as any)?.message || null
  );

  // Field validation errors
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
    } = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getFriendlyErrorMessage = (err: any): string => {
    if (!err) return 'Login failed. Please check your credentials.';
    const msg = err.message || '';
    if (
      msg.toLowerCase().includes('invalid login credentials') ||
      msg.toLowerCase().includes('invalid grant') ||
      msg.toLowerCase().includes('invalid_grant')
    ) {
      return 'Invalid email or password. Please verify your credentials and try again.';
    }
    if (msg.toLowerCase().includes('email not confirmed')) {
      return 'Please confirm your email address before logging in. Check your inbox for the confirmation link.';
    }
    if (msg.toLowerCase().includes('rate limit')) {
      return 'Too many login attempts. Please wait a few seconds and try again.';
    }
    return msg || 'An error occurred while logging in. Please try again.';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isLoading) return;

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setErrorMessage(getFriendlyErrorMessage(error));
        setIsLoading(false);
        return;
      }

      // 1. Verify session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // 2. Verify user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!session || !user) {
        setErrorMessage('Authentication session could not be established. Please try again.');
        setIsLoading(false);
        return;
      }

      // Sync registered full name from metadata
      const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
      updateProfile({ name: fullName, id: user.id });

      setSuccessMessage('Login successful! Entering Skyora...');
      const targetPath = (location.state as any)?.from?.pathname || '/';
      setTimeout(() => {
        navigate(targetPath, { replace: true });
      }, 500);
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err));
      setIsLoading(false);
    }
  };

  // Demo Persona Quick Login fallback
  const handleQuickLogin = (personaKey: 'aarav' | 'neha' | 'rahul') => {
    setPersona(personaKey);
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 font-sans select-none">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-xs">
            <CloudLightning className="w-6 h-6" />
          </div>
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
              Sign in to Skyora
            </h1>
            <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              IMD
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Access your personalized weather dashboards, routines, and smart alerts
          </p>
        </div>

        {/* Global Error Alert */}
        {errorMessage && (
          <div
            id="login-error-alert"
            role="alert"
            className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Global Success Alert */}
        {successMessage && (
          <div
            id="login-success-alert"
            role="status"
            className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} noValidate className="space-y-4">
          {/* Email Field */}
          <div>
            <label
              htmlFor="login-email"
              className="text-xs font-semibold text-slate-700 block mb-1"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                disabled={isLoading}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="name@example.com"
                className={`w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border transition-colors focus:outline-hidden ${
                  errors.email
                    ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-600 font-medium mt-1 pl-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="login-password"
                className="text-xs font-semibold text-slate-700 block"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                disabled={isLoading}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="Enter your password"
                className={`w-full text-xs pl-9 pr-10 py-2.5 rounded-lg border transition-colors focus:outline-hidden ${
                  errors.password
                    ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                }`}
              />
              <button
                type="button"
                id="toggle-login-password"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-600 font-medium mt-1 pl-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="pt-2 text-center border-t border-slate-100">
          <p className="text-xs text-slate-600">
            Don't have an account?{' '}
            <Link
              id="goto-register-link"
              to="/register"
              className="text-amber-800 hover:text-amber-900 hover:underline font-bold transition-colors"
            >
              Register
            </Link>
          </p>
        </div>

        {/* Quick Demo Personas */}
        <div className="pt-2 border-t border-slate-100">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
            Or One-Click Demo Personas:
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

        {/* Security & Privacy Badge */}
        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center gap-2 text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-[11px] leading-tight">
            Secured via Supabase Email/Password Authentication & JWT Sessions.
          </span>
        </div>
      </div>
    </div>
  );
};
