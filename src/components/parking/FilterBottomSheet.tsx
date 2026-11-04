import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../../theme';
import { AppText } from '../ui/AppText';
import { AppIcon, IconName } from '../ui/AppIcon';
import { AppButton } from '../ui/AppButton';
import { AppBadge } from '../ui/AppBadge';
import { BottomSheet } from '../ui/BottomSheet';
import { DiscoveryFilters, SortOption } from '../../features/discovery/types';
import { ParkingCategory, AccessType, VehicleType } from '../../types/parking';

export interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: DiscoveryFilters;
  sort: SortOption;
  onApply: (filters: DiscoveryFilters, sort: SortOption) => void;
  onReset: () => void;
}

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  onClose,
  filters,
  sort,
  onApply,
  onReset,
}) => {
  const { colors, spacing, radius, isDark } = useTheme();

  const [tempFilters, setTempFilters] = useState<DiscoveryFilters>(filters);
  const [tempSort, setTempSort] = useState<SortOption>(sort);

  const priceOptions = [30, 40, 50, 70, 100];
  const distanceOptions = [1, 2, 5, 10];

  const accessTypes: { type: AccessType; label: string; icon: IconName }[] = [
    { type: 'security_verified', label: 'Security-Verified', icon: 'shield-checkmark' },
    { type: 'owner_assisted', label: 'Owner-Assisted', icon: 'person' },
    { type: 'direct_access', label: 'Direct Access', icon: 'flash' },
    { type: 'facility_managed', label: 'Facility-Managed', icon: 'business' },
  ];

  const vehicleOptions: { type: VehicleType; label: string }[] = [
    { type: 'ev', label: 'EV Charging' },
    { type: 'suv', label: 'SUV' },
    { type: 'sedan', label: 'Sedan' },
    { type: 'motorcycle', label: 'Two-Wheeler' },
  ];

  const sortOptions: { option: SortOption; label: string }[] = [
    { option: 'recommended', label: 'Recommended' },
    { option: 'price_low', label: 'Price: Low to High' },
    { option: 'price_high', label: 'Price: High to Low' },
    { option: 'distance', label: 'Nearest First' },
    { option: 'rating', label: 'Highest Rated' },
  ];

  const handleApply = () => {
    onApply(tempFilters, tempSort);
    onClose();
  };

  const handleReset = () => {
    setTempFilters({});
    setTempSort('recommended');
    onReset();
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={{ paddingBottom: spacing.md }}>
        <View style={styles.headerRow}>
          <AppText variant="h3">Filters & Sorting</AppText>
          <Pressable onPress={handleReset} hitSlop={8}>
            <AppText variant="caption" weight="bold" color={colors.secondaryText}>
              Reset All
            </AppText>
          </Pressable>
        </View>

        <ScrollView style={{ maxHeight: 440, marginTop: spacing.md }} showsVerticalScrollIndicator={false}>
          {/* Sort By Section */}
          <View style={styles.filterSection}>
            <AppText variant="caption" weight="bold" color={colors.secondaryText}>
              SORT RESULTS BY
            </AppText>
            <View style={[styles.optionsWrap, { marginTop: spacing.xs }]}>
              {sortOptions.map((opt) => {
                const isSelected = tempSort === opt.option;
                return (
                  <Pressable
                    key={opt.option}
                    onPress={() => setTempSort(opt.option)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.pricePinBg : colors.surfaceSubtle,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderRadius: radius.pill,
                      },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      weight={isSelected ? 'bold' : 'medium'}
                      color={isSelected ? colors.pricePinText : colors.text}
                    >
                      {opt.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Maximum Hourly Rate (INR) */}
          <View style={[styles.filterSection, { marginTop: spacing.md }]}>
            <View style={styles.sectionHeaderRow}>
              <AppText variant="caption" weight="bold" color={colors.secondaryText}>
                MAX HOURLY RATE
              </AppText>
              {tempFilters.maxPrice && (
                <AppBadge label={`Up to ₹${tempFilters.maxPrice}/hr`} variant="primary" size="sm" />
              )}
            </View>
            <View style={[styles.optionsWrap, { marginTop: spacing.xs }]}>
              {priceOptions.map((pr) => {
                const isSelected = tempFilters.maxPrice === pr;
                return (
                  <Pressable
                    key={pr}
                    onPress={() =>
                      setTempFilters((prev) => ({
                        ...prev,
                        maxPrice: isSelected ? undefined : pr,
                      }))
                    }
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.pricePinBg : colors.surfaceSubtle,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderRadius: radius.pill,
                      },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      weight={isSelected ? 'bold' : 'medium'}
                      color={isSelected ? colors.pricePinText : colors.text}
                    >
                      ₹{pr}/hr
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Max Distance (km) */}
          <View style={[styles.filterSection, { marginTop: spacing.md }]}>
            <AppText variant="caption" weight="bold" color={colors.secondaryText}>
              DISTANCE RADIUS
            </AppText>
            <View style={[styles.optionsWrap, { marginTop: spacing.xs }]}>
              {distanceOptions.map((dist) => {
                const isSelected = tempFilters.maxDistanceKm === dist;
                return (
                  <Pressable
                    key={dist}
                    onPress={() =>
                      setTempFilters((prev) => ({
                        ...prev,
                        maxDistanceKm: isSelected ? undefined : dist,
                      }))
                    }
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.pricePinBg : colors.surfaceSubtle,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderRadius: radius.pill,
                      },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      weight={isSelected ? 'bold' : 'medium'}
                      color={isSelected ? colors.pricePinText : colors.text}
                    >
                      Within {dist} km
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Access Category Filter */}
          <View style={[styles.filterSection, { marginTop: spacing.md }]}>
            <AppText variant="caption" weight="bold" color={colors.secondaryText}>
              ACCESS WORKFLOW TYPE
            </AppText>
            <View style={[styles.optionsWrap, { marginTop: spacing.xs }]}>
              {accessTypes.map((acc) => {
                const isSelected = tempFilters.accessType === acc.type;
                return (
                  <Pressable
                    key={acc.type}
                    onPress={() =>
                      setTempFilters((prev) => ({
                        ...prev,
                        accessType: isSelected ? undefined : acc.type,
                      }))
                    }
                    style={[
                      styles.chipWithIcon,
                      {
                        backgroundColor: isSelected ? colors.pricePinBg : colors.surfaceSubtle,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderRadius: radius.pill,
                      },
                    ]}
                  >
                    <AppIcon
                      name={acc.icon}
                      size={14}
                      color={isSelected ? colors.primary : colors.secondaryText}
                      style={{ marginRight: 6 }}
                    />
                    <AppText
                      variant="caption"
                      weight={isSelected ? 'bold' : 'medium'}
                      color={isSelected ? colors.pricePinText : colors.text}
                    >
                      {acc.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Quick Features & Amenities */}
          <View style={[styles.filterSection, { marginTop: spacing.md }]}>
            <AppText variant="caption" weight="bold" color={colors.secondaryText}>
              AMENITIES & FEATURES
            </AppText>
            <View style={[styles.optionsWrap, { marginTop: spacing.xs }]}>
              <Pressable
                onPress={() =>
                  setTempFilters((prev) => ({
                    ...prev,
                    coveredOnly: !prev.coveredOnly,
                  }))
                }
                style={[
                  styles.chip,
                  {
                    backgroundColor: tempFilters.coveredOnly ? colors.pricePinBg : colors.surfaceSubtle,
                    borderColor: tempFilters.coveredOnly ? colors.primary : colors.border,
                    borderRadius: radius.pill,
                  },
                ]}
              >
                <AppText
                  variant="caption"
                  weight={tempFilters.coveredOnly ? 'bold' : 'medium'}
                  color={tempFilters.coveredOnly ? colors.pricePinText : colors.text}
                >
                  Covered / Shaded
                </AppText>
              </Pressable>

              <Pressable
                onPress={() =>
                  setTempFilters((prev) => ({
                    ...prev,
                    evChargingOnly: !prev.evChargingOnly,
                  }))
                }
                style={[
                  styles.chip,
                  {
                    backgroundColor: tempFilters.evChargingOnly ? colors.pricePinBg : colors.surfaceSubtle,
                    borderColor: tempFilters.evChargingOnly ? colors.primary : colors.border,
                    borderRadius: radius.pill,
                  },
                ]}
              >
                <AppText
                  variant="caption"
                  weight={tempFilters.evChargingOnly ? 'bold' : 'medium'}
                  color={tempFilters.evChargingOnly ? colors.pricePinText : colors.text}
                >
                  ⚡ EV Charging Ready
                </AppText>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        {/* Apply CTA */}
        <View style={{ marginTop: spacing.lg }}>
          <AppButton
            title="Apply Filters"
            onPress={handleApply}
            variant="primary"
            size="lg"
          />
        </View>
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
  filterSection: {
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  chipWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
});
