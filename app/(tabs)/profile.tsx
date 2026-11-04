import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
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
import { AppButton } from '../../src/components/ui/AppButton';
import { AppInput } from '../../src/components/ui/AppInput';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, mode, setMode, isDark } = useTheme();

  const { user, switchRole, vehicles, updateProfile } = useAuthStore();

  // Edit Profile Modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editPhone, setEditPhone] = useState(user.phone);
  const [editCity, setEditCity] = useState(user.city);

  const openEditProfile = () => {
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone);
    setEditCity(user.city);
    setIsEditProfileOpen(true);
  };

  const saveProfile = () => {
    updateProfile({
      name: editName.trim() || user.name,
      email: editEmail.trim() || user.email,
      phone: editPhone.trim() || user.phone,
      city: editCity.trim() || user.city,
    });
    setIsEditProfileOpen(false);
  };

  const handleRoleChange = (role: UserRole) => {
    switchRole(role);
    if (role === 'owner') {
      router.push('/owner' as any);
    } else if (role === 'security') {
      router.push('/security' as any);
    } else if (role === 'community_admin') {
      router.push('/admin' as any);
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
    {
      role: 'community_admin',
      title: 'Community Administrator Mode',
      subtitle: 'Review slot approvals, manage policies, staff & audit log',
      icon: 'shield-half-outline',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Account & Profile"
        subtitle="Manage settings, vehicles & roles"
        rightAction={
          <Pressable
            onPress={() => router.push('/notifications' as any)}
            hitSlop={8}
            style={styles.notifHeaderBtn}
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
        {/* User Profile Card */}
        <AppCard style={{ marginTop: spacing.sm, padding: spacing.md }}>
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
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                <AppText variant="h3">{user.name}</AppText>
                <AppBadge label="RWA VERIFIED" variant="primary" size="sm" />
              </View>
              <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                {user.email} • {user.phone}
              </AppText>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                {user.communityName}
              </AppText>
              <AppText variant="captionSmall" color={colors.primary} weight="semiBold" style={{ marginTop: 2 }}>
                Member since {user.memberSince}
              </AppText>
            </View>
          </View>

          <View style={[styles.profileCardFooter, { borderTopColor: colors.border, borderTopWidth: 1, marginTop: 12, paddingTop: 10 }]}>
            <AppButton
              title="Edit Profile Details"
              variant="outline"
              size="sm"
              onPress={openEditProfile}
              leftIcon={<AppIcon name="create-outline" size={16} color={colors.text} />}
            />
          </View>
        </AppCard>

        {/* Account Management Modules */}
        <View style={{ marginTop: spacing.xl }}>
          <AppText variant="h3">Account Management</AppText>
          <View style={{ marginTop: spacing.sm, gap: 10 }}>
            {/* 1. Vehicle Management */}
            <Pressable
              onPress={() => router.push('/profile/vehicles' as any)}
              style={({ pressed }) => [
                styles.navCard,
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
                <AppIcon name="car-outline" size={22} color={isDark ? colors.primary : '#49570B'} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <AppText variant="bodyBold">Vehicle Management</AppText>
                  <AppBadge label={`${vehicles.length} REGISTERED`} variant="default" size="sm" />
                </View>
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                  Add two-wheelers, sedans, SUVs, EVs & license plates
                </AppText>
              </View>
              <AppIcon name="chevron-forward" size={18} color={colors.secondaryText} />
            </Pressable>

            {/* 2. Saved Places */}
            <Pressable
              onPress={() => router.push('/profile/saved-places' as any)}
              style={({ pressed }) => [
                styles.navCard,
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
                <AppIcon name="location-outline" size={22} color={colors.text} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <AppText variant="bodyBold">Saved Places</AppText>
                  <AppBadge label={`${user.savedPlaces.length} PLACES`} variant="default" size="sm" />
                </View>
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                  Home, Office, Gym & frequent parking destinations
                </AppText>
              </View>
              <AppIcon name="chevron-forward" size={18} color={colors.secondaryText} />
            </Pressable>

            {/* 3. Account Preferences */}
            <Pressable
              onPress={() => router.push('/profile/preferences' as any)}
              style={({ pressed }) => [
                styles.navCard,
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
                <AppIcon name="settings-outline" size={22} color={colors.text} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText variant="bodyBold">Preferences & Notifications</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                  Default vehicle, push alerts, languages & appearance
                </AppText>
              </View>
              <AppIcon name="chevron-forward" size={18} color={colors.secondaryText} />
            </Pressable>

            {/* 4. Privacy & Gate Policy */}
            <Pressable
              onPress={() => router.push('/profile/privacy' as any)}
              style={({ pressed }) => [
                styles.navCard,
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
                <AppIcon name="shield-checkmark-outline" size={22} color={colors.text} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText variant="bodyBold">Privacy & Society Gate Governance</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                  Plate sharing rules, RWA data policies & security advice
                </AppText>
              </View>
              <AppIcon name="chevron-forward" size={18} color={colors.secondaryText} />
            </Pressable>
          </View>
        </View>

        {/* Support & Help Center */}
        <View style={{ marginTop: spacing.xl }}>
          <AppText variant="h3">Help & Support</AppText>
          <View style={{ marginTop: spacing.sm, gap: 10 }}>
            {/* 1. Help Centre & FAQ */}
            <Pressable
              onPress={() => router.push('/support' as any)}
              style={({ pressed }) => [
                styles.navCard,
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
                <AppIcon name="help-circle-outline" size={22} color={isDark ? colors.primary : '#49570B'} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText variant="bodyBold">Community Help Centre & FAQs</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                  Booking guides, gate scanner instructions & refunds
                </AppText>
              </View>
              <AppIcon name="chevron-forward" size={18} color={colors.secondaryText} />
            </Pressable>

            {/* 2. My Support Tickets */}
            <Pressable
              onPress={() => router.push('/support/tickets' as any)}
              style={({ pressed }) => [
                styles.navCard,
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
                <AppIcon name="chatbubble-ellipses-outline" size={22} color={colors.text} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText variant="bodyBold">Reported Issues & Tickets</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                  Track support ticket status & resolutions
                </AppText>
              </View>
              <AppIcon name="chevron-forward" size={18} color={colors.secondaryText} />
            </Pressable>
          </View>
        </View>

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

        {/* Information & Portals Links */}
        <View style={{ marginTop: spacing.xl }}>
          <AppText variant="h3">Community & Portals</AppText>
          <View style={{ marginTop: spacing.sm, gap: 10 }}>
            <Pressable
              onPress={() => router.push('/owner' as any)}
              style={({ pressed }) => [
                styles.navCard,
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
                <AppIcon name="business-outline" size={22} color={isDark ? colors.primary : '#49570B'} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText variant="bodyBold">Owner Dashboard & Listings</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                  Manage spaces, toggle live availability & track earnings
                </AppText>
              </View>
              <AppIcon name="chevron-forward" size={18} color={colors.secondaryText} />
            </Pressable>

            <Pressable
              onPress={() => router.push('/security' as any)}
              style={({ pressed }) => [
                styles.navCard,
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
                <AppIcon name="shield-checkmark-outline" size={22} color={colors.text} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText variant="bodyBold">Security Personnel Portal</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                  Gate 2 boom barrier duty, QR scanner & guard incentive log
                </AppText>
              </View>
              <AppIcon name="chevron-forward" size={18} color={colors.secondaryText} />
            </Pressable>

            <Pressable
              onPress={() => router.push('/admin' as any)}
              style={({ pressed }) => [
                styles.navCard,
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
                <AppIcon name="shield-half-outline" size={22} color={isDark ? colors.primary : '#49570B'} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText variant="bodyBold">Community Admin Portal</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                  RWA listing certifications, society bylaws, staff & audit log
                </AppText>
              </View>
              <AppIcon name="chevron-forward" size={18} color={colors.secondaryText} />
            </Pressable>

            <Pressable
              onPress={() => router.push('/about' as any)}
              style={({ pressed }) => [
                styles.navCard,
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
                <AppIcon name="information-circle-outline" size={22} color={isDark ? colors.primary : '#49570B'} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText variant="bodyBold">About CommunityPark</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                  Mission, 4 access workflows & community guidelines
                </AppText>
              </View>
              <AppIcon name="chevron-forward" size={18} color={colors.secondaryText} />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditProfileOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditProfileOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.surface,
                borderTopLeftRadius: radius.xl,
                borderTopRightRadius: radius.xl,
                paddingBottom: insets.bottom + 20,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <AppText variant="h3">Edit Profile Details</AppText>
              <Pressable onPress={() => setIsEditProfileOpen(false)} hitSlop={12}>
                <AppIcon name="close" size={24} color={colors.secondaryText} />
              </Pressable>
            </View>

            <View style={{ gap: 12, marginTop: 12 }}>
              <AppInput
                label="Full Name"
                placeholder="Your Full Name"
                value={editName}
                onChangeText={setEditName}
              />
              <AppInput
                label="Email Address"
                placeholder="you@example.com"
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <AppInput
                label="Mobile Number"
                placeholder="+91 98450 00000"
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
              />
              <AppInput
                label="Primary City"
                placeholder="Bengaluru, Mumbai"
                value={editCity}
                onChangeText={setEditCity}
              />
            </View>

            <View style={{ marginTop: 20 }}>
              <AppButton
                title="Save Profile"
                variant="primary"
                size="lg"
                onPress={saveProfile}
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
  profileCardFooter: {},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  notifHeaderBtn: {
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
});
