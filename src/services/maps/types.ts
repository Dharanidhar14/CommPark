import { AccessType, ParkingCategory } from '../../types/parking';

export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MapBoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface MapMarkerItem {
  id: string;
  coordinate: MapCoordinate;
  title: string;
  price: number;
  currency?: string;
  accessType: AccessType;
  category?: ParkingCategory;
  availableSpots?: number;
  isSelected?: boolean;
}

export interface MapSearchResult {
  id: string;
  title: string;
  subtitle: string;
  coordinate: MapCoordinate;
  type: 'locality' | 'landmark' | 'address';
  city?: string;
  locality?: string;
}

export type LocationPermissionStatus = 'undetermined' | 'granted' | 'denied' | 'blocked';

export interface LocationState {
  coordinate: MapCoordinate | null;
  permissionStatus: LocationPermissionStatus;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export interface ILocationService {
  requestPermissionAsync(): Promise<{ status: LocationPermissionStatus; canAskAgain: boolean }>;
  getCurrentLocationAsync(): Promise<MapCoordinate | null>;
  getPermissionStatusAsync(): Promise<LocationPermissionStatus>;
  openSettingsAsync(): Promise<void>;
}

export interface IGeocodingProvider {
  geocodeAsync(query: string): Promise<MapSearchResult[]>;
  reverseGeocodeAsync(coordinate: MapCoordinate): Promise<string | null>;
}

export interface IMapProvider {
  name: string;
  isSimulated: boolean;
  animateToRegion?(region: MapRegion, durationMs?: number): void;
  animateToCoordinate?(coordinate: MapCoordinate, zoom?: number): void;
}

export interface CommunityMapViewProps {
  markers: MapMarkerItem[];
  selectedMarkerId?: string;
  onMarkerSelect: (markerId: string) => void;
  userLocation?: MapCoordinate | null;
  initialRegion?: MapRegion;
  currentRegion?: MapRegion;
  onRegionChangeComplete?: (region: MapRegion) => void;
  onRecenterPress?: () => void;
  isLocating?: boolean;
  showSearchThisArea?: boolean;
  onSearchThisAreaPress?: () => void;
  style?: any;
}
