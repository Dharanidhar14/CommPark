import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useSupportStore } from '../../src/store/useSupportStore';
import { SupportTicketStatus } from '../../src/types/support';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppBadge, BadgeVariant } from '../../src/components/ui/AppBadge';
import { AppButton } from '../../src/components/ui/AppButton';

export default function SupportTicketsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const tickets = useSupportStore((s) => s.tickets);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(tickets[0]?.id || null);

  const toggleTicket = (id: string) => {
    setExpandedTicketId((prev) => (prev === id ? null : id));
  };

  const getStatusConfig = (
    status: SupportTicketStatus
  ): { label: string; variant: BadgeVariant } => {
    switch (status) {
      case 'submitted':
        return { label: 'SUBMITTED', variant: 'warning' };
      case 'under_review':
        return { label: 'UNDER REVIEW', variant: 'primary' };
      case 'resolved':
        return { label: 'RESOLVED', variant: 'success' };
      case 'closed':
        return { label: 'CLOSED', variant: 'default' };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Support Tickets"
        subtitle="Track issue resolutions & agent responses"
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
        <View style={styles.topRow}>
          <View>
            <AppText variant="h3">Your Tickets ({tickets.length})</AppText>
            <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
              Active and resolved customer cases
            </AppText>
          </View>
          <AppButton
            title="+ Report Issue"
            variant="primary"
            size="sm"
            onPress={() => router.push('/support/report' as any)}
          />
        </View>

        <View style={{ marginTop: spacing.md, gap: 12 }}>
          {tickets.length === 0 ? (
            <AppCard style={styles.emptyCard}>
              <AppIcon name="checkmark-done-circle-outline" size={44} color={colors.success} />
              <AppText variant="bodyBold" style={{ marginTop: 8 }}>
                No Open Tickets
              </AppText>
              <AppText variant="caption" color={colors.secondaryText} style={{ textAlign: 'center', marginTop: 4 }}>
                You have not filed any support issues. Everything is running smoothly!
              </AppText>
            </AppCard>
          ) : (
            tickets.map((t) => {
              const statusCfg = getStatusConfig(t.status);
              const isExpanded = expandedTicketId === t.id;

              return (
                <AppCard key={t.id} style={styles.ticketCard}>
                  <Pressable onPress={() => toggleTicket(t.id)} style={styles.ticketHeader}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <AppText variant="captionSmall" weight="bold" color={colors.secondaryText}>
                          #{t.ticketNumber}
                        </AppText>
                        <AppBadge label={statusCfg.label} variant={statusCfg.variant} size="sm" />
                        {t.relatedBookingNumber && (
                          <AppBadge label={`BOOKING #${t.relatedBookingNumber}`} variant="default" size="sm" />
                        )}
                      </View>

                      <AppText variant="bodyBold" style={{ marginTop: 6 }}>
                        {t.subject}
                      </AppText>

                      <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                        Category: {t.categoryLabel} • Filed on {t.createdAt}
                      </AppText>
                    </View>

                    <AppIcon
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.secondaryText}
                    />
                  </Pressable>

                  {isExpanded && (
                    <View
                      style={[
                        styles.expandedContent,
                        {
                          borderTopColor: colors.border,
                          borderTopWidth: 1,
                          marginTop: 12,
                          paddingTop: 10,
                        },
                      ]}
                    >
                      {/* Customer Reported Description */}
                      <AppText variant="captionSmall" color={colors.secondaryText}>
                        YOUR REPORTED ISSUE:
                      </AppText>
                      <View
                        style={[
                          styles.bubbleBox,
                          {
                            backgroundColor: colors.surfaceSubtle,
                            borderRadius: radius.sm,
                            padding: 10,
                            marginTop: 4,
                          },
                        ]}
                      >
                        <AppText variant="caption" color={colors.text}>
                          {t.description}
                        </AppText>
                      </View>

                      {/* Official Support Team Response */}
                      {t.responsePlaceholder && (
                        <View style={{ marginTop: 12 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <AppIcon name="shield-checkmark" size={14} color={colors.primary} />
                            <AppText variant="captionSmall" weight="bold" color={isDark ? colors.primary : '#49570B'}>
                              COMMUNITYPARK SUPPORT RESOLUTION:
                            </AppText>
                          </View>
                          <View
                            style={[
                              styles.bubbleBox,
                              {
                                backgroundColor: isDark
                                  ? 'rgba(217, 245, 66, 0.12)'
                                  : 'rgba(217, 245, 66, 0.25)',
                                borderColor: colors.primary,
                                borderWidth: 1,
                                borderRadius: radius.sm,
                                padding: 10,
                                marginTop: 4,
                              },
                            ]}
                          >
                            <AppText variant="caption" color={colors.text}>
                              {t.responsePlaceholder}
                            </AppText>
                            {t.resolvedAt && (
                              <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 6 }}>
                                Resolved: {t.resolvedAt}
                              </AppText>
                            )}
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </AppCard>
              );
            })
          )}
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  ticketCard: {
    padding: 14,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expandedContent: {},
  bubbleBox: {},
  emptyCard: {
    alignItems: 'center',
    padding: 24,
    marginTop: 12,
  },
});
