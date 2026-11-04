import React from 'react';
import {
  View,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme';
import { ParkingCategory } from '../../types/parking';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';

export interface ParkingSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  selectedCategory?: ParkingCategory | 'all';
  onSelectCategory?: (category: ParkingCategory | 'all') => void;
  onFilterPress?: () => void;
  placeholder?: string;
  style?: ViewStyle;
}

const CATEGORIES: { id: ParkingCategory | 'all'; label: string; icon: any }[] = [
  { id: 'all', label: 'All Spaces', icon: 'grid-outline' },
  { id: 'residential', label: 'Apartments', icon: 'shield-checkmark-outline' },
  { id: 'driveway', label: 'Driveways', icon: 'home-outline' },
  { id: 'street_bay', label: 'Direct Bays', icon: 'flash-outline' },
  { id: 'commercial', label: 'Commercial', icon: 'business-outline' },
];

export const ParkingSearchBar: React.FC<ParkingSearchBarProps> = ({
  value,
  onChangeText,
  selectedCategory = 'all',
  onSelectCategory,
  onFilterPress,
  placeholder = 'Search by address, landmark or area...',
  style,
}) => {
  const { colors, radius, spacing, fontFamilies, fontSizes } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {/* Search Input Bar */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface,
            borderRadius: radius.pill,
            borderColor: colors.border,
            borderWidth: 1,
            paddingHorizontal: spacing.md,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          },
        ]}
      >
        <AppIcon name="search-outline" size={20} color={colors.secondaryText} style={styles.searchIcon} />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedText}
          style={[
            styles.input,
            {
              color: colors.text,
              fontFamily: fontFamilies.regular,
              fontSize: fontSizes.md,
            },
          ]}
        />

        {value.length > 0 && (
          <Pressable onPress={() => onChangeText('')} hitSlop={8} style={styles.clearButton}>
            <AppIcon name="close-circle" size={18} color={colors.secondaryText} />
          </Pressable>
        )}

        {onFilterPress && (
          <Pressable
            onPress={onFilterPress}
            style={[
              styles.filterButton,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.pill,
              },
            ]}
          >
            <AppIcon name="options-outline" size={16} color={colors.primaryForeground} />
          </Pressable>
        )}
      </View>

      {/* Category Chips Scroll */}
      {onSelectCategory && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.categoryScroll, { marginTop: spacing.sm }]}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => onSelectCategory(cat.id)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected ? colors.pricePinBg : colors.surface,
                    borderColor: isSelected ? colors.pricePinBg : colors.border,
                    borderRadius: radius.pill,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs,
                    marginRight: spacing.sm,
                  },
                ]}
              >
                <AppIcon
                  name={cat.icon}
                  size={14}
                  color={isSelected ? colors.primary : colors.secondaryText}
                  style={{ marginRight: 6 }}
                />
                <AppText
                  variant="caption"
                  weight={isSelected ? 'bold' : 'medium'}
                  color={isSelected ? colors.pricePinText : colors.text}
                >
                  {cat.label}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginRight: 4,
  },
  filterButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryScroll: {
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
});
