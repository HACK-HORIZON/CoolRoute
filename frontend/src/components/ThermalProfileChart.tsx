import React, { useState } from 'react';
import { RouteOption } from '../types';
import { Activity, ShieldCheck, Flame } from 'lucide-react';

interface ThermalProfileChartProps {
  fastest: RouteOption;
  coolest: RouteOption;
}

export const ThermalProfileChart: React.FC<ThermalProfileChartProps> = ({ fastest, coolest }) => {
  const [hoveredData, setHoveredData] = useState<{
    distance: number;
    fastestTemp?: number;
    coolestTemp?: number;
    fastestSegName?: string;
    coolestSegName?: string;
  } | null>(null);

  // SVG Dimensions
  const width = 800;
  const height = 220;
  const padding = { top: 25, right: 35, bottom: 35, left: 45 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Temperature Range (Y-axis): 20°C to 50°C
  const minTemp = 20;
  const maxTemp = 50;

  // Distance Range (X-axis)
  const maxDist = Math.max(fastest.totalDistanceMeters, coolest.totalDistanceMeters, 100);

  const getX = (dist: number) => padding.left + (dist / maxDist) * plotWidth;
  const getY = (temp: number) => {
    const clamped = Math.max(minTemp, Math.min(maxTemp, temp));
    return padding.top + plotHeight - ((clamped - minTemp) / (maxTemp - minTemp)) * plotHeight;
  };

  // Build points for fastest route
  const fastestPoints: { x: number; y: number; dist: number; temp: number; name: string }[] = [];
  let curDistFastest = 0;
  fastest.segments.forEach((seg, i) => {
    if (i === 0) {
      fastestPoints.push({
        x: getX(0),
        y: getY(seg.perceivedHeatIndexC),
        dist: 0,
        temp: seg.perceivedHeatIndexC,
        name: seg.edgeName
      });
    }
    curDistFastest += seg.lengthMeters;
    fastestPoints.push({
      x: getX(curDistFastest),
      y: getY(seg.perceivedHeatIndexC),
      dist: curDistFastest,
      temp: seg.perceivedHeatIndexC,
      name: seg.edgeName
    });
  });

  // Build points for coolest route
  const coolestPoints: { x: number; y: number; dist: number; temp: number; name: string }[] = [];
  let curDistCoolest = 0;
  coolest.segments.forEach((seg, i) => {
    if (i === 0) {
      coolestPoints.push({
        x: getX(0),
        y: getY(seg.perceivedHeatIndexC),
        dist: 0,
        temp: seg.perceivedHeatIndexC,
        name: seg.edgeName
      });
    }
    curDistCoolest += seg.lengthMeters;
    coolestPoints.push({
      x: getX(curDistCoolest),
      y: getY(seg.perceivedHeatIndexC),
      dist: curDistCoolest,
      temp: seg.perceivedHeatIndexC,
      name: seg.edgeName
    });
  });

  const generatePathD = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    return points.reduce((acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '');
  };

  const fastestPathD = generatePathD(fastestPoints);
  const coolestPathD = generatePathD(coolestPoints);

  return (
    <div className="bg-black/95 backdrop-blur-md rounded-2xl border border-neutral-800 p-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white tracking-wide uppercase">
            Thermal Exposure Profile (Heat Index vs. Distance)
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-red-500 rounded-full inline-block"></span>
            <span className="text-neutral-300">Fastest (Direct)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 bg-emerald-400 rounded-full inline-block"></span>
            <span className="text-emerald-300 font-semibold">Cool Corridor</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[500px]"
          onMouseLeave={() => setHoveredData(null)}
        >
          {/* Temperature Zone Background Bands */}
          {/* Danger Zone: > 40°C */}
          <rect
            x={padding.left}
            y={getY(50)}
            width={plotWidth}
            height={getY(40) - getY(50)}
            fill="#ef4444"
            fillOpacity="0.12"
          />
          {/* Caution Zone: 32°C - 40°C */}
          <rect
            x={padding.left}
            y={getY(40)}
            width={plotWidth}
            height={getY(32) - getY(40)}
            fill="#f59e0b"
            fillOpacity="0.10"
          />
          {/* Comfort Zone: < 32°C */}
          <rect
            x={padding.left}
            y={getY(32)}
            width={plotWidth}
            height={getY(20) - getY(32)}
            fill="#10b981"
            fillOpacity="0.10"
          />

          {/* Grid lines and Y-axis labels */}
          {[20, 28, 36, 44].map((temp) => (
            <g key={temp}>
              <line
                x1={padding.left}
                y1={getY(temp)}
                x2={padding.left + plotWidth}
                y2={getY(temp)}
                stroke="#262626"
                strokeDasharray="3 3"
              />
              <text
                x={padding.left - 8}
                y={getY(temp) + 4}
                textAnchor="end"
                className="text-[10px] fill-neutral-400 font-mono"
              >
                {temp}°C
              </text>
            </g>
          ))}

          {/* X-axis distance labels */}
          {[0, Math.round(maxDist * 0.25), Math.round(maxDist * 0.5), Math.round(maxDist * 0.75), maxDist].map(
            (dist) => (
              <g key={dist}>
                <line
                  x1={getX(dist)}
                  y1={padding.top + plotHeight}
                  x2={getX(dist)}
                  y2={padding.top + plotHeight + 5}
                  stroke="#404040"
                />
                <text
                  x={getX(dist)}
                  y={padding.top + plotHeight + 18}
                  textAnchor="middle"
                  className="text-[10px] fill-neutral-400 font-mono"
                >
                  {dist}m
                </text>
              </g>
            )
          )}

          {/* Zone watermark badges */}
          <text
            x={padding.left + 8}
            y={getY(46)}
            className="text-[9px] fill-red-400/70 font-semibold tracking-wider uppercase"
          >
            Extreme Radiant Heat &gt;40°C
          </text>
          <text
            x={padding.left + 8}
            y={getY(25)}
            className="text-[9px] fill-emerald-400/80 font-semibold tracking-wider uppercase"
          >
            Comfort &amp; Shade Zone &lt;32°C
          </text>

          {/* Fastest Route Line */}
          <path
            d={fastestPathD}
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            strokeDasharray="6 4"
            strokeLinecap="round"
          />
          {fastestPoints.map((pt, i) => (
            <circle
              key={`fastest-pt-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={3.5}
              fill="#ef4444"
              className="hover:r-5 transition-all cursor-pointer"
              onMouseEnter={() =>
                setHoveredData({
                  distance: pt.dist,
                  fastestTemp: pt.temp,
                  fastestSegName: pt.name
                })
              }
            />
          ))}

          {/* Coolest Route Line */}
          <path
            d={coolestPathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {coolestPoints.map((pt, i) => (
            <circle
              key={`coolest-pt-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={4}
              fill="#10b981"
              stroke="#064e3b"
              strokeWidth="1.5"
              className="hover:r-6 transition-all cursor-pointer"
              onMouseEnter={() =>
                setHoveredData({
                  distance: pt.dist,
                  coolestTemp: pt.temp,
                  coolestSegName: pt.name
                })
              }
            />
          ))}
        </svg>

        {/* Hover inspection tooltip */}
        {hoveredData && (
          <div className="absolute top-2 right-4 bg-black/95 border border-neutral-800 px-3 py-1.5 rounded-lg text-xs shadow-xl pointer-events-none flex items-center gap-3">
            <span className="font-mono text-neutral-400">{hoveredData.distance}m along route:</span>
            {hoveredData.fastestTemp !== undefined && (
              <span className="text-red-400 font-bold flex items-center gap-1">
                <Flame className="w-3 h-3" /> Fastest: {hoveredData.fastestTemp}°C ({hoveredData.fastestSegName})
              </span>
            )}
            {hoveredData.coolestTemp !== undefined && (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Coolest: {hoveredData.coolestTemp}°C ({hoveredData.coolestSegName})
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
