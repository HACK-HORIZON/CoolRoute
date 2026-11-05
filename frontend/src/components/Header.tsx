import React, { useState, useEffect } from 'react';
import { Compass, Flame, Leaf, ShieldAlert } from 'lucide-react';
import { EnvironmentalContext } from '../types';

interface HeaderProps {
  env: EnvironmentalContext;
}

export const Header: React.FC<HeaderProps> = ({ env }) => {
  const isExtreme = env.heatCategory === 'Extreme' || env.heatCategory === 'High';

  // Live real-time clock
  const [liveTime, setLiveTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-black/95 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-30 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-emerald-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">
                CoolRoute
              </h1>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-300 border border-neutral-800">
                Bhubaneswar
              </span>
            </div>
          </div>
        </div>

        {/* Live Weather / Microclimate Status Badge */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900/90 border border-neutral-800 text-neutral-300">
            <span className="text-neutral-400">Current Time:</span>
            <span className="font-mono font-bold text-emerald-400">{liveTime}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900/90 border border-neutral-800 text-neutral-300">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-neutral-400">Current Air:</span>
            <span className="font-semibold text-white">{env.ambientTempC}°C</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium ${
              isExtreme
                ? 'bg-red-500/15 border-red-500/30 text-red-300'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            }`}
          >
            {isExtreme ? (
              <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-bounce" />
            ) : (
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>Current Heat Index: {env.baselineHeatIndexC}°C ({env.heatCategory})</span>
          </div>
        </div>
      </div>
    </header>
  );
};
