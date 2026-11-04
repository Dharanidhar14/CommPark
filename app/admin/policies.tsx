import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Switch,
  Pressable,
} from 'react-native';
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

export default function AdminPoliciesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const { policies, updatePolicy } = useAdminStore();

  const [externalSharingAllowed, setExternalSharingAllowed] = useState(
    policies.externalSharingAllowed
  );
  const [maxBookingHours, setMaxBookingHours] = useState(policies.maxBookingHours);
  const [permittedHours, setPermittedHours] = useState(policies.permittedHours);
  const [speedLimitKmh, setSpeedLimitKmh] = useState(policies.speedLimitKmh);
  const [requireSecurityQrCheck, setRequireSecurityQrCheck] = useState(
    policies.requireSecurityQrCheck
  );
  const [visitorOvernightParking, setVisitorOvernightParking] = useState(
    policies.visitorOvernightParking
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    updatePolicy({
      externalSharingAllowed,
      maxBookingHours,
      permittedHours,
      speedLimitKmh,
      requireSecurityQrCheck,
      visitorOvernightParking,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Community Parking Policies"
        subtitle="Manage bylaws & security rules"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing.lg,
            paddingBottom: insets.bottom + 90,
          },
        ]}
      >
        {/* Status Card */}
        <AppCard style={{ marginTop: spacing.xs, padding: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <AppText variant="h3">Society Parking Bylaws</AppText>
              <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                Last updated: {policies.updatedAt} by {policies.updatedBy}
              </AppText>
            </View>
            <AppBadge label="ACTIVE RULES" variant="primary" size="sm" />
          </View>
        </AppCard>

        {/* Policy Section 1: External Sharing */}
        <View style={{ marginTop: spacing.lg }}>
          <AppText variant="h4" weight="bold">
            1. Marketplace & Access Permissions
          </AppText>

          <AppCard style={{ marginTop: spacing.sm, padding: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <AppText variant="bodyBold">Allow External Resident Bay Sharing</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                  Enables verified residents to list allotted unused parking bays for community commuters.
                </AppText>
              </View>
              <Switch
                value={externalSharingAllowed}
                onValueChange={setExternalSharingAllowed}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={isDark ? '#000' : '#fff'}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.borderSubtle, marginVertical: spacing.md }]} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <AppText variant="bodyBold">Mandatory Gate QR & Plate Inspection</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                  Guards at Gate 2 must verify booking pass and license plate before opening barrier.
                </AppText>
              </View>
              <Switch
                value={requireSecurityQrCheck}
                onValueChange={setRequireSecurityQrCheck}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={isDark ? '#000' : '#fff'}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.borderSubtle, marginVertical: spacing.md }]} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <AppText variant="bodyBold">Overnight Commuter Parking</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                  Allows bookings extending between 11:00 PM and 06:00 AM.
                </AppText>
              </View>
              <Switch
                value={visitorOvernightParking}
                onValueChange={setVisitorOvernightParking}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={isDark ? '#000' : '#fff'}
              />
            </View>
          </AppCard>
        </View>

        {/* Policy Section 2: Time Limits & Hours */}
        <View style={{ marginTop: spacing.xl }}>
          <AppText variant="h4" weight="bold">
            2. Permitted Windows & Durations
          </AppText>

          <AppCard style={{ marginTop: spacing.sm, padding: spacing.md }}>
            <AppText variant="bodyBold">Maximum Booking Duration</AppText>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.xs }}>
              {[4, 8, 12, 24].map((hrs) => {
                const isSel = maxBookingHours === hrs;
                return (
                  <Pressable
                    key={hrs}
                    onPress={() => setMaxBookingHours(hrs)}
                    style={[
                      styles.choiceChip,
                      {
                        backgroundColor: isSel ? colors.pricePinBg : colors.surfaceSubtle,
                        borderColor: isSel ? colors.primary : colors.border,
                        borderRadius: radius.pill,
                      },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      weight={isSel ? 'bold' : 'medium'}
                      color={isSel ? colors.pricePinText : colors.text}
                    >
                      {hrs === 24 ? 'Full Day' : `${hrs} hrs`}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <AppText variant="bodyBold" style={{ marginTop: spacing.md }}>
              Permitted Operating Hours
            </AppText>
            <View style={{ marginTop: spacing.xs, gap: 8 }}>
              {[
                '24 Hours (Continuous Entry)',
                '07:00 AM – 11:00 PM (Standard Daytime)',
                '08:00 AM – 08:00 PM (Business Hours Only)',
              ].map((hrs) => {
                const isSel = permittedHours === hrs;
                return (
                  <Pressable
                    key={hrs}
                    onPress={() => setPermittedHours(hrs)}
                    style={[
                      styles.choiceRow,
                      {
                        backgroundColor: isSel ? colors.surfaceSubtle : colors.surface,
                        borderColor: isSel ? colors.primary : colors.border,
                        borderRadius: radius.md,
                        padding: spacing.sm,
                        borderWidth: isSel ? 2 : 1,
                      },
                    ]}
                  >
                    <AppText variant="captionSmall" style={{ flex: 1 }}>{hrs}</AppText>
                    <AppIcon
                      name={isSel ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={isSel ? (isDark ? colors.primary : '#49570B') : colors.secondaryText}
                    />
                  </Pressable>
                );
              })}
            </View>
          </AppCard>
        </View>

        {/* Policy Section 3: Safety & Speed Limit */}
        <View style={{ marginTop: spacing.xl }}>
          <AppText variant="h4" weight="bold">
            3. Campus Safety Rules
          </AppText>

          <AppCard style={{ marginTop: spacing.sm, padding: spacing.md }}>
            <AppText variant="bodyBold">Internal Premises Speed Limit</AppText>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.xs }}>
              {[10, 15, 20].map((spd) => {
                const isSel = speedLimitKmh === spd;
                return (
                  <Pressable
                    key={spd}
                    onPress={() => setSpeedLimitKmh(spd)}
                    style={[
                      styles.choiceChip,
                      {
                        backgroundColor: isSel ? colors.pricePinBg : colors.surfaceSubtle,
                        borderColor: isSel ? colors.primary : colors.border,
                        borderRadius: radius.pill,
                      },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      weight={isSel ? 'bold' : 'medium'}
                      color={isSel ? colors.pricePinText : colors.text}
                    >
                      {spd} km/h {spd === 10 ? '(Bylaw)' : ''}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </AppCard>
        </View>

        {/* Save Banner */}
        {saveSuccess && (
          <View
            style={[
              styles.successBanner,
              {
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                borderColor: colors.success,
                borderRadius: radius.md,
                padding: spacing.sm,
                marginTop: spacing.md,
              },
            ]}
          >
            <AppText variant="captionSmall" weight="bold" color={colors.success}>
              ✓ Community parking policies updated and logged to audit records!
            </AppText>
          </View>
        )}

        <View style={{ marginTop: spacing.lg }}>
          <AppButton
            title="Save Community Policies"
            onPress={handleSave}
            variant="primary"
            size="lg"
            leftIcon={<AppIcon name="save-outline" size={18} color={colors.primaryForeground} />}
          />
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
  divider: {
    height: 1,
  },
  choiceChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  successBanner: {
    borderWidth: 1,
  },
});
