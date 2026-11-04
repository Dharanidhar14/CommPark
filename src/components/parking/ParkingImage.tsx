import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../theme';
import { AppIcon } from '../ui/AppIcon';
import { AppBadge } from '../ui/AppBadge';

export interface ParkingImageProps {
  uri?: string;
  height?: number;
  covered?: boolean;
  style?: ViewStyle;
}

export const ParkingImage: React.FC<ParkingImageProps> = ({
  uri,
  height = 180,
  covered,
  style,
}) => {
  const { colors, radius, spacing } = useTheme();
  const [hasError, setHasError] = useState(false);

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor: colors.surfaceSubtle,
          borderRadius: radius.card,
        },
        style,
      ]}
    >
      {uri && !hasError ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={250}
          onError={() => setHasError(true)}
        />
      ) : (
        <View style={styles.placeholderContainer}>
          <AppIcon name="car-sport-outline" size={42} color={colors.mutedText} />
        </View>
      )}

      {covered !== undefined && (
        <View style={[styles.badgeOverlay, { top: spacing.sm, left: spacing.sm }]}>
          <AppBadge
            label={covered ? 'Covered' : 'Open Sky'}
            variant="dark"
            size="sm"
            icon={
              <AppIcon
                name={covered ? 'umbrella-outline' : 'sunny-outline'}
                size={12}
                color="#FFFFFF"
              />
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOverlay: {
    position: 'absolute',
  },
});
