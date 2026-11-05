import math
from datetime import datetime
from typing import Dict, Any

def calculate_noaa_solar_position(
    day_of_year: int,
    minute_of_day: int,
    lat_deg: float = 20.2961,
    lng_deg: float = 85.8245,
    timezone_offset_hours: float = 5.5
) -> Dict[str, float]:
    """
    Implements the NOAA Astronomical Solar Position Algorithm.
    Computes solar elevation, azimuth angle, equation of time, and declination.
    """
    hour_decimal = minute_of_day / 60.0

    # Fractional year in radians
    gamma = (2.0 * math.pi / 365.0) * (day_of_year - 1 + (hour_decimal - 12.0) / 24.0)

    # Equation of Time (minutes)
    eqtime = 229.18 * (
        0.000075 +
        0.001868 * math.cos(gamma) -
        0.032077 * math.sin(gamma) -
        0.014615 * math.cos(2.0 * gamma) -
        0.040849 * math.sin(2.0 * gamma)
    )

    # Solar Declination (radians)
    decl = (
        0.006918 -
        0.399912 * math.cos(gamma) +
        0.070257 * math.sin(gamma) -
        0.006758 * math.cos(2.0 * gamma) +
        0.000907 * math.sin(2.0 * gamma)
    )

    # True Solar Time (minutes)
    time_offset = eqtime + 4.0 * lng_deg - 60.0 * timezone_offset_hours
    tst = (minute_of_day + time_offset) % 1440.0
    if tst < 0:
        tst += 1440.0

    # Solar Hour Angle (degrees)
    ha_deg = (tst / 4.0) - 180.0
    ha_rad = math.radians(ha_deg)

    lat_rad = math.radians(lat_deg)

    # Solar Zenith Angle
    cos_zenith = (
        math.sin(lat_rad) * math.sin(decl) +
        math.cos(lat_rad) * math.cos(decl) * math.cos(ha_rad)
    )
    cos_zenith = max(-1.0, min(1.0, cos_zenith))
    zenith_rad = math.acos(cos_zenith)
    zenith_deg = math.degrees(zenith_rad)

    # Solar Elevation / Altitude
    elevation_deg = 90.0 - zenith_deg

    # Solar Azimuth Angle
    sin_zenith = math.sin(zenith_rad)
    if sin_zenith > 0.0001:
        cos_azimuth = (math.sin(decl) * math.cos(lat_rad) - math.cos(decl) * math.sin(lat_rad) * math.cos(ha_rad)) / sin_zenith
        cos_azimuth = max(-1.0, min(1.0, cos_azimuth))
        azimuth_rad = math.acos(cos_azimuth)
        azimuth_deg = math.degrees(azimuth_rad)
        if ha_deg > 0:
            azimuth_deg = (360.0 - azimuth_deg) % 360.0
    else:
        azimuth_deg = 180.0

    return {
        "elevation_deg": round(elevation_deg, 2),
        "azimuth_deg": round(azimuth_deg, 2),
        "declination_deg": round(math.degrees(decl), 2),
        "eqtime_min": round(eqtime, 2)
    }

def calculate_rothfusz_heat_index(temp_c: float, rh_pct: float) -> float:
    """
    NWS Rothfusz polynomial regression model for Heat Index.
    """
    t_f = temp_c * 9.0 / 5.0 + 32.0

    # Steadman's simple formula
    simple_hi = 0.5 * (t_f + 61.0 + ((t_f - 68.0) * 1.2) + (rh_pct * 0.094))
    if simple_hi < 80.0:
        return round((simple_hi - 32.0) * 5.0 / 9.0, 1)

    # Full 16-parameter polynomial
    hi = (
        -42.379 +
        2.04901523 * t_f +
        10.14333127 * rh_pct -
        0.22475541 * t_f * rh_pct -
        0.00683783 * (t_f ** 2) -
        0.05481717 * (rh_pct ** 2) +
        0.00122874 * (t_f ** 2) * rh_pct +
        0.00085282 * t_f * (rh_pct ** 2) -
        0.00000199 * (t_f ** 2) * (rh_pct ** 2)
    )

    # Adjustments
    if rh_pct < 13.0 and 80.0 <= t_f <= 112.0:
        adj = ((13.0 - rh_pct) / 4.0) * math.sqrt((17.0 - abs(t_f - 95.0)) / 17.0)
        hi -= adj
    elif rh_pct > 85.0 and 80.0 <= t_f <= 87.0:
        adj = ((rh_pct - 85.0) / 10.0) * ((87.0 - t_f) / 5.0)
        hi += adj

    return round((hi - 32.0) * 5.0 / 9.0, 1)

