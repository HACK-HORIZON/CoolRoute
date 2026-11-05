import { RouteOption, TradeoffAnalysis } from '../types';

/**
 * Analyzes the comparative trade-offs between the Fastest (baseline)
 * and Coolest (thermal-optimized) routes.
 */
export function analyzeRouteTradeoff(
  fastest: RouteOption,
  coolest: RouteOption
): TradeoffAnalysis {
  const timeDeltaSeconds = Math.max(0, coolest.totalDurationSeconds - fastest.totalDurationSeconds);
  const timeDeltaMinutes = Math.round((timeDeltaSeconds / 60) * 10) / 10;
  const timeDeltaPct = fastest.totalDurationSeconds > 0
    ? Math.round((timeDeltaSeconds / fastest.totalDurationSeconds) * 100)
    : 0;

  const distanceDeltaMeters = Math.max(0, coolest.totalDistanceMeters - fastest.totalDistanceMeters);

  const rawHeatDiff = fastest.cumulativeHeatExposure - coolest.cumulativeHeatExposure;
  const heatReductionPct = fastest.cumulativeHeatExposure > 0
    ? Math.max(0, Math.round((rawHeatDiff / fastest.cumulativeHeatExposure) * 100))
    : 0;

  const shadeIncreasePct = Math.max(0, coolest.averageShadePct - fastest.averageShadePct);

  const heatSavedPerMinuteWalked = timeDeltaMinutes > 0
    ? Math.round((heatReductionPct / timeDeltaMinutes) * 10) / 10
    : heatReductionPct;

  // Score Badge
  let scoreBadge: TradeoffAnalysis['scoreBadge'] = 'Balanced Trade-off';
  if (timeDeltaMinutes <= 0.3) {
    scoreBadge = 'Direct Advantage';
  } else if (heatSavedPerMinuteWalked >= 14) {
    scoreBadge = 'Exceptional Value';
  } else if (heatSavedPerMinuteWalked >= 7) {
    scoreBadge = 'Balanced Trade-off';
  } else {
    scoreBadge = 'Neutral';
  }

  // Generate detailed reasoning bullets
  const explanationBullets: string[] = [];

  // 1. Shade improvement
  if (shadeIncreasePct > 0) {
    explanationBullets.push(
      `Shade coverage jumps from ${fastest.averageShadePct}% to ${coolest.averageShadePct}% (+${shadeIncreasePct}% continuous canopy & colonnade protection).`
    );
  }

  // 2. Surface temperature avoidance
  let asphaltAvoidedMeters = 0;
  let maxAsphaltTemp = 0;
  for (const seg of fastest.segments) {
    if (seg.surfaceType === 'asphalt') {
      asphaltAvoidedMeters += seg.lengthMeters;
      if (seg.surfaceTempC > maxAsphaltTemp) maxAsphaltTemp = seg.surfaceTempC;
    }
  }

  if (asphaltAvoidedMeters > 0) {
    explanationBullets.push(
      `Bypasses ${asphaltAvoidedMeters}m of unshaded asphalt where ground temperatures peak at ${maxAsphaltTemp}°C.`
    );
  }

  // 3. Indoor AC relief
  if (coolest.indoorPortionPct > 0) {
    explanationBullets.push(
      `Includes ${coolest.indoorPortionPct}% of transit through an air-conditioned campus breezeway (21.5°C comfort zone).`
    );
  }

  // 4. Hydration & Rest Points
  const waterDiff = coolest.waterStationsPassed - fastest.waterStationsPassed;
  const restDiff = coolest.restPointsPassed - fastest.restPointsPassed;
  if (waterDiff > 0 || restDiff > 0) {
    const parts = [];
    if (waterDiff > 0) parts.push(`${waterDiff} additional chilled water refill station${waterDiff > 1 ? 's' : ''}`);
    if (restDiff > 0) parts.push(`${restDiff} shaded rest bench${restDiff > 1 ? 'es' : ''}`);
    explanationBullets.push(`Passes along ${parts.join(' and ')} for hydration recovery.`);
  }

  // 5. Peak thermal exposure delta
  const peakTempDiff = Math.round((fastest.peakPerceivedTempC - coolest.peakPerceivedTempC) * 10) / 10;
  if (peakTempDiff > 0) {
    explanationBullets.push(
      `Reduces maximum perceived thermal stress from ${fastest.peakPerceivedTempC}°C down to ${coolest.peakPerceivedTempC}°C (a ${peakTempDiff}°C reduction in peak heat load).`
    );
  }

  // Executive Summary Headline
  let summaryHeadline = '';
  if (timeDeltaMinutes <= 0.3) {
    summaryHeadline = `Cooler route with virtually zero detour time (${heatReductionPct}% heat reduction with no delay).`;
  } else {
    summaryHeadline = `Trade ${timeDeltaMinutes} extra mins (+${timeDeltaPct}%) to cut total heat exposure by ${heatReductionPct}%, saving ${heatSavedPerMinuteWalked}% heat per extra minute.`;
  }

  return {
    timeDeltaSeconds,
    timeDeltaMinutes,
    timeDeltaPct,
    distanceDeltaMeters,
    heatReductionPct,
    shadeIncreasePct,
    heatSavedPerMinuteWalked,
    scoreBadge,
    explanationBullets,
    summaryHeadline
  };
}
