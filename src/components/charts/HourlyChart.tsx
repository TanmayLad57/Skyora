import React, { useState } from 'react';
import { HourlyForecast } from '../../types';

interface HourlyChartProps {
  hourly: HourlyForecast[];
  userWindow?: { label: string; startHour: number; endHour: number };
  dryWindow?: { label: string; startHour: number; endHour: number };
  currentTemp?: number;
  currentHour?: number;
}

export const HourlyChart: React.FC<HourlyChartProps> = ({
  hourly,
  userWindow,
  dryWindow,
  currentTemp,
  currentHour,
}) => {
  const [hoveredHour, setHoveredHour] = useState<HourlyForecast | null>(null);

  // We display 24 hours (0 to 23), ensuring currentTemp is the canonical source of truth for current hour
  const displayHours = hourly.slice(0, 24).map((h) => {
    if (currentHour !== undefined && h.hour === currentHour && currentTemp !== undefined) {
      return { ...h, temp: currentTemp };
    }
    return h;
  });
  const minTemp = Math.min(...displayHours.map((h) => h.temp)) - 2;
  const maxTemp = Math.max(...displayHours.map((h) => h.temp)) + 2;
  const tempRange = Math.max(maxTemp - minTemp, 4);

  const width = 840;
  const height = 210;
  const padLeft = 40;
  const padRight = 30;
  const padTop = 32;
  const padBottom = 48;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const getX = (idx: number) => padLeft + (idx / (displayHours.length - 1)) * chartW;
  const getY = (temp: number) => padTop + chartH - ((temp - minTemp) / tempRange) * (chartH - 24);

  // Build temperature path
  const points = displayHours.map((h, i) => `${getX(i)},${getY(h.temp)}`).join(' ');
  const areaPath = `M ${getX(0)},${getY(displayHours[0].temp)} ` +
    displayHours.map((h, i) => `L ${getX(i)},${getY(h.temp)}`).join(' ') +
    ` L ${getX(displayHours.length - 1)},${padTop + chartH} L ${getX(0)},${padTop + chartH} Z`;

  // Helper for window X coordinates
  const getHourX = (hour: number) => {
    const idx = displayHours.findIndex((h) => h.hour === hour);
    return idx >= 0 ? getX(idx) : padLeft;
  };

  return (
    <div className="relative w-full">
      {/* Chart Legend / Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-3 text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-500 rounded-full inline-block" />
            <span>Temperature (°C)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2.5 bg-sky-400/50 rounded-xs inline-block" />
            <span>Rain Probability (%)</span>
          </div>
        </div>

        {/* Windows Legend */}
        <div className="flex items-center gap-3">
          {dryWindow && (
            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{dryWindow.label} ({dryWindow.startHour}:00–{dryWindow.endHour}:00)</span>
            </div>
          )}
          {userWindow && (
            <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-200/60">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>{userWindow.label} ({userWindow.startHour}:00–{userWindow.endHour}:00)</span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="overflow-x-auto overflow-y-hidden pb-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[700px] h-48 select-none"
        >
          <defs>
            <linearGradient id="tempAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="rainBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padLeft}
            y1={padTop + chartH}
            x2={width - padRight}
            y2={padTop + chartH}
            stroke="#E2E8F0"
            strokeWidth="1"
          />
          <line
            x1={padLeft}
            y1={padTop + chartH / 2}
            x2={width - padRight}
            y2={padTop + chartH / 2}
            stroke="#F1F5F9"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* User Window Highlight Band */}
          {userWindow && (
            <g>
              <rect
                x={getHourX(userWindow.startHour) - 10}
                y={padTop}
                width={Math.max(28, getHourX(userWindow.endHour) - getHourX(userWindow.startHour) + 20)}
                height={chartH}
                fill="#FEF3C7"
                opacity="0.45"
                rx="4"
              />
              <line
                x1={getHourX(userWindow.startHour)}
                y1={padTop}
                x2={getHourX(userWindow.startHour)}
                y2={padTop + chartH}
                stroke="#D97706"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            </g>
          )}

          {/* Dry Window Highlight Band */}
          {dryWindow && (
            <g>
              <rect
                x={getHourX(dryWindow.startHour) - 10}
                y={padTop}
                width={Math.max(28, getHourX(dryWindow.endHour) - getHourX(dryWindow.startHour) + 20)}
                height={chartH}
                fill="#D1FAE5"
                opacity="0.5"
                rx="4"
              />
              <line
                x1={getHourX(dryWindow.startHour)}
                y1={padTop}
                x2={getHourX(dryWindow.startHour)}
                y2={padTop + chartH}
                stroke="#059669"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            </g>
          )}

          {/* Rain Probability Bars (at bottom) */}
          {displayHours.map((h, i) => {
            const barH = (h.rainProb / 100) * (chartH * 0.45);
            const x = getX(i) - 9;
            const y = padTop + chartH - barH;
            return (
              <g key={`bar-${i}`}>
                {h.rainProb > 0 && (
                  <rect
                    x={x}
                    y={y}
                    width={18}
                    height={barH}
                    rx="3"
                    fill="url(#rainBarGrad)"
                    className="transition-all duration-150 hover:opacity-100"
                  />
                )}
                {/* Rain % label if >= 40% */}
                {h.rainProb >= 40 && (
                  <text
                    x={getX(i)}
                    y={y - 4}
                    textAnchor="middle"
                    className="text-[10px] fill-sky-700 font-mono font-medium"
                  >
                    {h.rainProb}%
                  </text>
                )}
              </g>
            );
          })}

          {/* Temperature Area & Line */}
          <path d={areaPath} fill="url(#tempAreaGrad)" />
          <polyline
            points={points}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Nodes & Hour Markers */}
          {displayHours.map((h, i) => {
            const cx = getX(i);
            const cy = getY(h.temp);
            const isCurrentMoment = currentHour !== undefined && h.hour === currentHour;
            const showLabel = i % 3 === 0 || h.hour === 17 || h.hour === 18 || isCurrentMoment;

            return (
              <g
                key={`node-${i}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredHour(h)}
                onMouseLeave={() => setHoveredHour(null)}
              >
                {/* Hover trigger zone */}
                <rect
                  x={cx - 15}
                  y={padTop}
                  width={30}
                  height={chartH + 30}
                  fill="transparent"
                />

                {/* Current moment highlight pulse ring */}
                {isCurrentMoment && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="8"
                    fill="#F59E0B"
                    fillOpacity="0.25"
                    className="animate-pulse"
                  />
                )}

                {/* Point circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={hoveredHour?.hour === h.hour || isCurrentMoment ? 5 : 3}
                  fill={hoveredHour?.hour === h.hour ? '#D97706' : isCurrentMoment ? '#F59E0B' : '#FFFFFF'}
                  stroke={isCurrentMoment ? '#B45309' : '#F59E0B'}
                  strokeWidth="2"
                  className="transition-all"
                />

                {/* Temp text */}
                {showLabel && (
                  <text
                    x={cx}
                    y={cy - 8}
                    textAnchor="middle"
                    className={`text-[11px] font-mono tabular-nums ${
                      isCurrentMoment ? 'font-bold fill-amber-950' : 'font-semibold fill-slate-800'
                    }`}
                  >
                    {h.temp}°
                  </text>
                )}

                {/* Time Axis Text */}
                {showLabel && (
                  <text
                    x={cx}
                    y={padTop + chartH + 18}
                    textAnchor="middle"
                    className={`text-[11px] font-mono ${
                      isCurrentMoment ? 'font-bold fill-amber-900' : 'fill-slate-500'
                    }`}
                  >
                    {h.time}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Hover Readout */}
      {hoveredHour && (
        <div className="absolute top-1 right-2 bg-slate-900 text-white rounded-md px-2.5 py-1.5 text-xs shadow-md flex items-center gap-3 z-10 pointer-events-none animate-in fade-in duration-100">
          <span className="font-mono font-medium text-amber-400">{hoveredHour.time}</span>
          <span>{hoveredHour.temp}°C ({hoveredHour.feelsLike}° feels)</span>
          <span className="text-sky-300">Rain: {hoveredHour.rainProb}% ({hoveredHour.rainfallMm}mm)</span>
          <span className="text-slate-300">{hoveredHour.conditionText}</span>
        </div>
      )}
    </div>
  );
};
