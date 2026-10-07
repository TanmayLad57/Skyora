import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAppStore } from '../store/useAppStore';
import {
  CloudLightning,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { updateProfile } = useAppStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Field validation errors
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    // 1. Full Name validation
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    // 2. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // 3. Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // 4. Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getFriendlyErrorMessage = (err: any): string => {
    if (!err) return 'Registration failed. Please try again.';
    const msg = err.message || '';
    if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('user already exists')) {
      return 'An account with this email already exists. Please login instead.';
    }
    if (msg.toLowerCase().includes('at least 6 characters')) {
      return 'Password must be at least 6 characters long.';
    }
    if (msg.toLowerCase().includes('valid email') || msg.toLowerCase().includes('invalid format')) {
      return 'Please enter a valid email address.';
    }
    if (msg.toLowerCase().includes('rate limit')) {
      return 'Too many attempts. Please wait a moment and try again.';
    }
    return msg || 'Registration could not be completed. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isLoading) return;

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        setErrorMessage(getFriendlyErrorMessage(error));
        setIsLoading(false);
        return;
      }

      // If a session was automatically created, sign out so the user explicitly logs in
      if (data.session) {
        await supabase.auth.signOut();
      }

      setSuccessMessage('Account created successfully. Please log in.');
      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: {
            message: 'Account created successfully. Please log in.',
            email: email.trim(),
          },
        });
      }, 1200);
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err));
      setIsLoading(false);
    }
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
              Create Account
            </h1>
            <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              IMD
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Join Skyora to experience intelligent, routine-aware weather guidance tailored for India
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div
            id="register-error-alert"
            role="alert"
            className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Global Success Banner */}
        {successMessage && (
          <div
            id="register-success-alert"
            role="status"
            className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* 1. Full Name */}
          <div>
            <label
              htmlFor="register-fullname"
              className="text-xs font-semibold text-slate-700 block mb-1"
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="register-fullname"
                type="text"
                autoComplete="name"
                disabled={isLoading}
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
                placeholder="e.g. Tanmay Sharma"
                className={`w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border transition-colors focus:outline-hidden ${
                  errors.fullName
                    ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="text-[11px] text-rose-600 font-medium mt-1 pl-1">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* 2. Email Address */}
          <div>
            <label
              htmlFor="register-email"
              className="text-xs font-semibold text-slate-700 block mb-1"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="register-email"
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

          {/* 3. Password */}
          <div>
            <label
              htmlFor="register-password"
              className="text-xs font-semibold text-slate-700 block mb-1"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                disabled={isLoading}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="At least 6 characters"
                className={`w-full text-xs pl-9 pr-10 py-2.5 rounded-lg border transition-colors focus:outline-hidden ${
                  errors.password
                    ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                }`}
              />
              <button
                type="button"
                id="toggle-register-password"
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

          {/* 4. Confirm Password */}
          <div>
            <label
              htmlFor="register-confirm-password"
              className="text-xs font-semibold text-slate-700 block mb-1"
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="register-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                disabled={isLoading}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword)
                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                placeholder="Re-enter your password"
                className={`w-full text-xs pl-9 pr-10 py-2.5 rounded-lg border transition-colors focus:outline-hidden ${
                  errors.confirmPassword
                    ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                }`}
              />
              <button
                type="button"
                id="toggle-register-confirm-password"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] text-rose-600 font-medium mt-1 pl-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            id="register-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="pt-2 text-center border-t border-slate-100">
          <p className="text-xs text-slate-600">
            Already have an account?{' '}
            <Link
              id="goto-login-link"
              to="/login"
              className="text-amber-800 hover:text-amber-900 hover:underline font-bold transition-colors"
            >
              Login
            </Link>
          </p>
        </div>

        {/* Security & Privacy Badge */}
        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center gap-2 text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-[11px] leading-tight">
            Encrypted with Supabase Authentication. Passwords are securely hashed.
          </span>
        </div>
      </div>
    </div>
  );
};
