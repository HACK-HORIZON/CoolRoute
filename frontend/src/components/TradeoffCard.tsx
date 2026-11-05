import React from 'react';
import { EnvironmentalContext, RouteOption, TimeRecommendation, TradeoffAnalysis } from '../types';
import { getTimeBasedRecommendation } from '../services/tradeoffAnalyst';
import {
  Clock,
  ShieldCheck,
  TrendingDown,
  Droplets,
  Trees,
  CheckCircle2,
  AlertTriangle,
  Award,
  Zap,
  Sparkles,
  Sun
} from 'lucide-react';

interface TradeoffCardProps {
  routes: {
    fastest: RouteOption;
    coolest: RouteOption;
    balanced: RouteOption;
  };
  tradeoff: TradeoffAnalysis;
  env?: EnvironmentalContext;
  timeRec?: TimeRecommendation;
  activeRouteId: 'fastest' | 'coolest' | 'balanced' | 'all';
  onSelectRoute: (id: 'fastest' | 'coolest' | 'balanced' | 'all') => void;
}

export const TradeoffCard: React.FC<TradeoffCardProps> = ({
  routes,
  tradeoff,
  env,
  timeRec,
  activeRouteId,
  onSelectRoute
}) => {
  const { fastest, coolest, balanced } = routes;
  const rec = timeRec || (env ? getTimeBasedRecommendation(env) : null);
  const bestId = rec?.bestRouteId || 'coolest';

  const getBadgeStyle = (badge: TradeoffAnalysis['scoreBadge']) => {
    switch (badge) {
      case 'Exceptional Value':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Direct Advantage':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      case 'Balanced Trade-off':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Side-by-Side Multi-Route Comparison Cards (Now on top) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
            <span>Route Comparison Options</span>
            <span className="text-xs font-normal text-neutral-400">(Click to preview on map)</span>
          </h4>
          <button
            onClick={() => onSelectRoute('all')}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
              activeRouteId === 'all'
                ? 'bg-emerald-600 text-white border-emerald-500 font-semibold shadow-md'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
            }`}
          >
            Show All Routes
          </button>
        </div>

        {/* Dynamic Departure Time Recommendation Pill */}
        {rec && (
          <div className="mb-3 px-3.5 py-2.5 rounded-xl bg-neutral-950/90 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 shadow-inner">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${bestId === 'coolest' ? 'bg-emerald-400' : bestId === 'fastest' ? 'bg-red-400' : 'bg-sky-400'} animate-pulse`} />
              <div className="text-xs">
                <span className="text-neutral-400">Best Route for Departure at </span>
                <span className="font-mono font-bold text-white">{env?.timeFormatted}</span>
                <span className="text-neutral-400">: </span>
                <span className={`font-bold ${bestId === 'coolest' ? 'text-emerald-400' : bestId === 'fastest' ? 'text-red-400' : 'text-sky-400'}`}>
                  {rec.bestRouteTitle}
                </span>
                <span className="text-neutral-400 text-[11px] ml-1.5 hidden md:inline">({rec.phaseName})</span>
              </div>
            </div>
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 self-start sm:self-auto">
              <span>Solar Hazard:</span>
              <span className={`font-bold px-1.5 py-0.5 rounded ${
                rec.solarHazardLevel === 'Extreme' || rec.solarHazardLevel === 'Severe'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : rec.solarHazardLevel === 'Moderate'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {rec.solarHazardLevel}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 1: Fastest Route */}
          <div
            onClick={() => onSelectRoute('fastest')}
            className={`p-4 rounded-xl cursor-pointer transition-all border relative ${
              activeRouteId === 'fastest'
                ? 'bg-neutral-900 border-red-500 ring-2 ring-red-500/30 shadow-lg'
                : bestId === 'fastest'
                ? 'bg-neutral-950 border-red-500/50 hover:border-red-500'
                : 'bg-black border-neutral-800 hover:border-neutral-700'
            }`}
          >
            {bestId === 'fastest' && (
              <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow">
                ★ Best Choice ({env?.timeFormatted})
              </div>
            )}

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {fastest.title}
              </span>
              <span className="text-xs text-neutral-400">Baseline</span>
            </div>

            <div className="text-xl font-bold text-white mb-1">
              {Math.round((fastest.totalDurationSeconds / 60) * 10) / 10} min
              <span className="text-xs font-normal text-neutral-400 ml-1.5">
                ({fastest.totalDistanceMeters}m)
              </span>
            </div>

            <p className="text-xs text-neutral-400 mb-3 line-clamp-1">{fastest.subtitle}</p>

            <div className="space-y-1.5 pt-2 border-t border-neutral-800 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Peak Thermal Load:</span>
                <span className="font-bold text-red-400">{fastest.peakPerceivedTempC}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Average Shade:</span>
                <span className="text-neutral-300">{fastest.averageShadePct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Water Hydration:</span>
                <span className="text-neutral-400">{fastest.waterStationsPassed} stops</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 pt-1">
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                <span>Unshaded road blacktop</span>
              </div>
            </div>
          </div>

          {/* Card 2: Coolest Route */}
          <div
            onClick={() => onSelectRoute('coolest')}
            className={`p-4 rounded-xl cursor-pointer transition-all border relative ${
              activeRouteId === 'coolest'
                ? 'bg-gradient-to-b from-neutral-900 to-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/40 shadow-xl'
                : bestId === 'coolest'
                ? 'bg-neutral-950 border-emerald-500/50 hover:border-emerald-500'
                : 'bg-black border-neutral-800 hover:border-neutral-700'
            }`}
          >
            {bestId === 'coolest' && (
              <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-emerald-500 text-neutral-950 text-[10px] font-extrabold uppercase tracking-wider shadow">
                ★ Best Choice ({env?.timeFormatted})
              </div>
            )}

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {coolest.title}
              </span>
            </div>

            <div className="text-xl font-bold text-emerald-400 mb-1">
              {Math.round((coolest.totalDurationSeconds / 60) * 10) / 10} min
              <span className="text-xs font-normal text-neutral-400 ml-1.5">
                ({coolest.totalDistanceMeters}m)
              </span>
            </div>

            <p className="text-xs text-neutral-300 mb-3 line-clamp-1">{coolest.subtitle}</p>

            <div className="space-y-1.5 pt-2 border-t border-neutral-800 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Peak Thermal Load:</span>
                <span className="font-bold text-emerald-300">{coolest.peakPerceivedTempC}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Average Shade:</span>
                <span className="font-semibold text-emerald-400">{coolest.averageShadePct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Water Hydration:</span>
                <span className="font-semibold text-blue-400">
                  {coolest.waterStationsPassed} Refill Station{coolest.waterStationsPassed > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 pt-1">
                <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                <span>-{tradeoff.heatReductionPct}% overall heat stress</span>
              </div>
            </div>
          </div>

          {/* Card 3: Balanced Route */}
          <div
            onClick={() => onSelectRoute('balanced')}
            className={`p-4 rounded-xl cursor-pointer transition-all border relative ${
              activeRouteId === 'balanced'
                ? 'bg-neutral-900 border-sky-500 ring-2 ring-sky-500/30 shadow-lg'
                : bestId === 'balanced'
                ? 'bg-neutral-950 border-sky-500/50 hover:border-sky-500'
                : 'bg-black border-neutral-800 hover:border-neutral-700'
            }`}
          >
            {bestId === 'balanced' && (
              <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-sky-500 text-neutral-950 text-[10px] font-extrabold uppercase tracking-wider shadow">
                ★ Best Choice ({env?.timeFormatted})
              </div>
            )}

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                {balanced.title}
              </span>
              <span className="text-xs text-neutral-400">Balanced</span>
            </div>

            <div className="text-xl font-bold text-sky-300 mb-1">
              {Math.round((balanced.totalDurationSeconds / 60) * 10) / 10} min
              <span className="text-xs font-normal text-neutral-400 ml-1.5">
                ({balanced.totalDistanceMeters}m)
              </span>
            </div>

            <p className="text-xs text-neutral-400 mb-3 line-clamp-1">{balanced.subtitle}</p>

            <div className="space-y-1.5 pt-2 border-t border-neutral-800 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Peak Thermal Load:</span>
                <span className="font-bold text-sky-400">{balanced.peakPerceivedTempC}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Average Shade:</span>
                <span className="text-neutral-300">{balanced.averageShadePct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Water Hydration:</span>
                <span className="text-neutral-400">{balanced.waterStationsPassed} stops</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-sky-400 pt-1">
                <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                <span>Partial shade with moderate detour</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary Route Summary / Recommended Overview Banner (Now below comparison options) */}
      <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                bestId === 'coolest'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : bestId === 'fastest'
                  ? 'border-red-500/40 bg-red-500/10 text-red-400'
                  : 'border-sky-500/40 bg-sky-500/10 text-sky-400'
              }`}>
                Recommended Choice ({env?.timeFormatted || 'Now'})
              </span>
              <span className="text-xs text-neutral-400">Route Overview</span>
            </div>
            <h3 className="text-base md:text-lg font-bold text-white tracking-tight">
              {rec?.headline || tradeoff.summaryHeadline}
            </h3>
          </div>

          {/* Efficiency Metric */}
          <div className="flex items-center gap-3 bg-black border border-neutral-800 rounded-xl px-4 py-2 flex-shrink-0">
            <TrendingDown className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">
                Heat Reduction
              </div>
              <div className="text-sm font-bold text-emerald-300">
                -{tradeoff.heatReductionPct}% heat{' '}
                <span className="text-xs font-normal text-neutral-400">(+{tradeoff.timeDeltaMinutes} min walk)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Key Trade-off Telemetry Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-neutral-850">
          <div className="p-3 rounded-xl bg-black border border-neutral-850">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[11px] font-medium">Time Difference</span>
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
            </div>
            <div className="text-base font-bold text-neutral-100">
              +{tradeoff.timeDeltaMinutes} min{' '}
              <span className="text-xs font-normal text-neutral-400">
                (+{tradeoff.timeDeltaPct}%)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black border border-emerald-500/30">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[11px] font-medium">Heat Exposure</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-base font-bold text-emerald-400">
              -{tradeoff.heatReductionPct}%{' '}
              <span className="text-xs font-normal text-neutral-400">thermal stress</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black border border-neutral-850">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[11px] font-medium">Shade Coverage</span>
              <Trees className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div className="text-base font-bold text-teal-300">
              +{tradeoff.shadeIncreasePct}%{' '}
              <span className="text-xs font-normal text-neutral-400">
                ({coolest.averageShadePct}% total)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black border border-neutral-850">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[11px] font-medium">Water &amp; Rest</span>
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-base font-bold text-sky-300">
              {coolest.waterStationsPassed} Kiosks{' '}
              <span className="text-xs font-normal text-neutral-400">
                +{coolest.restPointsPassed} Rest
              </span>
            </div>
          </div>
        </div>

        {/* Explainability Breakdown Bullets */}
        <div className="mt-3 pt-3 border-t border-neutral-850">
          <div className="text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Route highlights &amp; solar physics:
          </div>
          {rec && (
            <div className="mb-2 p-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300 leading-relaxed">
              <span className="font-semibold text-white">Why at {env?.timeFormatted}: </span>
              {rec.detailedReason}
            </div>
          )}
          <ul className="space-y-1 text-xs text-neutral-300">
            {tradeoff.explanationBullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">&bull;</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
