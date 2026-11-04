import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

export type IconName = keyof typeof Ionicons.glyphMap;

export interface AppIconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: any;
}

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 22,
  color,
  style,
}) => {
  const { colors } = useTheme();
  return (
    <Ionicons
      name={name}
      size={size}
      color={color || colors.text}
      style={style}
    />
  );
};
