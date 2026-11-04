import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useNotificationStore } from '../../src/store/useNotificationStore';
import { NotificationItem, NotificationCategory } from '../../src/types/notification';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon, IconName } from '../../src/components/ui/AppIcon';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppBadge } from '../../src/components/ui/AppBadge';
import { AppButton } from '../../src/components/ui/AppButton';

type FilterCat = 'all' | NotificationCategory;

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
  } = useNotificationStore();

  const [selectedFilter, setSelectedFilter] = useState<FilterCat>('all');

  const filterOptions: { id: FilterCat; label: string }[] = [
    { id: 'all', label: `All (${notifications.length})` },
    { id: 'booking', label: 'Passes' },
    { id: 'payment', label: 'Wallet & Payments' },
    { id: 'reminder', label: 'Reminders' },
    { id: 'approval', label: 'RWA Approvals' },
    { id: 'security', label: 'Gate Security' },
    { id: 'owner', label: 'Host Activity' },
  ];

  const filteredList = useMemo(() => {
    if (selectedFilter === 'all') return notifications;
    return notifications.filter((n) => n.category === selectedFilter);
  }, [notifications, selectedFilter]);

  const handleNotificationPress = (notif: NotificationItem) => {
    markAsRead(notif.id);
    if (notif.relatedRoute) {
      router.push(notif.relatedRoute as any);
    }
  };

  const getCategoryConfig = (
    cat: NotificationCategory
  ): { icon: IconName; color: string; bg: string } => {
    switch (cat) {
      case 'booking':
        return {
          icon: 'ticket-outline',
          color: isDark ? colors.primary : '#49570B',
          bg: 'rgba(217, 245, 66, 0.25)',
        };
      case 'payment':
        return {
          icon: 'wallet-outline',
          color: colors.success,
          bg: 'rgba(34, 197, 94, 0.15)',
        };
      case 'reminder':
        return {
          icon: 'time-outline',
          color: colors.warning,
          bg: 'rgba(234, 179, 8, 0.15)',
        };
      case 'approval':
        return {
          icon: 'shield-checkmark-outline',
          color: colors.primary,
          bg: 'rgba(217, 245, 66, 0.2)',
        };
      case 'security':
        return {
          icon: 'scan-outline',
          color: colors.text,
          bg: colors.surfaceSubtle,
        };
      case 'owner':
        return {
          icon: 'business-outline',
          color: isDark ? colors.primary : '#49570B',
          bg: 'rgba(217, 245, 66, 0.25)',
        };
      case 'promotional':
        return {
          icon: 'gift-outline',
          color: colors.warning,
          bg: 'rgba(234, 179, 8, 0.15)',
        };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Notifications"
        subtitle={
          unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up'
        }
        showBack
        onBack={() => router.back()}
        rightAction={
          unreadCount > 0 ? (
            <Pressable onPress={markAllAsRead} hitSlop={8} style={styles.markAllBtn}>
              <AppText variant="captionSmall" weight="bold" color={isDark ? colors.primary : '#49570B'}>
                Mark All Read
              </AppText>
            </Pressable>
          ) : (
            <Pressable onPress={() => router.push('/profile/preferences' as any)} hitSlop={8}>
              <AppIcon name="settings-outline" size={20} color={colors.secondaryText} />
            </Pressable>
          )
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
        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.filtersContainer, { gap: 8 }]}
        >
          {filterOptions.map((opt) => {
            const isSelected = selectedFilter === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setSelectedFilter(opt.id)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? colors.pricePinBg : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: radius.pill,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                <AppText
                  variant="captionSmall"
                  weight={isSelected ? 'bold' : 'medium'}
                  color={isSelected ? colors.pricePinText : colors.text}
                >
                  {opt.label}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Notifications List */}
        <View style={{ marginTop: spacing.sm, gap: 10 }}>
          {filteredList.length === 0 ? (
            <AppCard style={styles.emptyCard}>
              <AppIcon name="notifications-off-outline" size={40} color={colors.secondaryText} />
              <AppText variant="bodyBold" style={{ marginTop: 8 }}>
                No Notifications
              </AppText>
              <AppText variant="caption" color={colors.secondaryText} style={{ textAlign: 'center', marginTop: 4 }}>
                You have no active alerts or reminders under this category.
              </AppText>
            </AppCard>
          ) : (
            filteredList.map((item) => {
              const cfg = getCategoryConfig(item.category);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => handleNotificationPress(item)}
                  style={({ pressed }) => [
                    styles.notifCardWrapper,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <AppCard
                    style={[
                      styles.notifCard,
                      !item.isRead ? { borderColor: colors.primary, borderWidth: 1.5 } : undefined,
                    ]}
                  >
                    <View style={styles.notifRow}>
                      {/* Icon */}
                      <View style={[styles.iconCircle, { backgroundColor: cfg.bg }]}>
                        <AppIcon name={cfg.icon} size={20} color={cfg.color} />
                      </View>

                      {/* Content */}
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <AppText variant="bodyBold" numberOfLines={1} style={{ flex: 1, marginRight: 6 }}>
                            {item.title}
                          </AppText>
                          {!item.isRead && (
                            <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                          )}
                        </View>

                        <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 3 }}>
                          {item.body}
                        </AppText>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                          <AppText variant="captionSmall" color={colors.secondaryText}>
                            {item.timestamp}
                          </AppText>

                          <Pressable
                            onPress={() => dismissNotification(item.id)}
                            hitSlop={8}
                            style={styles.dismissBtn}
                          >
                            <AppIcon name="close" size={14} color={colors.secondaryText} />
                            <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginLeft: 2 }}>
                              Dismiss
                            </AppText>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </AppCard>
                </Pressable>
              );
            })
          )}
        </View>

        {filteredList.length > 0 && (
          <View style={{ marginTop: spacing.xl, alignItems: 'center' }}>
            <Pressable onPress={clearAll} hitSlop={8}>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Clear all notifications
              </AppText>
            </Pressable>
          </View>
        )}
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
  markAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  filtersContainer: {
    paddingVertical: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  notifCardWrapper: {},
  notifCard: {
    padding: 12,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dismissBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
    marginTop: 12,
  },
});
