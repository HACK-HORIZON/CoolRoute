# CoolRoute Bhubaneswar 🌿☀️

> *"Walk your city the way the shade intended."*

A microclimate-aware pedestrian shade navigation and solar heat-tradeoff planner for Greater Bhubaneswar, Odisha.

---

## 🌐 Live Deployments

| Component | Platform | Live URL |
| :--- | :--- | :--- |
| **Frontend Web App** | Vercel | **[https://cool-route-puce.vercel.app](https://cool-route-puce.vercel.app)** |
| **Backend API Service** | Render | **[https://coolroute-of98.onrender.com](https://coolroute-of98.onrender.com)** |
| **API Documentation (Swagger)** | Render | **[https://coolroute-of98.onrender.com/docs](https://coolroute-of98.onrender.com/docs)** |
| **GitHub Repository** | GitHub | **[https://github.com/HACK-HORIZON/CoolRoute](https://github.com/HACK-HORIZON/CoolRoute)** |

---

## ⚡ Tech Stack & Scientific Core

### 1. Frontend
- **React 18 + TypeScript + Vite**: Ultra-fast component lifecycle and type-safe state machine.
- **Tailwind CSS**: Precision dark aesthetic inspired by modern space intelligence design.
- **Leaflet.js + Esri World Imagery & OSM**: Multi-layer high-resolution satellite imagery and street cartography.

### 2. Backend & APIs
- **FastAPI (Python 3.11)**: Async microservice architecture serving geospatial and solar intelligence endpoints.
- **OSRM Routing Engine**: Multi-alternative walking path generation.
- **Photon Geocoder & OSM Nominatim**: Sub-second forward and reverse geocoding with fuzzy matching.
- **Open-Meteo API**: High-frequency hourly solar irradiance ($W/m^2$), 2m air temperature, surface temperature, and humidity.

### 3. Scientific Models & Algorithms
- **NOAA Astronomical Solar Position Algorithm**: Computes real-time solar declination $\delta$, solar elevation $\alpha$, and solar azimuth $\theta$ with true solar time correction.
- **Rothfusz Heat Index Equation**: Computes human apparent thermal perception:
  $$\text{HI} = -42.379 + 2.049T + 10.143R - 0.224TR - 0.0068T^2 - 0.054R^2 + 0.0012T^2R + 0.0008TR^2 - 0.0000019T^2R^2$$
- **Microclimate Surface Albedo Model**: Simulates localized temperature anomalies ($-2.5^\circ\text{C}$ to $+3.8^\circ\text{C}$) across asphalt corridors vs. dense urban tree canopies (Ekamra Kanan, Chandaka Buffer, Forest Park).
- **Multi-Objective Pareto Tradeoff Optimizer**: Evaluates routes across distance, shade coverage percentage, thermal stress integral, and direct solar exposure.

---

## 📁 Repository Structure

```
thermal-route-planner/
├── frontend/                          # React + TypeScript + Vite Client
│   ├── src/
│   │   ├── components/                # MapView, LocationSearch, TradeoffCard, Header, etc.
│   │   ├── services/                  # OSRM router, geocoding, solar engine, weather service
│   │   ├── data/                      # 150+ Bhubaneswar POIs & campus network
│   │   └── types/                     # TypeScript definitions for spatial & microclimatic models
│   ├── index.html                     # HTML5 entrypoint
│   ├── package.json                   # Client dependencies
│   ├── tailwind.config.js             # Custom styling
│   ├── vercel.json                    # Vercel deployment SPA rewrite rules
│   └── vite.config.ts                 # Build configuration
│
├── backend/                           # FastAPI Python Microservice
│   ├── main.py                        # REST endpoints & CORS configuration
│   ├── requirements.txt               # Dependencies (FastAPI, Uvicorn, httpx)
│   ├── services/
│   │   ├── solar_engine.py            # NOAA Solar Position Algorithm
│   │   └── weather_service.py         # Open-Meteo cache & weather client
│   ├── data/
│   └── bhubaneswar_data.py            # 150+ POIs & Canopy/Heat Island Registry
│   └── README.md                      # Backend documentation
│
├── package.json                       # Top-level workspace script runner
├── render.yaml                        # Render Blueprint deployment definition
└── vercel.json                        # Root Vercel SPA configuration
```

---

## 🚀 Local Development

### 1. Frontend
```powershell
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 2. Backend
```powershell
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Interactive API documentation: **[http://localhost:8000/docs](http://localhost:8000/docs)**
