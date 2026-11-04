import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useAuthStore } from '../../src/store/useAuthStore';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon, IconName } from '../../src/components/ui/AppIcon';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppBadge } from '../../src/components/ui/AppBadge';

const LANGUAGES = [
  { code: 'en', label: 'English (IN)' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
];

export default function AccountPreferencesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, mode, setMode, isDark } = useTheme();

  const {
    user,
    vehicles,
    setDefaultVehicle,
    updatePreferences,
    updateNotificationToggle,
    updatePrivacySetting,
  } = useAuthStore();

  const prefs = user.preferences;

  const handleLanguageChange = (langLabel: string) => {
    updatePreferences({ language: langLabel });
    Alert.alert('Language Preference', `Locale set to ${langLabel}. Multilingual string tables will activate in full production.`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Account Preferences"
        subtitle="Manage notifications, vehicles & appearance"
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
        {/* Preferred Default Vehicle */}
        <View style={{ marginTop: spacing.md }}>
          <View style={styles.sectionHeader}>
            <AppText variant="h3">Default Booking Vehicle</AppText>
            <Pressable onPress={() => router.push('/profile/vehicles' as any)}>
              <AppText variant="caption" weight="bold" color={isDark ? colors.primary : '#49570B'}>
                Manage Vehicles
              </AppText>
            </Pressable>
          </View>
          <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
            Auto-selected for new spot reservations and gate QR passes
          </AppText>

          <View style={{ marginTop: spacing.sm, gap: 8 }}>
            {vehicles.map((v) => {
              const isDefault = v.isDefault;
              return (
                <Pressable
                  key={v.id}
                  onPress={() => setDefaultVehicle(v.id)}
                  style={[
                    styles.prefCard,
                    {
                      backgroundColor: isDefault ? colors.surfaceSubtle : colors.surface,
                      borderColor: isDefault ? colors.primary : colors.border,
                      borderRadius: radius.card,
                      padding: spacing.md,
                      borderWidth: isDefault ? 2 : 1,
                    },
                  ]}
                >
                  <AppIcon
                    name={v.type === 'ev' ? 'flash' : 'car'}
                    size={20}
                    color={isDefault ? colors.primary : colors.text}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <AppText variant="bodyBold">
                      {v.make} {v.model}
                    </AppText>
                    <AppText variant="captionSmall" color={colors.secondaryText}>
                      Plate: {v.licensePlate} • {v.color}
                    </AppText>
                  </View>
                  <AppIcon
                    name={isDefault ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={isDefault ? colors.primary : colors.secondaryText}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Appearance Theme */}
        <View style={{ marginTop: spacing.xl }}>
          <AppText variant="h3">Appearance Theme</AppText>
          <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
            Switch between dark, light or follow device system
          </AppText>

          <View style={[styles.themeRow, { marginTop: spacing.sm }]}>
            {(['light', 'dark', 'system'] as const).map((thm) => {
              const isSelected = mode === thm;
              const labels = { light: 'Light', dark: 'Dark', system: 'Follow System' };
              const icons: Record<string, IconName> = {
                light: 'sunny-outline',
                dark: 'moon-outline',
                system: 'phone-portrait-outline',
              };

              return (
                <Pressable
                  key={thm}
                  onPress={() => setMode(thm)}
                  style={[
                    styles.themeBtn,
                    {
                      backgroundColor: isSelected ? colors.pricePinBg : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderRadius: radius.md,
                      paddingVertical: spacing.md,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <AppIcon
                    name={icons[thm]}
                    size={20}
                    color={isSelected ? colors.primary : colors.secondaryText}
                  />
                  <AppText
                    variant="caption"
                    weight={isSelected ? 'bold' : 'medium'}
                    color={isSelected ? colors.pricePinText : colors.text}
                    style={{ marginTop: 6 }}
                  >
                    {labels[thm]}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Notification Preferences */}
        <View style={{ marginTop: spacing.xl }}>
          <AppText variant="h3">Push Notifications</AppText>
          <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
            Control real-time alerts on your device
          </AppText>

          <AppCard style={{ marginTop: spacing.sm, padding: spacing.md }}>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <AppText variant="bodyBold">Booking Confirmations & Passes</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText}>
                  Instant QR pass generation and gate access slip
                </AppText>
              </View>
              <Switch
                value={prefs.notificationToggles.bookingConfirmations}
                onValueChange={(val) =>
                  updateNotificationToggle('bookingConfirmations', val)
                }
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            <View style={[styles.toggleDivider, { backgroundColor: colors.border }]} />

            <View style={styles.toggleRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <AppText variant="bodyBold">Expiry & Parking Reminders</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText}>
                  Receive 30-minute and 15-minute validity window alerts
                </AppText>
              </View>
              <Switch
                value={prefs.notificationToggles.bookingReminders}
                onValueChange={(val) =>
                  updateNotificationToggle('bookingReminders', val)
                }
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            <View style={[styles.toggleDivider, { backgroundColor: colors.border }]} />

            <View style={styles.toggleRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <AppText variant="bodyBold">Wallet Debits & Refund Alerts</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText}>
                  Instant notification for payments and refund credits
                </AppText>
              </View>
              <Switch
                value={prefs.notificationToggles.paymentUpdates}
                onValueChange={(val) =>
                  updateNotificationToggle('paymentUpdates', val)
                }
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            <View style={[styles.toggleDivider, { backgroundColor: colors.border }]} />

            <View style={styles.toggleRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <AppText variant="bodyBold">RWA Society & Community Updates</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText}>
                  By-law amendments, speed rules & slot approval notices
                </AppText>
              </View>
              <Switch
                value={prefs.notificationToggles.communityUpdates}
                onValueChange={(val) =>
                  updateNotificationToggle('communityUpdates', val)
                }
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            <View style={[styles.toggleDivider, { backgroundColor: colors.border }]} />

            <View style={styles.toggleRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <AppText variant="bodyBold">Special Offers & Weekend Promos</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText}>
                  Discounts on neighbourhood spots and EV charging
                </AppText>
              </View>
              <Switch
                value={prefs.notificationToggles.promotional}
                onValueChange={(val) =>
                  updateNotificationToggle('promotional', val)
                }
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
          </AppCard>
        </View>

        {/* Language Placeholder */}
        <View style={{ marginTop: spacing.xl }}>
          <AppText variant="h3">Language (भाषा)</AppText>
          <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
            Regional language preference for street directions and instructions
          </AppText>

          <View style={[styles.langGrid, { marginTop: spacing.sm }]}>
            {LANGUAGES.map((l) => {
              const isSel = prefs.language.includes(l.label.split(' ')[0]);
              return (
                <Pressable
                  key={l.code}
                  onPress={() => handleLanguageChange(l.label)}
                  style={[
                    styles.langChip,
                    {
                      backgroundColor: isSel ? colors.pricePinBg : colors.surface,
                      borderColor: isSel ? colors.primary : colors.border,
                      borderRadius: radius.md,
                      padding: spacing.md,
                      borderWidth: isSel ? 2 : 1,
                    },
                  ]}
                >
                  <AppText
                    variant="caption"
                    weight={isSel ? 'bold' : 'medium'}
                    color={isSel ? colors.pricePinText : colors.text}
                  >
                    {l.label}
                  </AppText>
                </Pressable>
              );
            })}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prefCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  toggleDivider: {
    height: 1,
    marginVertical: 4,
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langChip: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
});
