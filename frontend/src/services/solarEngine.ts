import { RealSolarMetrics } from '../types';

/**
 * Official NOAA Solar Position Algorithm
 * Computes exact Solar Elevation and Solar Azimuth based on physical astronomy equations
 * for any latitude, longitude, and timestamp (minutes from midnight on current date).
 *
 * References:
 * - NOAA Solar Calculator (Earth System Research Laboratories)
 * - Jean Meeus, Astronomical Algorithms
 */

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export function calculateRealSolarPosition(
  lat: number,
  lng: number,
  minutesFromMidnight: number,
  date: Date = new Date()
): RealSolarMetrics {
  // 1. Determine UTC time
  // If time is provided as minutesFromMidnight in local time, calculate local hour & minute
  const localHour = Math.floor(minutesFromMidnight / 60);
  const localMinute = Math.floor(minutesFromMidnight % 60);

  // Timezone offset for IST (Indian Standard Time UTC+5:30) or local browser
  // Bhubaneswar is in UTC+5.5
  const timezoneOffsetHours = 5.5;

  const utcHours = localHour + localMinute / 60 - timezoneOffsetHours;

  // 2. Day of year (1 - 365)
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diffDays = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // 3. Fractional year gamma in radians
  const gamma = (2 * Math.PI / 365) * (diffDays - 1 + (utcHours - 12) / 24);

  // 4. Equation of Time (EoT in minutes)
  const eqtime = 229.18 * (
    0.000075 +
    0.001868 * Math.cos(gamma) -
    0.032077 * Math.sin(gamma) -
    0.014615 * Math.cos(2 * gamma) -
    0.040849 * Math.sin(2 * gamma)
  );

  // 5. Solar Declination angle (radians)
  const declRad =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const declinationDeg = declRad * RAD_TO_DEG;

  // 6. True Solar Time (minutes)
  // Time offset = eqtime + 4 * longitude - 60 * timezone
  const timeOffset = eqtime + 4 * lng - 60 * timezoneOffsetHours;
  let trueSolarTime = minutesFromMidnight + timeOffset;
  trueSolarTime = ((trueSolarTime % 1440) + 1440) % 1440;

  // 7. Solar Hour Angle (degrees)
  let hourAngleDeg = (trueSolarTime / 4) - 180;
  if (hourAngleDeg < -180) hourAngleDeg += 360;
  const hourAngleRad = hourAngleDeg * DEG_TO_RAD;

  // 8. Solar Zenith Angle (radians)
  const latRad = lat * DEG_TO_RAD;
  const cosZenith =
    Math.sin(latRad) * Math.sin(declRad) +
    Math.cos(latRad) * Math.cos(declRad) * Math.cos(hourAngleRad);

  const zenithRad = Math.acos(Math.max(-1, Math.min(1, cosZenith)));
  const solarZenithDeg = zenithRad * RAD_TO_DEG;

  // 9. Solar Elevation / Altitude (degrees above horizon)
  let solarAltitudeDeg = 90 - solarZenithDeg;

  // Atmospheric refraction correction if above horizon
  if (solarAltitudeDeg > -0.575) {
    let refractionCorrection = 0;
    if (solarAltitudeDeg > 5) {
      refractionCorrection = 58.1 / Math.tan(solarAltitudeDeg * DEG_TO_RAD) -
        0.07 / Math.pow(Math.tan(solarAltitudeDeg * DEG_TO_RAD), 3) +
        0.000086 / Math.pow(Math.tan(solarAltitudeDeg * DEG_TO_RAD), 5);
    } else if (solarAltitudeDeg > -0.575) {
      refractionCorrection = 1735 + solarAltitudeDeg * (-518.2 + solarAltitudeDeg * (103.4 + solarAltitudeDeg * (-12.79 + solarAltitudeDeg * 0.711)));
    }
    solarAltitudeDeg += refractionCorrection / 3600;
  }

  // 10. Solar Azimuth (degrees clockwise from North: 0°=N, 90°=E, 180°=S, 270°=W)
  const sinZenith = Math.sin(zenithRad);
  let solarAzimuthDeg = 180;

  if (sinZenith > 0.001) {
    const cosAzimuth = (Math.sin(latRad) * cosZenith - Math.sin(declRad)) / (Math.cos(latRad) * sinZenith);
    const clampedCosAzimuth = Math.max(-1, Math.min(1, cosAzimuth));
    const azimuthRad = Math.acos(clampedCosAzimuth);
    solarAzimuthDeg = 180 - azimuthRad * RAD_TO_DEG;

    if (hourAngleDeg > 0) {
      solarAzimuthDeg = 360 - solarAzimuthDeg;
    }
  }

  // Normalize azimuth to 0-360
  solarAzimuthDeg = ((solarAzimuthDeg % 360) + 360) % 360;

  return {
    solarAltitudeDeg: Math.round(solarAltitudeDeg * 10) / 10,
    solarAzimuthDeg: Math.round(solarAzimuthDeg * 10) / 10,
    solarZenithDeg: Math.round(solarZenithDeg * 10) / 10,
    declinationDeg: Math.round(declinationDeg * 100) / 100,
    equationOfTimeMin: Math.round(eqtime * 10) / 10
  };
}

