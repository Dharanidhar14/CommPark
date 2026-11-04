import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useOwnerStore } from '../../src/store/useOwnerStore';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppBadge } from '../../src/components/ui/AppBadge';
import { AppButton } from '../../src/components/ui/AppButton';

export default function OwnerEarningsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const {
    totalEarnings,
    pendingEarnings,
    completedBookingsCount,
    payouts,
    listings,
  } = useOwnerStore();

  const spaceEarnings = [
    { name: 'Greenwood Heights Slot 14', amount: 12800.00, percent: 69 },
    { name: 'Defence Colony Gated Driveway', amount: 5650.00, percent: 31 },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Earnings & Payouts"
        subtitle="Revenue breakdown & bank transfers"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing.lg,
            paddingBottom: insets.bottom + 40,
          },
        ]}
      >
        {/* Prominent Simulated Financial Banner */}
        <View
          style={[
            styles.demoBanner,
            {
              backgroundColor: 'rgba(234, 179, 8, 0.12)',
              borderColor: colors.warning,
              borderRadius: radius.md,
              padding: spacing.sm,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <AppIcon name="information-circle" size={16} color={colors.warning} />
            <AppText variant="captionSmall" weight="bold" color={colors.warning}>
              SIMULATED FINANCIAL DATA
            </AppText>
          </View>
          <AppText variant="captionSmall" color={colors.warning} style={{ marginTop: 2 }}>
            All revenue metrics, wallet balances, and bank transfer UTR records are simulated demonstration data without physical banking integration.
          </AppText>
        </View>

        {/* Lifetime Earnings Hero Card */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.pricePinBg,
              borderColor: colors.primary,
              borderRadius: radius.card,
              padding: spacing.xl,
              marginTop: spacing.md,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText variant="caption" color={colors.secondaryText}>
              LIFETIME EARNINGS
            </AppText>
            <AppBadge label="INR (₹)" variant="primary" size="sm" />
          </View>

          <AppText
            variant="display"
            weight="extraBold"
            color={colors.pricePinText}
            style={{ marginTop: spacing.xs }}
          >
            ₹{totalEarnings.toFixed(2)}
          </AppText>

          <View style={[styles.statsRow, { borderTopColor: colors.border, borderTopWidth: 1, paddingTop: spacing.md, marginTop: spacing.md }]}>
            <View>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Pending Payout
              </AppText>
              <AppText variant="h3" color={isDark ? colors.primary : '#49570B'}>
                ₹{pendingEarnings.toFixed(2)}
              </AppText>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Completed Bookings
              </AppText>
              <AppText variant="h3" color={colors.pricePinText}>
                {completedBookingsCount} Trips
              </AppText>
            </View>
          </View>
        </View>

        {/* Listing-Wise Revenue Breakdown */}
        <View style={{ marginTop: spacing.xl }}>
          <AppText variant="h3">Listing Revenue Breakdown</AppText>
          <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
            Earnings distributed across your registered parking bays
          </AppText>

          <View style={{ marginTop: spacing.sm, gap: 10 }}>
            {spaceEarnings.map((item) => (
              <AppCard key={item.name} style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <AppText variant="bodyBold" numberOfLines={1} style={{ flex: 1, marginRight: 8 }}>
                    {item.name}
                  </AppText>
                  <AppText variant="bodyBold" color={isDark ? colors.primary : '#49570B'}>
                    ₹{item.amount.toFixed(2)}
                  </AppText>
                </View>

                <View style={{ marginTop: 8 }}>
                  <View style={[styles.barBg, { backgroundColor: colors.surfaceSubtle, borderRadius: radius.pill }]}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${item.percent}%`,
                          backgroundColor: colors.primary,
                          borderRadius: radius.pill,
                        },
                      ]}
                    />
                  </View>
                  <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 4 }}>
                    {item.percent}% of total earnings
                  </AppText>
                </View>
              </AppCard>
            ))}
          </View>
        </View>

        {/* Simulated Payout Account */}
        <View style={{ marginTop: spacing.xl }}>
          <AppText variant="h3">Linked Payout Account</AppText>
          <AppCard style={{ marginTop: spacing.sm, padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={[
                  styles.bankIconCircle,
                  { backgroundColor: colors.surfaceSubtle },
                ]}
              >
                <AppIcon name="business" size={20} color={colors.text} />
              </View>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <AppText variant="bodyBold">HDFC Bank Limited</AppText>
                  <AppBadge label="VERIFIED" variant="success" size="sm" />
                </View>
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                  A/C: •••••••• 9012 • IFSC: HDFC0001234
                </AppText>
              </View>
            </View>

            <View style={[styles.payoutSchedule, { backgroundColor: colors.surfaceSubtle, borderRadius: radius.sm, padding: spacing.sm, marginTop: spacing.md }]}>
              <AppIcon name="calendar-outline" size={14} color={colors.secondaryText} />
              <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginLeft: 6, flex: 1 }}>
                Automated weekly payout cycle: Every Tuesday directly to your verified bank account.
              </AppText>
            </View>
          </AppCard>
        </View>

        {/* Transaction Payout History */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText variant="h3">Bank Payout History</AppText>
            <AppBadge label="IMPS / NEFT" variant="default" size="sm" />
          </View>

          <View style={{ marginTop: spacing.sm, gap: 10 }}>
            {payouts.map((pay) => (
              <AppCard key={pay.id} style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <AppText variant="bodyBold">
                      {pay.method}
                    </AppText>
                    <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                      {pay.date} • Ref: {pay.utrReference}
                    </AppText>
                    <AppText variant="captionSmall" color={colors.secondaryText}>
                      Credited to HDFC •••• {pay.bankAccountLast4}
                    </AppText>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <AppText variant="h3" color={colors.success}>
                      +₹{pay.amount.toFixed(2)}
                    </AppText>
                    <AppBadge label="COMPLETED" variant="success" size="sm" style={{ marginTop: 4 }} />
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
  demoBanner: {
    borderWidth: 1,
  },
  heroCard: {
    borderWidth: 1.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barBg: {
    height: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
  },
  bankIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutSchedule: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
