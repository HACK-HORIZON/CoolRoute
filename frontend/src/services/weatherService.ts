import { RealWeatherMetrics } from '../types';

interface OpenMeteoHourlyResponse {
  latitude: number;
  longitude: number;
  current?: {
    temperature_2m: number;
    relative_humidity_2m: number;
    direct_normal_irradiance: number;
    surface_temperature?: number;
    wind_speed_10m?: number;
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    direct_normal_irradiance: number[];
    surface_temperature?: number[];
    wind_speed_10m?: number[];
  };
}

let cachedWeatherData: OpenMeteoHourlyResponse | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache

/**
 * Fetches real meteorological measurements and radiation forecasts from Open-Meteo.
 * Free API, no key required, CORS supported.
 */
export async function fetchRealWeatherData(lat: number = 20.2961, lng: number = 85.8245): Promise<OpenMeteoHourlyResponse | null> {
  const now = Date.now();
  if (cachedWeatherData && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedWeatherData;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current=temperature_2m,relative_humidity_2m,direct_normal_irradiance,surface_temperature,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,direct_normal_irradiance,surface_temperature,wind_speed_10m&timezone=Asia%2FKolkata`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP error: ${res.status}`);
    }

    const data: OpenMeteoHourlyResponse = await res.json();
    cachedWeatherData = data;
    lastFetchTime = now;
    return data;
  } catch (err) {
    console.warn('Real weather API unavailable or offline, using physical model fallback:', err);
    return null;
  }
}

/**
 * Extracts the real meteorological variables for a specific minute of the day (0 - 1440).
 */
export function getRealWeatherForTime(
  weatherData: OpenMeteoHourlyResponse | null,
  minutesFromMidnight: number,
  solarElevationDeg: number
): RealWeatherMetrics {
  const hour = Math.floor(minutesFromMidnight / 60);
  const minuteFraction = (minutesFromMidnight % 60) / 60;

  if (weatherData && weatherData.hourly && weatherData.hourly.time && weatherData.hourly.time.length > 0) {
    // Current day hour index in hourly array
    const targetHourIndex = Math.min(23, Math.max(0, hour));
    const nextHourIndex = Math.min(23, targetHourIndex + 1);

    const temps = weatherData.hourly.temperature_2m;
    const humids = weatherData.hourly.relative_humidity_2m;
    const irradiances = weatherData.hourly.direct_normal_irradiance;
    const surfaceTemps = weatherData.hourly.surface_temperature || temps;
    const windSpeeds = weatherData.hourly.wind_speed_10m || [12];

    const temp = (temps[targetHourIndex] ?? 30) * (1 - minuteFraction) + (temps[nextHourIndex] ?? 30) * minuteFraction;
    const humid = (humids[targetHourIndex] ?? 50) * (1 - minuteFraction) + (humids[nextHourIndex] ?? 50) * minuteFraction;
    const directIrradiance = (irradiances[targetHourIndex] ?? 0) * (1 - minuteFraction) + (irradiances[nextHourIndex] ?? 0) * minuteFraction;
    const surfaceTemp = (surfaceTemps[targetHourIndex] ?? temp + 8) * (1 - minuteFraction) + (surfaceTemps[nextHourIndex] ?? temp + 8) * minuteFraction;
    const windSpeed = windSpeeds[targetHourIndex] ?? 12;

    return {
      temperatureC: Math.round(temp * 10) / 10,
      relativeHumidityPct: Math.round(humid),
      directSolarIrradianceWm2: Math.max(0, Math.round(directIrradiance)),
      surfaceTempC: Math.round(surfaceTemp * 10) / 10,
      windSpeedKmh: Math.round(windSpeed),
      isLiveStationData: true,
      stationName: 'Open-Meteo Bhubaneswar Station'
    };
  }

  // Fallback: Physical meteorological diurnal curve calibrated to Bhubaneswar climate
  const minTemp = 24.2;
  const maxTemp = 37.8;
  const peakHour = 14.2;
  const minHour = 6.0;

  let temp = minTemp;
  if (hour >= minHour && hour <= peakHour) {
    const progress = (hour - minHour) / (peakHour - minHour);
    temp = minTemp + (maxTemp - minTemp) * Math.sin((progress * Math.PI) / 2);
  } else if (hour > peakHour) {
    const progress = (hour - peakHour) / (24 - peakHour + minHour);
    temp = maxTemp - (maxTemp - minTemp) * Math.sin((progress * Math.PI) / 2);
  }

  const humid = Math.max(30, Math.min(85, Math.round(75 - ((temp - minTemp) / (maxTemp - minTemp)) * 40)));
  const directIrradiance = solarElevationDeg > 0 ? Math.round(Math.sin((solarElevationDeg * Math.PI) / 180) * 880) : 0;
  const surfaceTemp = solarElevationDeg > 0 ? temp + (directIrradiance / 880) * 15 : temp;

  return {
    temperatureC: Math.round(temp * 10) / 10,
    relativeHumidityPct: humid,
    directSolarIrradianceWm2: directIrradiance,
    surfaceTempC: Math.round(surfaceTemp * 10) / 10,
    windSpeedKmh: 14,
    isLiveStationData: false,
    stationName: 'Physical Solar & Climate Model'
  };
}

