import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useWalletStore } from '../../src/store/useWalletStore';
import { WalletTransaction, TransactionType } from '../../src/types/wallet';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon, IconName } from '../../src/components/ui/AppIcon';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppBadge, BadgeVariant } from '../../src/components/ui/AppBadge';
import { AppInput } from '../../src/components/ui/AppInput';

type FilterType = 'all' | 'parking' | 'refund' | 'owner' | 'guard' | 'topup';

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const {
    availableBalance,
    pendingCredits,
    earnedAsOwner,
    earnedAsGuard,
    transactions,
    addFunds,
    getSummary,
  } = useWalletStore();

  const { totalCredits, totalDebits } = getSummary();

  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedTx, setSelectedTx] = useState<WalletTransaction | null>(null);

  // Add Money Modal State
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [addAmount, setAddAmount] = useState('500');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'Google Pay' | 'PhonePe' | 'Paytm' | 'BHIM'>('Google Pay');

  const filterOptions: { id: FilterType; label: string; count: number }[] = useMemo(() => {
    const pCount = transactions.filter((t) => t.type === 'parking_payment').length;
    const rCount = transactions.filter((t) => t.type === 'parking_refund').length;
    const oCount = transactions.filter((t) => t.type === 'owner_earning').length;
    const gCount = transactions.filter((t) => t.type === 'guard_incentive').length;
    const tCount = transactions.filter((t) => t.type === 'wallet_topup' || t.type === 'promo_credit').length;

    return [
      { id: 'all', label: 'All', count: transactions.length },
      { id: 'parking', label: 'Parking Passes', count: pCount },
      { id: 'refund', label: 'Refunds', count: rCount },
      { id: 'owner', label: 'Host Earnings', count: oCount },
      { id: 'guard', label: 'Guard Rewards', count: gCount },
      { id: 'topup', label: 'Wallet Loads', count: tCount },
    ];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (selectedFilter === 'parking' && tx.type !== 'parking_payment') return false;
      if (selectedFilter === 'refund' && tx.type !== 'parking_refund') return false;
      if (selectedFilter === 'owner' && tx.type !== 'owner_earning') return false;
      if (selectedFilter === 'guard' && tx.type !== 'guard_incentive') return false;
      if (selectedFilter === 'topup' && tx.type !== 'wallet_topup' && tx.type !== 'promo_credit')
        return false;
      return true;
    });
  }, [transactions, selectedFilter]);

  const handleExecuteTopup = () => {
    const parsed = parseFloat(addAmount);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid top-up amount.');
      return;
    }

    addFunds(parsed, `UPI (${selectedUpiApp})`);
    setIsAddMoneyOpen(false);
    Alert.alert(
      'Wallet Loaded Successfully',
      `Simulated payment of ₹${parsed.toFixed(2)} via ${selectedUpiApp} processed.\n\nUpdated available balance: ₹${(availableBalance + parsed).toFixed(2)}.`,
      [{ text: 'Great', style: 'default' }]
    );
  };

  const handleWithdrawPrompt = () => {
    Alert.alert(
      'Simulated Bank Withdrawal',
      `Eligible Host Earnings: ₹${earnedAsOwner.toFixed(2)}\nEligible Guard Incentives: ₹${earnedAsGuard.toFixed(2)}\n\nIn a production environment, host earnings and guard incentives are disbursed via automated weekly IMPS transfers to your registered bank account (HDFC Bank •••• 9012).`,
      [{ text: 'View Host Statement', onPress: () => router.push('/owner/earnings' as any) }, { text: 'Done', style: 'cancel' }]
    );
  };

  const getTxConfig = (
    tx: WalletTransaction
  ): {
    icon: IconName;
    color: string;
    bgColor: string;
    variant: BadgeVariant;
  } => {
    switch (tx.type) {
      case 'parking_payment':
        return {
          icon: 'arrow-up',
          color: colors.secondaryText,
          bgColor: colors.surfaceSubtle,
          variant: 'default',
        };
      case 'parking_refund':
        return {
          icon: 'refresh',
          color: colors.success,
          bgColor: 'rgba(34, 197, 94, 0.15)',
          variant: 'success',
        };
      case 'owner_earning':
        return {
          icon: 'business',
          color: colors.pricePinText,
          bgColor: 'rgba(217, 245, 66, 0.25)',
          variant: 'primary',
        };
      case 'guard_incentive':
        return {
          icon: 'shield-checkmark',
          color: isDark ? colors.primary : '#49570B',
          bgColor: 'rgba(217, 245, 66, 0.2)',
          variant: 'primary',
        };
      case 'wallet_topup':
        return {
          icon: 'arrow-down',
          color: colors.success,
          bgColor: 'rgba(34, 197, 94, 0.15)',
          variant: 'success',
        };
      case 'promo_credit':
        return {
          icon: 'gift-outline',
          color: colors.warning,
          bgColor: 'rgba(234, 179, 8, 0.15)',
          variant: 'warning',
        };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="CommunityPark Wallet"
        subtitle="Credits, earnings & transaction history"
        rightAction={
          <Pressable
            onPress={() => router.push('/notifications' as any)}
            hitSlop={8}
            style={styles.notifBtn}
          >
            <AppIcon name="notifications-outline" size={22} color={colors.text} />
          </Pressable>
        }
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
        {/* Prototype Financial Disclaimer */}
        <View
          style={[
            styles.demoBanner,
            {
              backgroundColor: 'rgba(234, 179, 8, 0.12)',
              borderColor: colors.warning,
              borderRadius: radius.md,
              padding: spacing.sm,
              marginTop: spacing.xs,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <AppIcon name="wallet" size={16} color={colors.warning} />
            <AppText variant="captionSmall" weight="bold" color={colors.warning}>
              SIMULATED PROTOTYPE WALLET
            </AppText>
          </View>
          <AppText variant="captionSmall" color={colors.warning} style={{ marginTop: 2 }}>
            All rupee values, top-ups, guard verification rewards, and host credits are simulated within this demonstration session. No real banking transfers occur.
          </AppText>
        </View>

        {/* Available Balance Hero Card */}
        <View
          style={[
            styles.balanceHero,
            {
              backgroundColor: colors.pricePinBg,
              borderColor: colors.primary,
              borderRadius: radius.card,
              padding: spacing.lg,
              marginTop: spacing.sm,
            },
          ]}
        >
          <View style={styles.balanceTopRow}>
            <AppText variant="caption" color={colors.secondaryText}>
              AVAILABLE WALLET BALANCE
            </AppText>
            <View style={[styles.currencyPill, { backgroundColor: colors.primary }]}>
              <AppText variant="captionSmall" weight="bold" color={colors.primaryForeground}>
                INR (₹)
              </AppText>
            </View>
          </View>

          <AppText
            variant="display"
            weight="extraBold"
            color={colors.pricePinText}
            style={[styles.balanceNumber, { marginTop: spacing.xs }]}
          >
            ₹{availableBalance.toFixed(2)}
          </AppText>

          {/* Separation of Dedicated Earning Counters */}
          <View
            style={[
              styles.earningsBreakdown,
              {
                borderTopColor: colors.border,
                borderTopWidth: 1,
                paddingTop: spacing.md,
                marginTop: spacing.md,
              },
            ]}
          >
            <View style={styles.earningItem}>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Space Host Lifetime
              </AppText>
              <AppText variant="bodyBold" color={colors.pricePinText}>
                +₹{earnedAsOwner.toFixed(2)}
              </AppText>
            </View>

            <View style={styles.earningItem}>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Guard Incentives
              </AppText>
              <AppText variant="bodyBold" color={isDark ? colors.primary : '#49570B'}>
                +₹{earnedAsGuard.toFixed(2)}
              </AppText>
            </View>

            <View style={styles.earningItem}>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Pending Credits
              </AppText>
              <AppText variant="bodyBold" color={colors.secondaryText}>
                ₹{pendingCredits.toFixed(2)}
              </AppText>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={[styles.actionBtnRow, { marginTop: spacing.lg }]}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <AppButton
                title="Add Money"
                onPress={() => setIsAddMoneyOpen(true)}
                variant="primary"
                size="md"
                leftIcon={<AppIcon name="add-circle-outline" size={18} color={colors.primaryForeground} />}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <AppButton
                title="Withdraw"
                onPress={handleWithdrawPrompt}
                variant="secondary"
                size="md"
                leftIcon={<AppIcon name="arrow-up-circle-outline" size={18} color={colors.text} />}
              />
            </View>
          </View>
        </View>

        {/* Lifetime Activity Summary Strip */}
        <View style={styles.summaryStrip}>
          <AppCard style={styles.summaryCard}>
            <AppText variant="captionSmall" color={colors.secondaryText}>
              TOTAL CREDITS
            </AppText>
            <AppText variant="bodyBold" color={colors.success} style={{ marginTop: 2 }}>
              +₹{totalCredits.toFixed(2)}
            </AppText>
          </AppCard>

          <AppCard style={styles.summaryCard}>
            <AppText variant="captionSmall" color={colors.secondaryText}>
              TOTAL DEBITS
            </AppText>
            <AppText variant="bodyBold" color={colors.text} style={{ marginTop: 2 }}>
              -₹{totalDebits.toFixed(2)}
            </AppText>
          </AppCard>

          <AppCard style={styles.summaryCard}>
            <AppText variant="captionSmall" color={colors.secondaryText}>
              TOTAL TXNS
            </AppText>
            <AppText variant="bodyBold" style={{ marginTop: 2 }}>
              {transactions.length}
            </AppText>
          </AppCard>
        </View>

        {/* Transaction History Section */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={styles.sectionHeader}>
            <AppText variant="h3">Transaction Activity</AppText>
            <Pressable onPress={() => Alert.alert('Account Statement', 'Detailed CSV/PDF statement available for download in full production.')}>
              <AppText variant="caption" weight="bold" color={isDark ? colors.primary : '#49570B'}>
                Download Statement
              </AppText>
            </Pressable>
          </View>

          {/* Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.filterScroll, { gap: 8 }]}
          >
            {filterOptions.map((opt) => {
              const isSelected = selectedFilter === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setSelectedFilter(opt.id)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isSelected ? colors.pricePinBg : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderRadius: radius.pill,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <AppText
                    variant="captionSmall"
                    weight={isSelected ? 'bold' : 'medium'}
                    color={isSelected ? colors.pricePinText : colors.text}
                  >
                    {opt.label} ({opt.count})
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Transaction Cards */}
          <View style={{ marginTop: spacing.sm, gap: 10 }}>
            {filteredTransactions.map((tx) => {
              const cfg = getTxConfig(tx);
              const isPositive = tx.amount > 0;

              return (
                <Pressable
                  key={tx.id}
                  onPress={() => setSelectedTx(tx)}
                  style={({ pressed }) => [
                    styles.txPressable,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <AppCard style={styles.txCard}>
                    <View style={styles.txRow}>
                      <View style={[styles.txIconCircle, { backgroundColor: cfg.bgColor }]}>
                        <AppIcon name={cfg.icon} size={18} color={cfg.color} />
                      </View>

                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <AppText variant="bodyBold" numberOfLines={1}>
                          {tx.title}
                        </AppText>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                          <AppBadge label={tx.category} size="sm" variant={cfg.variant} />
                          <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginLeft: 6 }}>
                            {tx.date}
                          </AppText>
                        </View>
                      </View>

                      <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
                        <AppText
                          variant="bodyBold"
                          color={isPositive ? colors.success : colors.text}
                        >
                          {isPositive ? `+₹${tx.amount.toFixed(2)}` : `-₹${Math.abs(tx.amount).toFixed(2)}`}
                        </AppText>
                        <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                          {tx.status.toUpperCase()}
                        </AppText>
                      </View>
                    </View>
                  </AppCard>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Transaction Details Modal */}
      <Modal
        visible={selectedTx !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedTx(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.detailModalSheet,
              {
                backgroundColor: colors.surface,
                borderRadius: radius.card,
                padding: spacing.xl,
              },
            ]}
          >
            {selectedTx && (
              <>
                <View style={styles.modalHeader}>
                  <AppText variant="h3">Transaction Details</AppText>
                  <Pressable onPress={() => setSelectedTx(null)} hitSlop={12}>
                    <AppIcon name="close" size={24} color={colors.secondaryText} />
                  </Pressable>
                </View>

                <View style={styles.detailHeroAmount}>
                  <AppText
                    variant="display"
                    weight="extraBold"
                    color={selectedTx.amount > 0 ? colors.success : colors.text}
                  >
                    {selectedTx.amount > 0
                      ? `+₹${selectedTx.amount.toFixed(2)}`
                      : `-₹${Math.abs(selectedTx.amount).toFixed(2)}`}
                  </AppText>
                  <AppBadge
                    label={selectedTx.status.toUpperCase()}
                    variant={selectedTx.status === 'completed' ? 'success' : 'default'}
                    size="sm"
                    style={{ marginTop: 6 }}
                  />
                </View>

                <View style={[styles.detailTable, { borderTopColor: colors.border, borderTopWidth: 1, marginTop: 16, paddingTop: 12 }]}>
                  <View style={styles.detailRow}>
                    <AppText variant="caption" color={colors.secondaryText}>Category</AppText>
                    <AppText variant="caption" weight="bold">{selectedTx.category}</AppText>
                  </View>

                  <View style={styles.detailRow}>
                    <AppText variant="caption" color={colors.secondaryText}>Reference ID</AppText>
                    <AppText variant="caption" weight="bold">{selectedTx.referenceNumber}</AppText>
                  </View>

                  <View style={styles.detailRow}>
                    <AppText variant="caption" color={colors.secondaryText}>Timestamp</AppText>
                    <AppText variant="caption">{selectedTx.date}</AppText>
                  </View>

                  {selectedTx.paymentMethodUsed && (
                    <View style={styles.detailRow}>
                      <AppText variant="caption" color={colors.secondaryText}>Payment Mode</AppText>
                      <AppText variant="caption">{selectedTx.paymentMethodUsed}</AppText>
                    </View>
                  )}

                  {selectedTx.relatedBookingId && (
                    <View style={styles.detailRow}>
                      <AppText variant="caption" color={colors.secondaryText}>Booking Ref</AppText>
                      <AppText variant="caption" weight="bold" color={colors.primary}>
                        #{selectedTx.relatedBookingId}
                      </AppText>
                    </View>
                  )}

                  {selectedTx.note && (
                    <View style={{ marginTop: 10 }}>
                      <AppText variant="captionSmall" color={colors.secondaryText}>Description</AppText>
                      <AppText variant="caption" style={{ marginTop: 2 }}>{selectedTx.note}</AppText>
                    </View>
                  )}
                </View>

                <View style={{ marginTop: 20 }}>
                  <AppButton
                    title="Close"
                    variant="primary"
                    size="md"
                    onPress={() => setSelectedTx(null)}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Add Money Modal */}
      <Modal
        visible={isAddMoneyOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddMoneyOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.topupSheet,
              {
                backgroundColor: colors.surface,
                borderTopLeftRadius: radius.xl,
                borderTopRightRadius: radius.xl,
                paddingBottom: insets.bottom + 20,
                paddingHorizontal: spacing.lg,
                paddingTop: spacing.lg,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <AppText variant="h3">Load Wallet (Simulated)</AppText>
              <Pressable onPress={() => setIsAddMoneyOpen(false)} hitSlop={12}>
                <AppIcon name="close" size={24} color={colors.secondaryText} />
              </Pressable>
            </View>

            <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
              Choose a preset amount or enter custom rupee value
            </AppText>

            {/* Quick Presets */}
            <View style={[styles.presetRow, { marginTop: 12 }]}>
              {['200', '500', '1000', '2000'].map((amt) => {
                const isSel = addAmount === amt;
                return (
                  <Pressable
                    key={amt}
                    onPress={() => setAddAmount(amt)}
                    style={[
                      styles.presetChip,
                      {
                        backgroundColor: isSel ? colors.pricePinBg : colors.surfaceSubtle,
                        borderColor: isSel ? colors.primary : colors.border,
                        borderRadius: radius.md,
                        borderWidth: isSel ? 2 : 1,
                      },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      weight={isSel ? 'bold' : 'medium'}
                      color={isSel ? colors.pricePinText : colors.text}
                    >
                      +₹{amt}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ marginTop: 14 }}>
              <AppInput
                label="Custom Amount (INR)"
                placeholder="500"
                value={addAmount}
                onChangeText={setAddAmount}
                keyboardType="numeric"
                leftIcon={<AppText variant="bodyBold">₹</AppText>}
              />
            </View>

            {/* UPI Apps Selection */}
            <AppText variant="caption" weight="bold" color={colors.secondaryText} style={{ marginTop: 16 }}>
              SIMULATED UPI PROVIDER
            </AppText>
            <View style={[styles.upiGrid, { marginTop: 8 }]}>
              {(['Google Pay', 'PhonePe', 'Paytm', 'BHIM'] as const).map((app) => {
                const isSel = selectedUpiApp === app;
                return (
                  <Pressable
                    key={app}
                    onPress={() => setSelectedUpiApp(app)}
                    style={[
                      styles.upiCard,
                      {
                        backgroundColor: isSel ? colors.surfaceSubtle : colors.surface,
                        borderColor: isSel ? colors.primary : colors.border,
                        borderRadius: radius.md,
                        borderWidth: isSel ? 2 : 1,
                        padding: spacing.sm,
                      },
                    ]}
                  >
                    <AppIcon
                      name={isSel ? 'radio-button-on' : 'radio-button-off'}
                      size={16}
                      color={isSel ? colors.primary : colors.secondaryText}
                    />
                    <AppText
                      variant="captionSmall"
                      weight={isSel ? 'bold' : 'medium'}
                      style={{ marginLeft: 6 }}
                    >
                      {app}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ marginTop: 20 }}>
              <AppButton
                title={`Load ₹${parseFloat(addAmount || '0').toFixed(2)} (Simulated)`}
                variant="primary"
                size="lg"
                onPress={handleExecuteTopup}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  notifBtn: {
    padding: 6,
  },
  demoBanner: {
    borderWidth: 1,
  },
  balanceHero: {
    borderWidth: 1,
  },
  balanceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currencyPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  balanceNumber: {
    letterSpacing: -0.5,
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
  summaryStrip: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterScroll: {
    paddingVertical: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  txPressable: {
    marginBottom: 2,
  },
  txCard: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  topupSheet: {},
  detailModalSheet: {
    margin: 20,
    maxHeight: '80%',
    alignSelf: 'center',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailHeroAmount: {
    alignItems: 'center',
    marginVertical: 14,
  },
  detailTable: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  upiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  upiCard: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
  },
});
