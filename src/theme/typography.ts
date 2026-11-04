import { Platform, TextStyle } from 'react-native';

export const fontFamilies = {
  regular: Platform.select({
    ios: 'Manrope_400Regular',
    android: 'Manrope_400Regular',
    default: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),
  medium: Platform.select({
    ios: 'Manrope_500Medium',
    android: 'Manrope_500Medium',
    default: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),
  semiBold: Platform.select({
    ios: 'Manrope_600SemiBold',
    android: 'Manrope_600SemiBold',
    default: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),
  bold: Platform.select({
    ios: 'Manrope_700Bold',
    android: 'Manrope_700Bold',
    default: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),
  extraBold: Platform.select({
    ios: 'Manrope_800ExtraBold',
    android: 'Manrope_800ExtraBold',
    default: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),
};

export const fontSizes = {
  xxs: 10,
  xs: 12,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 38,
};

export const lineHeights = {
  xxs: 14,
  xs: 16,
  sm: 18,
  md: 22,
  lg: 24,
  xl: 28,
  xxl: 32,
  xxxl: 38,
  display: 46,
};

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};

export const typography: Record<string, TextStyle> = {
  display: {
    fontFamily: fontFamilies.extraBold,
    fontSize: fontSizes.display,
    lineHeight: lineHeights.display,
    fontWeight: fontWeights.extraBold,
    letterSpacing: -1,
  },
  h1: {
    fontFamily: fontFamilies.extraBold,
    fontSize: fontSizes.xxxl,
    lineHeight: lineHeights.xxxl,
    fontWeight: fontWeights.extraBold,
    letterSpacing: -0.7,
  },
  h2: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xxl,
    lineHeight: lineHeights.xxl,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.5,
  },
  h3: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.xl,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.3,
  },
  h4: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    fontWeight: fontWeights.semiBold,
  },
  body: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    fontWeight: fontWeights.regular,
  },
  bodyMedium: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    fontWeight: fontWeights.medium,
  },
  bodyBold: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    fontWeight: fontWeights.semiBold,
  },
  caption: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    fontWeight: fontWeights.medium,
  },
  captionSmall: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: fontWeights.regular,
  },
  button: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
    fontWeight: fontWeights.bold,
    letterSpacing: 0.2,
  },
  buttonSmall: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    fontWeight: fontWeights.semiBold,
  },
  tabularPrice: {
    fontFamily: fontFamilies.extraBold,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    fontWeight: fontWeights.extraBold,
    fontVariant: ['tabular-nums'],
  },
};
