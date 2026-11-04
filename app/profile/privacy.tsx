import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useAuthStore } from '../../src/store/useAuthStore';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppBadge } from '../../src/components/ui/AppBadge';
import { AppButton } from '../../src/components/ui/AppButton';

export default function PrivacySettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const { user, updatePrivacySetting } = useAuthStore();
  const priv = user.preferences.privacySettings;

  const handleRequestDataExport = () => {
    Alert.alert(
      'Account Data Export (Simulation)',
      `An encrypted archive containing your profile details, registered vehicles (${user.name}), and booking history is generated.\n\nIn a production deployment, this archive is securely dispatched to your registered email (${user.email}).`,
      [{ text: 'Download Summary', style: 'default' }, { text: 'Done', style: 'cancel' }]
    );
  };

  const handleDeleteAccountNotice = () => {
    Alert.alert(
      'Account Deletion Workflow',
      'Under CommunityPark governance guidelines, full account erasure requires settling all outstanding parking bookings, verifying zero active vehicle visits in gated premises, and withdrawing remaining wallet funds.\n\nThis is a prototype demonstration; production deletion requires backend database cascades.',
      [{ text: 'Understood', style: 'default' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Privacy & Responsibility"
        subtitle="Data governance, transparency & society rules"
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
        {/* Prototype Transparency Notice */}
        <View
          style={[
            styles.demoBanner,
            {
              backgroundColor: 'rgba(234, 179, 8, 0.12)',
              borderColor: colors.warning,
              borderRadius: radius.md,
              padding: spacing.md,
              marginTop: spacing.xs,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <AppIcon name="lock-closed" size={16} color={colors.warning} />
            <AppText variant="captionSmall" weight="bold" color={colors.warning}>
              TRANSPARENCY & COMMUNITY DATA DISCLOSURE
            </AppText>
          </View>
          <AppText variant="captionSmall" color={colors.warning} style={{ marginTop: 4 }}>
            CommunityPark operates within residential gated societies. To ensure resident safety and lawful property access, essential vehicle and visitor details are shared with authorized estate security officers.
          </AppText>
        </View>

        {/* 1. What Information is Shared */}
        <View style={{ marginTop: spacing.lg }}>
          <AppText variant="h3">Data Shared with Estate Security</AppText>
          <AppCard style={{ marginTop: spacing.sm, padding: spacing.md }}>
            <View style={styles.dataItem}>
              <View style={[styles.dataIcon, { backgroundColor: colors.surfaceSubtle }]}>
                <AppIcon name="car-outline" size={20} color={colors.text} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText variant="bodyBold">Vehicle License Plate & Model</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                  Required by RWA security staff at the boom barrier to verify authorized vehicle entry and prevent unauthorized parking.
                </AppText>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.dataItem}>
              <View style={[styles.dataIcon, { backgroundColor: colors.surfaceSubtle }]}>
                <AppIcon name="time-outline" size={20} color={colors.text} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText variant="bodyBold">Reservation Time Window</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                  Guards cross-reference active booking start and end times to manage visitor bays and internal society traffic.
                </AppText>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.dataItem}>
              <View style={[styles.dataIcon, { backgroundColor: colors.surfaceSubtle }]}>
                <AppIcon name="person-outline" size={20} color={colors.text} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText variant="bodyBold">Driver Name & Contact Number</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                  Used strictly for gate intercom verification and emergency communication (e.g., blocking access or lights left on).
                </AppText>
              </View>
            </View>
          </AppCard>
        </View>

        {/* 2. Privacy Controls */}
        <View style={{ marginTop: spacing.xl }}>
          <AppText variant="h3">Privacy Controls</AppText>
          <AppCard style={{ marginTop: spacing.sm, padding: spacing.md }}>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <AppText variant="bodyBold">Display Full Plate to Guards</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText}>
                  Allow security personnel to view full plate on scanner
                </AppText>
              </View>
              <Switch
                value={priv.sharePlateWithGuards}
                onValueChange={(val) =>
                  updatePrivacySetting('sharePlateWithGuards', val)
                }
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.toggleRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <AppText variant="bodyBold">Show Profile Avatar to Hosts</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText}>
                  Allow space owners to see your photo upon booking
                </AppText>
              </View>
              <Switch
                value={priv.showProfilePhotoToHosts}
                onValueChange={(val) =>
                  updatePrivacySetting('showProfilePhotoToHosts', val)
                }
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.toggleRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <AppText variant="bodyBold">Direct Contact Sharing with Hosts</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText}>
                  Share mobile number with host for driveway access coordination
                </AppText>
              </View>
              <Switch
                value={priv.shareContactWithOwners}
                onValueChange={(val) =>
                  updatePrivacySetting('shareContactWithOwners', val)
                }
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
          </AppCard>
        </View>

        {/* 3. Account Security Recommendations */}
        <View style={{ marginTop: spacing.xl }}>
          <AppText variant="h3">Security Recommendations</AppText>
          <AppCard style={{ marginTop: spacing.sm, padding: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <AppIcon name="shield-checkmark-outline" size={20} color={colors.success} />
              <AppText variant="bodyBold">One-Time Digital QR Passes</AppText>
            </View>
            <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 4 }}>
              Never screenshot or forward gate QR passes to third parties. Each pass is cryptographically tied to your registered vehicle registration number.
            </AppText>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <AppIcon name="speedometer-outline" size={20} color={colors.warning} />
              <AppText variant="bodyBold">Society Speed Limits</AppText>
            </View>
            <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 4 }}>
              Adhere to the 10 km/h internal speed limit within residential basements. Repeated infractions can result in RWA gate blacklisting.
            </AppText>
          </AppCard>
        </View>

        {/* 4. Data Rights & Export */}
        <View style={{ marginTop: spacing.xl, gap: 12 }}>
          <AppButton
            title="Export My Account Data (JSON/PDF)"
            variant="outline"
            size="md"
            onPress={handleRequestDataExport}
            leftIcon={<AppIcon name="download-outline" size={18} color={colors.text} />}
          />

          <AppButton
            title="Request Account Deletion"
            variant="outline"
            size="md"
            onPress={handleDeleteAccountNotice}
            leftIcon={<AppIcon name="trash-outline" size={18} color={colors.error} />}
            textStyle={{ color: colors.error }}
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
  demoBanner: {
    borderWidth: 1,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dataIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
});
