import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useAuthStore } from '../../src/store/useAuthStore';
import { UserRole } from '../../src/types/user';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon, IconName } from '../../src/components/ui/AppIcon';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppBadge } from '../../src/components/ui/AppBadge';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, mode, setMode } = useTheme();

  const { user, switchRole, vehicles } = useAuthStore();

  const handleRoleChange = (role: UserRole) => {
    switchRole(role);
    if (role === 'owner') {
      router.push('/owner' as any);
    } else if (role === 'security') {
      router.push('/security/verify' as any);
    }
  };

  const roleOptions: { role: UserRole; title: string; subtitle: string; icon: IconName }[] = [
    {
      role: 'customer',
      title: 'Customer Mode',
      subtitle: 'Discover, reserve and park in community spots',
      icon: 'car-sport-outline',
    },
    {
      role: 'owner',
      title: 'Owner Mode',
      subtitle: 'List spaces, manage calendar and track payouts',
      icon: 'business-outline',
    },
    {
      role: 'security',
      title: 'Security Staff Mode',
      subtitle: 'QR check, vehicle entry and guard incentive logging',
      icon: 'shield-checkmark-outline',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Account & Roles" subtitle="Manage profile and access modes" />

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
        {/* User Profile Card */}
        <AppCard style={{ marginTop: spacing.sm }}>
          <View style={styles.profileHeader}>
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: colors.primary, borderRadius: radius.pill },
              ]}
            >
              <AppText variant="h2" weight="extraBold" color={colors.primaryForeground}>
                {user.name.charAt(0)}
              </AppText>
            </View>

            <View style={{ flex: 1, marginLeft: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <AppText variant="h3">{user.name}</AppText>
                <AppBadge label="Verified" variant="primary" size="sm" style={{ marginLeft: 8 }} />
              </View>
              <AppText variant="caption" color={colors.secondaryText} style={{ marginTop: 2 }}>
                {user.email}
              </AppText>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                {user.communityName}
              </AppText>
            </View>
          </View>
        </AppCard>

        {/* Unified Experience Multi-Role Switcher */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={styles.sectionHeader}>
            <AppText variant="h3">Unified Account Mode</AppText>
            <AppBadge label="Permission-Controlled" variant="default" size="sm" />
          </View>
          <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
            Switch between authorized operational roles in one unified profile.
          </AppText>

          <View style={{ marginTop: spacing.md }}>
            {roleOptions.map((opt) => {
              const isSelected = user.activeRole === opt.role;
              return (
                <Pressable
                  key={opt.role}
                  onPress={() => handleRoleChange(opt.role)}
                  style={({ pressed }) => [
                    styles.roleCard,
                    {
                      backgroundColor: isSelected ? colors.surfaceSubtle : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderRadius: radius.card,
                      padding: spacing.md,
                      borderWidth: isSelected ? 2 : 1,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.roleIcon,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceSubtle,
                      },
                    ]}
                  >
                    <AppIcon
                      name={opt.icon}
                      size={20}
                      color={isSelected ? colors.primaryForeground : colors.text}
                    />
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <AppText variant="bodyBold">{opt.title}</AppText>
                      {isSelected && (
                        <AppBadge label="ACTIVE" variant="primary" size="sm" style={{ marginLeft: 6 }} />
                      )}
                    </View>
                    <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                      {opt.subtitle}
                    </AppText>
                  </View>

                  <AppIcon
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={isSelected ? colors.primary : colors.secondaryText}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Appearance & Theme Selector */}
        <View style={{ marginTop: spacing.xl }}>
          <AppText variant="h3">Appearance Theme</AppText>
          <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
            Choose your preferred color theme
          </AppText>

          <View style={[styles.themeRow, { marginTop: spacing.md }]}>
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

        {/* Registered Vehicles Summary */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={styles.sectionHeader}>
            <AppText variant="h3">Registered Vehicles</AppText>
            <AppText variant="caption" weight="bold" color={colors.primaryForeground === '#171A18' && colors.background === '#171A18' ? colors.primary : '#49570B'}>
              + Add Vehicle
            </AppText>
          </View>

          <View style={{ marginTop: spacing.sm }}>
            {vehicles.map((veh) => (
              <AppCard key={veh.id} style={{ marginBottom: 10, padding: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={[
                      styles.vehIconCircle,
                      { backgroundColor: colors.surfaceSubtle },
                    ]}
                  >
                    <AppIcon name="car" size={20} color={colors.text} />
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <AppText variant="bodyBold">
                      {veh.make} {veh.model}
                    </AppText>
                    <AppText variant="captionSmall" color={colors.secondaryText}>
                      Plate: {veh.licensePlate} • {veh.color}
                    </AppText>
                  </View>

                  {veh.isDefault && (
                    <AppBadge label="DEFAULT" variant="default" size="sm" />
                  )}
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  vehIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
