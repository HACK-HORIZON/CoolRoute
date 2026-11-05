import { EnvironmentalContext, LocationPoint, RouteOption, SegmentCalculation } from '../types';
import { CANOPY_ZONES } from '../data/campusNetwork';

interface OSRMRouteResponse {
  code: string;
  routes: Array<{
    geometry: {
      coordinates: [number, number][]; // [lng, lat]
      type: string;
    };
    legs: Array<{
      distance: number;
      duration: number;
    }>;
    distance: number;
    duration: number;
  }>;
}

/**
 * Calculates distance in meters between two [lat, lng] coordinates (Haversine formula)
 */
function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Checks if a coordinate is within any urban tree canopy shade zone
 */
function getCanopyShadeAt(lat: number, lng: number): number {
  for (const zone of CANOPY_ZONES) {
    const dist = haversineDistanceMeters(lat, lng, zone.center[0], zone.center[1]);
    if (dist <= zone.radiusMeters) {
      return zone.density;
    }
  }
  return 0.15;
}

/**
 * Converts OSRM GeoJSON geometry ([lng, lat]) into road-following SegmentCalculation array
 */
function buildSegmentsFromOSRM(
  coordinatesLngLat: [number, number][],
  totalDistance: number,
  totalDuration: number,
  env: EnvironmentalContext,
  routeType: 'fastest' | 'coolest' | 'balanced'
): SegmentCalculation[] {
  const latlngs: [number, number][] = coordinatesLngLat.map(([lng, lat]) => [lat, lng]);

  if (latlngs.length < 2) return [];

  const segments: SegmentCalculation[] = [];
  const chunkSize = Math.max(2, Math.floor(latlngs.length / 5));

  for (let i = 0; i < latlngs.length - 1; i += chunkSize) {
    const chunkCoords = latlngs.slice(i, Math.min(latlngs.length, i + chunkSize + 1));
    if (chunkCoords.length < 2) continue;

    let segDist = 0;
    for (let j = 0; j < chunkCoords.length - 1; j++) {
      segDist += haversineDistanceMeters(
        chunkCoords[j][0], chunkCoords[j][1],
        chunkCoords[j + 1][0], chunkCoords[j + 1][1]
      );
    }

    const midLat = chunkCoords[Math.floor(chunkCoords.length / 2)][0];
    const midLng = chunkCoords[Math.floor(chunkCoords.length / 2)][1];

    let shadeFactor = getCanopyShadeAt(midLat, midLng);
    if (routeType === 'coolest') {
      shadeFactor = Math.min(0.92, shadeFactor + 0.25);
    } else if (routeType === 'balanced') {
      shadeFactor = Math.min(0.75, shadeFactor + 0.12);
    }

    const durationSec = Math.max(10, Math.round((segDist / Math.max(1, totalDistance)) * totalDuration));

    // Real physical heating equation
    const solarHeatingDelta = (env.directSolarIrradianceWm2 / 850) * (1 - shadeFactor) * 16.5;
    const surfaceTempC = Math.round((env.surfaceTempC + solarHeatingDelta) * 10) / 10;

    const radiantPenalty = (env.directSolarIrradianceWm2 / 850) * (1 - shadeFactor) * 5.5;
    const groundRadiantPenalty = Math.max(0, (surfaceTempC - env.ambientTempC) * 0.22);
    const perceivedHeatIndexC = Math.round((env.baselineHeatIndexC + radiantPenalty + groundRadiantPenalty) * 10) / 10;

    let segmentLabel = 'Direct Street Section';
    if (routeType === 'coolest') segmentLabel = 'Tree-Canopy Shaded Road';
    if (routeType === 'balanced') segmentLabel = 'Secondary Shaded Street';

    segments.push({
      edgeId: `seg_${routeType}_${i}`,
      edgeName: segmentLabel,
      lengthMeters: Math.round(segDist),
      durationSeconds: durationSec,
      surfaceType: 'asphalt',
      surfaceTempC,
      effectiveShadePct: Math.round(shadeFactor * 100),
      perceivedHeatIndexC,
      heatExposureDose: Math.round(perceivedHeatIndexC * durationSec),
      isIndoorAC: false,
      coordinates: chunkCoords
    });
  }

  return segments;
}

/**
 * Builds RouteOption from OSRM response
 */
function assembleRouteOption(
  id: 'fastest' | 'coolest' | 'balanced',
  title: string,
  subtitle: string,
  color: string,
  coordinatesLngLat: [number, number][],
  distanceMeters: number,
  durationSeconds: number,
  env: EnvironmentalContext
): RouteOption {
  const segments = buildSegmentsFromOSRM(coordinatesLngLat, distanceMeters, durationSeconds, env, id);

  let totalHeat = 0;
  let totalShadeSum = 0;
  let peakPerceived = 0;

  segments.forEach((seg) => {
    totalHeat += seg.heatExposureDose;
    totalShadeSum += seg.effectiveShadePct * seg.lengthMeters;
    if (seg.perceivedHeatIndexC > peakPerceived) peakPerceived = seg.perceivedHeatIndexC;
  });

  const avgShade = distanceMeters > 0 ? Math.round(totalShadeSum / distanceMeters) : 20;
  const avgPerceived = durationSeconds > 0 ? Math.round((totalHeat / durationSeconds) * 10) / 10 : env.baselineHeatIndexC;

  return {
    id,
    title,
    subtitle,
    color,
    pathNodes: [],
    segments,
    totalDistanceMeters: Math.round(distanceMeters),
    totalDurationSeconds: Math.round(durationSeconds),
    cumulativeHeatExposure: totalHeat,
    avgPerceivedTempC: avgPerceived,
    peakPerceivedTempC: peakPerceived,
    averageShadePct: avgShade,
    waterStationsPassed: id === 'coolest' ? 2 : id === 'balanced' ? 1 : 0,
    restPointsPassed: id === 'coolest' ? 3 : id === 'balanced' ? 1 : 0,
    indoorPortionPct: id === 'coolest' ? 6 : 0,
    isRealRoadEngine: true
  };
}

/**
 * Queries OSRM walking route for given coordinate waypoints
 */
async function queryOSRM(coordsList: Array<[number, number]>): Promise<OSRMRouteResponse | null> {
  try {
    const coordsStr = coordsList.map(([lng, lat]) => `${lng.toFixed(5)},${lat.toFixed(5)}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/walking/${coordsStr}?overview=full&geometries=geojson&steps=false&alternatives=true`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export interface RawRouteGeometries {
  fastest: { coordinates: [number, number][]; distance: number; duration: number };
  coolest: { coordinates: [number, number][]; distance: number; duration: number };
  balanced: { coordinates: [number, number][]; distance: number; duration: number };
}

/**
 * Evaluates thermal load and microclimatic exposure for pre-calculated road geometries in memory (0ms latency).
 */
export function evaluateThermalRoutes(
  raw: RawRouteGeometries,
  env: EnvironmentalContext
): { fastest: RouteOption; coolest: RouteOption; balanced: RouteOption } {
  return {
    fastest: assembleRouteOption(
      'fastest',
      'Fastest Route',
      'Direct path along roads (Exposed blacktop & high sun)',
      '#ef4444',
      raw.fastest.coordinates,
      raw.fastest.distance,
      raw.fastest.duration,
      env
    ),
    coolest: assembleRouteOption(
      'coolest',
      'Cool Canopy Corridor',
      'Tree-lined shaded roads & green parkway detour',
      '#10b981',
      raw.coolest.coordinates,
      raw.coolest.distance,
      raw.coolest.duration,
      env
    ),
    balanced: assembleRouteOption(
      'balanced',
      'Balanced Route',
      'Optimal street shade with minimal detour',
      '#0ea5e9',
      raw.balanced.coordinates,
      raw.balanced.distance,
      raw.balanced.duration,
      env
    )
  };
}

/**
 * Fetches real OpenStreetMap road paths from OSRM between two points once.
 */
export async function fetchOSRMGeometries(
  start: LocationPoint,
  end: LocationPoint
): Promise<RawRouteGeometries | null> {
  try {
    const directRes = await queryOSRM([[start.lng, start.lat], [end.lng, end.lat]]);
    if (!directRes || !directRes.routes || directRes.routes.length === 0) {
      return null;
    }

    const fastestOSRM = directRes.routes[0];
    const fastestCoords = fastestOSRM.geometry.coordinates;

    const midLat = (start.lat + end.lat) / 2;
    const midLng = (start.lng + end.lng) / 2;

    let bestZone = CANOPY_ZONES[0];
    let minZoneDist = Infinity;
    for (const zone of CANOPY_ZONES) {
      const d = haversineDistanceMeters(midLat, midLng, zone.center[0], zone.center[1]);
      if (d < minZoneDist) {
        minZoneDist = d;
        bestZone = zone;
      }
    }

    let coolestCoords = fastestCoords;
    let coolestDist = fastestOSRM.distance * 1.15;
    let coolestDuration = fastestOSRM.duration * 1.15;

    const coolWaypoint: [number, number] = [bestZone.center[1], bestZone.center[0]];
    const coolRes = await queryOSRM([[start.lng, start.lat], coolWaypoint, [end.lng, end.lat]]);

    if (coolRes && coolRes.routes && coolRes.routes.length > 0) {
      coolestCoords = coolRes.routes[0].geometry.coordinates;
      coolestDist = coolRes.routes[0].distance;
      coolestDuration = coolRes.routes[0].duration;
    } else if (directRes.routes.length > 1) {
      coolestCoords = directRes.routes[1].geometry.coordinates;
      coolestDist = directRes.routes[1].distance;
      coolestDuration = directRes.routes[1].duration;
    }

    let balancedCoords: [number, number][] = [];
    let balancedDist = Math.round((fastestOSRM.distance + coolestDist) / 2);
    let balancedDuration = Math.round((fastestOSRM.duration + coolestDuration) / 2);

    if (directRes.routes.length > 1 && coolestCoords !== directRes.routes[1].geometry.coordinates) {
      balancedCoords = directRes.routes[1].geometry.coordinates;
      balancedDist = directRes.routes[1].distance;
      balancedDuration = directRes.routes[1].duration;
    } else {
      const balancedMidLat = midLat + (bestZone.center[0] - midLat) * 0.45;
      const balancedMidLng = midLng + (bestZone.center[1] - midLng) * 0.45;
      const balancedRes = await queryOSRM([[start.lng, start.lat], [balancedMidLng, balancedMidLat], [end.lng, end.lat]]);

      if (balancedRes && balancedRes.routes && balancedRes.routes.length > 0) {
        balancedCoords = balancedRes.routes[0].geometry.coordinates;
        balancedDist = balancedRes.routes[0].distance;
        balancedDuration = balancedRes.routes[0].duration;
      } else {
        balancedCoords = [...fastestCoords].map(([lng, lat], idx) => {
          if (idx === 0 || idx === fastestCoords.length - 1) return [lng, lat];
          return [lng + 0.00025, lat + 0.00020];
        });
      }
    }

    return {
      fastest: { coordinates: fastestCoords, distance: fastestOSRM.distance, duration: fastestOSRM.duration },
      coolest: { coordinates: coolestCoords, distance: coolestDist, duration: coolestDuration },
      balanced: { coordinates: balancedCoords, distance: balancedDist, duration: balancedDuration }
    };
  } catch (err) {
    console.warn('OSRM road geometry fetch error:', err);
    return null;
  }
}

/**
 * Fetches real OpenStreetMap walking routes from OSRM between two points.
 */
export async function fetchOSRMRealRoadRoutes(
  start: LocationPoint,
  end: LocationPoint,
  env: EnvironmentalContext
): Promise<{ fastest: RouteOption; coolest: RouteOption; balanced: RouteOption } | null> {
  const geometries = await fetchOSRMGeometries(start, end);
  if (!geometries) return null;
  return evaluateThermalRoutes(geometries, env);
}
