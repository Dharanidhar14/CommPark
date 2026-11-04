import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

export interface AppDividerProps {
  orientation?: 'horizontal' | 'vertical';
  spacingVertical?: number;
  spacingHorizontal?: number;
  style?: ViewStyle;
}

export const AppDivider: React.FC<AppDividerProps> = ({
  orientation = 'horizontal',
  spacingVertical = 8,
  spacingHorizontal = 8,
  style,
}) => {
  const { colors } = useTheme();

  if (orientation === 'vertical') {
    return (
      <View
        style={[
          styles.vertical,
          {
            backgroundColor: colors.border,
            marginHorizontal: spacingHorizontal,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.horizontal,
        {
          backgroundColor: colors.border,
          marginVertical: spacingVertical,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    width: '100%',
  },
  vertical: {
    width: 1,
    height: '100%',
  },
});
