import React from 'react';
import { View, StyleSheet, Modal, Pressable } from 'react-native';
import { useTheme } from '../../theme';
import { AppText } from '../ui/AppText';
import { AppButton } from '../ui/AppButton';
import { AppIcon } from '../ui/AppIcon';
import { useLocationStore } from '../../store/useLocationStore';

export const LocationPermissionModal: React.FC = () => {
  const { colors, spacing, radius, isDark } = useTheme();
  const isExplanationVisible = useLocationStore((s) => s.isExplanationVisible);
  const confirmExplanationAndRequest = useLocationStore(
    (s) => s.confirmExplanationAndRequest
  );
  const dismissExplanation = useLocationStore((s) => s.dismissExplanation);

  return (
    <Modal
      visible={isExplanationVisible}
      transparent
      animationType="fade"
      onRequestClose={dismissExplanation}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderRadius: radius.xl,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Icon Header */}
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: isDark ? '#2B350C' : '#F1FCCC',
                borderRadius: radius.pill,
              },
            ]}
          >
            <AppIcon
              name="navigate"
              size={36}
              color={isDark ? colors.primary : '#49570B'}
            />
          </View>

          <AppText
            variant="h3"
            weight="bold"
            align="center"
            style={{ marginTop: spacing.md }}
          >
            Find Parking Near You
          </AppText>

          <AppText
            variant="body"
            color={colors.secondaryText}
            align="center"
            style={{ marginTop: spacing.xs, lineHeight: 22 }}
          >
            CommunityPark uses your foreground location to discover nearby
            verified parking bays, calculate walking distance in real time, and
            point you to the correct residential gate.
          </AppText>

          {/* Privacy reassurance pill */}
          <View
            style={[
              styles.privacyPill,
              {
                backgroundColor: colors.background,
                borderRadius: radius.md,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <AppIcon
              name="shield-checkmark-outline"
              size={16}
              color={isDark ? colors.primary : '#49570B'}
              style={{ marginRight: 6 }}
            />
            <AppText variant="captionSmall" color={colors.secondaryText}>
              Foreground only. Never tracked in background.
            </AppText>
          </View>

          {/* Action Buttons */}
          <View style={[styles.actionColumn, { marginTop: spacing.lg }]}>
            <AppButton
              title="Allow Location Access"
              variant="primary"
              size="lg"
              fullWidth
              onPress={confirmExplanationAndRequest}
            />

            <Pressable
              onPress={dismissExplanation}
              style={styles.notNowBtn}
              hitSlop={8}
            >
              <AppText
                variant="body"
                weight="semiBold"
                color={colors.secondaryText}
              >
                Not Now, I'll Search Manually
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  privacyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  actionColumn: {
    width: '100%',
    gap: 12,
  },
  notNowBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});
