import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { AppText } from '../ui/AppText';

export interface ParkingPriceProps {
  price: number;
  period?: 'hr' | 'day';
  currency?: string;
  variant?: 'floating' | 'card' | 'large';
  isSelected?: boolean;
  style?: ViewStyle;
}

export const ParkingPrice: React.FC<ParkingPriceProps> = ({
  price,
  period = 'hr',
  currency = '$',
  variant = 'card',
  isSelected = false,
  style,
}) => {
  const { colors, radius, spacing, isDark } = useTheme();

  if (variant === 'floating') {
    // Dark floating map price pill, turns Electric Lime when selected
    const bgColor = isSelected ? colors.primary : colors.pricePinBg;
    const textColor = isSelected ? colors.primaryForeground : colors.pricePinText;
    const borderColor = isSelected ? colors.primary : isDark ? colors.border : '#000000';

    return (
      <View
        style={[
          styles.floatingContainer,
          {
            backgroundColor: bgColor,
            borderRadius: radius.pill,
            borderColor,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.25,
            shadowRadius: 5,
            elevation: 4,
          },
          style,
        ]}
      >
        <AppText variant="caption" weight="extraBold" color={textColor} style={styles.tabular}>
          {currency}{price.toFixed(2)}
        </AppText>
        <AppText variant="captionSmall" weight="medium" color={textColor} style={{ opacity: 0.8, marginLeft: 2 }}>
          /{period}
        </AppText>
      </View>
    );
  }

  if (variant === 'large') {
    return (
      <View style={[styles.largeContainer, style]}>
        <AppText variant="display" weight="extraBold" color={colors.text} style={styles.tabular}>
          {currency}{price.toFixed(2)}
        </AppText>
        <AppText variant="body" color={colors.secondaryText} style={{ marginLeft: 4, marginBottom: 6 }}>
          /{period}
        </AppText>
      </View>
    );
  }

  return (
    <View style={[styles.cardContainer, style]}>
      <AppText variant="h3" weight="extraBold" color={colors.text} style={styles.tabular}>
        {currency}{price.toFixed(2)}
      </AppText>
      <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginLeft: 2, marginBottom: 2 }}>
        /{period}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  largeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});
