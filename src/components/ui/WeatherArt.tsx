import React from 'react';
import { WeatherConditionCode } from '../../types';

interface WeatherArtProps {
  condition: WeatherConditionCode | string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
}

export const WeatherArt: React.FC<WeatherArtProps> = ({
  condition,
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    hero: 'w-32 h-32 md:w-36 md:h-36',
  };

  const currentSize = sizeMap[size];

  switch (condition) {
    case 'clear':
      return (
        <svg
          viewBox="0 0 100 100"
          className={`${currentSize} ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Outer Glow */}
          <circle cx="50" cy="50" r="32" fill="#FEF3C7" opacity="0.6" />
          {/* Core Sun Body */}
          <circle cx="50" cy="50" r="22" fill="url(#sun-grad)" />
          {/* Gentle Rays */}
          <path
            d="M50 14V22M50 78V86M14 50H22M78 50H86M24.5 24.5L30.2 30.2M69.8 69.8L75.5 75.5M24.5 75.5L30.2 69.8M69.8 30.2L75.5 24.5"
            stroke="#F59E0B"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="sun-grad" x1="30" y1="30" x2="70" y2="70" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FBBF24" />
              <stop offset="1" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'partly-cloudy':
      return (
        <svg
          viewBox="0 0 100 100"
          className={`${currentSize} ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Peeking Sun */}
          <circle cx="64" cy="36" r="16" fill="url(#peeking-sun)" />
          <path
            d="M64 14V18M82 26L79 29M86 36H82M64 54V50M79 43L82 46"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Soft Foreground Cloud */}
          <path
            d="M32 72H68C76 72 82 66 82 58C82 50.5 76.5 44.5 69.5 44C67.5 34 58.5 26 48 26C36.5 26 27 35 26.2 46.5C20.5 48 16 53.5 16 60C16 66.5 23 72 32 72Z"
            fill="url(#cloud-soft)"
          />
          <defs>
            <linearGradient id="peeking-sun" x1="50" y1="20" x2="78" y2="52" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE68A" />
              <stop offset="1" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="cloud-soft" x1="20" y1="28" x2="75" y2="72" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="1" stopColor="#CBD5E1" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'cloudy':
      return (
        <svg
          viewBox="0 0 100 100"
          className={`${currentSize} ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Back Cloud */}
          <path
            d="M52 50H78C84 50 88 45.5 88 40C88 34.5 83.5 30 78 30C76.5 23 70 18 62 18C53 18 46 24 45 32C41 33 38 37 38 41C38 46 42 50 52 50Z"
            fill="#CBD5E1"
            opacity="0.8"
          />
          {/* Front Cloud */}
          <path
            d="M28 74H74C82 74 88 68 88 60C88 52.5 82 46.5 75 46C73 35.5 64 27.5 53 27.5C41 27.5 31.5 37 30.5 49C24.5 50.5 20 56 20 62.5C20 69 26 74 28 74Z"
            fill="url(#overcast-grad)"
          />
          <defs>
            <linearGradient id="overcast-grad" x1="20" y1="30" x2="80" y2="74" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F1F5F9" />
              <stop offset="1" stopColor="#94A3B8" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'heavy-rain':
    case 'light-rain':
    case 'drizzle':
      return (
        <svg
          viewBox="0 0 100 100"
          className={`${currentSize} ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Rain Cloud */}
          <path
            d="M28 56H72C79.5 56 85.5 50.5 85.5 43C85.5 36 80 30.5 73 30C71 21 62.5 14 52 14C40.5 14 31.5 22.5 30.5 33.5C24.5 35 20 40 20 46C20 51.5 25 56 28 56Z"
            fill="url(#rain-cloud-grad)"
          />
          {/* Rain streaks */}
          <line x1="32" y1="64" x2="26" y2="78" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
          <line x1="48" y1="64" x2="42" y2="82" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
          <line x1="64" y1="64" x2="58" y2="80" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
          {condition === 'heavy-rain' && (
            <>
              <line x1="38" y1="72" x2="33" y2="86" stroke="#0369A1" strokeWidth="3" strokeLinecap="round" />
              <line x1="56" y1="70" x2="51" y2="86" stroke="#0369A1" strokeWidth="3" strokeLinecap="round" />
            </>
          )}
          <defs>
            <linearGradient id="rain-cloud-grad" x1="20" y1="16" x2="80" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#94A3B8" />
              <stop offset="1" stopColor="#475569" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'thunderstorm':
      return (
        <svg
          viewBox="0 0 100 100"
          className={`${currentSize} ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Storm Cloud */}
          <path
            d="M26 54H74C81 54 87 48.5 87 41.5C87 35 81.5 29.5 75 29C73 20 64.5 13 54 13C42 13 32.5 21.5 31.5 32.5C25.5 34 21 39 21 45C21 50 25.5 54 26 54Z"
            fill="url(#storm-cloud)"
          />
          {/* Lightning Bolt */}
          <path
            d="M50 50L40 68H51L44 87L62 62H50L56 50H50Z"
            fill="#FBBF24"
            stroke="#D97706"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Angled Rain Drops */}
          <line x1="30" y1="62" x2="24" y2="76" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="72" y1="60" x2="66" y2="74" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />
          <defs>
            <linearGradient id="storm-cloud" x1="20" y1="15" x2="80" y2="54" gradientUnits="userSpaceOnUse">
              <stop stopColor="#64748B" />
              <stop offset="1" stopColor="#1E293B" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'fog':
      return (
        <svg
          viewBox="0 0 100 100"
          className={`${currentSize} ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Fog Layers */}
          <line x1="22" y1="36" x2="78" y2="36" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
          <line x1="16" y1="48" x2="84" y2="48" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
          <line x1="26" y1="60" x2="74" y2="60" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
          <line x1="20" y1="72" x2="80" y2="72" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    default:
      return (
        <svg
          viewBox="0 0 100 100"
          className={`${currentSize} ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="25" fill="#38BDF8" opacity="0.8" />
        </svg>
      );
  }
};
