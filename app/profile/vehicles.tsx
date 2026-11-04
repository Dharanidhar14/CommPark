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
import { useBookingStore } from '../../src/store/useBookingStore';
import { RegisteredVehicle } from '../../src/types/booking';
import { VehicleType } from '../../src/types/parking';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon, IconName } from '../../src/components/ui/AppIcon';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppBadge } from '../../src/components/ui/AppBadge';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppInput } from '../../src/components/ui/AppInput';

const VEHICLE_TYPES: { type: VehicleType; label: string; icon: IconName }[] = [
  { type: 'motorcycle', label: 'Two-Wheeler', icon: 'bicycle-outline' },
  { type: 'hatchback', label: 'Hatchback', icon: 'car-sport-outline' },
  { type: 'sedan', label: 'Sedan', icon: 'car-outline' },
  { type: 'suv', label: 'SUV', icon: 'car-sport' },
  { type: 'ev', label: 'Electric Vehicle', icon: 'flash-outline' },
];

export default function VehicleManagementScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const { vehicles, selectedVehicleId, setDefaultVehicle, removeVehicle, addVehicle, updateVehicle } =
    useAuthStore();
  const activeBooking = useBookingStore((s) => s.activeBooking);

  // Edit / Add Modal state
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [color, setColor] = useState('');
  const [selectedType, setSelectedType] = useState<VehicleType>('sedan');
  const [isDefault, setIsDefault] = useState(false);
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setMake('');
    setModel('');
    setPlate('');
    setColor('');
    setSelectedType('sedan');
    setIsDefault(vehicles.length === 0);
    setFormError('');
    setModalMode('add');
  };

  const openEditModal = (veh: RegisteredVehicle) => {
    setEditingVehicleId(veh.id);
    setMake(veh.make);
    setModel(veh.model);
    setPlate(veh.licensePlate);
    setColor(veh.color);
    setSelectedType(veh.type);
    setIsDefault(veh.isDefault);
    setFormError('');
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingVehicleId(null);
  };

  const handleSaveVehicle = () => {
    if (!make.trim() || !model.trim() || !plate.trim() || !color.trim()) {
      setFormError('Please fill in all vehicle details.');
      return;
    }

    const cleanedPlate = plate.trim().toUpperCase();

    if (modalMode === 'add') {
      const added = addVehicle({
        make: make.trim(),
        model: model.trim(),
        licensePlate: cleanedPlate,
        color: color.trim(),
        type: selectedType,
        isDefault,
      });
      if (isDefault) {
        setDefaultVehicle(added.id);
      }
    } else if (modalMode === 'edit' && editingVehicleId) {
      updateVehicle(editingVehicleId, {
        make: make.trim(),
        model: model.trim(),
        licensePlate: cleanedPlate,
        color: color.trim(),
        type: selectedType,
      });
      if (isDefault) {
        setDefaultVehicle(editingVehicleId);
      }
    }

    closeModal();
  };

  const handleDeleteVehicle = (veh: RegisteredVehicle) => {
    // Check if vehicle is linked to an active reservation
    if (activeBooking && activeBooking.vehicle.id === veh.id && activeBooking.status === 'active') {
      Alert.alert(
        'Cannot Remove Vehicle',
        `Vehicle ${veh.licensePlate} (${veh.make} ${veh.model}) is linked to active reservation #${activeBooking.bookingNumber} at ${activeBooking.space.name}.\n\nBooking security rules prohibit vehicle deregistration during an active parking session. Please complete or cancel the reservation first.`,
        [{ text: 'Understood', style: 'default' }]
      );
      return;
    }

    Alert.alert(
      'Remove Vehicle',
      `Are you sure you want to remove ${veh.make} ${veh.model} (${veh.licensePlate}) from your profile?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const res = removeVehicle(veh.id);
            if (!res.success) {
              Alert.alert('Removal Blocked', res.reason || 'Could not remove vehicle.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Vehicle Management"
        subtitle="Registered vehicles for gated community access"
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
        {/* Verification Rule Notice */}
        <View
          style={[
            styles.infoBanner,
            {
              backgroundColor: colors.surfaceSubtle,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.md,
              marginTop: spacing.sm,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <AppIcon name="shield-checkmark" size={16} color={colors.primary} />
            <AppText variant="captionSmall" weight="bold" color={colors.text}>
              INDIAN RTO REGISTRATION COMPLIANCE
            </AppText>
          </View>
          <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 4 }}>
            Apartment boom barriers & security personnel verify physical license plates against your digital pass upon arrival. Active booking vehicles cannot be deleted.
          </AppText>
        </View>

        {/* Vehicles List */}
        <View style={{ marginTop: spacing.lg }}>
          <View style={styles.sectionHeader}>
            <AppText variant="h3">Your Fleet ({vehicles.length})</AppText>
            <AppButton
              title="+ Add Vehicle"
              variant="primary"
              size="sm"
              onPress={openAddModal}
            />
          </View>

          <View style={{ marginTop: spacing.md, gap: 12 }}>
            {vehicles.map((veh) => {
              const isActiveInBooking =
                activeBooking && activeBooking.vehicle.id === veh.id && activeBooking.status === 'active';
              const isSelectedDefault = veh.isDefault;

              return (
                <AppCard
                  key={veh.id}
                  style={[
                    styles.vehicleCard,
                    isSelectedDefault ? { borderColor: colors.primary, borderWidth: 1.5 } : undefined,
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View
                        style={[
                          styles.typeIconCircle,
                          {
                            backgroundColor:
                              veh.type === 'ev' ? 'rgba(34, 197, 94, 0.15)' : colors.surfaceSubtle,
                          },
                        ]}
                      >
                        <AppIcon
                          name={
                            veh.type === 'ev'
                              ? 'flash'
                              : veh.type === 'motorcycle'
                              ? 'bicycle'
                              : 'car'
                          }
                          size={20}
                          color={veh.type === 'ev' ? colors.success : colors.text}
                        />
                      </View>
                      <View style={{ marginLeft: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <AppText variant="bodyBold">
                            {veh.make} {veh.model}
                          </AppText>
                          {isSelectedDefault && (
                            <AppBadge label="DEFAULT" variant="primary" size="sm" />
                          )}
                          {isActiveInBooking && (
                            <AppBadge label="ACTIVE IN BOOKING" variant="warning" size="sm" />
                          )}
                        </View>
                        <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                          {veh.color} • {veh.type.toUpperCase()}
                        </AppText>
                      </View>
                    </View>
                  </View>

                  {/* Indian License Plate Pill */}
                  <View
                    style={[
                      styles.plateContainer,
                      {
                        backgroundColor: colors.surfaceSubtle,
                        borderColor: colors.border,
                        borderRadius: radius.sm,
                        marginTop: 10,
                      },
                    ]}
                  >
                    <View style={styles.plateIndBadge}>
                      <AppText variant="captionSmall" weight="bold" color="#FFFFFF">
                        IND
                      </AppText>
                    </View>
                    <AppText
                      variant="h4"
                      weight="bold"
                      color={colors.text}
                      style={styles.plateText}
                    >
                      {veh.licensePlate}
                    </AppText>
                  </View>

                  {/* Action Buttons */}
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
                    {!isSelectedDefault && (
                      <Pressable
                        onPress={() => setDefaultVehicle(veh.id)}
                        hitSlop={8}
                        style={styles.footerAction}
                      >
                        <AppIcon name="star-outline" size={16} color={colors.secondaryText} />
                        <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginLeft: 4 }}>
                          Set as Default
                        </AppText>
                      </Pressable>
                    )}

                    <View style={{ flexDirection: 'row', gap: 16, marginLeft: 'auto' }}>
                      <Pressable
                        onPress={() => openEditModal(veh)}
                        hitSlop={8}
                        style={styles.footerAction}
                      >
                        <AppIcon name="create-outline" size={16} color={colors.text} />
                        <AppText variant="captionSmall" weight="semiBold" color={colors.text} style={{ marginLeft: 4 }}>
                          Edit
                        </AppText>
                      </Pressable>

                      <Pressable
                        onPress={() => handleDeleteVehicle(veh)}
                        hitSlop={8}
                        style={styles.footerAction}
                      >
                        <AppIcon name="trash-outline" size={16} color={colors.error} />
                        <AppText variant="captionSmall" weight="semiBold" color={colors.error} style={{ marginLeft: 4 }}>
                          Remove
                        </AppText>
                      </Pressable>
                    </View>
                  </View>
                </AppCard>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Add / Edit Vehicle Modal */}
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
                {modalMode === 'add' ? 'Add New Vehicle' : 'Edit Vehicle Details'}
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
              {/* Vehicle Type Selector */}
              <AppText variant="caption" weight="bold" color={colors.secondaryText} style={{ marginTop: 12 }}>
                VEHICLE CATEGORY
              </AppText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, marginTop: 8 }}
              >
                {VEHICLE_TYPES.map((t) => {
                  const isSel = selectedType === t.type;
                  return (
                    <Pressable
                      key={t.type}
                      onPress={() => setSelectedType(t.type)}
                      style={[
                        styles.typePill,
                        {
                          backgroundColor: isSel ? colors.pricePinBg : colors.surfaceSubtle,
                          borderColor: isSel ? colors.primary : colors.border,
                          borderRadius: radius.pill,
                          borderWidth: isSel ? 2 : 1,
                        },
                      ]}
                    >
                      <AppIcon
                        name={t.icon}
                        size={16}
                        color={isSel ? colors.pricePinText : colors.text}
                      />
                      <AppText
                        variant="captionSmall"
                        weight={isSel ? 'bold' : 'medium'}
                        color={isSel ? colors.pricePinText : colors.text}
                        style={{ marginLeft: 6 }}
                      >
                        {t.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Inputs */}
              <View style={{ marginTop: 16 }}>
                <AppInput
                  label="Vehicle Manufacturer / Make"
                  placeholder="e.g. Tata, Hyundai, Ather, Maruti"
                  value={make}
                  onChangeText={setMake}
                />
              </View>

              <View style={{ marginTop: 12 }}>
                <AppInput
                  label="Model"
                  placeholder="e.g. Nexon EV, Creta, 450X"
                  value={model}
                  onChangeText={setModel}
                />
              </View>

              <View style={{ marginTop: 12 }}>
                <AppInput
                  label="License Plate Number (Indian Format)"
                  placeholder="e.g. KA 01 MJ 4821"
                  value={plate}
                  onChangeText={setPlate}
                  autoCapitalize="characters"
                />
              </View>

              <View style={{ marginTop: 12 }}>
                <AppInput
                  label="Exterior Color"
                  placeholder="e.g. Teal Blue, Polar White"
                  value={color}
                  onChangeText={setColor}
                />
              </View>
            </ScrollView>

            <View style={{ marginTop: 16 }}>
              <AppButton
                title={modalMode === 'add' ? 'Register Vehicle' : 'Save Changes'}
                variant="primary"
                size="lg"
                onPress={handleSaveVehicle}
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
  infoBanner: {
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleCard: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  plateIndBadge: {
    backgroundColor: '#003399',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginRight: 8,
  },
  plateText: {
    letterSpacing: 1.5,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerAction: {
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
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
