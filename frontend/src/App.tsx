import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { TimeSlider } from './components/TimeSlider';
import { MapView } from './components/MapView';
import { TradeoffCard } from './components/TradeoffCard';
import { ThermalProfileChart } from './components/ThermalProfileChart';
import { LocationSearch } from './components/LocationSearch';
import { LayerControls } from './components/LayerControls';
import { PRESET_SCENARIOS } from './data/campusNetwork';
import { BHUBANESWAR_EXPANDED_DATABASE } from './data/bhubaneswarAreas';
import { LocationPoint, RouteOption } from './types';
import { calculateEnvironmentalContext } from './services/microclimateEngine';
import { fetchRealWeatherData } from './services/weatherService';
import { fetchOSRMGeometries, evaluateThermalRoutes, generateSynthesizedRoadGeometries, RawRouteGeometries } from './services/osrmRoutingService';
import { analyzeRouteTradeoff, getTimeBasedRecommendation } from './services/tradeoffAnalyst';
import { reverseGeocode } from './services/geocodingService';
import { Bookmark, Footprints } from 'lucide-react';

const DEFAULT_ORIGIN: LocationPoint = {
  name: 'Master Canteen (Station Square)',
  lat: 20.2668,
  lng: 85.8398,
  address: 'Master Canteen Square, Station Rd, Bhubaneswar 751001'
};

const DEFAULT_DESTINATION: LocationPoint = {
  name: 'Ram Mandir Square (Janpath)',
  lat: 20.2825,
  lng: 85.8436,
  address: 'Janpath Rd, Kharvela Nagar, Bhubaneswar 751001'
};

export const App: React.FC = () => {
  // State: Departure time (minutes from midnight). Default: 13:30 (810 min - Peak solar heating)
  const [departureMinutes, setDepartureMinutes] = useState<number>(810);

  // State: Origin and Destination (Real LocationPoints in Bhubaneswar)
  // Default: Master Canteen to Ram Mandir
  const [origin, setOrigin] = useState<LocationPoint>(DEFAULT_ORIGIN);
  const [destination, setDestination] = useState<LocationPoint>(DEFAULT_DESTINATION);

  // State: Live GPS position and accuracy radius (meters)
  const [gpsLocation, setGpsLocation] = useState<[number, number] | null>(null);
  const [gpsAccuracyRadius, setGpsAccuracyRadius] = useState<number>(35);

  // State: Map pick mode ('origin' | 'destination' | null)
  const [isPickingOnMap, setIsPickingOnMap] = useState<'origin' | 'destination' | null>(null);

  // State: Active route preview ('fastest' | 'coolest' | 'balanced' | 'all')
  const [activeRouteId, setActiveRouteId] = useState<'fastest' | 'coolest' | 'balanced' | 'all'>('all');

  // State: Walking speed (m/s)
  const [walkingSpeed, setWalkingSpeed] = useState<number>(1.3);

  // State: Real meteorological station data from Open-Meteo
  const [weatherData, setWeatherData] = useState<any>(null);

  // State: Guaranteed road geometries connecting origin and destination
  const [rawGeometries, setRawGeometries] = useState<RawRouteGeometries>(() =>
    generateSynthesizedRoadGeometries(DEFAULT_ORIGIN, DEFAULT_DESTINATION)
  );

  // State: Visual Map Layers
  const [showCanopy, setShowCanopy] = useState<boolean>(true);
  const [showHeatIslands, setShowHeatIslands] = useState<boolean>(true);
  const [showAmenities, setShowAmenities] = useState<boolean>(true);

  // 1. Fetch live Open-Meteo meteorological and radiation data on mount or when location changes
  useEffect(() => {
    let isMounted = true;
    fetchRealWeatherData(origin.lat, origin.lng).then((data) => {
      if (isMounted && data) {
        setWeatherData(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [origin.lat, origin.lng]);

  // 2. Fetch or calculate road geometries whenever Origin or Destination changes
  useEffect(() => {
    let isMounted = true;

    // Step A: Immediately generate routes for the exact selected endpoints in 0ms!
    const immediateGeoms = generateSynthesizedRoadGeometries(origin, destination);
    setRawGeometries(immediateGeoms);

    // Step B: Query OSRM in background to fine-tune to exact OpenStreetMap street curves if available
    fetchOSRMGeometries(origin, destination).then((geoms) => {
      if (isMounted && geoms) {
        setRawGeometries(geoms);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [origin.lat, origin.lng, destination.lat, destination.lng]);

  // 3. Dynamic environmental context calculated from physical solar + weather models
  const env = useMemo(() => {
    return calculateEnvironmentalContext(departureMinutes, weatherData, origin.lat, origin.lng);
  }, [departureMinutes, weatherData, origin.lat, origin.lng]);

  // 4. Instant in-memory route evaluation (0ms latency as the time slider is moved)
  const activeRoutes = useMemo(() => {
    return evaluateThermalRoutes(rawGeometries, env);
  }, [rawGeometries, env]);

  // 5. Compute real trade-off analysis between Fastest and Coolest routes
  const tradeoff = useMemo(() => {
    if (!activeRoutes) return null;
    return analyzeRouteTradeoff(activeRoutes.fastest, activeRoutes.coolest);
  }, [activeRoutes]);

  // 6. Dynamic time-based recommendation engine (Identifies best route across 24h diurnal cycle)
  const timeRec = useMemo(() => {
    return getTimeBasedRecommendation(env);
  }, [env]);

  // Handle map point selection / pin drag (wrapped in useCallback for stable reference)
  const handleSelectCoordinate = useCallback((point: LocationPoint, role: 'origin' | 'destination') => {
    if (role === 'origin') {
      setOrigin(point);
    } else {
      setDestination(point);
    }
  }, []);

  // Handle live GPS resolution
  const handleGpsResolved = useCallback((pos: [number, number], accuracy: number) => {
    setGpsLocation(pos);
    setGpsAccuracyRadius(accuracy);
  }, []);

  // 100% Precision GPS location directly from map FAB (Zero stale IP cache)
  const handleTriggerGps = () => {
    if (!navigator.geolocation) {
      setOrigin(DEFAULT_ORIGIN);
      setGpsLocation([DEFAULT_ORIGIN.lat, DEFAULT_ORIGIN.lng]);
      setGpsAccuracyRadius(40);
      return;
    }

    const onPosSuccess = async (lat: number, lng: number, acc: number) => {
      const addr = await reverseGeocode(lat, lng);
      const point: LocationPoint = {
        name: addr || 'My Live Location',
        lat,
        lng,
        address: `GPS (±${Math.round(acc)}m): ${addr}`
      };
      setOrigin(point);
      setGpsLocation([lat, lng]);
      setGpsAccuracyRadius(acc);
    };

    // Primary: Immediate High-Accuracy Hardware GPS with maximumAge: 0 to eliminate wrong ISP/IP locations
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onPosSuccess(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy || 10);
      },
      (err) => {
        console.warn('High accuracy GPS timed out, trying standard positioning:', err);
        navigator.geolocation.getCurrentPosition(
          (posFallback) => {
            onPosSuccess(posFallback.coords.latitude, posFallback.coords.longitude, posFallback.coords.accuracy || 35);
          },
          (errFinal) => {
            console.error('All GPS options failed:', errFinal);
            setOrigin(DEFAULT_ORIGIN);
            setGpsLocation([DEFAULT_ORIGIN.lat, DEFAULT_ORIGIN.lng]);
            setGpsAccuracyRadius(45);
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
        );
      },
      { enableHighAccuracy: true, timeout: 8500, maximumAge: 0 }
    );
  };

  // Handle preset scenario selection
  const handleSelectScenario = (scenarioId: string) => {
    const sc = PRESET_SCENARIOS.find((s) => s.id === scenarioId);
    if (sc) {
      if (scenarioId === 'sc_janpath_commute') {
        setOrigin(BHUBANESWAR_EXPANDED_DATABASE[9]); // Master Canteen
        setDestination(BHUBANESWAR_EXPANDED_DATABASE[10]); // Ram Mandir
      } else if (scenarioId === 'sc_green_sanctuary') {
        setOrigin(BHUBANESWAR_EXPANDED_DATABASE[49]); // Forest Park
        setDestination(BHUBANESWAR_EXPANDED_DATABASE[23]); // Lok Seva Bhavan
      } else {
        setOrigin(BHUBANESWAR_EXPANDED_DATABASE[10]); // Ram Mandir
        setDestination(BHUBANESWAR_EXPANDED_DATABASE[28]); // Vani Vihar
      }
      setDepartureMinutes(sc.recommendedTime);
      setActiveRouteId('all');
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* 1. Header with live microclimate telemetry */}
      <Header env={env} />

      {/* 2. Main Application Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-5">
        {/* Centered Terra-Style Hero Headline */}
        <section className="text-center py-8 sm:py-12 md:py-16 px-4 max-w-5xl mx-auto select-none">
          {/* Top Pill / Platform Tag with glowing cyan dots */}
          <div className="inline-flex items-center justify-center gap-2 mb-4 sm:mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]"></span>
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-cyan-400 font-semibold">
              Urban Shade &amp; Heat Intelligence
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]"></span>
          </div>

          {/* 2-Line Hero Topic Headline: Massive Terra Display Size */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extrabold tracking-tighter text-center leading-[1.03] sm:leading-[1.02]">
            <span className="text-white block">
              Walk your city
            </span>
            <span className="text-stroke-hollow block mt-1.5 sm:mt-3">
              the way the shade intended.
            </span>
          </h1>

          {/* Terra-style refined subtext paragraph */}
          <p className="text-sm sm:text-base text-neutral-400 text-center max-w-xl mx-auto mt-5 sm:mt-6 leading-relaxed font-normal">
            Bring comfort to every step. CoolRoute uses real-time solar physics and canopy shade data to reveal cooler, healthier paths across Bhubaneswar.
          </p>
        </section>

        {/* Time of Day Simulation Bar with Live Route Recommendation */}
        <TimeSlider
          env={env}
          timeRec={timeRec}
          onChangeTime={setDepartureMinutes}
          onSelectRoute={setActiveRouteId}
        />

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Spatial Map & Visual Analytics (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Interactive Real Road Map with Satellite & Draggable Pins */}
            <MapView
              routes={activeRoutes}
              activeRouteId={activeRouteId}
              recommendedRouteId={timeRec.bestRouteId}
              origin={origin}
              destination={destination}
              onSelectCoordinate={handleSelectCoordinate}
              isPickingOnMap={isPickingOnMap}
              onClearPickMode={() => setIsPickingOnMap(null)}
              showCanopy={showCanopy}
              showHeatIslands={showHeatIslands}
              showAmenities={showAmenities}
              gpsLocation={gpsLocation}
              gpsAccuracyRadius={gpsAccuracyRadius}
              onTriggerGps={handleTriggerGps}
            />

            {/* Map Visual Layer Controls */}
            <LayerControls
              showCanopy={showCanopy}
              onToggleCanopy={() => setShowCanopy(!showCanopy)}
              showHeatIslands={showHeatIslands}
              onToggleHeatIslands={() => setShowHeatIslands(!showHeatIslands)}
              showAmenities={showAmenities}
              onToggleAmenities={() => setShowAmenities(!showAmenities)}
            />

            {/* Thermal Elevation Profile Chart */}
            {activeRoutes && (
              <ThermalProfileChart fastest={activeRoutes.fastest} coolest={activeRoutes.coolest} />
            )}
          </div>

          {/* Right Column: Search, Routing Controls & Trade-off Analyst (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Location Search Bar for Origin & Destination */}
            <LocationSearch
              origin={origin}
              destination={destination}
              onChangeOrigin={setOrigin}
              onChangeDestination={setDestination}
              isPickingOnMap={isPickingOnMap}
              onTogglePickOnMap={setIsPickingOnMap}
              onGpsResolved={handleGpsResolved}
            />

            {/* Quick Demo Presets */}
            <div className="bg-neutral-950/90 backdrop-blur-md rounded-2xl border border-neutral-800 p-3 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase">
                  <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Curated Bhubaneswar Scenarios</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Footprints className="w-3 h-3 text-slate-500" />
                  <select
                    value={walkingSpeed}
                    onChange={(e) => setWalkingSpeed(Number(e.target.value))}
                    className="bg-black border border-neutral-800 rounded-lg px-2 py-0.5 text-[11px] text-slate-200"
                  >
                    <option value={1.0}>Slow (1.0 m/s)</option>
                    <option value={1.3}>Standard (1.3 m/s)</option>
                    <option value={1.6}>Brisk (1.6 m/s)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {PRESET_SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectScenario(sc.id)}
                    className="p-2 rounded-xl text-left border bg-black/80 border-neutral-800 text-slate-300 hover:bg-neutral-900 hover:text-white transition text-xs"
                  >
                    <div className="font-bold truncate text-emerald-400">{sc.title.split(':')[0]}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{sc.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Real Trade-off Analyst Card */}
            {activeRoutes && tradeoff ? (
              <TradeoffCard
                routes={activeRoutes}
                tradeoff={tradeoff}
                env={env}
                timeRec={timeRec}
                activeRouteId={activeRouteId}
                onSelectRoute={setActiveRouteId}
              />
            ) : (
              <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 text-center text-slate-400">
                Calculating road-aligned routes between selected locations...
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 3. Clean Footer */}
      <footer className="bg-black border-t border-neutral-900 px-4 py-4 text-xs text-neutral-500 mt-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-neutral-300">CoolRoute</strong> &bull; Pedestrian shade &amp; heat navigation for Bhubaneswar
          </div>
          <div className="text-[11px] text-neutral-500">
            OpenStreetMap road network &bull; NOAA solar position model &bull; Open-Meteo
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
