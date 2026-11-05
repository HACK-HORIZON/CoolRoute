from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Optional, List, Dict, Any
import math

from services.solar_engine import calculate_noaa_solar_position, calculate_rothfusz_heat_index
from services.weather_service import get_live_weather
from data.bhubaneswar_data import BHUBANESWAR_POIS, CANOPY_ZONES, HEAT_ISLAND_ZONES

app = FastAPI(
    title="CoolRoute Bhubaneswar API",
    description="Microclimate-Aware Pedestrian Navigation & Heat Resilient Route Planner",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "app": "CoolRoute Bhubaneswar Backend",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/pois")
def search_pois(q: Optional[str] = Query(None, description="Search term for landmarks, buildings, malls, colonies")):
    """
    In-memory spatial index of 150+ Bhubaneswar landmarks.
    """
    if not q:
        return {"total": len(BHUBANESWAR_POIS), "results": BHUBANESWAR_POIS[:10]}
    
    query_lower = q.lower().strip()
    matches = [
        poi for poi in BHUBANESWAR_POIS
        if query_lower in poi["name"].lower() or query_lower in poi["address"].lower()
    ]
    return {"total": len(matches), "results": matches}

@app.get("/api/weather")
async def get_weather(
    lat: float = Query(20.2961, description="Latitude"),
    lng: float = Query(85.8245, description="Longitude")
):
    """
    Real-time weather station metrics (Open-Meteo with TTL caching).
    """
    weather = await get_live_weather(lat, lng)
    return weather

@app.get("/api/solar")
def get_solar_geometry(
    minute_of_day: int = Query(810, description="Minute of day from 0 to 1440 (e.g. 810 = 13:30)"),
    lat: float = Query(20.2961, description="Latitude"),
    lng: float = Query(85.8245, description="Longitude")
):
    """
    NOAA Astronomical Solar Position calculations.
    """
    now = datetime.now()
    day_of_year = now.timetuple().tm_yday
    solar_pos = calculate_noaa_solar_position(day_of_year, minute_of_day, lat, lng)
    
    # Calculate diurnal irradiance estimation based on solar elevation
    elevation = solar_pos["elevation_deg"]
    if elevation > 0:
        # Beer-Lambert atmospheric attenuation approximation
        zenith_rad = math.radians(90.0 - elevation)
        air_mass = 1.0 / (math.cos(zenith_rad) + 0.50572 * ((96.07995 - (90.0 - elevation)) ** -1.6364))
        direct_irradiance = round(1361.0 * (0.7 ** (air_mass ** 0.678)), 1)
    else:
        direct_irradiance = 0.0

    return {
        **solar_pos,
        "direct_irradiance_wm2": direct_irradiance,
        "minute_of_day": minute_of_day,
        "formatted_time": f"{minute_of_day // 60:02d}:{minute_of_day % 60:02d}"
    }

@app.get("/api/canopy")
def get_canopy_zones():
    """
    Returns registered tree canopy shade zones and severe solar heat islands.
    """
    return {
        "canopy_zones": CANOPY_ZONES,
        "heat_islands": HEAT_ISLAND_ZONES
    }

