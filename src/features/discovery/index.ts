import { MOCK_PARKING_SPACES } from '../../constants/mockData';
import { ParkingSpace } from '../../types/parking';
import { DiscoveryFilters, SortOption } from './types';

export function getFilteredParkingSpaces(
  filters: DiscoveryFilters = {},
  sort: SortOption = 'distance'
): ParkingSpace[] {
  let results = [...MOCK_PARKING_SPACES];

  if (filters.query && filters.query.trim().length > 0) {
    const q = filters.query.toLowerCase().trim();
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.neighborhood.toLowerCase().includes(q)
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

  if (filters.maxPrice) {
    results = results.filter((s) => s.pricePerHour <= (filters.maxPrice ?? 100));
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
    default:
      results.sort((a, b) => a.distanceKm - b.distanceKm);
      break;
  }

  return results;
}

export function getParkingSpaceById(id: string): ParkingSpace | undefined {
  return MOCK_PARKING_SPACES.find((s) => s.id === id);
}

export * from './types';
