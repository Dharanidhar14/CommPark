import { MOCK_PARKING_SPACES } from '../../constants/mockData';
import { ParkingSpace } from '../../types/parking';
import { DiscoveryFilters, SortOption, SearchSuggestionItem } from './types';

export const POPULAR_METRO_LOCALITIES = [
  { id: 'loc_all', name: 'All Localities', city: 'Bengaluru / Mumbai' },
  { id: 'loc_indiranagar', name: 'Indiranagar', city: 'Bengaluru', landmark: '100ft Road / CMH Hospital' },
  { id: 'loc_koramangala', name: 'Koramangala', city: 'Bengaluru', landmark: 'Sony World Signal / Forum Mall' },
  { id: 'loc_hsr', name: 'HSR Layout', city: 'Bengaluru', landmark: 'Sector 2 / BDA Complex' },
  { id: 'loc_whitefield', name: 'Whitefield', city: 'Bengaluru', landmark: 'ITPL / EPIP Tech Zone' },
  { id: 'loc_bandra', name: 'Bandra West', city: 'Mumbai', landmark: 'Pali Hill / Carter Road' },
  { id: 'loc_bkc', name: 'Bandra Kurla Complex (BKC)', city: 'Mumbai', landmark: 'Financial District' },
];

export const RECENT_SEARCHES_MOCK = [
  'Indiranagar 100ft Road, Bengaluru',
  'Sony World Junction, Koramangala',
  'Whitefield ITPL Tech Zone',
  'Pali Hill, Bandra West',
];

export const SEARCH_SUGGESTIONS_MOCK: SearchSuggestionItem[] = [
  {
    id: 'sug_1',
    title: 'Indiranagar 100 Feet Road',
    subtitle: 'Defence Colony • Food & Shopping Hub, Bengaluru',
    type: 'locality',
    query: 'Indiranagar',
  },
  {
    id: 'sug_2',
    title: 'Sony World Junction',
    subtitle: '80 Feet Road, Koramangala 4th Block, Bengaluru',
    type: 'landmark',
    query: 'Koramangala',
  },
  {
    id: 'sug_3',
    title: 'Prestige ITPL Tech Zone',
    subtitle: 'Whitefield Main Road, Bengaluru',
    type: 'landmark',
    query: 'Whitefield',
  },
  {
    id: 'sug_4',
    title: 'HSR Layout Sector 2 & BDA',
    subtitle: 'Residential Gated Condos, Bengaluru',
    type: 'locality',
    query: 'HSR Layout',
  },
  {
    id: 'sug_5',
    title: 'Bandra Pali Hill',
    subtitle: 'Nargis Dutt Road, Mumbai',
    type: 'locality',
    query: 'Bandra West',
  },
];

function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function getFilteredParkingSpaces(
  filters: DiscoveryFilters = {},
  sort: SortOption = 'recommended'
): ParkingSpace[] {
  let results = [...MOCK_PARKING_SPACES];

  if (filters.city && filters.city !== 'all') {
    results = results.filter((s) => s.city.toLowerCase() === filters.city?.toLowerCase());
  }

  // Geographic Radius Filter
  if (filters.latitude !== undefined && filters.longitude !== undefined) {
    const lat = filters.latitude;
    const lng = filters.longitude;
    const maxRadius = filters.radiusKm ?? 50;

    results = results
      .map((s) => {
        const dist = calculateDistanceKm(lat, lng, s.coordinates.latitude, s.coordinates.longitude);
        return { ...s, distanceKm: dist };
      })
      .filter((s) => s.distanceKm <= maxRadius);
  }

  // Bounding Box Filter
  if (
    filters.minLat !== undefined &&
    filters.maxLat !== undefined &&
    filters.minLng !== undefined &&
    filters.maxLng !== undefined
  ) {
    results = results.filter(
      (s) =>
        s.coordinates.latitude >= filters.minLat! &&
        s.coordinates.latitude <= filters.maxLat! &&
        s.coordinates.longitude >= filters.minLng! &&
        s.coordinates.longitude <= filters.maxLng!
    );
  }

  if (filters.query && filters.query.trim().length > 0) {
    const q = filters.query.toLowerCase().trim();
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.locality.toLowerCase().includes(q) ||
        s.neighborhood.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.nearbyLandmarks.some((l) => l.toLowerCase().includes(q))
    );
  }

  if (filters.locality && filters.locality !== 'all' && filters.locality !== 'All Localities') {
    results = results.filter(
      (s) => s.locality.toLowerCase() === filters.locality?.toLowerCase()
    );
  }

  if (filters.category && filters.category !== 'all') {
    results = results.filter((s) => s.category === filters.category);
  }

  if (filters.accessType && filters.accessType !== 'all') {
    results = results.filter((s) => s.accessType === filters.accessType);
  }

  if (filters.coveredOnly) {
    results = results.filter((s) => s.covered);
  }

  if (filters.evChargingOnly) {
    results = results.filter((s) => s.amenities.includes('ev_charging'));
  }

  if (filters.securityGuardOnly) {
    results = results.filter((s) => s.securityGuardOnSite);
  }

  if (filters.vehicleType) {
    results = results.filter((s) => s.supportedVehicles.includes(filters.vehicleType!));
  }

  if (filters.minPrice !== undefined) {
    results = results.filter((s) => s.pricePerHour >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    results = results.filter((s) => s.pricePerHour <= filters.maxPrice!);
  }

  if (filters.maxDistanceKm !== undefined) {
    results = results.filter((s) => s.distanceKm <= filters.maxDistanceKm!);
  }

  // Sorting
  switch (sort) {
    case 'price_low':
      results.sort((a, b) => a.pricePerHour - b.pricePerHour);
      break;
    case 'price_high':
      results.sort((a, b) => b.pricePerHour - a.pricePerHour);
      break;
    case 'rating':
      results.sort((a, b) => b.rating - a.rating);
      break;
    case 'distance':
      results.sort((a, b) => a.distanceKm - b.distanceKm);
      break;
    case 'recommended':
    default:
      // Weighting by rating, availability, and distance
      results.sort((a, b) => {
        const scoreA = (a.isAvailable ? 10 : 0) + a.rating * 2 - a.distanceKm;
        const scoreB = (b.isAvailable ? 10 : 0) + b.rating * 2 - b.distanceKm;
        return scoreB - scoreA;
      });
      break;
  }

  return results;
}

export function getParkingSpaceById(id: string): ParkingSpace | undefined {
  return MOCK_PARKING_SPACES.find((s) => s.id === id);
}

export * from './types';
