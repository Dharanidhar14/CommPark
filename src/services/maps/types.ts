import { AccessType } from '../../types/parking';

export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

export interface MapMarkerItem {
  id: string;
  coordinate: MapCoordinate;
  title: string;
  price: number;
  currency?: string;
  accessType: AccessType;
  isSelected?: boolean;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface CommunityMapViewProps {
  markers: MapMarkerItem[];
  selectedMarkerId?: string;
  onMarkerSelect: (markerId: string) => void;
  userLocation?: MapCoordinate;
  initialRegion?: MapRegion;
  style?: any;
}
