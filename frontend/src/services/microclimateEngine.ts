import { EnvironmentalContext, GraphEdge, SegmentCalculation } from '../types';
import { calculateRealSolarPosition } from './solarEngine';
import { getRealWeatherForTime } from './weatherService';

interface HourlyWeatherData {
  latitude: number;
  longitude: number;
  current?: any;
  hourly?: any;
}

/**
 * Computes exact physical microclimate & solar metrics using:
 * 1. NOAA astronomical solar equations (Real Solar Elevation & Solar Azimuth)
 * 2. Open-Meteo physical meteorological station data (Real Temperature, Humidity, Direct Irradiance & Surface Temp)
 */
export function calculateEnvironmentalContext(
  minutesFromMidnight: number,
  weatherData: HourlyWeatherData | null = null,
  lat: number = 20.2961,
  lng: number = 85.8245
): EnvironmentalContext {
  const hour = minutesFromMidnight / 60;
  const hh = Math.floor(hour).toString().padStart(2, '0');
  const mm = Math.floor(minutesFromMidnight % 60).toString().padStart(2, '0');

  // 1. Exact NOAA Astronomical Solar Geometry
  const solar = calculateRealSolarPosition(lat, lng, minutesFromMidnight);

  // 2. Real Meteorological Data (Live station forecast/actuals from Open-Meteo)
  const weather = getRealWeatherForTime(weatherData, minutesFromMidnight, solar.solarAltitudeDeg);

  // 3. Rothfusz Baseline Heat Index Calculation
  const T = weather.temperatureC * 1.8 + 32; // Convert to Fahrenheit
  const R = weather.relativeHumidityPct;

  let hiF =
    -42.379 +
    2.04901523 * T +
    10.14333127 * R -
    0.22475541 * T * R -
    0.00683783 * T * T -
    0.05481717 * R * R +
    0.00122874 * T * T * R +
    0.00085282 * T * R * R -
    0.00000199 * T * T * R * R;

  // Simple formula fallback if low heat
  if (R < 13 && T >= 80 && T <= 112) {
    const adj = ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    hiF -= adj;
  } else if (R > 85 && T >= 80 && T <= 87) {
    const adj = ((R - 85) / 10) * ((87 - T) / 5);
    hiF += adj;
  }

  const baselineHeatIndexC = Math.round(((hiF - 32) * (5 / 9)) * 10) / 10;

  // Categorize heat level
  let heatCategory: EnvironmentalContext['heatCategory'] = 'Normal';
  if (baselineHeatIndexC >= 42) heatCategory = 'Extreme';
  else if (baselineHeatIndexC >= 36) heatCategory = 'High';
  else if (baselineHeatIndexC >= 30) heatCategory = 'Moderate';

  return {
    timestampMinutes: minutesFromMidnight,
    timeFormatted: `${hh}:${mm}`,
    ambientTempC: weather.temperatureC,
    relativeHumidityPct: weather.relativeHumidityPct,
    solarAltitudeDeg: solar.solarAltitudeDeg,
    solarAzimuthDeg: solar.solarAzimuthDeg,
    directSolarIrradianceWm2: weather.directSolarIrradianceWm2,
    surfaceTempC: weather.surfaceTempC,
    baselineHeatIndexC,
    heatCategory,
    isLiveDataSource: weather.isLiveStationData,
    dataSourceLabel: weather.stationName
  };
}

/**
 * Computes dynamic micro-climate metrics for a specific footpath edge
 * given the ambient environmental conditions.
 */
export function calculateEdgeMicroclimate(
  edge: GraphEdge,
  env: EnvironmentalContext,
  walkSpeedMps: number = 1.3
): SegmentCalculation {
  const durationSeconds = Math.max(1, Math.round(edge.lengthMeters / walkSpeedMps));

  // If indoor AC
  if (edge.isIndoorAC) {
    const indoorTempC = 22.0;
    return {
      edgeId: edge.id,
      edgeName: edge.name,
      lengthMeters: edge.lengthMeters,
      durationSeconds,
      surfaceType: 'indoor',
      surfaceTempC: 22.0,
      effectiveShadePct: 100,
      perceivedHeatIndexC: indoorTempC,
      heatExposureDose: indoorTempC * durationSeconds,
      isIndoorAC: true,
      coordinates: edge.coordinates
    };
  }

  // 1. Effective Shade
  const canopyShade = edge.treeCanopyCoverPct * 0.85;
  const buildingShade = edge.buildingShadeFactor * Math.max(0.2, (90 - env.solarAltitudeDeg) / 90);
  const effectiveShade = Math.min(0.95, Math.max(0.05, canopyShade + buildingShade * (1 - canopyShade)));
  const unshadedSunFraction = 1.0 - effectiveShade;

  // 2. Real Surface Temperature based on measured solar irradiance and surface albedo
  const maxSolarDelta = (env.directSolarIrradianceWm2 / 850) * 16.5;
  const albedoAbsorptance = 1.0 - edge.surfaceAlbedo;
  const surfaceTempC = Math.round(
    (env.surfaceTempC + maxSolarDelta * albedoAbsorptance * unshadedSunFraction) * 10
  ) / 10;

  // 3. Perceived Heat Index
  const directRadiationDelta = (env.directSolarIrradianceWm2 / 850) * unshadedSunFraction * 5.5;
  const groundRadiantDelta = Math.max(0, (surfaceTempC - env.ambientTempC) * 0.22);
  const perceivedHeatIndexC = Math.round(
    (env.baselineHeatIndexC + directRadiationDelta + groundRadiantDelta) * 10
  ) / 10;

  const heatExposureDose = Math.round(perceivedHeatIndexC * durationSeconds);

  return {
    edgeId: edge.id,
    edgeName: edge.name,
    lengthMeters: edge.lengthMeters,
    durationSeconds,
    surfaceType: edge.surfaceType,
    surfaceTempC,
    effectiveShadePct: Math.round(effectiveShade * 100),
    perceivedHeatIndexC,
    heatExposureDose,
    isIndoorAC: false,
    coordinates: edge.coordinates
  };
}
