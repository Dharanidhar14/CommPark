import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '../../theme';

export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'bodyMedium'
  | 'bodyBold'
  | 'caption'
  | 'captionSmall'
  | 'button'
  | 'buttonSmall'
  | 'tabularPrice';

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  weight?: 'regular' | 'medium' | 'semiBold' | 'bold' | 'extraBold';
  style?: TextStyle | TextStyle[];
  children: React.ReactNode;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  color,
  align,
  weight,
  style,
  children,
  ...rest
}) => {
  const { colors, typography, fontFamilies } = useTheme();

  const variantStyle = typography[variant] || typography.body;

  const dynamicStyle: TextStyle = {
    color: color || (variant === 'caption' || variant === 'captionSmall' ? colors.secondaryText : colors.text),
    ...(align ? { textAlign: align } : {}),
    ...(weight ? { fontFamily: fontFamilies[weight] } : {}),
  };

  return (
    <Text style={[styles.base, variantStyle, dynamicStyle, style]} {...rest}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
