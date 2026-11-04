import React from 'react';
import { SimulatedMap } from './SimulatedMap';
import { CommunityMapViewProps } from './types';

/**
 * CommunityMapView
 * Provider-independent map abstraction component.
 * Allows switching between vector simulated surface, Google Maps, or Mapbox
 * without altering any consumer screen or component code.
 */
export const CommunityMapView: React.FC<CommunityMapViewProps> = (props) => {
  return <SimulatedMap {...props} />;
};

export * from './types';
