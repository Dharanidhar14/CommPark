import React from 'react';
import { View, ScrollView, StyleSheet, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useAuthStore } from '../../src/store/useAuthStore';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppCard } from '../../src/components/ui/AppCard';

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const { user, updateNotificationToggle } = useAuthStore();
  const toggles = user.preferences.notificationToggles;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Notification Settings"
        subtitle="Manage push alert preferences"
        showBack
        onBack={() => router.back()}
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
        <AppCard style={{ marginTop: spacing.md, padding: spacing.md }}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <AppText variant="bodyBold">Booking Confirmations & Passes</AppText>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Instant pass generation and gate slip updates
              </AppText>
            </View>
            <Switch
              value={toggles.bookingConfirmations}
              onValueChange={(val) =>
                updateNotificationToggle('bookingConfirmations', val)
              }
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <AppText variant="bodyBold">Parking Expiry Reminders</AppText>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Receive 30-minute validity window alerts
              </AppText>
            </View>
            <Switch
              value={toggles.bookingReminders}
              onValueChange={(val) =>
                updateNotificationToggle('bookingReminders', val)
              }
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <AppText variant="bodyBold">Wallet Debits & Refunds</AppText>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Instant transaction confirmation & refund arrivals
              </AppText>
            </View>
            <Switch
              value={toggles.paymentUpdates}
              onValueChange={(val) =>
                updateNotificationToggle('paymentUpdates', val)
              }
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <AppText variant="bodyBold">Society & Community Updates</AppText>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                RWA approvals, speed limits, and by-law notices
              </AppText>
            </View>
            <Switch
              value={toggles.communityUpdates}
              onValueChange={(val) =>
                updateNotificationToggle('communityUpdates', val)
              }
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <AppText variant="bodyBold">Host Activity Updates</AppText>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Alerts when guests book your driveway or residential bay
              </AppText>
            </View>
            <Switch
              value={toggles.listingActivity}
              onValueChange={(val) =>
                updateNotificationToggle('listingActivity', val)
              }
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </AppCard>
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    marginVertical: 6,
  },
});
