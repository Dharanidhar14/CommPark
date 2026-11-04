import { ParkingCategory, AccessType, VehicleType } from '../../types/parking';

export interface DiscoveryFilters {
  query?: string;
  category?: ParkingCategory | 'all';
  accessType?: AccessType | 'all';
  vehicleType?: VehicleType;
  maxPrice?: number;
  coveredOnly?: boolean;
  evChargingOnly?: boolean;
}

export type SortOption = 'distance' | 'price_low' | 'price_high' | 'rating';
