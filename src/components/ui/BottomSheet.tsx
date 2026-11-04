import React from 'react';
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number | string;
  style?: ViewStyle;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, radius, spacing } = useTheme();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}
          onPress={onClose}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius.xxl,
              borderTopRightRadius: radius.xxl,
              paddingBottom: Math.max(insets.bottom, spacing.lg),
              paddingHorizontal: spacing.lg,
              borderTopWidth: 1,
              borderColor: colors.border,
            },
            style,
          ]}
        >
          <View style={styles.handleWrapper}>
            <View
              style={[
                styles.handle,
                { backgroundColor: colors.border, borderRadius: radius.pill },
              ]}
            />
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    width: '100%',
    maxHeight: '85%',
  },
  handleWrapper: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
  },
});
