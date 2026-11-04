import { ParkingCategory, AccessType, VehicleType } from '../../types/parking';

export interface DiscoveryFilters {
  query?: string;
  locality?: string;
  category?: ParkingCategory | 'all';
  accessType?: AccessType | 'all';
  vehicleType?: VehicleType;
  minPrice?: number;
  maxPrice?: number;
  maxDistanceKm?: number;
  coveredOnly?: boolean;
  evChargingOnly?: boolean;
  securityGuardOnly?: boolean;
}

export type SortOption =
  | 'recommended'
  | 'price_low'
  | 'price_high'
  | 'distance'
  | 'rating';

export interface SearchSuggestionItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'locality' | 'landmark' | 'category';
  query: string;
}
