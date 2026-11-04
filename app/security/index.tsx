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
import { useSecurityStore } from '../../src/store/useSecurityStore';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppBadge } from '../../src/components/ui/AppBadge';
import { AppButton } from '../../src/components/ui/AppButton';

export default function SecurityDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const {
    guard,
    expectedArrivals,
    parkedVehicles,
    verificationLogs,
    incentiveStats,
    toggleDutyStatus,
    recordExit,
  } = useSecurityStore();

  const [activeTab, setActiveTab] = useState<'queue' | 'parked' | 'history' | 'incentives'>('queue');

  const isOnDuty = guard.dutyStatus === 'on_duty';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Security Personnel Portal"
        subtitle={guard.propertyName}
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
        {/* Prototype Simulation Notice */}
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
            <AppIcon name="shield-half" size={16} color={colors.warning} />
            <AppText variant="captionSmall" weight="bold" color={colors.warning}>
              SIMULATED SECURITY CONSOLE
            </AppText>
          </View>
          <AppText variant="captionSmall" color={colors.warning} style={{ marginTop: 2 }}>
            Demonstrates Gate 2 residential vehicle authorization, license plate verification, and operational guard incentives.
          </AppText>
        </View>

        {/* On-Duty Guard Profile Card */}
        <AppCard style={{ marginTop: spacing.md, padding: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AppText variant="h3">{guard.name}</AppText>
                <AppBadge
                  label={isOnDuty ? 'ON DUTY' : 'SHIFT BREAK'}
                  variant={isOnDuty ? 'success' : 'warning'}
                  size="sm"
                />
              </View>
              <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                Badge #{guard.badgeNumber} • {guard.gateNumber}
              </AppText>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Shift Started: {guard.shiftStartTime}
              </AppText>
            </View>

            <Pressable
              onPress={toggleDutyStatus}
              style={[
                styles.dutyToggleBtn,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  borderRadius: radius.pill,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 6,
                },
              ]}
            >
              <AppText variant="captionSmall" weight="bold" color={colors.text}>
                {isOnDuty ? 'Take Break' : 'Resume Duty'}
              </AppText>
            </Pressable>
          </View>
        </AppCard>

        {/* Primary Action: QR Scanner */}
        <View style={{ marginTop: spacing.md }}>
          <AppButton
            title="Open QR & Plate Scanner"
            onPress={() => router.push('/security/verify' as any)}
            variant="primary"
            size="lg"
            leftIcon={<AppIcon name="scan-outline" size={20} color={colors.primaryForeground} />}
          />
        </View>

        {/* Guard Metrics Row */}
        <View style={[styles.metricsRow, { marginTop: spacing.md }]}>
          <AppCard style={styles.metricCard}>
            <AppText variant="captionSmall" color={colors.secondaryText}>
              EXPECTED QUEUE
            </AppText>
            <AppText variant="h3" weight="extraBold" style={{ marginTop: 2 }}>
              {expectedArrivals.filter((a) => a.status === 'pending').length} Cars
            </AppText>
          </AppCard>

          <AppCard style={styles.metricCard}>
            <AppText variant="captionSmall" color={colors.secondaryText}>
              PARKED INSIDE
            </AppText>
            <AppText variant="h3" weight="extraBold" style={{ marginTop: 2 }}>
              {parkedVehicles.length} Bays
            </AppText>
          </AppCard>

          <AppCard style={styles.metricCard}>
            <AppText variant="captionSmall" color={colors.secondaryText}>
              SHIFT INCENTIVE
            </AppText>
            <AppText variant="h3" weight="extraBold" color={isDark ? colors.primary : '#49570B'} style={{ marginTop: 2 }}>
              +₹{incentiveStats.shiftEarned.toFixed(0)}
            </AppText>
          </AppCard>
        </View>

        {/* Tab Segment Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.segmentContainer,
            {
              backgroundColor: colors.surfaceSubtle,
              borderRadius: radius.pill,
              borderColor: colors.border,
              marginTop: spacing.lg,
              padding: 3,
            },
          ]}
        >
          {[
            { id: 'queue' as const, label: `Expected Queue (${expectedArrivals.length})` },
            { id: 'parked' as const, label: `Parked Vehicles (${parkedVehicles.length})` },
            { id: 'history' as const, label: `Verification Logs (${verificationLogs.length})` },
            { id: 'incentives' as const, label: `Guard Incentives` },
          ].map((tab) => {
            const isSel = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[
                  styles.tabBtn,
                  {
                    backgroundColor: isSel ? colors.surface : 'transparent',
                    borderRadius: radius.pill,
                  },
                ]}
              >
                <AppText
                  variant="captionSmall"
                  weight={isSel ? 'bold' : 'medium'}
                  color={isSel ? colors.text : colors.secondaryText}
                >
                  {tab.label}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* TAB 1: EXPECTED QUEUE */}
        {activeTab === 'queue' && (
          <View style={{ marginTop: spacing.md, gap: 10 }}>
            {expectedArrivals.map((arr) => {
              const isArrived = arr.status === 'arrived';
              return (
                <AppCard key={arr.id} style={{ padding: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <AppText variant="h3">{arr.vehiclePlate}</AppText>
                        <AppBadge
                          label={isArrived ? 'VERIFIED' : 'PENDING'}
                          variant={isArrived ? 'success' : 'warning'}
                          size="sm"
                        />
                      </View>
                      <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                        {arr.vehicleModel} • Driver: {arr.customerName}
                      </AppText>
                      <AppText variant="captionSmall" color={colors.text} style={{ marginTop: 4 }}>
                        Slot: {arr.slotNumber} ({arr.spaceName})
                      </AppText>
                      <AppText variant="captionSmall" color={colors.secondaryText}>
                        Window: {arr.scheduledTime}
                      </AppText>
                    </View>

                    {!isArrived && (
                      <AppButton
                        title="Scan Pass"
                        onPress={() => router.push('/security/verify' as any)}
                        variant="secondary"
                        size="sm"
                        fullWidth={false}
                        leftIcon={<AppIcon name="scan" size={14} color={colors.text} />}
                      />
                    )}
                  </View>
                </AppCard>
              );
            })}
          </View>
        )}

        {/* TAB 2: PARKED VEHICLES */}
        {activeTab === 'parked' && (
          <View style={{ marginTop: spacing.md, gap: 10 }}>
            {parkedVehicles.length === 0 ? (
              <AppCard style={{ padding: 24, alignItems: 'center' }}>
                <AppIcon name="car-outline" size={36} color={colors.secondaryText} />
                <AppText variant="bodyBold" style={{ marginTop: 12 }}>
                  No Vehicles Currently Parked
                </AppText>
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 4 }}>
                  Approved driver arrivals will appear here upon gate check-in.
                </AppText>
              </AppCard>
            ) : (
              parkedVehicles.map((veh) => (
                <AppCard key={veh.id} style={{ padding: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <AppText variant="h3">{veh.vehiclePlate}</AppText>
                        <AppBadge label="PARKED INSIDE" variant="primary" size="sm" />
                      </View>
                      <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                        {veh.vehicleModel} • {veh.customerName}
                      </AppText>
                      <AppText variant="captionSmall" color={colors.text} style={{ marginTop: 4 }}>
                        Slot: {veh.slotNumber} • Entry at {veh.entryTime}
                      </AppText>
                    </View>

                    <AppButton
                      title="Record Exit"
                      onPress={() => recordExit(veh.id)}
                      variant="outline"
                      size="sm"
                      fullWidth={false}
                      leftIcon={<AppIcon name="exit-outline" size={14} color={colors.text} />}
                    />
                  </View>
                </AppCard>
              ))
            )}
          </View>
        )}

        {/* TAB 3: VERIFICATION LOGS */}
        {activeTab === 'history' && (
          <View style={{ marginTop: spacing.md, gap: 10 }}>
            {verificationLogs.map((log) => {
              const isApproved = log.result === 'approved';
              return (
                <AppCard key={log.id} style={{ padding: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <AppText variant="bodyBold">#{log.bookingNumber}</AppText>
                        <AppBadge
                          label={log.statusLabel}
                          variant={isApproved ? 'success' : 'error'}
                          size="sm"
                        />
                      </View>
                      <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                        Plate: {log.arrivingPlate} {log.expectedPlate !== log.arrivingPlate ? `(Expected: ${log.expectedPlate})` : ''}
                      </AppText>
                      <AppText variant="captionSmall" color={colors.text} style={{ marginTop: 4 }}>
                        {log.notes}
                      </AppText>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <AppText variant="captionSmall" color={colors.secondaryText}>
                        {log.timestamp}
                      </AppText>
                      {isApproved && (
                        <AppText variant="captionSmall" weight="bold" color={colors.success} style={{ marginTop: 4 }}>
                          +₹{log.incentiveCredited} Guard Bonus
                        </AppText>
                      )}
                    </View>
                  </View>
                </AppCard>
              );
            })}
          </View>
        )}

        {/* TAB 4: GUARD INCENTIVES */}
        {activeTab === 'incentives' && (
          <View style={{ marginTop: spacing.md }}>
            <AppCard
              style={{
                backgroundColor: colors.pricePinBg,
                borderColor: colors.primary,
                borderWidth: 1.5,
                padding: spacing.lg,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <AppText variant="caption" color={colors.secondaryText}>
                  TODAY'S SHIFT REWARD
                </AppText>
                <AppBadge label="SIMULATED REWARD" variant="primary" size="sm" />
              </View>

              <AppText variant="display" weight="extraBold" color={colors.pricePinText} style={{ marginTop: 4 }}>
                ₹{incentiveStats.shiftEarned.toFixed(2)}
              </AppText>

              <View style={[styles.incentiveDetailRow, { borderTopColor: colors.border, borderTopWidth: 1, paddingTop: spacing.md, marginTop: spacing.md }]}>
                <View>
                  <AppText variant="captionSmall" color={colors.secondaryText}>Verified Checks</AppText>
                  <AppText variant="h3" color={colors.pricePinText}>{incentiveStats.verificationsCount} Vehicles</AppText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <AppText variant="captionSmall" color={colors.secondaryText}>Total Lifetime</AppText>
                  <AppText variant="h3" color={isDark ? colors.primary : '#49570B'}>₹{incentiveStats.totalLifetimeEarned.toFixed(2)}</AppText>
                </View>
              </View>
            </AppCard>

            <View style={[styles.policyNoticeBox, { backgroundColor: colors.surfaceSubtle, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AppIcon name="gift-outline" size={16} color={isDark ? colors.primary : '#49570B'} />
                <AppText variant="caption" weight="bold">
                  Operational Guard Incentive Protocol
                </AppText>
              </View>
              <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 4, lineHeight: 16 }}>
                Eligible security guards earn an automated ₹15 incentive credited to their wallet for every legitimate booking QR & vehicle license plate inspection completed at residential gates.
              </AppText>
            </View>
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
  demoBanner: {
    borderWidth: 1,
  },
  dutyToggleBtn: {
    borderWidth: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    padding: 10,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderWidth: 1,
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incentiveDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  policyNoticeBox: {},
});
