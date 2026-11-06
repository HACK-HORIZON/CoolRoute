import { LocationPoint } from '../types';
import { searchComprehensiveBhubaneswar, EnrichedLocationPoint, BHUBANESWAR_EXPANDED_DATABASE } from '../data/bhubaneswarAreas';

export interface SearchResultItem extends LocationPoint {
  categoryIcon?: string;
  categoryLabel?: string;
}

/**
 * Searches places, buildings, apartments, and streets combining:
 * 1. Comprehensive Local Bhubaneswar Knowledge Base (150+ places)
 * 2. Photon Geocoder (Elasticsearch-powered OSM typeahead with Bhubaneswar GPS proximity bias)
 * 3. Nominatim OpenStreetMap Bounded Geocoder
 */
export async function searchLocations(query: string): Promise<SearchResultItem[]> {
  const trimmed = query.trim();
  if (trimmed.length < 1) {
    return BHUBANESWAR_EXPANDED_DATABASE.slice(0, 8).map(mapEnrichedToResult);
  }

  // 0. Support direct coordinate input (e.g. "20.2961, 85.8245")
  const coordMatch = trimmed.match(/^([+-]?\d+(?:\.\d+)?)[,\s]+([+-]?\d+(?:\.\d+)?)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return [{
        id: `coord_${lat.toFixed(4)}_${lng.toFixed(4)}`,
        name: `Custom Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        lat,
        lng,
        address: `Custom coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        categoryIcon: '📍',
        categoryLabel: 'COORDINATES'
      }];
    }
  }

  // 1. Instant match from comprehensive local database
  const localMatches = searchComprehensiveBhubaneswar(trimmed).map(mapEnrichedToResult);
  const results: SearchResultItem[] = [...localMatches];

  // 2. Query Photon Geocoder (Bhubaneswar location bias: 20.2961, 85.8245)
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&lat=20.2961&lon=85.8245&limit=10`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(photonUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.features) {
        for (const feat of data.features) {
          const coords = feat.geometry?.coordinates;
          const props = feat.properties || {};

          if (coords && coords.length >= 2) {
            const lng = coords[0];
            const lat = coords[1];

            const name = props.name || props.street || props.district || props.city || trimmed;
            const addressParts = [
              props.housenumber,
              props.street,
              props.district,
              props.city || props.state || 'Odisha'
            ].filter(Boolean);

            const item: SearchResultItem = {
              id: `photon_${props.osm_id || Math.random()}`,
              name,
              lat,
              lng,
              address: addressParts.join(', ') || props.state || 'Odisha, India',
              categoryIcon: getIconForOsmType(props.osm_value || props.osm_key),
              categoryLabel: props.osm_value || 'Location'
            };

            addIfNotDuplicate(results, item);
          }
        }
      }
    }
  } catch (err) {
    // Photon failed or timed out, proceed to Nominatim
  }

  // 3. Query OpenStreetMap Nominatim with India / Odisha bias
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&viewbox=85.50,20.60,86.20,20.00&bounded=0&limit=8&addressdetails=1`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(nominatimUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      for (const item of data) {
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);

        const parts = item.display_name.split(',');
        const shortTitle = parts.slice(0, 2).join(',').trim();

        addIfNotDuplicate(results, {
          id: `nom_${item.place_id}`,
          name: shortTitle || item.name,
          lat,
          lng,
          address: item.display_name,
          categoryIcon: '📍',
          categoryLabel: item.type || 'Street'
        });
      }
    }
  } catch {
    // Ignore online errors
  }

  // Prioritize locations in Greater Bhubaneswar region
  results.sort((a, b) => {
    const aInBbsr = a.lat >= 20.15 && a.lat <= 20.45 && a.lng >= 85.65 && a.lng <= 85.95;
    const bInBbsr = b.lat >= 20.15 && b.lat <= 20.45 && b.lng >= 85.65 && b.lng <= 85.95;
    if (aInBbsr && !bInBbsr) return -1;
    if (!aInBbsr && bInBbsr) return 1;
    return 0;
  });

  return results.slice(0, 12);
}

/**
 * Helper to prevent duplicate coordinates in search results
 */
function addIfNotDuplicate(list: SearchResultItem[], item: SearchResultItem) {
  const exists = list.some(
    (existing) =>
      (Math.abs(existing.lat - item.lat) < 0.0015 && Math.abs(existing.lng - item.lng) < 0.0015) ||
      existing.name.toLowerCase() === item.name.toLowerCase()
  );
  if (!exists) {
    list.push(item);
  }
}

function mapEnrichedToResult(item: EnrichedLocationPoint): SearchResultItem {
  let icon = '📍';
  if (item.category === 'hospital') icon = '🏥';
  if (item.category === 'mall') icon = '🛍️';
  if (item.category === 'building') icon = '🏢';
  if (item.category === 'education') icon = '🎓';
  if (item.category === 'transit') icon = '🚆';
  if (item.category === 'heritage') icon = '🏛️';
  if (item.category === 'park') icon = '🌳';

  return {
    ...item,
    categoryIcon: icon,
    categoryLabel: item.category.toUpperCase()
  };
}

function getIconForOsmType(type?: string): string {
  if (!type) return '📍';
  const t = type.toLowerCase();
  if (t.includes('hospital') || t.includes('clinic') || t.includes('pharmacy')) return '🏥';
  if (t.includes('shop') || t.includes('mall') || t.includes('supermarket')) return '🛍️';
  if (t.includes('school') || t.includes('university') || t.includes('college')) return '🎓';
  if (t.includes('apartment') || t.includes('residential') || t.includes('building')) return '🏢';
  if (t.includes('park') || t.includes('garden')) return '🌳';
  if (t.includes('station') || t.includes('bus') || t.includes('airport')) return '🚆';
  return '📍';
}

/**
 * Reverse geocodes coordinates [lat, lng] to get a clean, human-readable address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  // 1. Check if near any known landmark in our 150+ database
  let closestDist = Infinity;
  let closestName = '';

  for (const item of BHUBANESWAR_EXPANDED_DATABASE) {
    const dLat = (item.lat - lat) * 111000;
    const dLng = (item.lng - lng) * 111000 * Math.cos((lat * Math.PI) / 180);
    const distM = Math.sqrt(dLat * dLat + dLng * dLng);

    if (distM < 85) {
      return item.name;
    } else if (distM < closestDist && distM < 250) {
      closestDist = distM;
      closestName = `Near ${item.name}`;
    }
  }

  // 2. Query Nominatim reverse geocoding
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat.toFixed(5)}&lon=${lng.toFixed(5)}&zoom=18&addressdetails=1`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const main = addr.road || addr.suburb || addr.neighbourhood || addr.residential || addr.building;
        const sub = addr.suburb || addr.city_district || addr.city || 'Bhubaneswar';

        if (main && sub) return `${main}, ${sub}`;
        if (main) return `${main}, Bhubaneswar`;
      }
      if (data.display_name) {
        const parts = data.display_name.split(',');
        return parts.slice(0, 3).join(',').trim();
      }
    }
  } catch {
    // Ignore online errors
  }

  if (closestName) return closestName;
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}
