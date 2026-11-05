# CoolRoute
> *"Walk your city the way the shade intended."*

Microclimate-aware pedestrian navigation and heat trade-off planner for Greater Bhubaneswar.

---

## 📁 Repository Structure

```
thermal-route-planner/
├── frontend/                          # Client Web Application
│   ├── src/
│   │   ├── components/                # MapView, LocationSearch, TradeoffCard, Header, etc.
│   │   ├── services/                  # OSRM router, geocoding, solar engine, weather service
│   │   ├── data/                      # 150+ Bhubaneswar POIs database & campus network
│   │   └── types/                     # TypeScript definitions for spatial & microclimatic models
│   ├── index.html                     # HTML5 entrypoint
│   ├── package.json                   # Vite + React + TypeScript configuration
│   ├── tailwind.config.js             # Styling & custom typography system
│   └── vite.config.ts                 # Build configuration
│
├── backend/                           # Asynchronous FastAPI Microservice
│   ├── main.py                        # FastAPI application & REST endpoints
│   ├── requirements.txt               # Python dependencies
│   ├── services/
│   │   ├── solar_engine.py            # NOAA Astronomical Solar Position algorithm
│   │   └── weather_service.py         # Open-Meteo weather API with in-memory TTL caching
│   ├── data/
│   │   └── bhubaneswar_data.py        # 150+ POIs & Urban Canopy / Heat Island registry
│   └── README.md                      # Backend setup and API documentation
│
└── package.json                       # Top-level workspace script runner
```

---

## 🚀 Running the Project

### 1. Frontend (React + TypeScript + Vite)
You can run the frontend either from the root or inside `frontend/`:

```powershell
# From root:
npm run dev

# Or directly in frontend folder:
cd frontend
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

### 2. Backend (FastAPI + Python)
```powershell
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Interactive Swagger API docs available at: **[http://localhost:8000/docs](http://localhost:8000/docs)**
