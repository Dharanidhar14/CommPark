import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useAuthStore } from '../../src/store/useAuthStore';
import { SavedPlace } from '../../src/types/user';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon, IconName } from '../../src/components/ui/AppIcon';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppBadge } from '../../src/components/ui/AppBadge';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppInput } from '../../src/components/ui/AppInput';

const PLACE_LABELS: { label: SavedPlace['label']; icon: IconName }[] = [
  { label: 'Home', icon: 'home-outline' },
  { label: 'Office', icon: 'briefcase-outline' },
  { label: 'College', icon: 'school-outline' },
  { label: 'Gym', icon: 'fitness-outline' },
  { label: 'Custom', icon: 'location-outline' },
];

export default function SavedPlacesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const { user, addSavedPlace, updateSavedPlace, removeSavedPlace } = useAuthStore();
  const savedPlaces = user.savedPlaces || [];

  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<SavedPlace['label']>('Home');
  const [customName, setCustomName] = useState('');
  const [address, setAddress] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setSelectedLabel('Home');
    setCustomName('');
    setAddress('');
    setLocality('');
    setCity('Bengaluru');
    setFormError('');
    setModalMode('add');
  };

  const openEditModal = (place: SavedPlace) => {
    setEditingId(place.id);
    setSelectedLabel(place.label);
    setCustomName(place.customName || '');
    setAddress(place.address);
    setLocality(place.locality);
    setCity(place.city);
    setFormError('');
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingId(null);
  };

  const handleSavePlace = () => {
    if (!address.trim() || !locality.trim() || !city.trim()) {
      setFormError('Please enter the street address, locality and city.');
      return;
    }

    if (modalMode === 'add') {
      addSavedPlace({
        label: selectedLabel,
        customName: selectedLabel === 'Custom' ? customName.trim() : undefined,
        address: address.trim(),
        locality: locality.trim(),
        city: city.trim(),
        coordinates: { latitude: 12.9716, longitude: 77.6412 },
      });
    } else if (modalMode === 'edit' && editingId) {
      updateSavedPlace(editingId, {
        label: selectedLabel,
        customName: selectedLabel === 'Custom' ? customName.trim() : undefined,
        address: address.trim(),
        locality: locality.trim(),
        city: city.trim(),
      });
    }

    closeModal();
  };

  const handleDeletePlace = (place: SavedPlace) => {
    const title = place.customName || place.label;
    Alert.alert('Remove Saved Place', `Delete "${title}" from your saved destinations?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => removeSavedPlace(place.id),
      },
    ]);
  };

  const getLabelIcon = (label: SavedPlace['label']): IconName => {
    switch (label) {
      case 'Home':
        return 'home';
      case 'Office':
        return 'briefcase';
      case 'College':
        return 'school';
      case 'Gym':
        return 'fitness';
      case 'Custom':
        return 'location';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Saved Places"
        subtitle="Quick one-tap destinations & parking search"
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
        <View style={styles.topActionRow}>
          <View>
            <AppText variant="h3">Your Locations ({savedPlaces.length})</AppText>
            <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
              Used to find nearby community parking automatically
            </AppText>
          </View>
          <AppButton
            title="+ Add Place"
            variant="primary"
            size="sm"
            onPress={openAddModal}
          />
        </View>

        <View style={{ marginTop: spacing.md, gap: 12 }}>
          {savedPlaces.map((sp) => {
            const iconName = getLabelIcon(sp.label);
            const displayName = sp.customName || sp.label;

            return (
              <AppCard key={sp.id} style={styles.placeCard}>
                <View style={styles.cardTop}>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: colors.surfaceSubtle },
                    ]}
                  >
                    <AppIcon name={iconName} size={22} color={isDark ? colors.primary : '#49570B'} />
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <AppText variant="bodyBold">{displayName}</AppText>
                      <AppBadge label={sp.label.toUpperCase()} variant="default" size="sm" />
                    </View>
                    <AppText variant="caption" color={colors.text} style={{ marginTop: 3 }}>
                      {sp.address}
                    </AppText>
                    <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                      {sp.locality}, {sp.city}
                    </AppText>
                  </View>
                </View>

                {/* Card Actions */}
                <View
                  style={[
                    styles.cardFooter,
                    {
                      borderTopColor: colors.border,
                      borderTopWidth: 1,
                      marginTop: 12,
                      paddingTop: 10,
                    },
                  ]}
                >
                  <Pressable
                    onPress={() => router.push('/(tabs)/explore' as any)}
                    hitSlop={8}
                    style={styles.actionBtn}
                  >
                    <AppIcon name="search-outline" size={16} color={isDark ? colors.primary : '#49570B'} />
                    <AppText
                      variant="captionSmall"
                      weight="bold"
                      color={isDark ? colors.primary : '#49570B'}
                      style={{ marginLeft: 4 }}
                    >
                      Find Parking Nearby
                    </AppText>
                  </Pressable>

                  <View style={{ flexDirection: 'row', gap: 14, marginLeft: 'auto' }}>
                    <Pressable
                      onPress={() => openEditModal(sp)}
                      hitSlop={8}
                      style={styles.actionBtn}
                    >
                      <AppIcon name="create-outline" size={16} color={colors.text} />
                      <AppText variant="captionSmall" color={colors.text} style={{ marginLeft: 4 }}>
                        Edit
                      </AppText>
                    </Pressable>

                    <Pressable
                      onPress={() => handleDeletePlace(sp)}
                      hitSlop={8}
                      style={styles.actionBtn}
                    >
                      <AppIcon name="trash-outline" size={16} color={colors.error} />
                      <AppText variant="captionSmall" color={colors.error} style={{ marginLeft: 4 }}>
                        Delete
                      </AppText>
                    </Pressable>
                  </View>
                </View>
              </AppCard>
            );
          })}
        </View>
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal
        visible={modalMode !== null}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
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
              <AppText variant="h3">
                {modalMode === 'add' ? 'Save New Destination' : 'Edit Saved Place'}
              </AppText>
              <Pressable onPress={closeModal} hitSlop={12}>
                <AppIcon name="close" size={24} color={colors.secondaryText} />
              </Pressable>
            </View>

            {formError.length > 0 && (
              <View
                style={[
                  styles.formErrorBox,
                  { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: radius.sm },
                ]}
              >
                <AppText variant="captionSmall" color={colors.error}>
                  {formError}
                </AppText>
              </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {/* Category Pills */}
              <AppText variant="caption" weight="bold" color={colors.secondaryText} style={{ marginTop: 10 }}>
                PLACE CATEGORY
              </AppText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, marginTop: 8 }}
              >
                {PLACE_LABELS.map((p) => {
                  const isSel = selectedLabel === p.label;
                  return (
                    <Pressable
                      key={p.label}
                      onPress={() => setSelectedLabel(p.label)}
                      style={[
                        styles.labelPill,
                        {
                          backgroundColor: isSel ? colors.pricePinBg : colors.surfaceSubtle,
                          borderColor: isSel ? colors.primary : colors.border,
                          borderRadius: radius.pill,
                          borderWidth: isSel ? 2 : 1,
                        },
                      ]}
                    >
                      <AppIcon
                        name={p.icon}
                        size={16}
                        color={isSel ? colors.pricePinText : colors.text}
                      />
                      <AppText
                        variant="captionSmall"
                        weight={isSel ? 'bold' : 'medium'}
                        color={isSel ? colors.pricePinText : colors.text}
                        style={{ marginLeft: 6 }}
                      >
                        {p.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {selectedLabel === 'Custom' && (
                <View style={{ marginTop: 14 }}>
                  <AppInput
                    label="Place Name / Label"
                    placeholder="e.g. Grandma's House, Tennis Club"
                    value={customName}
                    onChangeText={setCustomName}
                  />
                </View>
              )}

              <View style={{ marginTop: 14 }}>
                <AppInput
                  label="Street Address / Building"
                  placeholder="e.g. Flat B-402, Greenwood Palms, 14th Main Rd"
                  value={address}
                  onChangeText={setAddress}
                />
              </View>

              <View style={{ marginTop: 12 }}>
                <AppInput
                  label="Locality / Neighborhood"
                  placeholder="e.g. Indiranagar, Koramangala, Bandra West"
                  value={locality}
                  onChangeText={setLocality}
                />
              </View>

              <View style={{ marginTop: 12 }}>
                <AppInput
                  label="City"
                  placeholder="e.g. Bengaluru, Mumbai"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
            </ScrollView>

            <View style={{ marginTop: 16 }}>
              <AppButton
                title={modalMode === 'add' ? 'Save Destination' : 'Save Changes'}
                variant="primary"
                size="lg"
                onPress={handleSavePlace}
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
  topActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  placeCard: {
    padding: 14,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
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
  formErrorBox: {
    padding: 8,
    marginBottom: 8,
  },
  labelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
