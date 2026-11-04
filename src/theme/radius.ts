export const radius = {
  none: 0,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  card: 20,
  pill: 9999,
  full: 9999,
} as const;

export type Radius = typeof radius;
