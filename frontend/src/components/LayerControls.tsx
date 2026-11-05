import React from 'react';
import { Layers, Trees, Flame, Droplets } from 'lucide-react';

interface LayerControlsProps {
  showCanopy: boolean;
  onToggleCanopy: () => void;
  showHeatIslands: boolean;
  onToggleHeatIslands: () => void;
  showAmenities: boolean;
  onToggleAmenities: () => void;
}

export const LayerControls: React.FC<LayerControlsProps> = ({
  showCanopy,
  onToggleCanopy,
  showHeatIslands,
  onToggleHeatIslands,
  showAmenities,
  onToggleAmenities
}) => {
  return (
    <div className="bg-black/95 backdrop-blur-md rounded-2xl border border-neutral-800 p-3 shadow-lg flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-1.5 text-neutral-300 font-semibold">
        <Layers className="w-4 h-4 text-emerald-400" />
        <span>Map Visual Layers:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onToggleCanopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
            showCanopy
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Trees className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tree Canopies</span>
        </button>

        <button
          onClick={onToggleHeatIslands}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
            showHeatIslands
              ? 'bg-orange-500/20 border-orange-500 text-orange-300 font-semibold'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span>Heat Islands</span>
        </button>

        <button
          onClick={onToggleAmenities}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
            showAmenities
              ? 'bg-blue-500/20 border-blue-500 text-blue-300 font-semibold'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Droplets className="w-3.5 h-3.5 text-blue-400" />
          <span>Water &amp; Rest POIs</span>
        </button>
      </div>
    </div>
  );
};
