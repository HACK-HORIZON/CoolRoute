import time
from typing import Dict, Any, Optional
import httpx

_WEATHER_CACHE: Dict[str, Any] = {}
CACHE_TTL_SECONDS = 900  # 15 minutes

async def get_live_weather(lat: float = 20.2961, lng: float = 85.8245) -> Dict[str, Any]:
    """
    Retrieves live meteorological data from Open-Meteo with an in-memory TTL cache.
    """
    cache_key = f"{round(lat, 3)}_{round(lng, 3)}"
    now = time.time()

    if cache_key in _WEATHER_CACHE:
        cached_entry = _WEATHER_CACHE[cache_key]
        if now - cached_entry["timestamp"] < CACHE_TTL_SECONDS:
            return cached_entry["data"]

    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lng}&current="
        f"temperature_2m,relative_humidity_2m,direct_radiation,surface_temperature,wind_speed_10m"
        f"&timezone=Asia%2FKolkata"
    )

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                curr = data.get("current", {})
                weather_result = {
                    "temperature_2m": curr.get("temperature_2m", 34.5),
                    "relative_humidity_2m": curr.get("relative_humidity_2m", 68),
                    "direct_radiation": curr.get("direct_radiation", 650.0),
                    "surface_temperature": curr.get("surface_temperature", 42.0),
                    "wind_speed_10m": curr.get("wind_speed_10m", 2.5),
                    "source": "Open-Meteo API",
                    "timestamp": now
                }
                _WEATHER_CACHE[cache_key] = {"data": weather_result, "timestamp": now}
                return weather_result
    except Exception as e:
        print(f"Weather API error: {e}")

    # Fallback default for Bhubaneswar
    fallback = {
        "temperature_2m": 35.0,
        "relative_humidity_2m": 65,
        "direct_radiation": 720.0,
        "surface_temperature": 45.0,
        "wind_speed_10m": 2.1,
        "source": "Fallback Estimate",
        "timestamp": now
    }
    return fallback

