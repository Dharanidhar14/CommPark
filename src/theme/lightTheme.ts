import { PALETTE } from './colors';

export const lightColors = {
  // Brand
  primary: PALETTE.electricLime as string,
  primaryForeground: PALETTE.pitchDark as string,
  primaryHover: PALETTE.electricLimeDark as string,

  // Layout & Backgrounds
  background: PALETTE.offWhite as string,
  surface: PALETTE.pureWhite as string,
  surfaceSubtle: PALETTE.subtleLight as string,
  card: PALETTE.cardLight as string,
  cardBorder: PALETTE.borderLight as string,

  // Typography
  text: PALETTE.textLightPrimary as string,
  secondaryText: PALETTE.textLightSecondary as string,
  mutedText: PALETTE.textLightMuted as string,
  inverseText: PALETTE.pureWhite as string,

  // Borders & Dividers
  border: PALETTE.borderLight as string,
  borderSubtle: PALETTE.borderSubtleLight as string,

  // Feedback & Status
  success: PALETTE.successGreen as string,
  successBackground: '#EBF5EE',
  error: PALETTE.errorRed as string,
  errorBackground: '#FDF2F2',
  warning: PALETTE.warningAmber as string,
  warningBackground: '#FEF3C7',
  info: PALETTE.infoBlue as string,

  // Overlays & Floating elements
  overlay: PALETTE.overlayLight as string,
  pricePinBg: PALETTE.pitchDark as string,
  pricePinText: PALETTE.pureWhite as string,
  userLocationPin: PALETTE.electricLime as string,
  userLocationRing: 'rgba(217, 245, 66, 0.4)',

  // Maps
  mapBackground: '#EEF0EB',
  mapRoad: '#FFFFFF',
  mapRoadOutline: '#DFE2DA',
  mapBlock: '#F7F8F5',
  mapWater: '#DCE8EE',
  mapPark: '#E2EBD9',
};

export type ThemeColors = { [K in keyof typeof lightColors]: string };
