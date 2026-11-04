import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useAuthStore } from '../../src/store/useAuthStore';
import { MOCK_PARKING_SPACES } from '../../src/constants/mockData';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppBadge } from '../../src/components/ui/AppBadge';
import { AppButton } from '../../src/components/ui/AppButton';
import { AccessTypePill } from '../../src/components/parking/AccessTypePill';

export default function OwnerDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();

  const user = useAuthStore((s) => s.user);

  // Filter listings owned by this user
  const [listings, setListings] = useState(MOCK_PARKING_SPACES.slice(0, 2));

  const toggleAvailability = (id: string) => {
    setListings((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Owner Dashboard"
        subtitle="Manage spaces, availability & revenue"
        showBack
        onBack={() => router.replace('/(tabs)/profile' as any)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing.lg,
            paddingBottom: insets.bottom + 80,
          },
        ]}
      >
        {/* Earnings & Performance Metrics Grid */}
        <View style={styles.metricsGrid}>
          <AppCard style={styles.metricCard}>
            <AppText variant="captionSmall" color={colors.secondaryText}>
              MONTHLY EARNINGS
            </AppText>
            <AppText variant="h2" weight="extraBold" color={colors.primaryForeground === '#171A18' && colors.background === '#171A18' ? colors.primary : '#49570B'} style={{ marginTop: 4 }}>
              ${user.wallet.earnedAsOwner.toFixed(2)}
            </AppText>
            <AppText variant="captionSmall" color={colors.success} style={{ marginTop: 2 }}>
              +18.4% vs last month
            </AppText>
          </AppCard>

          <AppCard style={styles.metricCard}>
            <AppText variant="captionSmall" color={colors.secondaryText}>
              ACTIVE LISTINGS
            </AppText>
            <AppText variant="h2" weight="extraBold" style={{ marginTop: 4 }}>
              {listings.length} Spots
            </AppText>
            <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
              85% avg occupancy
            </AppText>
          </AppCard>
        </View>

        {/* Create Listing CTA */}
        <View style={{ marginTop: spacing.lg }}>
          <AppButton
            title="+ List New Parking Space"
            onPress={() => {}}
            variant="primary"
            size="lg"
            leftIcon={<AppIcon name="add-circle" size={20} color={colors.primaryForeground} />}
          />
        </View>

        {/* Active Space Listings */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={styles.sectionHeader}>
            <AppText variant="h3">My Listed Spaces</AppText>
            <AppText variant="captionSmall" color={colors.secondaryText}>
              Toggle live availability
            </AppText>
          </View>

          <View style={{ marginTop: spacing.sm }}>
            {listings.map((space) => (
              <AppCard key={space.id} style={styles.listingCard}>
                <View style={styles.listingHeader}>
                  <View style={{ flex: 1 }}>
                    <AccessTypePill accessType={space.accessType} compact />
                    <AppText variant="h4" numberOfLines={1} style={{ marginTop: 6 }}>
                      {space.name}
                    </AppText>
                    <AppText variant="captionSmall" color={colors.secondaryText}>
                      {space.address}
                    </AppText>
                  </View>

                  <View style={styles.switchWrapper}>
                    <Switch
                      value={space.isAvailable}
                      onValueChange={() => toggleAvailability(space.id)}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor="#FFFFFF"
                    />
                    <AppText
                      variant="captionSmall"
                      color={space.isAvailable ? colors.success : colors.secondaryText}
                      weight="bold"
                      style={{ marginTop: 2 }}
                    >
                      {space.isAvailable ? 'LIVE' : 'PAUSED'}
                    </AppText>
                  </View>
                </View>

                <View
                  style={[
                    styles.listingFooter,
                    {
                      borderTopColor: colors.borderSubtle,
                      borderTopWidth: 1,
                      marginTop: spacing.md,
                      paddingTop: spacing.sm,
                    },
                  ]}
                >
                  <View>
                    <AppText variant="captionSmall" color={colors.secondaryText}>
                      Standard Rate
                    </AppText>
                    <AppText variant="bodyBold">
                      ${space.pricePerHour.toFixed(2)}/hr (${space.pricePerDay.toFixed(2)}/day)
                    </AppText>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <AppButton
                      title="Calendar"
                      onPress={() => {}}
                      variant="secondary"
                      size="sm"
                      fullWidth={false}
                      leftIcon={<AppIcon name="calendar-outline" size={14} color={colors.text} />}
                    />
                    <AppButton
                      title="Edit"
                      onPress={() => {}}
                      variant="secondary"
                      size="sm"
                      fullWidth={false}
                      leftIcon={<AppIcon name="create-outline" size={14} color={colors.text} />}
                    />
                  </View>
                </View>
              </AppCard>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  metricCard: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listingCard: {
    marginBottom: 12,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  switchWrapper: {
    alignItems: 'center',
    marginLeft: 8,
  },
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
