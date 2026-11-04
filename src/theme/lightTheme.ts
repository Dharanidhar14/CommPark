import { PALETTE } from './colors';

export const lightColors = {
  // Brand
  primary: PALETTE.electricLime,
  primaryForeground: PALETTE.pitchDark,
  primaryHover: PALETTE.electricLimeDark,

  // Layout & Backgrounds
  background: PALETTE.offWhite,
  surface: PALETTE.pureWhite,
  surfaceSubtle: PALETTE.subtleLight,
  card: PALETTE.cardLight,
  cardBorder: PALETTE.borderLight,

  // Typography
  text: PALETTE.textLightPrimary,
  secondaryText: PALETTE.textLightSecondary,
  mutedText: PALETTE.textLightMuted,
  inverseText: PALETTE.pureWhite,

  // Borders & Dividers
  border: PALETTE.borderLight,
  borderSubtle: PALETTE.borderSubtleLight,

  // Feedback & Status
  success: PALETTE.successGreen,
  successBackground: '#EBF5EE',
  error: PALETTE.errorRed,
  errorBackground: '#FDF2F2',
  warning: PALETTE.warningAmber,
  warningBackground: '#FEF3C7',
  info: PALETTE.infoBlue,

  // Overlays & Floating elements
  overlay: PALETTE.overlayLight,
  pricePinBg: PALETTE.pitchDark,
  pricePinText: PALETTE.pureWhite,
  userLocationPin: PALETTE.electricLime,
  userLocationRing: 'rgba(217, 245, 66, 0.4)',

  // Maps
  mapBackground: '#EEF0EB',
  mapRoad: '#FFFFFF',
  mapRoadOutline: '#DFE2DA',
  mapBlock: '#F7F8F5',
  mapWater: '#DCE8EE',
  mapPark: '#E2EBD9',
};

export type ThemeColors = typeof lightColors;
