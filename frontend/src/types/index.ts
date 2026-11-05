export type SurfaceType = 'asphalt' | 'concrete' | 'brick' | 'gravel' | 'grass' | 'indoor';

export interface LocationPoint {
  id?: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  poiType?: 'water_fountain' | 'shaded_bench' | 'cooling_hub' | 'indoor_ac' | 'misting_station';
  poiDescription?: string;
}

export interface GraphNode extends LocationPoint {
  id: string;
  elevationMeters?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  lengthMeters: number;
  surfaceType: SurfaceType;
  surfaceAlbedo: number; // e.g. 0.10 for asphalt, 0.40 for concrete, 0.25 for grass, 0.70 for indoor
  treeCanopyCoverPct: number; // 0.0 to 1.0
  buildingShadeFactor: number; // base structural obstruction 0.0 to 1.0
  isIndoorAC: boolean;
  name: string;
  coordinates: [number, number][]; // [lat, lng] pairs for the geometry
}

export interface RealSolarMetrics {
  solarAltitudeDeg: number;
  solarAzimuthDeg: number;
  solarZenithDeg: number;
  declinationDeg: number;
  equationOfTimeMin: number;
}

export interface RealWeatherMetrics {
  temperatureC: number;
  relativeHumidityPct: number;
  directSolarIrradianceWm2: number;
  surfaceTempC: number;
  windSpeedKmh: number;
  isLiveStationData: boolean;
  stationName: string;
}

export interface EnvironmentalContext {
  timestampMinutes: number; // minutes from midnight (e.g. 810 = 13:30)
  timeFormatted: string; // "13:30"
  ambientTempC: number;
  relativeHumidityPct: number;
  solarAltitudeDeg: number; // Real astronomical NOAA angle above horizon
  solarAzimuthDeg: number; // Real astronomical NOAA solar azimuth (0=North, 90=East, 180=South, 270=West)
  directSolarIrradianceWm2: number; // Real direct normal irradiance (W/m²) from Open-Meteo station
  surfaceTempC: number; // Real ground skin temperature (°C)
  baselineHeatIndexC: number;
  heatCategory: 'Normal' | 'Moderate' | 'High' | 'Extreme';
  isLiveDataSource: boolean;
  dataSourceLabel: string;
}

export interface SegmentCalculation {
  edgeId: string;
  edgeName: string;
  lengthMeters: number;
  durationSeconds: number;
  surfaceType: SurfaceType;
  surfaceTempC: number;
  effectiveShadePct: number;
  perceivedHeatIndexC: number;
  heatExposureDose: number; // perceivedHeatIndex * duration
  isIndoorAC: boolean;
  coordinates: [number, number][]; // Strict road coordinates
}

export interface RouteOption {
  id: 'fastest' | 'coolest' | 'balanced';
  title: string;
  subtitle: string;
  color: string;
  pathNodes: string[];
  segments: SegmentCalculation[];
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  cumulativeHeatExposure: number;
  avgPerceivedTempC: number;
  peakPerceivedTempC: number;
  averageShadePct: number;
  waterStationsPassed: number;
  restPointsPassed: number;
  indoorPortionPct: number;
  isRealRoadEngine?: boolean;
}

export interface TradeoffAnalysis {
  timeDeltaSeconds: number;
  timeDeltaMinutes: number;
  timeDeltaPct: number;
  distanceDeltaMeters: number;
  heatReductionPct: number;
  shadeIncreasePct: number;
  heatSavedPerMinuteWalked: number; // efficiency ratio
  scoreBadge: 'Exceptional Value' | 'Balanced Trade-off' | 'Neutral' | 'Direct Advantage';
  explanationBullets: string[];
  summaryHeadline: string;
}

export interface TimeRecommendation {
  bestRouteId: 'fastest' | 'coolest' | 'balanced';
  bestRouteTitle: string;
  badgeLabel: string;
  badgeStyle: string;
  phaseName: string;
  solarHazardLevel: 'Low' | 'Moderate' | 'High' | 'Severe' | 'Extreme';
  headline: string;
  detailedReason: string;
  tip: string;
}

export interface PresetScenario {
  id: string;
  title: string;
  description: string;
  originNodeId: string;
  destinationNodeId: string;
  recommendedTime: number; // minutes from midnight
}
