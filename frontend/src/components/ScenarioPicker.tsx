import React from 'react';
import { CAMPUS_NODES, PRESET_SCENARIOS } from '../data/campusNetwork';
import { Bookmark, MapPin, Navigation, Footprints } from 'lucide-react';

interface ScenarioPickerProps {
  originNodeId: string;
  destNodeId: string;
  onSelectOrigin: (id: string) => void;
  onSelectDest: (id: string) => void;
  onSelectScenario: (scenarioId: string) => void;
  walkingSpeed: number;
  onSelectWalkingSpeed: (speed: number) => void;
}

export const ScenarioPicker: React.FC<ScenarioPickerProps> = ({
  originNodeId,
  destNodeId,
  onSelectOrigin,
  onSelectDest,
  onSelectScenario,
  walkingSpeed,
  onSelectWalkingSpeed
}) => {
  return (
    <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/80 p-4 shadow-xl space-y-4">
      {/* 1. Quick Demo Scenarios (Crucial for Hackathon Demo) */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Bookmark className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-white tracking-wide uppercase">
            Demo Presets (One-Click)
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PRESET_SCENARIOS.map((sc) => {
            const isMatch = sc.originNodeId === originNodeId && sc.destinationNodeId === destNodeId;
            return (
              <button
                key={sc.id}
                onClick={() => onSelectScenario(sc.id)}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  isMatch
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-900/50 border-slate-700/60 text-slate-300 hover:bg-slate-700/40 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold truncate">{sc.title}</div>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{sc.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Custom Origin & Destination Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-700/60">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1.5">
            <MapPin className="w-3.5 h-3.5" />
            Origin (Start Point A)
          </label>
          <select
            value={originNodeId}
            onChange={(e) => onSelectOrigin(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {CAMPUS_NODES.map((n) => (
              <option key={`orig-${n.id}`} value={n.id} disabled={n.id === destNodeId}>
                {n.name} {n.poiType ? `(${n.poiType.replace('_', ' ')})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 mb-1.5">
            <Navigation className="w-3.5 h-3.5" />
            Destination (End Point B)
          </label>
          <select
            value={destNodeId}
            onChange={(e) => onSelectDest(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            {CAMPUS_NODES.map((n) => (
              <option key={`dest-${n.id}`} value={n.id} disabled={n.id === originNodeId}>
                {n.name} {n.poiType ? `(${n.poiType.replace('_', ' ')})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Walking Speed Pace Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-700/60 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          <Footprints className="w-3.5 h-3.5 text-slate-400" />
          <span>Walking Pace:</span>
        </div>
        <div className="flex items-center gap-1.5">
          {[
            { label: 'Leisure (1.0 m/s)', speed: 1.0 },
            { label: 'Normal (1.3 m/s)', speed: 1.3 },
            { label: 'Brisk (1.6 m/s)', speed: 1.6 }
          ].map((pace) => (
            <button
              key={pace.label}
              onClick={() => onSelectWalkingSpeed(pace.speed)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all border ${
                walkingSpeed === pace.speed
                  ? 'bg-slate-700 text-white border-slate-500 font-semibold shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {pace.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
