# CoolRoute Backend (FastAPI + Python)

High-performance asynchronous backend service for **CoolRoute Bhubaneswar**.

---

## 🚀 Features

- **FastAPI Framework**: High throughput, auto-generated interactive OpenAPI docs at `/docs`.
- **NOAA Solar Position Engine**: Astronomical solar geometry equations (`elevation_deg`, `azimuth_deg`, `eqtime_min`).
- **Open-Meteo Integration with TTL Cache**: In-memory 15-minute caching for temperature, humidity, radiation, and road surface heat.
- **In-Memory Spatial Index**: 150+ categorized Bhubaneswar Points of Interest (POIs).
- **Urban Canopy & Heat Island Registry**: Real polygons and buffer zones for tree canopies and heat islands.

---

## 📦 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the Development Server
```bash
uvicorn main:app --reload --port 8000
```

### 3. Open Interactive Swagger Docs
Open your browser at: [http://localhost:8000/docs](http://localhost:8000/docs)

