import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LocationPoint, RouteOption } from '../types';
import { CANOPY_ZONES, HEAT_ISLAND_ZONES, CAMPUS_NODES } from '../data/campusNetwork';
import { Layers, RotateCcw, ShieldCheck, Eye, Satellite, Map as MapIcon, Crosshair, Navigation2 } from 'lucide-react';
import { reverseGeocode } from '../services/geocodingService';

interface MapViewProps {
  routes: {
    fastest: RouteOption;
    coolest: RouteOption;
    balanced: RouteOption;
  } | null;
  activeRouteId: 'fastest' | 'coolest' | 'balanced' | 'all';
  origin: LocationPoint;
  destination: LocationPoint;
  onSelectCoordinate: (point: LocationPoint, role: 'origin' | 'destination') => void;
  isPickingOnMap: 'origin' | 'destination' | null;
  onClearPickMode: () => void;
  showCanopy: boolean;
  showHeatIslands: boolean;
  showAmenities: boolean;
  gpsLocation?: [number, number] | null;
  gpsAccuracyRadius?: number;
  onTriggerGps?: () => void;
}

const BBSR_CENTER: [number, number] = [20.2760, 85.8350];

export const MapView: React.FC<MapViewProps> = ({
  routes,
  activeRouteId,
  origin,
  destination,
  onSelectCoordinate,
  isPickingOnMap,
  onClearPickMode,
  showCanopy,
  showHeatIslands,
  showAmenities,
  gpsLocation,
  gpsAccuracyRadius = 35,
  onTriggerGps
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const activeTileLayerRef = useRef<L.TileLayer | null>(null);

  // Basemap toggle: 'satellite' | 'osm' | 'voyager'
  const [tileProvider, setTileProvider] = useState<'satellite' | 'osm' | 'voyager'>('satellite');
  const [mapReady, setMapReady] = useState(false);

  // Layer groups refs
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const canopyLayerRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<L.LayerGroup | null>(null);
  const endpointsLayerRef = useRef<L.LayerGroup | null>(null);
  const amenitiesLayerRef = useRef<L.LayerGroup | null>(null);
  const gpsMarkerLayerRef = useRef<L.LayerGroup | null>(null);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [origin.lat, origin.lng],
      zoom: 14,
      minZoom: 10,
      maxZoom: 19,
      zoomControl: false
    });

    // Default to High-Res Esri Satellite Imagery
    const satTile = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; High-Resolution Satellite Imagery',
      maxZoom: 19
    }).addTo(map);

    activeTileLayerRef.current = satTile;

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initialize layer groups
    canopyLayerRef.current = L.layerGroup().addTo(map);
    heatLayerRef.current = L.layerGroup().addTo(map);
    routesLayerRef.current = L.layerGroup().addTo(map);
    amenitiesLayerRef.current = L.layerGroup().addTo(map);
    endpointsLayerRef.current = L.layerGroup().addTo(map);
    gpsMarkerLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);

    // Handle map clicks for custom origin/destination picking
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const addr = await reverseGeocode(lat, lng);
      const point: LocationPoint = {
        name: addr,
        lat,
        lng,
        address: addr
      };

      const targetRole = (mapContainerRef.current?.getAttribute('data-pick-mode') as 'origin' | 'destination' | null);

      if (targetRole === 'origin' || targetRole === 'destination') {
        onSelectCoordinate(point, targetRole);
        onClearPickMode();
      } else {
        const popup = L.popup()
          .setLatLng([lat, lng])
          .setContent(`
            <div class="p-1 text-slate-800">
              <div class="font-bold text-xs text-slate-900">${addr}</div>
              <div class="text-[10px] text-slate-500 font-mono mt-0.5">${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
              <div class="flex gap-2 mt-2 pt-1.5 border-t border-slate-200">
                <button id="popup-set-orig" class="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-700">Set as Start (A)</button>
                <button id="popup-set-dest" class="px-2.5 py-1 bg-purple-600 text-white rounded text-[11px] font-semibold hover:bg-purple-700">Set as End (B)</button>
              </div>
            </div>
          `)
          .openOn(map);

        setTimeout(() => {
          const btnO = document.getElementById('popup-set-orig');
          const btnD = document.getElementById('popup-set-dest');
          if (btnO) {
            btnO.onclick = () => {
              onSelectCoordinate(point, 'origin');
              map.closePopup();
            };
          }
          if (btnD) {
            btnD.onclick = () => {
              onSelectCoordinate(point, 'destination');
              map.closePopup();
            };
          }
        }, 100);
      }
    });

    const timers = [
      setTimeout(() => map.invalidateSize(), 150),
      setTimeout(() => map.invalidateSize(), 500),
      setTimeout(() => map.invalidateSize(), 1200)
    ];

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', handleResize);
      setMapReady(false);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update pick mode cursor
  useEffect(() => {
    if (mapContainerRef.current) {
      if (isPickingOnMap) {
        mapContainerRef.current.setAttribute('data-pick-mode', isPickingOnMap);
        mapContainerRef.current.style.cursor = 'crosshair';
      } else {
        mapContainerRef.current.removeAttribute('data-pick-mode');
        mapContainerRef.current.style.cursor = '';
      }
    }
  }, [isPickingOnMap]);

  // 2. Basemap Switcher
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (activeTileLayerRef.current) {
      map.removeLayer(activeTileLayerRef.current);
    }

    if (tileProvider === 'satellite') {
      activeTileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri World Imagery &bull; High-Resolution Satellite',
        maxZoom: 19
      }).addTo(map);
    } else if (tileProvider === 'osm') {
      activeTileLayerRef.current = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);
    } else {
      activeTileLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO &copy; OpenStreetMap',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);
    }
  }, [tileProvider]);

  // 3. Render Canopy Zones
  useEffect(() => {
    const layer = canopyLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    if (showCanopy) {
      CANOPY_ZONES.forEach((zone) => {
        const circle = L.circle(zone.center, {
          radius: zone.radiusMeters,
          color: '#10b981',
          weight: 2,
          fillColor: '#10b981',
          fillOpacity: tileProvider === 'satellite' ? 0.35 : 0.22,
          dashArray: '5, 5'
        }).bindTooltip(
          `<div class="text-xs font-semibold text-emerald-800">🌳 ${zone.name}</div>
           <div class="text-[10px] text-slate-600">${Math.round(zone.density * 100)}% Canopy Density</div>`,
          { sticky: true }
        );
        layer.addLayer(circle);
      });
    }
  }, [showCanopy, tileProvider]);

  // 4. Render Heat Islands
  useEffect(() => {
    const layer = heatLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    if (showHeatIslands) {
      HEAT_ISLAND_ZONES.forEach((zone) => {
        const circle = L.circle(zone.center, {
          radius: zone.radiusMeters,
          color: '#f97316',
          weight: 2,
          fillColor: '#ea580c',
          fillOpacity: tileProvider === 'satellite' ? 0.35 : 0.28
        }).bindTooltip(
          `<div class="text-xs font-semibold text-rose-800">🔥 ${zone.name}</div>
           <div class="text-[10px] text-slate-600">${zone.surfaceType}</div>`,
          { sticky: true }
        );
        layer.addLayer(circle);
      });
    }
  }, [showHeatIslands, tileProvider]);

  // 5. Render Uber/Rapido Style DRAGGABLE Origin (A) and Destination (B) Markers!
  useEffect(() => {
    const layer = endpointsLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    // Draggable Marker A (Start)
    const iconA = L.divIcon({
      className: 'custom-map-icon',
      html: `<div class="relative flex flex-col items-center group cursor-grab active:cursor-grabbing">
               <div class="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-bold shadow-2xl ring-4 ring-emerald-300 text-sm">A</div>
               <div class="w-1.5 h-2 bg-emerald-700 rounded-b"></div>
               <div class="absolute -top-7 hidden group-hover:flex px-2 py-0.5 rounded bg-slate-900/95 text-[10px] text-emerald-300 font-semibold shadow border border-slate-700 whitespace-nowrap">
                 Drag to exact doorstep
               </div>
             </div>`,
      iconSize: [32, 38],
      iconAnchor: [16, 38]
    });

    const markerA = L.marker([origin.lat, origin.lng], { icon: iconA, draggable: true });
    markerA.bindTooltip(
      `<div class="text-xs font-bold text-emerald-700">Start (A): ${origin.name}</div>
       <div class="text-[10px] text-slate-500">Drag pin to adjust exact location</div>`,
      { sticky: true }
    );

    markerA.on('dragend', async () => {
      const pos = markerA.getLatLng();
      const addr = await reverseGeocode(pos.lat, pos.lng);
      onSelectCoordinate({ name: addr, lat: pos.lat, lng: pos.lng, address: addr }, 'origin');
    });

    layer.addLayer(markerA);

    // Draggable Marker B (Destination)
    const iconB = L.divIcon({
      className: 'custom-map-icon',
      html: `<div class="relative flex flex-col items-center group cursor-grab active:cursor-grabbing">
               <div class="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-bold shadow-2xl ring-4 ring-purple-300 text-sm">B</div>
               <div class="w-1.5 h-2 bg-purple-700 rounded-b"></div>
               <div class="absolute -top-7 hidden group-hover:flex px-2 py-0.5 rounded bg-slate-900/95 text-[10px] text-purple-300 font-semibold shadow border border-slate-700 whitespace-nowrap">
                 Drag to destination
               </div>
             </div>`,
      iconSize: [32, 38],
      iconAnchor: [16, 38]
    });

    const markerB = L.marker([destination.lat, destination.lng], { icon: iconB, draggable: true });
    markerB.bindTooltip(
      `<div class="text-xs font-bold text-purple-700">Destination (B): ${destination.name}</div>
       <div class="text-[10px] text-slate-500">Drag pin to adjust destination</div>`,
      { sticky: true }
    );

    markerB.on('dragend', async () => {
      const pos = markerB.getLatLng();
      const addr = await reverseGeocode(pos.lat, pos.lng);
      onSelectCoordinate({ name: addr, lat: pos.lat, lng: pos.lng, address: addr }, 'destination');
    });

    layer.addLayer(markerB);
  }, [origin, destination, onSelectCoordinate]);

  // 6. Render Live GPS Beacon with Accuracy Circle
  useEffect(() => {
    const layer = gpsMarkerLayerRef.current;
    const map = mapInstanceRef.current;
    if (!layer) return;
    layer.clearLayers();

    if (gpsLocation) {
      // Blue translucent GPS Accuracy Circle (Google Maps / Uber style)
      const accuracyCircle = L.circle(gpsLocation, {
        radius: Math.max(25, gpsAccuracyRadius),
        color: '#38bdf8',
        weight: 1.5,
        fillColor: '#38bdf8',
        fillOpacity: 0.15
      });
      layer.addLayer(accuracyCircle);

      // Pulsing blue GPS user dot
      const gpsIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `<div class="relative flex items-center justify-center w-6 h-6">
                 <div class="absolute w-6 h-6 rounded-full bg-sky-400 opacity-75 animate-ping"></div>
                 <div class="relative w-4 h-4 rounded-full bg-sky-500 border-2 border-white shadow-xl"></div>
               </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const gpsMarker = L.marker(gpsLocation, { icon: gpsIcon }).bindTooltip(
        `<div class="text-xs font-bold text-sky-600">Your Device GPS Position</div>
         <div class="text-[10px] text-slate-500">Accuracy radius: &plusmn;${Math.round(gpsAccuracyRadius)}m</div>
         <div class="text-[10px] text-emerald-600 font-semibold">Tip: Drag Pin A to fine-tune doorstep</div>`,
        { sticky: true }
      );
      layer.addLayer(gpsMarker);

      if (map) {
        map.flyTo(gpsLocation, 16, { duration: 1.2 });
      }
    }
  }, [gpsLocation, gpsAccuracyRadius]);

  // 7. Render Amenities Layer
  useEffect(() => {
    const layer = amenitiesLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    if (showAmenities) {
      CAMPUS_NODES.forEach((node) => {
        if (!node.poiType) return;
        let iconChar = '💧';
        let bgClass = 'bg-blue-600';
        if (node.poiType === 'cooling_hub') { iconChar = '❄️'; bgClass = 'bg-teal-600'; }
        if (node.poiType === 'shaded_bench') { iconChar = '🪑'; bgClass = 'bg-emerald-700'; }
        if (node.poiType === 'misting_station') { iconChar = '💨'; bgClass = 'bg-cyan-500'; }
        if (node.poiType === 'indoor_ac') { iconChar = '🏛️'; bgClass = 'bg-sky-700'; }

        const icon = L.divIcon({
          className: 'custom-map-icon',
          html: `<div class="flex items-center justify-center w-6 h-6 rounded-full ${bgClass} text-white shadow-md text-xs border border-white cursor-pointer hover:scale-125 transition-transform" title="${node.name}">${iconChar}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const m = L.marker([node.lat, node.lng], { icon }).bindPopup(`
          <div class="p-1 text-slate-800 text-xs">
            <div class="font-bold">${node.name}</div>
            <div class="text-[11px] text-slate-600">${node.poiDescription || ''}</div>
          </div>
        `);
        layer.addLayer(m);
      });
    }
  }, [showAmenities]);

  // 8. Render All 3 Distinct Route Polylines
  useEffect(() => {
    if (!mapReady || !routesLayerRef.current || !routes) return;
    const layer = routesLayerRef.current;
    const map = mapInstanceRef.current;
    layer.clearLayers();

    const allPoints: [number, number][] = [];

    const drawRoute = (route: RouteOption, isHighlighted: boolean) => {
      if (!route) return;
      const latlngs: [number, number][] = [];
      if (route.segments && route.segments.length > 0) {
        route.segments.forEach((seg, i) => {
          if (seg.coordinates && seg.coordinates.length > 0) {
            if (i === 0) {
              latlngs.push(...seg.coordinates);
            } else {
              latlngs.push(...seg.coordinates.slice(1));
            }
          }
        });
      }

      // Guaranteed fallback to endpoints if segment array was empty
      if (latlngs.length < 2) {
        latlngs.push([origin.lat, origin.lng], [destination.lat, destination.lng]);
      }

      allPoints.push(...latlngs);

      // 1. High-contrast Black Casing Polyline (Guarantees immediate visibility against satellite basemaps)
      const casing = L.polyline(latlngs, {
        color: '#000000',
        weight: isHighlighted ? 10 : 7,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round'
      });
      layer.addLayer(casing);

      // 2. Glow effect for active route
      if (isHighlighted) {
        const glowLine = L.polyline(latlngs, {
          color: route.color,
          weight: 14,
          opacity: 0.45,
          lineCap: 'round',
          lineJoin: 'round'
        });
        layer.addLayer(glowLine);
      }

      // 3. Main crisp polyline along road network
      const polyline = L.polyline(latlngs, {
        color: route.color,
        weight: isHighlighted ? 6 : 4,
        opacity: isHighlighted ? 1.0 : 0.85,
        dashArray: route.id === 'fastest' ? '6, 6' : undefined,
        lineCap: 'round',
        lineJoin: 'round'
      });

      polyline.bindTooltip(
        `<div class="text-xs font-bold" style="color: ${route.color}">${route.title}</div>
         <div class="text-[11px] text-slate-700 font-medium">⏱️ ${Math.round((route.totalDurationSeconds / 60) * 10) / 10} min (${(route.totalDistanceMeters / 1000).toFixed(2)} km)</div>
         <div class="text-[10px] text-slate-500">Avg Heat: ${route.avgPerceivedTempC}°C • Shade: ${route.averageShadePct}%</div>`,
        { sticky: true }
      );

      layer.addLayer(polyline);
    };

    if (activeRouteId === 'all') {
      drawRoute(routes.fastest, false);
      drawRoute(routes.balanced, false);
      drawRoute(routes.coolest, true);
    } else {
      if (activeRouteId !== 'fastest') drawRoute(routes.fastest, false);
      if (activeRouteId !== 'balanced') drawRoute(routes.balanced, false);
      if (activeRouteId !== 'coolest') drawRoute(routes.coolest, false);

      if (activeRouteId === 'fastest') drawRoute(routes.fastest, true);
      if (activeRouteId === 'coolest') drawRoute(routes.coolest, true);
      if (activeRouteId === 'balanced') drawRoute(routes.balanced, true);
    }

    if (map && allPoints.length > 0 && !isPickingOnMap) {
      try {
        const bounds = L.latLngBounds(allPoints);
        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [45, 45],
            maxZoom: 16,
            animate: true
          });
        }
      } catch (err) {
        console.warn('Map bounds fit error:', err);
      }
    }
  }, [mapReady, routes, activeRouteId, isPickingOnMap, origin.lat, origin.lng, destination.lat, destination.lng]);

  return (
    <div className="relative w-full h-[480px] md:h-[560px] rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Picking on Map Prompt Banner */}
      {isPickingOnMap && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl bg-emerald-600/95 text-white font-bold text-xs shadow-2xl border border-emerald-400 flex items-center gap-2 animate-pulse">
          <span>Click anywhere on the map to set {isPickingOnMap === 'origin' ? 'Start (A)' : 'Destination (B)'}</span>
          <button
            onClick={onClearPickMode}
            className="px-2 py-0.5 rounded bg-black/30 hover:bg-black/50 text-[10px] uppercase font-semibold"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Control Buttons: Recenter & Satellite/Street Layer Toggle */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
        <button
          onClick={() => {
            if (mapInstanceRef.current) mapInstanceRef.current.setView(BBSR_CENTER, 14);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/95 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold shadow-lg backdrop-blur-md transition"
          title="Recenter on Bhubaneswar"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Bhubaneswar</span>
        </button>

        {/* 3-Way Basemap Switcher */}
        <div className="flex rounded-xl bg-black/95 border border-neutral-800 p-0.5 shadow-lg backdrop-blur-md text-xs">
          <button
            onClick={() => setTileProvider('satellite')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition ${tileProvider === 'satellite'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-neutral-300 hover:text-white'
              }`}
            title="High-Resolution Satellite Aerial View"
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>Satellite</span>
          </button>

          <button
            onClick={() => setTileProvider('osm')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition ${tileProvider === 'osm'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-neutral-300 hover:text-white'
              }`}
            title="OpenStreetMap Street Vectors"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Streets</span>
          </button>

          <button
            onClick={() => setTileProvider('voyager')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition ${tileProvider === 'voyager'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-neutral-300 hover:text-white'
              }`}
            title="Clean Carto Voyager"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Clean</span>
          </button>
        </div>
      </div>

      {/* Floating GPS Crosshair FAB (Google Maps / Uber style) */}
      {onTriggerGps && (
        <button
          onClick={onTriggerGps}
          className="absolute bottom-16 right-3 z-10 p-3 rounded-full bg-black/95 hover:bg-neutral-900 text-sky-400 border border-neutral-800 shadow-2xl backdrop-blur-md hover:scale-110 active:scale-95 transition-all"
          title="Recenter on My Live GPS Location"
        >
          <Crosshair className="w-5 h-5" />
        </button>
      )}

      {/* Real-Road Verification Pill */}
      <div className="absolute bottom-3 left-3 z-10 bg-black/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-800 text-[11px] text-neutral-300 flex items-center gap-1.5 shadow-lg">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Drag A &amp; B pins anywhere</span>
      </div>

      {/* Map Legend */}
      <div className="absolute top-3 right-3 z-10 bg-black/95 backdrop-blur-md rounded-xl p-3 border border-neutral-800 shadow-lg text-[11px] space-y-1.5 max-w-[210px]">
        <div className="font-semibold text-neutral-200 pb-1 border-b border-neutral-800 flex items-center justify-between">
          <span>Routes</span>
          <span className="text-[10px] text-neutral-400">Walking</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1 bg-red-500 inline-block rounded-full"></span>
          <span className="text-neutral-300">Direct Route</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1.5 bg-emerald-500 inline-block rounded-full"></span>
          <span className="text-emerald-300 font-medium">Shaded Corridor</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1 bg-sky-400 inline-block rounded-full"></span>
          <span className="text-sky-300">Balanced Route</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-neutral-800">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600/40 border border-emerald-500"></span>
          <span className="text-neutral-400">Tree Canopy</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-600/40 border border-orange-500"></span>
          <span className="text-neutral-400">High Heat Area</span>
        </div>
      </div>
    </div>
  );
};
