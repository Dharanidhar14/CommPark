import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';
import { useAuthStore } from '../../src/store/useAuthStore';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppBadge } from '../../src/components/ui/AppBadge';

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, radius, isDark } = useTheme();
  const user = useAuthStore((s) => s.user);

  const transactions = [
    {
      id: 'tx_1',
      title: 'Greenwood Heights Parking',
      type: 'payment',
      date: 'Today, 6:15 PM',
      amount: -21.75,
      badge: 'Parking Pass',
    },
    {
      id: 'tx_2',
      title: 'Driveway Rental Payout',
      type: 'payout',
      date: 'Nov 02, 2026',
      amount: +48.00,
      badge: 'Owner Earning',
    },
    {
      id: 'tx_3',
      title: 'Gate 2 Security Verification Incentive',
      type: 'incentive',
      date: 'Nov 01, 2026',
      amount: +4.50,
      badge: 'Guard Incentive',
    },
    {
      id: 'tx_4',
      title: 'MetroCenter Commercial Garage',
      type: 'payment',
      date: 'Oct 29, 2026',
      amount: -18.00,
      badge: 'Parking Pass',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Community Wallet" subtitle="Credits, earnings and rewards" />

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
        {/* Main Balance Hero Card */}
        <View
          style={[
            styles.balanceHero,
            {
              backgroundColor: colors.pricePinBg,
              borderColor: colors.primary,
              borderRadius: radius.card,
              padding: spacing.xl,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: isDark ? 0.4 : 0.1,
              shadowRadius: 14,
              elevation: 5,
            },
          ]}
        >
          <View style={styles.balanceTopRow}>
            <AppText variant="caption" color={colors.secondaryText}>
              AVAILABLE BALANCE
            </AppText>
            <View style={[styles.currencyPill, { backgroundColor: colors.primary }]}>
              <AppText variant="captionSmall" weight="bold" color={colors.primaryForeground}>
                USD
              </AppText>
            </View>
          </View>

          <AppText
            variant="display"
            weight="extraBold"
            color={colors.pricePinText}
            style={[styles.balanceNumber, { marginTop: spacing.xs }]}
          >
            ${user.wallet.balance.toFixed(2)}
          </AppText>

          <View
            style={[
              styles.earningsBreakdown,
              {
                borderTopColor: colors.border,
                borderTopWidth: 1,
                paddingTop: spacing.md,
                marginTop: spacing.lg,
              },
            ]}
          >
            <View style={styles.earningItem}>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Space Owner Earned
              </AppText>
              <AppText variant="bodyBold" color={colors.pricePinText}>
                +${user.wallet.earnedAsOwner.toFixed(2)}
              </AppText>
            </View>

            <View style={styles.earningItem}>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Guard Incentives
              </AppText>
              <AppText variant="bodyBold" color={colors.primary}>
                +${user.wallet.earnedAsSecurityGuard.toFixed(2)}
              </AppText>
            </View>
          </View>

          <View style={[styles.actionBtnRow, { marginTop: spacing.lg }]}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <AppButton
                title="Add Funds"
                onPress={() => {}}
                variant="primary"
                size="md"
                leftIcon={<AppIcon name="add-circle-outline" size={18} color={colors.primaryForeground} />}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <AppButton
                title="Withdraw"
                onPress={() => {}}
                variant="secondary"
                size="md"
                leftIcon={<AppIcon name="arrow-up-circle-outline" size={18} color={colors.text} />}
              />
            </View>
          </View>
        </View>

        {/* Transaction History Section */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={styles.sectionHeader}>
            <AppText variant="h3">Recent Activity</AppText>
            <Pressable>
              <AppText variant="caption" weight="bold" color={colors.secondaryText}>
                Statement
              </AppText>
            </Pressable>
          </View>

          <View style={{ marginTop: spacing.md }}>
            {transactions.map((tx) => (
              <AppCard key={tx.id} style={styles.txCard}>
                <View style={styles.txRow}>
                  <View
                    style={[
                      styles.txIconCircle,
                      {
                        backgroundColor:
                          tx.amount > 0 ? colors.successBackground : colors.surfaceSubtle,
                      },
                    ]}
                  >
                    <AppIcon
                      name={tx.amount > 0 ? 'arrow-down' : 'arrow-up'}
                      size={18}
                      color={tx.amount > 0 ? colors.success : colors.secondaryText}
                    />
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <AppText variant="bodyBold" numberOfLines={1}>
                      {tx.title}
                    </AppText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                      <AppBadge label={tx.badge} size="sm" variant={tx.type === 'incentive' ? 'primary' : 'default'} />
                      <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginLeft: 6 }}>
                        {tx.date}
                      </AppText>
                    </View>
                  </View>

                  <AppText
                    variant="h4"
                    weight="bold"
                    color={tx.amount > 0 ? colors.success : colors.text}
                  >
                    {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                  </AppText>
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
  balanceHero: {
    borderWidth: 1.5,
  },
  balanceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currencyPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  balanceNumber: {
    fontVariant: ['tabular-nums'],
  },
  earningsBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  earningItem: {
    flex: 1,
  },
  actionBtnRow: {
    flexDirection: 'row',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txCard: {
    marginBottom: 10,
    padding: 12,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
