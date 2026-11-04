import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../../theme';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { AppBadge } from '../ui/AppBadge';
import { BottomSheet } from '../ui/BottomSheet';
import { POPULAR_METRO_LOCALITIES } from '../../features/discovery';

export interface LocationSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  selectedLocality: string;
  onSelectLocality: (localityName: string) => void;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  visible,
  onClose,
  selectedLocality,
  onSelectLocality,
}) => {
  const { colors, spacing, radius } = useTheme();

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={{ paddingBottom: spacing.md }}>
        <View style={styles.headerRow}>
          <View>
            <AppText variant="h3">Select Destination</AppText>
            <AppText variant="captionSmall" color={colors.secondaryText}>
              Find parking in popular Indian metro hubs
            </AppText>
          </View>
          <AppBadge label="DEMO CITIES" variant="default" size="sm" />
        </View>

        <ScrollView style={{ maxHeight: 380, marginTop: spacing.md }}>
          {POPULAR_METRO_LOCALITIES.map((loc) => {
            const isSelected =
              selectedLocality.toLowerCase() === loc.name.toLowerCase() ||
              (loc.id === 'loc_all' && selectedLocality === 'All Localities');

            return (
              <Pressable
                key={loc.id}
                onPress={() => {
                  onSelectLocality(loc.name);
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.localityItem,
                  {
                    backgroundColor: isSelected ? colors.surfaceSubtle : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: radius.md,
                    padding: spacing.md,
                    borderWidth: isSelected ? 2 : 1,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceSubtle,
                    },
                  ]}
                >
                  <AppIcon
                    name={loc.id === 'loc_all' ? 'compass-outline' : 'location'}
                    size={18}
                    color={isSelected ? colors.primaryForeground : colors.text}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <AppText variant="bodyBold">{loc.name}</AppText>
                  <AppText variant="captionSmall" color={colors.secondaryText}>
                    {loc.city} {loc.landmark ? `• ${loc.landmark}` : ''}
                  </AppText>
                </View>

                {isSelected && (
                  <AppIcon name="checkmark-circle" size={20} color={colors.primaryForeground === '#171A18' && colors.background === '#171A18' ? colors.primary : '#49570B'} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  localityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
