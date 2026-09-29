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
} from 'lucide-react';

export const WeatherDetailsPage: React.FC = () => {
  const { profile, simulatedHour } = useAppStore();
  const [activeTab, setActiveTab] = useState<'24hours' | '7days' | 'air'>('24hours');

  const activeLocation =
    profile.locations.find((l) => l.id === profile.activeLocationId) ||
    profile.locations[0] || { name: 'Mumbai', state: 'Maharashtra' };

  const weather = getWeatherData(activeLocation.name, simulatedHour, profile.units);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Weather Details
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Comprehensive meteorological observations and multi-day projections for {weather.city}, {weather.state}
        </p>
      </div>

      {/* Hero Snapshot */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <WeatherArt condition={weather.condition} size="lg" />
          <div>
            <div className="flex items-baseline">
              <span className="text-5xl font-extrabold text-slate-900 font-mono tabular-nums">
                {weather.temp}
              </span>
              <span className="text-2xl font-medium text-slate-500 ml-1">
                °{profile.units}
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-800 mt-1">
              {weather.conditionText}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Feels like {weather.feelsLike}°{profile.units} · Station last updated {weather.lastUpdated}
            </div>
          </div>
        </div>

        {/* Quick Readout Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Rain Probability</span>
            <span className="text-base font-bold text-slate-900 font-mono">{weather.rainProb}%</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Wind</span>
            <span className="text-base font-bold text-slate-900 font-mono">{weather.windSpeedKm} km/h</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
            <span className="text-slate-400 block text-[11px]">Humidity</span>
            <span className="text-base font-bold text-slate-900 font-mono">{weather.humidity}%</span>
          </div>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('24hours')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === '24hours' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Next 24 Hours</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('7days')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === '7days' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Next 7 Days</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('air')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
            activeTab === 'air' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>Air & Environmental Parameters</span>
        </button>
      </div>

      {/* Tab 1: Next 24 Hours */}
      {activeTab === '24hours' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-2">Hourly Curve Analysis</h2>
            <HourlyChart
              hourly={weather.hourly}
              dryWindow={{ label: 'Dry Window', startHour: 17, endHour: 18 }}
              userWindow={{ label: 'Routine Window', startHour: 18, endHour: 19 }}
            />
          </div>

          {/* Tabular Hourly Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs overflow-hidden">
            <h2 className="text-sm font-bold text-slate-900 mb-3">Detailed Hourly Log</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium">
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Condition</th>
                    <th className="py-2.5 px-3 text-right">Temp</th>
                    <th className="py-2.5 px-3 text-right">Rain %</th>
                    <th className="py-2.5 px-3 text-right">Rainfall (mm)</th>
                    <th className="py-2.5 px-3 text-right">Wind</th>
                    <th className="py-2.5 px-3 text-right">Humidity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {weather.hourly.map((h, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{h.time}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-700 flex items-center gap-2">
                        <WeatherArt condition={h.condition} size="sm" />
                        <span>{h.conditionText}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-900 font-bold">{h.temp}°</td>
                      <td className="py-2.5 px-3 text-right text-sky-700 font-semibold">{h.rainProb}%</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{h.rainfallMm} mm</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{h.windSpeedKm} km/h</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{h.humidity}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Next 7 Days */}
      {activeTab === '7days' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-4">7-Day Meteorological Projections</h2>
            <div className="space-y-3">
              {weather.daily.map((d, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-[160px]">
                    <WeatherArt condition={d.condition} size="md" />
                    <div>
                      <div className="text-sm font-bold text-slate-900">{d.day}</div>
                      <div className="text-xs text-slate-500">{d.date}</div>
                    </div>
                  </div>

                  <div className="flex-1 max-w-md text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">{d.conditionText}</span> — {d.summary}
                  </div>

                  <div className="flex items-center gap-6 font-mono text-xs text-right">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Rain</span>
                      <span className="font-semibold text-sky-700">{d.rainProb}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">High / Low</span>
                      <span className="font-bold text-slate-900">{d.tempMax}° / {d.tempMin}°</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Air & Conditions */}
      {activeTab === 'air' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Air Quality Index Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">National Air Quality Index (AQI)</h2>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                {weather.aqiStatus}
              </span>
            </div>
            <div className="text-4xl font-extrabold text-slate-900 font-mono mb-2">
              {weather.aqi}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Air quality is considered satisfactory, and air pollution poses little or no risk to general outdoor activities.
            </p>
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>PM 2.5: <strong className="font-mono text-slate-800">28 µg/m³</strong></span>
                <span className="text-emerald-700">Good</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>PM 10: <strong className="font-mono text-slate-800">54 µg/m³</strong></span>
                <span className="text-emerald-700">Moderate</span>
              </div>
            </div>
          </div>

          {/* Solar & Day Cycle */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Sun className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">Daylight & Solar Schedule</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 my-3">
              <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-100 flex items-center gap-3">
                <Sunrise className="w-6 h-6 text-amber-600" />
                <div>
                  <span className="text-[11px] text-slate-500 block">Sunrise</span>
                  <span className="text-base font-bold text-slate-900 font-mono">{weather.sunrise} IST</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-100 flex items-center gap-3">
                <Sunset className="w-6 h-6 text-amber-700" />
                <div>
                  <span className="text-[11px] text-slate-500 block">Sunset</span>
                  <span className="text-base font-bold text-slate-900 font-mono">{weather.sunset} IST</span>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
              <div className="flex justify-between">
                <span>UV Radiation Index:</span>
                <span className="font-bold text-slate-900 font-mono">{weather.uvIndex} ({weather.uvLevel})</span>
              </div>
              <div className="flex justify-between">
                <span>Horizontal Visibility:</span>
                <span className="font-bold text-slate-900 font-mono">{weather.visibilityKm} km</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
