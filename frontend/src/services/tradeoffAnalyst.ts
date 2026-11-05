import { EnvironmentalContext, RouteOption, TimeRecommendation, TradeoffAnalysis } from '../types';

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

/**
 * Dynamically determines which route is physically optimal based on departure time,
 * solar position, direct irradiance, surface temperature, and thermal stress.
 */
export function getTimeBasedRecommendation(env: EnvironmentalContext): TimeRecommendation {
  const { timestampMinutes, solarAltitudeDeg, directSolarIrradianceWm2, surfaceTempC, baselineHeatIndexC } = env;

  // Diurnal evaluation based on physical solar irradiance and heat index
  const isNightOrDawn = timestampMinutes < 510 || timestampMinutes >= 1050; // Before 8:30 AM or after 5:30 PM
  const isMiddaySolarPeak = timestampMinutes >= 690 && timestampMinutes < 930; // 11:30 AM to 3:30 PM (Solar Peak)
  
  // Severe thermal conditions: direct radiation > 520 W/m² OR heat index >= 34°C OR surface temp >= 42°C
  const isHighThermalStress = directSolarIrradianceWm2 >= 520 || baselineHeatIndexC >= 34 || surfaceTempC >= 42;
  const isLowThermalStress = directSolarIrradianceWm2 < 180 && baselineHeatIndexC < 30 && surfaceTempC < 34;

  if (isNightOrDawn || isLowThermalStress) {
    return {
      bestRouteId: 'fastest',
      bestRouteTitle: 'Direct Route',
      badgeLabel: `RECOMMENDED FOR ${env.timeFormatted}`,
      badgeStyle: 'bg-red-500 text-white border-red-400 shadow-red-500/30',
      phaseName: timestampMinutes < 510 ? 'Early Morning Cool Window' : 'Evening / Twilight Window',
      solarHazardLevel: 'Low',
      headline: `Direct Route is optimal at ${env.timeFormatted} (Fastest Arrival)`,
      detailedReason: `At ${env.timeFormatted}, direct solar radiation is minimal (${Math.round(directSolarIrradianceWm2)} W/m²) and ground temperatures are mild (${Math.round(surfaceTempC)}°C). There is no thermal benefit in detouring through tree canopies. Taking the direct path saves unnecessary walking minutes and physical fatigue.`,
      tip: `Ideal conditions for a brisk direct walk. Thermal strain is negligible.`
    };
  } else if (isMiddaySolarPeak || isHighThermalStress) {
    return {
      bestRouteId: 'coolest',
      bestRouteTitle: 'Shaded Route',
      badgeLabel: `RECOMMENDED FOR ${env.timeFormatted}`,
      badgeStyle: 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-emerald-500/30',
      phaseName: 'Midday Solar Peak & High Heat',
      solarHazardLevel: directSolarIrradianceWm2 > 700 ? 'Extreme' : 'Severe',
      headline: `Shaded Route is critically recommended at ${env.timeFormatted} (Max Heat Shielding)`,
      detailedReason: `Sun is high at ${Math.round(solarAltitudeDeg)}° delivering ${Math.round(directSolarIrradianceWm2)} W/m² of direct radiation, heating unshaded blacktop asphalt to ${Math.round(surfaceTempC)}°C. The Shaded Route provides continuous tree canopy coverage, cutting perceived thermal load by up to 7°C while passing active water refill points.`,
      tip: `Extreme solar hazard. Walk beneath the green canopy and stay hydrated.`
    };
  } else {
    // Moderate Transition (08:30 - 11:30 or 15:30 - 17:30)
    return {
      bestRouteId: 'balanced',
      bestRouteTitle: 'Balanced Route',
      badgeLabel: `RECOMMENDED FOR ${env.timeFormatted}`,
      badgeStyle: 'bg-sky-500 text-neutral-950 border-sky-400 shadow-sky-500/30',
      phaseName: timestampMinutes < 690 ? 'Late Morning Sun Transition' : 'Late Afternoon Heat Dissipation',
      solarHazardLevel: 'Moderate',
      headline: `Balanced Route is optimal at ${env.timeFormatted} (Best Comfort/Time Ratio)`,
      detailedReason: `Solar angle is at ${Math.round(solarAltitudeDeg)}° with moderate radiation (${Math.round(directSolarIrradianceWm2)} W/m²). The Balanced Route incorporates sidewalk shade with only a slight detour, offering the best trade-off between walking comfort and arrival time.`,
      tip: `Optimal compromise: reliable tree shade without an excessive detour.`
    };
  }
}
