import React, { useState } from 'react';
import { Sun, Droplets, Compass, Thermometer, Flame, ChevronDown, ChevronUp, Clock, Trees, Zap, ShieldCheck } from 'lucide-react';
import { EnvironmentalContext, TimeRecommendation } from '../types';
import { getTimeBasedRecommendation } from '../services/tradeoffAnalyst';

interface TimeSliderProps {
  env: EnvironmentalContext;
  timeRec?: TimeRecommendation;
  onChangeTime: (minutes: number) => void;
  onSelectRoute?: (id: 'fastest' | 'coolest' | 'balanced' | 'all') => void;
}

const PRESET_HOURS = [
  { label: '8:00 AM', desc: 'Morning', minutes: 480 },
  { label: '11:30 AM', desc: 'Late Morning', minutes: 690 },
  { label: '1:30 PM', desc: 'Midday Peak', minutes: 810 },
  { label: '3:30 PM', desc: 'Afternoon', minutes: 930 },
  { label: '6:30 PM', desc: 'Evening', minutes: 1110 },
];

export const TimeSlider: React.FC<TimeSliderProps> = ({ env, timeRec, onChangeTime, onSelectRoute }) => {
  const [showTelemetry, setShowTelemetry] = useState(false);
  const minMinutes = 420; // 07:00
  const maxMinutes = 1200; // 20:00

  const rec = timeRec || getTimeBasedRecommendation(env);
  const bestId = rec.bestRouteId;

  return (
    <div className="bg-black/95 backdrop-blur-md rounded-2xl border border-neutral-800 p-4 shadow-xl space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Title & Departure Display */}
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white tracking-wide">
              Departure Time
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Slide to see how sun angles, shade coverage, and street heat evolve throughout the day
          </p>
        </div>

        {/* Departure Time Badge */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="px-3.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2 shadow-inner">
            <span className="text-xs text-neutral-400">Departure:</span>
            <span className="text-base font-mono font-bold text-white">{env.timeFormatted}</span>
          </div>

          <button
            onClick={() => setShowTelemetry(!showTelemetry)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800 transition"
            title="Toggle solar and microclimate measurements"
          >
            <span>Solar Info</span>
            {showTelemetry ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Scrub Slider */}
      <div className="relative px-1">
        <input
          type="range"
          min={minMinutes}
          max={maxMinutes}
          step={15}
          value={env.timestampMinutes}
          onChange={(e) => onChangeTime(Number(e.target.value))}
          className="w-full h-2.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
        />
        <div className="flex justify-between text-[11px] font-mono text-neutral-400 mt-1">
          <span>07:00 AM</span>
          <span>10:00 AM</span>
          <span className="text-neutral-300 font-medium">01:00 PM (Solar Peak)</span>
          <span>04:00 PM</span>
          <span>08:00 PM</span>
        </div>
      </div>

      {/* Dynamic Route Recommendation for Departure Time */}
      <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 shadow-inner flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl flex items-center justify-center ${
            bestId === 'coolest'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : bestId === 'fastest'
              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
              : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
          }`}>
            {bestId === 'coolest' ? (
              <Trees className="w-5 h-5 text-emerald-400" />
            ) : bestId === 'fastest' ? (
              <Zap className="w-5 h-5 text-red-400" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-sky-400" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Optimal Route at {env.timeFormatted}:</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                bestId === 'coolest'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : bestId === 'fastest'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                  : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              }`}>
                {rec.bestRouteTitle}
              </span>
              <span className="text-[11px] text-neutral-400 hidden md:inline">({rec.phaseName})</span>
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
              {rec.detailedReason}
            </div>
          </div>
        </div>

        {onSelectRoute && (
          <button
            onClick={() => onSelectRoute(bestId)}
            className={`text-xs px-3 py-1.5 rounded-xl font-semibold border transition self-start sm:self-auto whitespace-nowrap shadow ${
              bestId === 'coolest'
                ? 'bg-emerald-600/90 hover:bg-emerald-600 text-white border-emerald-500'
                : bestId === 'fastest'
                ? 'bg-red-600/90 hover:bg-red-600 text-white border-red-500'
                : 'bg-sky-600/90 hover:bg-sky-600 text-white border-sky-500'
            }`}
          >
            Select {rec.bestRouteTitle.split(' ')[0]}
          </button>
        )}
      </div>

      {/* Preset Quick-Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {PRESET_HOURS.map((preset) => {
          const isSelected = Math.abs(env.timestampMinutes - preset.minutes) < 20;
          return (
            <button
              key={preset.label}
              onClick={() => onChangeTime(preset.minutes)}
              className={`px-3 py-2 rounded-xl text-left transition-all border ${
                isSelected
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-medium'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <div className="text-xs font-semibold leading-tight">{preset.label}</div>
              <div className="text-[10px] text-neutral-400 truncate">{preset.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Expandable Microclimate & Solar Telemetry Grid */}
      {showTelemetry && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 border-t border-neutral-800 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-950 border border-neutral-800">
            <Sun className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-neutral-400 text-[10px] font-medium">Solar Elevation</div>
              <div className="font-semibold text-neutral-100">{env.solarAltitudeDeg}°</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-950 border border-neutral-800">
            <Compass className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-neutral-400 text-[10px] font-medium">Solar Azimuth</div>
              <div className="font-semibold text-neutral-100">{env.solarAzimuthDeg}°</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-950 border border-neutral-800">
            <Thermometer className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-neutral-400 text-[10px] font-medium">Direct Irradiance</div>
              <div className="font-semibold text-neutral-100">{env.directSolarIrradianceWm2} W/m²</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-950 border border-neutral-800">
            <Droplets className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-neutral-400 text-[10px] font-medium">Humidity</div>
              <div className="font-semibold text-neutral-100">{env.relativeHumidityPct}%</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-950 border border-neutral-800">
            <Flame className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-neutral-400 text-[10px] font-medium">Road Surface</div>
              <div className="font-semibold text-neutral-100">{env.surfaceTempC}°C</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
