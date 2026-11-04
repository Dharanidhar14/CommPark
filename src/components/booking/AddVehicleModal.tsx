import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTheme } from '../../theme';
import { AppText } from '../ui/AppText';
import { AppInput } from '../ui/AppInput';
import { AppButton } from '../ui/AppButton';
import { AppIcon } from '../ui/AppIcon';
import { BottomSheet } from '../ui/BottomSheet';
import { VehicleType } from '../../types/parking';
import { RegisteredVehicle } from '../../types/booking';

const vehicleSchema = z.object({
  licensePlate: z
    .string()
    .min(5, 'Registration plate must be at least 5 characters')
    .max(15, 'Registration plate cannot exceed 15 characters')
    .regex(/^[A-Z0-9\s-]+$/i, 'Invalid format (e.g. KA 01 AB 1234)'),
  make: z.string().min(2, 'Make must be at least 2 characters'),
  model: z.string().min(2, 'Model must be at least 2 characters'),
  color: z.string().min(2, 'Color is required'),
  type: z.enum(['sedan', 'suv', 'ev', 'hatchback', 'motorcycle', 'van']),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

export interface AddVehicleModalProps {
  visible: boolean;
  onClose: () => void;
  onVehicleAdded: (vehicle: Omit<RegisteredVehicle, 'id' | 'userId'>) => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  visible,
  onClose,
  onVehicleAdded,
}) => {
  const { colors, spacing, radius } = useTheme();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<VehicleFormData>({
    defaultValues: {
      licensePlate: '',
      make: '',
      model: '',
      color: '',
      type: 'ev',
    },
  });

  const selectedType = watch('type');

  const vehicleTypes: { type: VehicleType; label: string }[] = [
    { type: 'ev', label: 'EV' },
    { type: 'suv', label: 'SUV' },
    { type: 'sedan', label: 'Sedan' },
    { type: 'hatchback', label: 'Hatchback' },
    { type: 'motorcycle', label: '2-Wheeler' },
  ];

  const onSubmit = (data: VehicleFormData) => {
    onVehicleAdded({
      licensePlate: data.licensePlate.toUpperCase().trim(),
      make: data.make.trim(),
      model: data.model.trim(),
      color: data.color.trim(),
      type: data.type,
      isDefault: false,
    });
    reset();
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={{ paddingBottom: spacing.md }}>
        <View style={styles.headerRow}>
          <AppText variant="h3">Add Registered Vehicle</AppText>
          <Pressable onPress={onClose} hitSlop={8}>
            <AppIcon name="close" size={20} color={colors.secondaryText} />
          </Pressable>
        </View>
        <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
          Accurate license plate is required for residential gate security verification.
        </AppText>

        <ScrollView style={{ maxHeight: 420, marginTop: spacing.md }} showsVerticalScrollIndicator={false}>
          {/* License Plate Number */}
          <Controller
            control={control}
            name="licensePlate"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Registration Plate Number *"
                placeholder="e.g. KA 01 MJ 4821"
                value={value}
                onChangeText={(t) => onChange(t.toUpperCase())}
                error={errors.licensePlate?.message}
                autoCapitalize="characters"
              />
            )}
          />

          {/* Make and Model */}
          <View style={styles.twoColRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Controller
                control={control}
                name="make"
                render={({ field: { onChange, value } }) => (
                  <AppInput
                    label="Make *"
                    placeholder="e.g. Tata / Maruti"
                    value={value}
                    onChangeText={onChange}
                    error={errors.make?.message}
                  />
                )}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Controller
                control={control}
                name="model"
                render={({ field: { onChange, value } }) => (
                  <AppInput
                    label="Model *"
                    placeholder="e.g. Nexon / Swift"
                    value={value}
                    onChangeText={onChange}
                    error={errors.model?.message}
                  />
                )}
              />
            </View>
          </View>

          {/* Color */}
          <Controller
            control={control}
            name="color"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Vehicle Color *"
                placeholder="e.g. Teal Blue / Polar White"
                value={value}
                onChangeText={onChange}
                error={errors.color?.message}
              />
            )}
          />

          {/* Vehicle Type Selector */}
          <View style={{ marginTop: spacing.xs, marginBottom: spacing.md }}>
            <AppText variant="caption" weight="semiBold" style={{ marginBottom: 6 }}>
              Vehicle Category *
            </AppText>
            <View style={styles.typesRow}>
              {vehicleTypes.map((vt) => {
                const isSelected = selectedType === vt.type;
                return (
                  <Pressable
                    key={vt.type}
                    onPress={() => setValue('type', vt.type)}
                    style={[
                      styles.typeChip,
                      {
                        backgroundColor: isSelected ? colors.pricePinBg : colors.surfaceSubtle,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderRadius: radius.pill,
                      },
                    ]}
                  >
                    <AppText
                      variant="captionSmall"
                      weight={isSelected ? 'bold' : 'medium'}
                      color={isSelected ? colors.pricePinText : colors.text}
                    >
                      {vt.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={{ marginTop: spacing.md }}>
            <AppButton
              title="Save & Select Vehicle"
              onPress={handleSubmit(onSubmit)}
              variant="primary"
              size="lg"
            />
          </View>
        </ScrollView>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  twoColRow: {
    flexDirection: 'row',
  },
  typesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
  },
});
