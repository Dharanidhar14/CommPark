import * as Location from 'expo-location';
import {
  IGeocodingProvider,
  MapCoordinate,
  MapSearchResult,
} from '../maps/types';
import { MOCK_PARKING_SPACES } from '../../constants/mockData';

// Curated database of prominent localities & landmarks in primary target metro hubs
export const METRO_LOCATION_DIRECTORY: MapSearchResult[] = [
  // Bengaluru Localities & Landmarks
  {
    id: 'geo_blr_indiranagar',
    title: 'Indiranagar',
    subtitle: '100ft Road & CMH Road • Shopping & Food Hub, Bengaluru',
    coordinate: { latitude: 12.9716, longitude: 77.6412 },
    type: 'locality',
    city: 'Bengaluru',
    locality: 'Indiranagar',
  },
  {
    id: 'geo_blr_100ft',
    title: 'Indiranagar 100 Feet Road',
    subtitle: 'Defence Colony / Doopanahalli, Bengaluru',
    coordinate: { latitude: 12.9745, longitude: 77.6430 },
    type: 'landmark',
    city: 'Bengaluru',
    locality: 'Indiranagar',
  },
  {
    id: 'geo_blr_koramangala',
    title: 'Koramangala 4th Block',
    subtitle: 'Sony World Signal / 80ft Road, Bengaluru',
    coordinate: { latitude: 12.9352, longitude: 77.6245 },
    type: 'locality',
    city: 'Bengaluru',
    locality: 'Koramangala',
  },
  {
    id: 'geo_blr_sony_world',
    title: 'Sony World Junction',
    subtitle: '100ft Intermediate Ring Road, Koramangala, Bengaluru',
    coordinate: { latitude: 12.9365, longitude: 77.6260 },
    type: 'landmark',
    city: 'Bengaluru',
    locality: 'Koramangala',
  },
  {
    id: 'geo_blr_whitefield',
    title: 'Whitefield',
    subtitle: 'ITPL Main Road / EPIP Tech Corridor, Bengaluru',
    coordinate: { latitude: 12.9855, longitude: 77.7280 },
    type: 'locality',
    city: 'Bengaluru',
    locality: 'Whitefield',
  },
  {
    id: 'geo_blr_itpl',
    title: 'International Tech Park (ITPL)',
    subtitle: 'Whitefield Main Road, Bengaluru',
    coordinate: { latitude: 12.9868, longitude: 77.7302 },
    type: 'landmark',
    city: 'Bengaluru',
    locality: 'Whitefield',
  },
  {
    id: 'geo_blr_hsr',
    title: 'HSR Layout Sector 2',
    subtitle: '27th Main Road / BDA Complex, Bengaluru',
    coordinate: { latitude: 12.9115, longitude: 77.6480 },
    type: 'locality',
    city: 'Bengaluru',
    locality: 'HSR Layout',
  },
  {
    id: 'geo_blr_mg_road',
    title: 'MG Road & Brigade Road',
    subtitle: 'Central Business District / Metro Station, Bengaluru',
    coordinate: { latitude: 12.9716, longitude: 77.5946 },
    type: 'locality',
    city: 'Bengaluru',
    locality: 'MG Road',
  },
  {
    id: 'geo_blr_church_st',
    title: 'Church Street',
    subtitle: 'Museum Road Junction, Bengaluru',
    coordinate: { latitude: 12.9748, longitude: 77.6030 },
    type: 'landmark',
    city: 'Bengaluru',
    locality: 'CBD',
  },
  {
    id: 'geo_blr_bellandur',
    title: 'Bellandur EcoSpace',
    subtitle: 'Outer Ring Road (ORR) Tech Corridor, Bengaluru',
    coordinate: { latitude: 12.9260, longitude: 77.6762 },
    type: 'locality',
    city: 'Bengaluru',
    locality: 'Bellandur',
  },

  // Mumbai Localities & Landmarks
  {
    id: 'geo_mum_bandra',
    title: 'Bandra West',
    subtitle: 'Pali Hill & Carter Road, Mumbai',
    coordinate: { latitude: 19.0650, longitude: 72.8290 },
    type: 'locality',
    city: 'Mumbai',
    locality: 'Bandra West',
  },
  {
    id: 'geo_mum_bkc',
    title: 'Bandra Kurla Complex (BKC)',
    subtitle: 'G Block, International Financial Hub, Mumbai',
    coordinate: { latitude: 19.0660, longitude: 72.8680 },
    type: 'locality',
    city: 'Mumbai',
    locality: 'BKC',
  },
  {
    id: 'geo_mum_pali_hill',
    title: 'Pali Hill',
    subtitle: 'Nargis Dutt Road, Bandra West, Mumbai',
    coordinate: { latitude: 19.0620, longitude: 72.8270 },
    type: 'landmark',
    city: 'Mumbai',
    locality: 'Bandra West',
  },
];

export class GeocodingService implements IGeocodingProvider {
  async geocodeAsync(query: string): Promise<MapSearchResult[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const cleanQuery = query.toLowerCase().trim();
    const results: MapSearchResult[] = [];
    const seenTitles = new Set<string>();

    // 1. Directory search (instant, reliable, offline-ready)
    for (const item of METRO_LOCATION_DIRECTORY) {
      const matchTitle = item.title.toLowerCase().includes(cleanQuery);
      const matchSubtitle = item.subtitle.toLowerCase().includes(cleanQuery);
      const matchLocality = item.locality?.toLowerCase().includes(cleanQuery);
      const matchCity = item.city?.toLowerCase().includes(cleanQuery);

      if (matchTitle || matchSubtitle || matchLocality || matchCity) {
        results.push(item);
        seenTitles.add(item.title.toLowerCase());
      }
    }

    // 2. Also search mock parking space landmarks
    for (const space of MOCK_PARKING_SPACES) {
      const spaceNameMatch = space.name.toLowerCase().includes(cleanQuery);
      const localityMatch = space.locality.toLowerCase().includes(cleanQuery);
      const landmarkMatch = space.nearbyLandmarks.some((l) =>
        l.toLowerCase().includes(cleanQuery)
      );

      if (
        (spaceNameMatch || localityMatch || landmarkMatch) &&
        !seenTitles.has(space.name.toLowerCase())
      ) {
        results.push({
          id: `geo_space_${space.id}`,
          title: space.name,
          subtitle: `${space.address}, ${space.locality}`,
          coordinate: space.coordinates,
          type: 'address',
          city: space.city,
          locality: space.locality,
        });
        seenTitles.add(space.name.toLowerCase());
      }
    }

    // 3. Fallback to native Expo Location geocoding if directory yielded fewer than 3 items
    if (results.length < 3) {
      try {
        const nativeResults = await Location.geocodeAsync(query);
        for (let i = 0; i < Math.min(nativeResults.length, 3); i++) {
          const item = nativeResults[i];
          const coord = { latitude: item.latitude, longitude: item.longitude };
          const title = `${query}`;
          if (!seenTitles.has(title.toLowerCase())) {
            results.push({
              id: `geo_native_${Date.now()}_${i}`,
              title,
              subtitle: `Coordinates: ${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}`,
              coordinate: coord,
              type: 'address',
            });
            seenTitles.add(title.toLowerCase());
          }
        }
      } catch {
        // Native geocoding may be unavailable without network/service; directory results suffice
      }
    }

    return results;
  }

  reverseLookupDirectory(query: string): MapSearchResult | undefined {
    const clean = query.trim().toLowerCase();
    for (const item of METRO_LOCATION_DIRECTORY) {
      if (
        item.title.toLowerCase() === clean ||
        item.locality?.toLowerCase() === clean ||
        item.title.toLowerCase().includes(clean)
      ) {
        return item;
      }
    }
    for (const space of MOCK_PARKING_SPACES) {
      if (
        space.name.toLowerCase() === clean ||
        space.locality.toLowerCase() === clean ||
        space.name.toLowerCase().includes(clean)
      ) {
        return {
          id: `geo_space_${space.id}`,
          title: space.name,
          subtitle: `${space.address}, ${space.locality}`,
          coordinate: space.coordinates,
          type: 'address',
          city: space.city,
          locality: space.locality,
        };
      }
    }
    return undefined;
  }

  async reverseGeocodeAsync(coordinate: MapCoordinate): Promise<string | null> {
    // 1. Check directory proximities first (within ~500m)
    for (const item of METRO_LOCATION_DIRECTORY) {
      const dLat = Math.abs(item.coordinate.latitude - coordinate.latitude);
      const dLng = Math.abs(item.coordinate.longitude - coordinate.longitude);
      if (dLat < 0.005 && dLng < 0.005) {
        return `${item.title}, ${item.city || 'Bengaluru'}`;
      }
    }

    // 2. Attempt native reverse geocoding
    try {
      const addresses = await Location.reverseGeocodeAsync(coordinate);
      if (addresses.length > 0) {
        const addr = addresses[0];
        const parts = [
          addr.street || addr.name,
          addr.district || addr.subregion,
          addr.city,
        ].filter(Boolean);
        return parts.join(', ') || null;
      }
    } catch {
      // ignore
    }

    return null;
  }
}

export const geocodingService = new GeocodingService();
