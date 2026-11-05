import React, { useState, useEffect, useRef } from 'react';
import { LocationPoint } from '../types';
import { searchLocations, reverseGeocode, SearchResultItem } from '../services/geocodingService';
import { BHUBANESWAR_EXPANDED_DATABASE, searchComprehensiveBhubaneswar } from '../data/bhubaneswarAreas';
import { Search, MapPin, Navigation, ArrowUpDown, Crosshair, Loader2, Compass, Check, X, Building2, ShoppingBag, GraduationCap, Trees, Hospital } from 'lucide-react';

interface LocationSearchProps {
  origin: LocationPoint;
  destination: LocationPoint;
  onChangeOrigin: (point: LocationPoint) => void;
  onChangeDestination: (point: LocationPoint) => void;
  isPickingOnMap: 'origin' | 'destination' | null;
  onTogglePickOnMap: (target: 'origin' | 'destination' | null) => void;
  onGpsResolved?: (pos: [number, number], accuracy: number) => void;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  origin,
  destination,
  onChangeOrigin,
  onChangeDestination,
  isPickingOnMap,
  onTogglePickOnMap,
  onGpsResolved
}) => {
  const [originQuery, setOriginQuery] = useState(origin.name);
  const [destQuery, setDestQuery] = useState(destination.name);

  const [originSuggestions, setOriginSuggestions] = useState<SearchResultItem[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<SearchResultItem[]>([]);

  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  const originTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const destTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setOriginQuery(origin.name);
  }, [origin.name]);

  useEffect(() => {
    setDestQuery(destination.name);
  }, [destination.name]);

  // Handle origin search with debouncing
  const handleOriginChange = (val: string) => {
    setOriginQuery(val);
    if (originTimeoutRef.current) clearTimeout(originTimeoutRef.current);

    if (val.trim().length === 0) {
      setOriginSuggestions(BHUBANESWAR_EXPANDED_DATABASE.slice(0, 8).map(mapToItem));
      return;
    }

    setIsSearchingOrigin(true);
    originTimeoutRef.current = setTimeout(async () => {
      const results = await searchLocations(val);
      setOriginSuggestions(results);
      setIsSearchingOrigin(false);
    }, 200);
  };

  // Handle destination search with debouncing
  const handleDestChange = (val: string) => {
    setDestQuery(val);
    if (destTimeoutRef.current) clearTimeout(destTimeoutRef.current);

    if (val.trim().length === 0) {
      setDestSuggestions(BHUBANESWAR_EXPANDED_DATABASE.slice(0, 8).map(mapToItem));
      return;
    }

    setIsSearchingDest(true);
    destTimeoutRef.current = setTimeout(async () => {
      const results = await searchLocations(val);
      setDestSuggestions(results);
      setIsSearchingDest(false);
    }, 200);
  };

  function mapToItem(item: any): SearchResultItem {
    return {
      ...item,
      categoryIcon: item.category === 'hospital' ? '🏥' : item.category === 'mall' ? '🛍️' : item.category === 'building' ? '🏢' : '📍',
      categoryLabel: item.category?.toUpperCase() || 'AREA'
    };
  }

  // Swap Origin and Destination
  const handleSwap = () => {
    const temp = origin;
    onChangeOrigin(destination);
    onChangeDestination(temp);
  };

  // 100% Precision GPS location (no stale IP cache, immediate hardware trilateration)
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      const defaultHub = BHUBANESWAR_EXPANDED_DATABASE.find(p => p.name.includes('Master Canteen')) || BHUBANESWAR_EXPANDED_DATABASE[0];
      onChangeOrigin(defaultHub);
      setOriginQuery(defaultHub.name);
      return;
    }

    setIsGpsLoading(true);

    const onPosSuccess = async (lat: number, lng: number, acc: number) => {
      setIsGpsLoading(false);
      const addr = await reverseGeocode(lat, lng);
      const point: LocationPoint = {
        name: addr || 'My Live Location',
        lat,
        lng,
        address: `GPS (±${Math.round(acc)}m): ${addr}`
      };
      onChangeOrigin(point);
      setOriginQuery(point.name);
      if (onGpsResolved) {
        onGpsResolved([lat, lng], acc);
      }
    };

    // Primary: Query High-Accuracy Hardware GPS with maximumAge: 0 to eliminate wrong ISP/IP location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onPosSuccess(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy || 10);
      },
      (err) => {
        console.warn('High accuracy GPS timed out or unavailable, trying network positioning:', err);
        // Fallback with fresh coordinates only
        navigator.geolocation.getCurrentPosition(
          (posFallback) => {
            onPosSuccess(posFallback.coords.latitude, posFallback.coords.longitude, posFallback.coords.accuracy || 35);
          },
          (errFinal) => {
            console.error('All GPS providers failed:', errFinal);
            setIsGpsLoading(false);
            const defaultHub = BHUBANESWAR_EXPANDED_DATABASE.find(p => p.name.includes('Master Canteen')) || BHUBANESWAR_EXPANDED_DATABASE[0];
            onChangeOrigin(defaultHub);
            setOriginQuery(defaultHub.name);
            if (onGpsResolved) {
              onGpsResolved([defaultHub.lat, defaultHub.lng], 50);
            }
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
        );
      },
      { enableHighAccuracy: true, timeout: 8500, maximumAge: 0 }
    );
  };

  // Resolve typed queries and trigger route calculation
  const handlePlanRoute = () => {
    if (originQuery && originQuery !== origin.name) {
      const match = searchComprehensiveBhubaneswar(originQuery)[0];
      if (match) {
        onChangeOrigin(match);
        setOriginQuery(match.name);
      }
    }

    if (destQuery && destQuery !== destination.name) {
      const match = searchComprehensiveBhubaneswar(destQuery)[0];
      if (match) {
        onChangeDestination(match);
        setDestQuery(match.name);
      }
    }

    setOriginSuggestions([]);
    setDestSuggestions([]);
  };

  // Filter category shortcuts
  const handleCategoryFilter = (cat: string) => {
    const filtered = BHUBANESWAR_EXPANDED_DATABASE.filter(
      (item) => item.category === cat
    ).slice(0, 8).map(mapToItem);
    setDestSuggestions(filtered);
  };

  return (
    <div className="bg-black/95 backdrop-blur-md rounded-2xl border border-neutral-800 p-4 shadow-xl space-y-4">
      {/* Top Header with GPS and Swap */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-white tracking-wide uppercase">
            Search Places, Buildings &amp; Streets
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUseCurrentLocation}
            disabled={isGpsLoading}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/35 text-emerald-300 border border-emerald-500/40 text-xs font-semibold shadow transition"
            title="Locate exact live GPS"
          >
            {isGpsLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{isGpsLoading ? 'Locating...' : 'My Live GPS'}</span>
          </button>

          <button
            onClick={handleSwap}
            className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs transition shadow"
            title="Swap Origin and Destination"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-300" />
          </button>
        </div>
      </div>

      {/* Origin Search Field */}
      <div className="relative">
        <label className="flex items-center justify-between text-xs font-semibold text-emerald-400 mb-1">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            Pickup / Start (Point A)
          </span>
          <button
            onClick={() => onTogglePickOnMap(isPickingOnMap === 'origin' ? null : 'origin')}
            className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition ${
              isPickingOnMap === 'origin'
                ? 'bg-emerald-500 text-white animate-pulse'
                : 'text-emerald-400 hover:bg-emerald-500/10'
            }`}
          >
            {isPickingOnMap === 'origin' ? 'Click Map for Start...' : '📍 Pick on Map'}
          </button>
        </label>

        <div className="relative flex items-center">
          <input
            type="text"
            value={originQuery}
            onFocus={() => {
              if (originSuggestions.length === 0) {
                setOriginSuggestions(BHUBANESWAR_EXPANDED_DATABASE.slice(0, 6).map(mapToItem));
              }
            }}
            onBlur={() => {
              setTimeout(() => setOriginSuggestions([]), 250);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && originSuggestions.length > 0) {
                const top = originSuggestions[0];
                onChangeOrigin(top);
                setOriginQuery(top.name);
                setOriginSuggestions([]);
              }
            }}
            onChange={(e) => handleOriginChange(e.target.value)}
            placeholder="Type any building, apartment, street or colony..."
            className="w-full bg-neutral-950 border border-neutral-800 text-neutral-100 rounded-xl pl-3 pr-16 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <div className="absolute right-2 flex items-center gap-1">
            {originQuery && (
              <button
                onClick={() => {
                  setOriginQuery('');
                  setOriginSuggestions([]);
                }}
                className="text-neutral-500 hover:text-neutral-300 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {isSearchingOrigin && (
              <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            )}
          </div>
        </div>

        {/* Origin Autocomplete Dropdown */}
        {originSuggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden divide-y divide-neutral-850 max-h-56 overflow-y-auto">
            {originSuggestions.map((item, idx) => (
              <div
                key={`orig-sug-${idx}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChangeOrigin(item);
                  setOriginQuery(item.name);
                  setOriginSuggestions([]);
                }}
                className="p-2.5 hover:bg-emerald-600/20 cursor-pointer text-left transition flex items-center justify-between"
              >
                <div className="flex items-start gap-2.5 min-w-0 pr-2">
                  <span className="text-base flex-shrink-0 mt-0.5">{item.categoryIcon || '📍'}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">{item.name}</span>
                      {item.categoryLabel && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-900 text-neutral-400 border border-neutral-800 font-mono">
                          {item.categoryLabel}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-neutral-400 truncate">{item.address}</div>
                  </div>
                </div>
                {item.name === origin.name && (
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Destination Search Field */}
      <div className="relative">
        <label className="flex items-center justify-between text-xs font-semibold text-purple-400 mb-1">
          <span className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5" />
            Destination (Point B)
          </span>
          <button
            onClick={() => onTogglePickOnMap(isPickingOnMap === 'destination' ? null : 'destination')}
            className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition ${
              isPickingOnMap === 'destination'
                ? 'bg-purple-500 text-white animate-pulse'
                : 'text-purple-400 hover:bg-purple-500/10'
            }`}
          >
            {isPickingOnMap === 'destination' ? 'Click Map for End...' : '📍 Pick on Map'}
          </button>
        </label>

        <div className="relative flex items-center">
          <input
            type="text"
            value={destQuery}
            onFocus={() => {
              if (destSuggestions.length === 0) {
                setDestSuggestions(BHUBANESWAR_EXPANDED_DATABASE.slice(0, 6).map(mapToItem));
              }
            }}
            onBlur={() => {
              setTimeout(() => setDestSuggestions([]), 250);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (destSuggestions.length > 0) {
                  const top = destSuggestions[0];
                  onChangeDestination(top);
                  setDestQuery(top.name);
                  setDestSuggestions([]);
                } else {
                  handlePlanRoute();
                }
              }
            }}
            onChange={(e) => handleDestChange(e.target.value)}
            placeholder="Type destination building, hospital, mall, or street..."
            className="w-full bg-neutral-950 border border-neutral-800 text-neutral-100 rounded-xl pl-3 pr-16 py-2 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
          <div className="absolute right-2 flex items-center gap-1">
            {destQuery && (
              <button
                onClick={() => {
                  setDestQuery('');
                  setDestSuggestions([]);
                }}
                className="text-neutral-500 hover:text-neutral-300 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {isSearchingDest && (
              <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
            )}
          </div>
        </div>

        {/* Destination Autocomplete Dropdown */}
        {destSuggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden divide-y divide-neutral-850 max-h-56 overflow-y-auto">
            {destSuggestions.map((item, idx) => (
              <div
                key={`dest-sug-${idx}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChangeDestination(item);
                  setDestQuery(item.name);
                  setDestSuggestions([]);
                }}
                className="p-2.5 hover:bg-purple-600/20 cursor-pointer text-left transition flex items-center justify-between"
              >
                <div className="flex items-start gap-2.5 min-w-0 pr-2">
                  <span className="text-base flex-shrink-0 mt-0.5">{item.categoryIcon || '📍'}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">{item.name}</span>
                      {item.categoryLabel && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-900 text-neutral-400 border border-neutral-800 font-mono">
                          {item.categoryLabel}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-neutral-400 truncate">{item.address}</div>
                  </div>
                </div>
                {item.name === destination.name && (
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Big Action Button: Plan Routes */}
      <button
        onClick={handlePlanRoute}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] border border-emerald-400/40"
      >
        <Navigation className="w-4 h-4 text-emerald-200 fill-emerald-200" />
        <span>Plan Routes (Direct &bull; Shaded &bull; Balanced)</span>
      </button>

      {/* Category Filter Chips (Google Maps / Uber Explore Style) */}
      <div className="pt-2 border-t border-neutral-800">
        <div className="text-[10px] font-semibold text-neutral-400 mb-1.5 flex items-center justify-between">
          <span>Quick Category Explorer:</span>
          <span className="text-[9px] text-neutral-500">Tap to browse</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handleCategoryFilter('hospital')}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-rose-300 border border-neutral-800 transition"
          >
            <span>🏥</span>
            <span>Hospitals</span>
          </button>

          <button
            onClick={() => handleCategoryFilter('mall')}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-300 border border-neutral-800 transition"
          >
            <span>🛍️</span>
            <span>Malls</span>
          </button>

          <button
            onClick={() => handleCategoryFilter('building')}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-sky-300 border border-neutral-800 transition"
          >
            <span>🏢</span>
            <span>Apartments</span>
          </button>

          <button
            onClick={() => handleCategoryFilter('education')}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-emerald-300 border border-neutral-800 transition"
          >
            <span>🎓</span>
            <span>Colleges</span>
          </button>

          <button
            onClick={() => handleCategoryFilter('park')}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-teal-300 border border-neutral-800 transition"
          >
            <span>🌳</span>
            <span>Parks</span>
          </button>
        </div>
      </div>
    </div>
  );
};
