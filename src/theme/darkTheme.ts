import { PALETTE } from './colors';
import { ThemeColors } from './lightTheme';

export const darkColors: ThemeColors = {
  // Brand
  primary: PALETTE.electricLime,
  primaryForeground: PALETTE.pitchDark,
  primaryHover: PALETTE.electricLimeLight,

  // Layout & Backgrounds
  background: PALETTE.pitchDark,
  surface: PALETTE.surfaceDark,
  surfaceSubtle: PALETTE.surfaceSubtleDark,
  card: PALETTE.cardDark,
  cardBorder: PALETTE.borderDark,

  // Typography
  text: PALETTE.textDarkPrimary,
  secondaryText: PALETTE.textDarkSecondary,
  mutedText: PALETTE.textDarkMuted,
  inverseText: PALETTE.pitchDark,

  // Borders & Dividers
  border: PALETTE.borderDark,
  borderSubtle: PALETTE.borderSubtleDark,

  // Feedback & Status
  success: PALETTE.successGreenDark,
  successBackground: 'rgba(128, 201, 149, 0.15)',
  error: PALETTE.errorRedDark,
  errorBackground: 'rgba(255, 119, 119, 0.15)',
  warning: PALETTE.warningAmberDark,
  warningBackground: 'rgba(245, 158, 11, 0.15)',
  info: '#60A5FA',

  // Overlays & Floating elements
  overlay: PALETTE.overlayDark,
  pricePinBg: PALETTE.surfaceDark,
  pricePinText: PALETTE.textDarkPrimary,
  userLocationPin: PALETTE.electricLime,
  userLocationRing: 'rgba(217, 245, 66, 0.3)',

  // Maps
  mapBackground: '#141715',
  mapRoad: '#202521',
  mapRoadOutline: '#2B322D',
  mapBlock: '#191D1A',
  mapWater: '#16232B',
  mapPark: '#1C261E',
};
