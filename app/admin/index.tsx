import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useAdminStore } from '../../src/store/useAdminStore';
import { useOwnerStore } from '../../src/store/useOwnerStore';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppBadge } from '../../src/components/ui/AppBadge';
import { AppButton } from '../../src/components/ui/AppButton';

export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const { property, staff, auditLogs } = useAdminStore();
  const listings = useOwnerStore((s) => s.listings);

  const pendingListings = listings.filter((l) => l.approvalStatus === 'pending_approval');
  const approvedListings = listings.filter((l) => l.approvalStatus === 'approved');
  const onDutyStaff = staff.filter((s) => s.dutyStatus === 'on_duty');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Community Administration"
        subtitle={property.name}
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
              SIMULATED RWA ESTATE PORTAL
            </AppText>
          </View>
          <AppText variant="captionSmall" color={colors.warning} style={{ marginTop: 2 }}>
            Demonstrates Resident Welfare Association (RWA) governance, apartment parking slot authorization, society bylaws, and security staff oversight.
          </AppText>
        </View>

        {/* Property Overview Card */}
        <AppCard style={{ marginTop: spacing.md, padding: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <AppText variant="h3">{property.name}</AppText>
              <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                {property.locality}, {property.city} • Reg: {property.rwaRegistrationNumber}
              </AppText>
              <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                {property.totalResidentialUnits} Units • {property.totalRegisteredBays} Registered Slots
              </AppText>
            </View>
            <AppBadge label="RWA CERTIFIED" variant="primary" size="sm" />
          </View>
        </AppCard>

        {/* Society Parking Metrics Grid */}
        <View style={styles.metricsGrid}>
          <AppCard style={styles.metricCard}>
            <AppText variant="captionSmall" color={colors.secondaryText}>
              PENDING APPROVAL
            </AppText>
            <AppText
              variant="h2"
              weight="extraBold"
              color={pendingListings.length > 0 ? colors.warning : colors.text}
              style={{ marginTop: 4 }}
            >
              {pendingListings.length} Bays
            </AppText>
            <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
              Awaiting verification
            </AppText>
          </AppCard>

          <AppCard style={styles.metricCard}>
            <AppText variant="captionSmall" color={colors.secondaryText}>
              APPROVED SLOTS
            </AppText>
            <AppText variant="h2" weight="extraBold" color={colors.success} style={{ marginTop: 4 }}>
              {approvedListings.length} Live
            </AppText>
            <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
              Active on map
            </AppText>
          </AppCard>

          <AppCard style={styles.metricCard}>
            <AppText variant="captionSmall" color={colors.secondaryText}>
              GUARDS ON DUTY
            </AppText>
            <AppText variant="h2" weight="extraBold" style={{ marginTop: 4 }}>
              {onDutyStaff.length} / {staff.length}
            </AppText>
            <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
              Gate 1 & Gate 2 active
            </AppText>
          </AppCard>
        </View>

        {/* Administration Navigation Modules */}
        <View style={{ marginTop: spacing.xl }}>
          <AppText variant="h3">Administrative Management</AppText>
          <View style={{ marginTop: spacing.sm, gap: 10 }}>
            {/* 1. Review Pending Listings */}
            <Pressable
              onPress={() => router.push('/admin/approvals' as any)}
              style={({ pressed }) => [
                styles.adminNavCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: pendingListings.length > 0 ? colors.warning : colors.border,
                  borderRadius: radius.card,
                  padding: spacing.md,
                  borderWidth: pendingListings.length > 0 ? 1.5 : 1,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <View style={[styles.navIconCircle, { backgroundColor: colors.surfaceSubtle }]}>
                <AppIcon name="checkmark-done-circle-outline" size={24} color={isDark ? colors.primary : '#49570B'} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <AppText variant="bodyBold">Listing Authorization Portal</AppText>
                  {pendingListings.length > 0 && (
                    <AppBadge label={`${pendingListings.length} PENDING`} variant="warning" size="sm" />
                  )}
                </View>
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                  Review resident submissions, inspect slot rights, approve or reject
                </AppText>
              </View>
              <AppIcon name="chevron-forward" size={18} color={colors.secondaryText} />
            </Pressable>

            {/* 2. Community Parking Policies */}
            <Pressable
              onPress={() => router.push('/admin/policies' as any)}
              style={({ pressed }) => [
                styles.adminNavCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.card,
                  padding: spacing.md,
                  borderWidth: 1,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <View style={[styles.navIconCircle, { backgroundColor: colors.surfaceSubtle }]}>
                <AppIcon name="options-outline" size={24} color={colors.text} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText variant="bodyBold">Community Parking Policies</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                  Set speed limits, max booking windows, vehicle rules, and gate policies
                </AppText>
              </View>
              <AppIcon name="chevron-forward" size={18} color={colors.secondaryText} />
            </Pressable>

            {/* 3. Security Staff Oversight */}
            <Pressable
              onPress={() => router.push('/admin/staff' as any)}
              style={({ pressed }) => [
                styles.adminNavCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.card,
                  padding: spacing.md,
                  borderWidth: 1,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <View style={[styles.navIconCircle, { backgroundColor: colors.surfaceSubtle }]}>
                <AppIcon name="people-outline" size={24} color={colors.text} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <AppText variant="bodyBold">Security Personnel Roster</AppText>
                  <AppBadge label={`${staff.length} GUARDS`} variant="default" size="sm" />
                </View>
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                  Gate duty assignments, active authorizations, and suspension controls
                </AppText>
              </View>
              <AppIcon name="chevron-forward" size={18} color={colors.secondaryText} />
            </Pressable>

            {/* 4. Immutable Audit Records */}
            <Pressable
              onPress={() => router.push('/admin/audit' as any)}
              style={({ pressed }) => [
                styles.adminNavCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.card,
                  padding: spacing.md,
                  borderWidth: 1,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <View style={[styles.navIconCircle, { backgroundColor: colors.surfaceSubtle }]}>
                <AppIcon name="document-text-outline" size={24} color={colors.text} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText variant="bodyBold">Immutable Society Audit Logs</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                  Full chronological log of barrier entries, approvals, alerts, and policies
                </AppText>
              </View>
              <AppIcon name="chevron-forward" size={18} color={colors.secondaryText} />
            </Pressable>
          </View>
        </View>

        {/* Recent Audit Feed */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText variant="h3">Recent Governance Activity</AppText>
            <Pressable onPress={() => router.push('/admin/audit' as any)}>
              <AppText variant="caption" weight="bold" color={isDark ? colors.primary : '#49570B'}>
                View all ({auditLogs.length})
              </AppText>
            </Pressable>
          </View>

          <View style={{ marginTop: spacing.sm, gap: 8 }}>
            {auditLogs.slice(0, 3).map((log) => (
              <AppCard key={log.id} style={{ padding: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <AppText variant="bodyBold" numberOfLines={1}>
                      {log.targetDescription}
                    </AppText>
                    <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                      By {log.actorName} ({log.actorRole})
                    </AppText>
                  </View>
                  <AppText variant="captionSmall" color={colors.secondaryText}>
                    {log.timestamp}
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
  demoBanner: {
    borderWidth: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  metricCard: {
    flex: 1,
    padding: 10,
  },
  adminNavCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
