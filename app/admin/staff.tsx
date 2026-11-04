import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useAdminStore } from '../../src/store/useAdminStore';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppBadge } from '../../src/components/ui/AppBadge';
import { AppButton } from '../../src/components/ui/AppButton';

export default function AdminStaffScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const { staff, toggleStaffStatus } = useAdminStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Security Staff Management"
        subtitle="Guard rosters & gate permissions"
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
        <AppCard style={{ marginTop: spacing.xs, padding: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <AppText variant="h3">Gate Security Operations</AppText>
              <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                {staff.filter((s) => s.authorizationStatus === 'authorized').length} Active Guards • 3 Operational Gate Posts
              </AppText>
            </View>
            <AppBadge label="RWA ROSTER" variant="primary" size="sm" />
          </View>
        </AppCard>

        {/* Staff Members List */}
        <View style={{ marginTop: spacing.lg, gap: 12 }}>
          {staff.map((guard) => {
            const isAuthorized = guard.authorizationStatus === 'authorized';
            const isOnDuty = guard.dutyStatus === 'on_duty';

            return (
              <AppCard key={guard.id} style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <AppText variant="h3">{guard.name}</AppText>
                      <AppBadge
                        label={isAuthorized ? 'AUTHORIZED' : 'SUSPENDED'}
                        variant={isAuthorized ? 'success' : 'error'}
                        size="sm"
                      />
                      <AppBadge
                        label={isOnDuty ? 'ON DUTY' : guard.dutyStatus.toUpperCase()}
                        variant={isOnDuty ? 'primary' : 'default'}
                        size="sm"
                      />
                    </View>

                    <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 4 }}>
                      Staff ID: {guard.staffId} • {guard.assignedGate}
                    </AppText>

                    <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                      Role: {guard.role.replace('_', ' ').toUpperCase()} • Contact: {guard.phone}
                    </AppText>
                  </View>

                  <AppButton
                    title={isAuthorized ? 'Suspend' : 'Authorize'}
                    onPress={() => toggleStaffStatus(guard.id)}
                    variant={isAuthorized ? 'outline' : 'primary'}
                    size="sm"
                    fullWidth={false}
                    leftIcon={
                      <AppIcon
                        name={isAuthorized ? 'ban-outline' : 'checkmark-circle-outline'}
                        size={14}
                        color={isAuthorized ? colors.error : colors.primaryForeground}
                      />
                    }
                  />
                </View>

                {!isAuthorized && (
                  <View
                    style={[
                      styles.suspendedWarning,
                      {
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderColor: colors.error,
                        borderRadius: radius.sm,
                        padding: spacing.xs,
                        marginTop: spacing.sm,
                      },
                    ]}
                  >
                    <AppText variant="captionSmall" color={colors.error}>
                      ⚠ Access Suspended: Scanner credentials revoked; cannot verify visitor vehicles.
                    </AppText>
                  </View>
                )}
              </AppCard>
            );
          })}
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
  suspendedWarning: {
    borderWidth: 1,
  },
});
