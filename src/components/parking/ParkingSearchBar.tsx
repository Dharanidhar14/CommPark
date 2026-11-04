import React, { useState } from 'react';
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
import { SearchSuggestionItem } from '../../features/discovery/types';

export interface ParkingSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  selectedCategory?: ParkingCategory | 'all';
  onSelectCategory?: (category: ParkingCategory | 'all') => void;
  onFilterPress?: () => void;
  suggestions?: SearchSuggestionItem[];
  onSelectSuggestion?: (suggestion: SearchSuggestionItem) => void;
  recentSearches?: string[];
  onSelectRecent?: (query: string) => void;
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
  suggestions = [],
  onSelectSuggestion,
  recentSearches = [],
  onSelectRecent,
  placeholder = 'Search by locality, landmark or address...',
  style,
}) => {
  const { colors, radius, spacing, fontFamilies, fontSizes, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const filteredSuggestions = value.trim().length > 0
    ? suggestions.filter(
        (s) =>
          s.title.toLowerCase().includes(value.toLowerCase()) ||
          s.subtitle.toLowerCase().includes(value.toLowerCase())
      )
    : [];

  return (
    <View style={[styles.container, style]}>
      {/* Search Input Field */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface,
            borderRadius: radius.pill,
            borderColor: isFocused ? colors.primary : colors.border,
            borderWidth: isFocused ? 1.5 : 1,
            paddingHorizontal: spacing.md,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.25 : 0.05,
            shadowRadius: 8,
            elevation: 2,
          },
        ]}
      >
        <AppIcon
          name="search-outline"
          size={20}
          color={isFocused ? (isDark ? colors.primary : '#49570B') : colors.secondaryText}
          style={styles.searchIcon}
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
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

      {/* Autocomplete Suggestions Dropdown */}
      {isFocused && filteredSuggestions.length > 0 && (
        <View
          style={[
            styles.suggestionsDropdown,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.lg,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: isDark ? 0.35 : 0.1,
              shadowRadius: 12,
              elevation: 6,
            },
          ]}
        >
          {filteredSuggestions.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => {
                if (onSelectSuggestion) onSelectSuggestion(item);
                else onChangeText(item.query);
                setIsFocused(false);
              }}
              style={({ pressed }) => [
                styles.suggestionItem,
                { borderBottomColor: colors.borderSubtle },
                pressed && { backgroundColor: colors.surfaceSubtle },
              ]}
            >
              <AppIcon
                name={item.type === 'landmark' ? 'navigate' : 'location'}
                size={16}
                color={isDark ? colors.primary : '#49570B'}
                style={{ marginRight: 10 }}
              />
              <View style={{ flex: 1 }}>
                <AppText variant="bodyBold" numberOfLines={1}>{item.title}</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText} numberOfLines={1}>
                  {item.subtitle}
                </AppText>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* Recent Searches Chips (when focused and query is empty) */}
      {isFocused && value.trim().length === 0 && recentSearches.length > 0 && (
        <View style={[styles.recentSearchesBox, { backgroundColor: colors.surfaceSubtle, borderRadius: radius.md, padding: spacing.sm, marginTop: spacing.xs }]}>
          <AppText variant="captionSmall" weight="bold" color={colors.secondaryText} style={{ marginBottom: 4 }}>
            RECENT SEARCHES
          </AppText>
          <View style={styles.recentWrap}>
            {recentSearches.map((rec, idx) => (
              <Pressable
                key={idx}
                onPress={() => {
                  if (onSelectRecent) onSelectRecent(rec);
                  else onChangeText(rec);
                  setIsFocused(false);
                }}
                style={[
                  styles.recentChip,
                  { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.pill },
                ]}
              >
                <AppIcon name="time-outline" size={12} color={colors.secondaryText} style={{ marginRight: 4 }} />
                <AppText variant="captionSmall" numberOfLines={1} style={{ maxWidth: 160 }}>
                  {rec}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>
      )}

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
    position: 'relative',
    zIndex: 20,
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
  suggestionsDropdown: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 50,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  recentSearchesBox: {
    width: '100%',
  },
  recentWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
});
