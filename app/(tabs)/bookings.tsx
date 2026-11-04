import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useBookingStore } from '../../src/store/useBookingStore';
import { BookingStatus } from '../../src/types/booking';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppBadge } from '../../src/components/ui/AppBadge';
import { AppButton } from '../../src/components/ui/AppButton';
import { AccessTypePill } from '../../src/components/parking/AccessTypePill';
import { ActivePassBanner } from '../../src/components/common/ActivePassBanner';
import { EmptyState } from '../../src/components/ui/EmptyState';

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();

  const { activeBooking, bookings } = useBookingStore();
  const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'completed'>('all');

  const filteredBookings = bookings.filter((b) => {
    if (selectedTab === 'active') return b.status === 'active' || b.status === 'upcoming';
    if (selectedTab === 'completed') return b.status === 'completed';
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="My Bookings" subtitle="Active passes and history" />

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
        {/* Active Parking Pass Hero Card */}
        {activeBooking && (
          <View style={{ marginTop: spacing.sm, marginBottom: spacing.lg }}>
            <ActivePassBanner booking={activeBooking} />
          </View>
        )}

        {/* Filter Segment Tabs */}
        <View
          style={[
            styles.segmentContainer,
            {
              backgroundColor: colors.surfaceSubtle,
              borderRadius: radius.pill,
              borderColor: colors.border,
            },
          ]}
        >
          {(['all', 'active', 'completed'] as const).map((tab) => {
            const isSelected = selectedTab === tab;
            const labels = { all: 'All Passes', active: 'Active & Upcoming', completed: 'Completed' };
            return (
              <Pressable
                key={tab}
                onPress={() => setSelectedTab(tab)}
                style={[
                  styles.segmentButton,
                  {
                    backgroundColor: isSelected ? colors.surface : 'transparent',
                    borderRadius: radius.pill,
                  },
                ]}
              >
                <AppText
                  variant="captionSmall"
                  weight={isSelected ? 'bold' : 'medium'}
                  color={isSelected ? colors.text : colors.secondaryText}
                >
                  {labels[tab]}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <EmptyState
            icon="ticket-outline"
            title="No Bookings Found"
            description="You don't have any bookings in this section. Discover convenient parking spots nearby."
            actionTitle="Find Parking"
            onAction={() => router.push('/(tabs)/explore' as any)}
            style={{ marginTop: spacing.xxl }}
          />
        ) : (
          <View style={{ marginTop: spacing.lg }}>
            {filteredBookings.map((booking) => (
              <AppCard
                key={booking.id}
                onPress={() => router.push({ pathname: '/booking/pass', params: { id: booking.id } } as any)}
                style={styles.bookingCard}
              >
                <View style={styles.bookingHeader}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="captionSmall" color={colors.secondaryText}>
                      #{booking.bookingNumber}
                    </AppText>
                    <AppText variant="h4" numberOfLines={1} style={{ marginTop: 2 }}>
                      {booking.space.name}
                    </AppText>
                  </View>

                  <AppBadge
                    label={booking.status.toUpperCase()}
                    variant={
                      booking.status === 'active'
                        ? 'primary'
                        : booking.status === 'upcoming'
                        ? 'warning'
                        : 'default'
                    }
                    size="sm"
                  />
                </View>

                <View style={[styles.bookingMetaRow, { marginTop: spacing.sm }]}>
                  <AccessTypePill accessType={booking.accessType} compact />
                  <AppText variant="captionSmall" color={colors.secondaryText}>
                    Plate: {booking.vehicle.licensePlate} ({booking.vehicle.make})
                  </AppText>
                </View>

                <View
                  style={[
                    styles.bookingFooter,
                    {
                      marginTop: spacing.md,
                      borderTopColor: colors.borderSubtle,
                      borderTopWidth: 1,
                      paddingTop: spacing.sm,
                    },
                  ]}
                >
                  <View>
                    <AppText variant="captionSmall" color={colors.secondaryText}>
                      Total Paid
                    </AppText>
                    <AppText variant="h4" weight="bold">
                      {booking.currency}{booking.totalAmount.toFixed(2)}
                    </AppText>
                  </View>

                  <AppButton
                    title="View Pass & QR"
                    onPress={() => router.push({ pathname: '/booking/pass', params: { id: booking.id } } as any)}
                    variant="secondary"
                    size="sm"
                    fullWidth={false}
                    rightIcon={<AppIcon name="chevron-forward" size={14} color={colors.text} />}
                  />
                </View>
              </AppCard>
            ))}
          </View>
        )}
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
  segmentContainer: {
    flexDirection: 'row',
    padding: 3,
    borderWidth: 1,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingCard: {
    marginBottom: 14,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookingMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
