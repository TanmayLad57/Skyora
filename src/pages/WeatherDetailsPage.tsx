import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getWeatherData } from '../services/weather';
import { WeatherArt } from '../components/ui/WeatherArt';
import { HourlyChart } from '../components/charts/HourlyChart';
import {
  Sunrise,
  Sunset,
  Wind,
  Droplets,
  Sun,
  Eye,
  Activity,
  Gauge,
  Calendar,
  Clock,
  Compass,
  ArrowUp,
  ArrowDown,
  MapPin,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const WeatherDetailsPage: React.FC = () => {
  const { profile, simulatedHour } = useAppStore();
  const [activeTab, setActiveTab] = useState<'24hours' | '7days' | 'air'>('24hours');

  const activeLocation =
    profile.locations.find((l) => l.id === profile.activeLocationId) ||
    profile.locations[0] || { name: 'Mumbai', state: 'Maharashtra' };

  const weather = getWeatherData(activeLocation.name, simulatedHour, profile.units);
  const unitSymbol = profile.units === 'F' ? '°F' : '°C';

  // 7-Day temperature range scale bounds for visual bar positioning
  const globalMinTemp = Math.min(...weather.daily.map((d) => d.tempMin), 10);
  const globalMaxTemp = Math.max(...weather.daily.map((d) => d.tempMax), 40);
  const tempSpan = Math.max(globalMaxTemp - globalMinTemp, 1);

  // Daylight arc calculations
  const parseTimeToMinutes = (timeStr: string) => {
    const parts = timeStr.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || '0', 10);
  };

  const sunriseMin = parseTimeToMinutes(weather.sunrise || '06:15');
  const sunsetMin = parseTimeToMinutes(weather.sunset || '18:25');
  const currentMin = (simulatedHour !== undefined ? simulatedHour : new Date().getHours()) * 60 + 30;

  // Sun position normalized (0 to 1) along the daylight arc
  let daylightProgress = 0;
  const isDaytime = currentMin >= sunriseMin && currentMin <= sunsetMin;
  if (currentMin <= sunriseMin) daylightProgress = 0;
  else if (currentMin >= sunsetMin) daylightProgress = 1;
  else daylightProgress = (currentMin - sunriseMin) / (sunsetMin - sunriseMin);

  // Parabolic sun trajectory coordinates: x: 20 to 180, y: 80 - sin(progress * PI) * 55
  const sunX = 20 + daylightProgress * 160;
  const sunY = 80 - Math.sin(daylightProgress * Math.PI) * 55;

  // AQI semi-circular gauge angle calculation (0 to 300 AQI -> -90deg to +90deg)
  const aqiClamped = Math.min(Math.max(weather.aqi, 0), 300);
  const aqiAngle = -90 + (aqiClamped / 300) * 180;

  // AQI color accents
  const aqiBadgeColors = {
    Good: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Moderate: 'bg-amber-50 text-amber-800 border-amber-200',
    Poor: 'bg-orange-50 text-orange-800 border-orange-200',
    Unhealthy: 'bg-rose-50 text-rose-800 border-rose-200',
  }[weather.aqiStatus] || 'bg-slate-50 text-slate-700 border-slate-200';

  const aqiBarColor = {
    Good: '#10b981',
    Moderate: '#f59e0b',
    Poor: '#f97316',
    Unhealthy: '#ef4444',
  }[weather.aqiStatus] || '#64748b';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>{weather.city}, {weather.state}</span>
          <span aria-hidden="true">·</span>
          <span>Station Observation</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Weather Details & Forecast
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Comprehensive meteorological observations and multi-day projections for {weather.city}
        </p>
      </div>

      {/* Hero Snapshot Card (Matching Home's Elevation & Polish) */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden transition-all">
        <div className="flex flex-wrap items-start justify-between gap-6">
          {/* Main Temp & Condition Block */}
          <div className="flex items-center gap-6">
            <WeatherArt condition={weather.condition} size="hero" />
            <div>
              <div className="flex items-baseline">
                <span className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
                  {weather.temp}
                </span>
                <span className="text-2xl md:text-3xl font-medium text-slate-500 ml-1">
                  {unitSymbol}
                </span>
              </div>
              <div className="text-base font-bold text-slate-800 mt-0.5">
                {weather.conditionText}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                <span>
                  Feels like <strong className="font-semibold text-slate-700 font-mono">{weather.feelsLike}{unitSymbol}</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-0.5 font-mono">
                  <ArrowUp className="w-3 h-3 text-amber-600" />
                  <span>{weather.daily[0]?.tempMax ?? weather.temp + 2}°</span>
                  <ArrowDown className="w-3 h-3 text-sky-600 ml-1" />
                  <span>{weather.daily[0]?.tempMin ?? weather.temp - 3}°</span>
                </span>
                <span aria-hidden="true">·</span>
                <span>Updated {weather.lastUpdated}</span>
              </div>
            </div>
          </div>

          {/* Quick Met Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs w-full lg:w-auto">
            {/* Precipitation Potential */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-medium">Precipitation</span>
                <Droplets className="w-3.5 h-3.5 text-sky-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
                {weather.rainProb}%
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {weather.rainfallMm > 0 ? `${weather.rainfallMm} mm expected` : 'No rain this hour'}
              </div>
            </div>

            {/* Wind Dynamics */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-medium">Wind Vector</span>
                <Wind className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 font-mono tabular-nums flex items-baseline gap-1.5">
                <span>{weather.windSpeedKm}</span>
                <span className="text-xs font-normal text-slate-500">km/h</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Direction: <strong className="font-semibold text-slate-700">{weather.windDirection}</strong>
              </div>
            </div>

            {/* Humidity */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-medium">Relative Humidity</span>
                <Droplets className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
                {weather.humidity}%
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {weather.humidity > 75 ? 'Humid & heavy' : weather.humidity > 50 ? 'Comfortable' : 'Dry & crisp'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Tab Navigation Control */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit border border-slate-200/60">
        <button
          type="button"
          onClick={() => setActiveTab('24hours')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === '24hours'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Next 24 Hours</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('7days')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === '7days'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>7-Day Outlook</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('air')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'air'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
          }`}
        >
          <Gauge className="w-3.5 h-3.5 text-slate-500" />
          <span>Air & Solar Environment</span>
        </button>
      </div>

      {/* TAB 1: 24-HOUR FORECAST & INTERVAL CARDS */}
      {activeTab === '24hours' && (
        <div className="space-y-6">
          {/* Hourly Curve Chart */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900">
                24-Hour Temperature & Precipitation Curve
              </h2>
              <span className="text-[11px] text-slate-400">
                Hourly model updates
              </span>
            </div>
            <HourlyChart
              hourly={weather.hourly}
              dryWindow={{ label: 'Dry Window', startHour: 17, endHour: 18 }}
              userWindow={{ label: 'Routine Window', startHour: 18, endHour: 19 }}
            />
          </div>

          {/* Hourly Interval Breakdown (Modern Cards replacing raw HTML table) */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Hourly Conditions Breakdown
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed timeline of rain chances, thermal curve, and wind speeds throughout the day
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">24 hourly intervals</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-2">
              {weather.hourly.map((h) => {
                const isSelectedHour = simulatedHour !== undefined && h.hour === simulatedHour;
                return (
                  <div
                    key={h.hour}
                    className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelectedHour
                        ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/30'
                        : 'bg-slate-50/70 border-slate-200/70 hover:bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 font-mono">{h.time}</span>
                        {isSelectedHour && (
                          <span className="text-[9px] bg-amber-500 text-white font-bold px-1 rounded">
                            Now
                          </span>
                        )}
                      </div>

                      <div className="my-2.5 flex items-center justify-center">
                        <WeatherArt condition={h.condition} size="sm" />
                      </div>

                      <div className="text-center">
                        <div className="text-lg font-extrabold text-slate-900 font-mono">
                          {h.temp}°
                        </div>
                        <div className="text-[11px] font-medium text-slate-600 truncate mt-0.5">
                          {h.conditionText}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 space-y-1 text-[10px] text-slate-500 font-mono">
                      <div className="flex justify-between items-center">
                        <span>Rain:</span>
                        <span className={`font-semibold ${h.rainProb > 40 ? 'text-sky-700' : 'text-slate-600'}`}>
                          {h.rainProb}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Wind:</span>
                        <span className="text-slate-700">{h.windSpeedKm} km/h</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 7-DAY OUTLOOK WITH VISUAL MIN/MAX RANGE BARS */}
      {activeTab === '7days' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              7-Day Multi-Model Meteorological Projections
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Extended temperature spans, precipitation trends, and daily atmospheric summaries
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {weather.daily.map((d, i) => {
              // Calculate horizontal position & width percentage for temperature span
              const leftPercent = Math.max(0, ((d.tempMin - globalMinTemp) / tempSpan) * 100);
              const rightPercent = Math.min(100, ((d.tempMax - globalMinTemp) / tempSpan) * 100);
              const barWidth = Math.max(8, rightPercent - leftPercent);

              return (
                <div
                  key={i}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    i === 0
                      ? 'bg-amber-50/30 border-amber-200'
                      : 'bg-slate-50/70 border-slate-100 hover:bg-slate-100/60 hover:border-slate-200'
                  }`}
                >
                  {/* Day, Date & Icon */}
                  <div className="flex items-center gap-3.5 min-w-[190px]">
                    <WeatherArt condition={d.condition} size="md" />
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{d.day}</span>
                        {i === 0 && (
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{d.date}</div>
                    </div>
                  </div>

                  {/* Summary description */}
                  <div className="flex-1 text-xs text-slate-600 leading-relaxed md:px-2">
                    <span className="font-semibold text-slate-800">{d.conditionText}</span> — {d.summary}
                  </div>

                  {/* Rain Probability Badge */}
                  <div className="flex items-center gap-1 text-xs font-mono min-w-[80px]">
                    <Droplets className="w-3.5 h-3.5 text-sky-500" />
                    <span className={`font-semibold ${d.rainProb > 40 ? 'text-sky-700' : 'text-slate-500'}`}>
                      {d.rainProb}%
                    </span>
                  </div>

                  {/* Visual Temperature Range Bar */}
                  <div className="flex items-center gap-3 min-w-[200px] text-xs font-mono">
                    <span className="w-8 text-right font-medium text-slate-500">{d.tempMin}°</span>
                    <div className="flex-1 h-2.5 bg-slate-200/80 rounded-full relative overflow-hidden">
                      <div
                        className="absolute h-full rounded-full bg-linear-to-r from-sky-400 via-amber-400 to-amber-600"
                        style={{
                          left: `${leftPercent}%`,
                          width: `${barWidth}%`,
                        }}
                      />
                    </div>
                    <span className="w-8 text-left font-bold text-slate-900">{d.tempMax}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: AIR QUALITY, SOLAR CYCLE & ENVIRONMENTAL SENSORS */}
      {activeTab === 'air' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* 1. National Air Quality Index with Semi-Circular Gauge */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">National Air Quality (AQI)</h2>
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${aqiBadgeColors}`}>
                {weather.aqiStatus}
              </span>
            </div>

            {/* SVG Arc Gauge */}
            <div className="flex flex-col items-center justify-center pt-2">
              <svg viewBox="0 0 200 115" className="w-48 h-28 overflow-visible">
                {/* Background Arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                {/* Active Colored Arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke={aqiBarColor}
                  strokeWidth="14"
                  strokeDasharray="251.3"
                  strokeDashoffset={251.3 - (aqiClamped / 300) * 251.3}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
                {/* Needle Needle/Center text */}
                <circle cx="100" cy="100" r="4" fill="#0f172a" />
                <line
                  x1="100"
                  y1="100"
                  x2={100 + 65 * Math.cos((aqiAngle * Math.PI) / 180)}
                  y2={100 + 65 * Math.sin((aqiAngle * Math.PI) / 180)}
                  stroke="#0f172a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              <div className="text-center -mt-6">
                <div className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {weather.aqi}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  USAQI Standard · {weather.city}
                </div>
              </div>
            </div>

            {/* Guidance copy */}
            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              {weather.aqi <= 50
                ? 'Air quality is satisfactory; ambient conditions are ideal for outdoor high-intensity cardio.'
                : weather.aqi <= 100
                ? 'Air quality is acceptable; moderate sensitivity individuals may consider standard outdoor routines.'
                : weather.aqi <= 150
                ? 'Slight respiratory sensitivity risk; sensitive groups should limit strenuous outdoor training.'
                : 'High particulate load; outdoor workouts should be shortened or shifted indoors.'}
            </p>

            {/* Particulate matter breakdown */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Fine PM 2.5</span>
                <span className="font-mono font-bold text-slate-800">
                  {Math.round(weather.aqi * 0.35)} µg/m³
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Coarse PM 10</span>
                <span className="font-mono font-bold text-slate-800">
                  {Math.round(weather.aqi * 0.58)} µg/m³
                </span>
              </div>
            </div>
          </div>

          {/* 2. Solar Daylight Schedule with SVG Trajectory Curve */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900">Daylight & Sun Trajectory</h2>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                isDaytime ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
              }`}>
                {isDaytime ? 'Daylight Active' : 'Night Hours'}
              </span>
            </div>

            {/* SVG Parabolic Daylight Path */}
            <div className="pt-2 flex flex-col items-center">
              <svg viewBox="0 0 200 100" className="w-full h-28 overflow-visible">
                {/* Horizon Line */}
                <line x1="10" y1="85" x2="190" y2="85" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="3 3" />
                {/* Trajectory Parabola */}
                <path
                  d="M 20 85 Q 100 10 180 85"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
                {/* Sun Marker */}
                <circle cx={sunX} cy={sunY} r="7" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" className="shadow-xs" />
                <circle cx={sunX} cy={sunY} r="12" fill="#fbbf24" fillOpacity="0.25" />
                {/* Sunrise/Sunset labels on SVG */}
                <text x="20" y="98" fontSize="9" fill="#64748b" textAnchor="middle" fontFamily="monospace">
                  {weather.sunrise}
                </text>
                <text x="180" y="98" fontSize="9" fill="#64748b" textAnchor="middle" fontFamily="monospace">
                  {weather.sunset}
                </text>
              </svg>
            </div>

            {/* Sunrise & Sunset Tiles */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100 flex items-center gap-3">
                <Sunrise className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-500 block">Sunrise</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">{weather.sunrise} IST</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100 flex items-center gap-3">
                <Sunset className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-500 block">Sunset</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">{weather.sunset} IST</span>
                </div>
              </div>
            </div>

            {/* UV Index & Exposure Bar */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">Solar UV Index</span>
                <span className="font-bold text-slate-900 font-mono">
                  {weather.uvIndex} · {weather.uvLevel} Risk
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div className="flex-1 bg-emerald-400" title="Low (0-2)" />
                <div className="flex-1 bg-amber-400" title="Moderate (3-5)" />
                <div className="flex-1 bg-orange-500" title="High (6-7)" />
                <div className="flex-1 bg-rose-500" title="Very High (8-10)" />
                <div className="flex-1 bg-purple-600" title="Extreme (11+)" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 Low</span>
                <span>3 Mod</span>
                <span>6 High</span>
                <span>8 V.High</span>
                <span>11+ Ext</span>
              </div>
            </div>

            {/* Visibility Metric */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>Atmospheric Visibility</span>
              </div>
              <span className="font-bold text-slate-900 font-mono">{weather.visibilityKm} km</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
