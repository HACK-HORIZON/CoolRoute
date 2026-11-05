import React, { useState } from 'react';
import { Sun, Droplets, Compass, Thermometer, Flame, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { EnvironmentalContext } from '../types';

interface TimeSliderProps {
  env: EnvironmentalContext;
  onChangeTime: (minutes: number) => void;
}

const PRESET_HOURS = [
  { label: '8:00 AM', desc: 'Morning', minutes: 480 },
  { label: '11:30 AM', desc: 'Late Morning', minutes: 690 },
  { label: '1:30 PM', desc: 'Midday Peak', minutes: 810 },
  { label: '3:30 PM', desc: 'Afternoon', minutes: 930 },
  { label: '6:30 PM', desc: 'Evening', minutes: 1110 },
];

export const TimeSlider: React.FC<TimeSliderProps> = ({ env, onChangeTime }) => {
  const [showTelemetry, setShowTelemetry] = useState(false);
  const minMinutes = 420; // 07:00
  const maxMinutes = 1200; // 20:00

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
