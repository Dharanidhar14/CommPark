import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useAdminStore } from '../../src/store/useAdminStore';
import { AdminAuditRecord } from '../../src/types/admin';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon, IconName } from '../../src/components/ui/AppIcon';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppBadge, BadgeVariant } from '../../src/components/ui/AppBadge';
import { AppInput } from '../../src/components/ui/AppInput';
import { AppButton } from '../../src/components/ui/AppButton';

type FilterCategory = 'all' | 'entries' | 'alerts' | 'listings' | 'governance';

export default function AdminAuditScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const { auditLogs, property } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');

  const filterOptions: { id: FilterCategory; label: string; count: number }[] = useMemo(() => {
    const alertsCount = auditLogs.filter((l) => l.action === 'security_alert').length;
    const entriesCount = auditLogs.filter((l) => l.action === 'guest_entry_logged').length;
    const listingsCount = auditLogs.filter(
      (l) => l.action === 'listing_approved' || l.action === 'listing_rejected'
    ).length;
    const governanceCount = auditLogs.filter(
      (l) =>
        l.action === 'policy_updated' ||
        l.action === 'staff_authorized' ||
        l.action === 'staff_suspended'
    ).length;

    return [
      { id: 'all', label: 'All Events', count: auditLogs.length },
      { id: 'entries', label: 'Barrier Entries', count: entriesCount },
      { id: 'alerts', label: 'Security Alerts', count: alertsCount },
      { id: 'listings', label: 'Listing Reviews', count: listingsCount },
      { id: 'governance', label: 'Bylaws & Staff', count: governanceCount },
    ];
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // Category filter
      if (selectedFilter === 'entries' && log.action !== 'guest_entry_logged') {
        return false;
      }
      if (selectedFilter === 'alerts' && log.action !== 'security_alert') {
        return false;
      }
      if (
        selectedFilter === 'listings' &&
        log.action !== 'listing_approved' &&
        log.action !== 'listing_rejected'
      ) {
        return false;
      }
      if (
        selectedFilter === 'governance' &&
        log.action !== 'policy_updated' &&
        log.action !== 'staff_authorized' &&
        log.action !== 'staff_suspended'
      ) {
        return false;
      }

      // Search filter
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesTarget = log.targetDescription.toLowerCase().includes(q);
        const matchesActor = log.actorName.toLowerCase().includes(q);
        const matchesRole = log.actorRole.toLowerCase().includes(q);
        const matchesId = log.targetId.toLowerCase().includes(q);
        const matchesDetails = log.details?.toLowerCase().includes(q);
        return matchesTarget || matchesActor || matchesRole || matchesId || matchesDetails;
      }

      return true;
    });
  }, [auditLogs, selectedFilter, searchQuery]);

  const getActionConfig = (
    action: AdminAuditRecord['action']
  ): {
    label: string;
    variant: BadgeVariant;
    icon: IconName;
    accentColor: string;
  } => {
    switch (action) {
      case 'guest_entry_logged':
        return {
          label: 'ENTRY GRANTED',
          variant: 'success',
          icon: 'log-in-outline',
          accentColor: colors.success,
        };
      case 'security_alert':
        return {
          label: 'SECURITY ALERT',
          variant: 'error',
          icon: 'alert-circle-outline',
          accentColor: colors.error,
        };
      case 'listing_approved':
        return {
          label: 'SLOT CERTIFIED',
          variant: 'primary',
          icon: 'checkmark-circle-outline',
          accentColor: colors.primary,
        };
      case 'listing_rejected':
        return {
          label: 'SLOT REJECTED',
          variant: 'error',
          icon: 'close-circle-outline',
          accentColor: colors.error,
        };
      case 'policy_updated':
        return {
          label: 'BYLAW AMENDED',
          variant: 'warning',
          icon: 'options-outline',
          accentColor: colors.warning,
        };
      case 'staff_suspended':
        return {
          label: 'STAFF SUSPENDED',
          variant: 'error',
          icon: 'person-remove-outline',
          accentColor: colors.error,
        };
      case 'staff_authorized':
        return {
          label: 'STAFF CLEARED',
          variant: 'success',
          icon: 'shield-checkmark-outline',
          accentColor: colors.success,
        };
    }
  };

  const handleExportAudit = () => {
    Alert.alert(
      'Export Society Audit Trail',
      `Complete cryptographic audit log (${auditLogs.length} events) ready for export.\n\nGenerated for: ${property.name}\nRWA Reg: ${property.rwaRegistrationNumber}\nFormat: Signed PDF & CSV`,
      [{ text: 'Download Summary', style: 'default' }, { text: 'Close', style: 'cancel' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Immutable Audit Logs"
        subtitle={`${property.name} • Governance Ledger`}
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
        {/* Prototype & Transparency Banner */}
        <View
          style={[
            styles.demoBanner,
            {
              backgroundColor: 'rgba(234, 179, 8, 0.12)',
              borderColor: colors.warning,
              borderRadius: radius.md,
              padding: spacing.sm,
              marginTop: spacing.xs,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <AppIcon name="lock-closed" size={16} color={colors.warning} />
            <AppText variant="captionSmall" weight="bold" color={colors.warning}>
              SECURE TAMPER-EVIDENT SOCIETY LEDGER
            </AppText>
          </View>
          <AppText variant="captionSmall" color={colors.warning} style={{ marginTop: 2 }}>
            Simulates immutable community records. Boom barrier passes, slot certifications, rule changes, and security exceptions cannot be altered or removed after logging.
          </AppText>
        </View>

        {/* Audit Stats Summary */}
        <View style={styles.statsRow}>
          <AppCard style={styles.statCard}>
            <AppText variant="captionSmall" color={colors.secondaryText}>
              TOTAL EVENTS
            </AppText>
            <AppText variant="h2" weight="extraBold" style={{ marginTop: 2 }}>
              {auditLogs.length}
            </AppText>
            <AppText variant="captionSmall" color={colors.secondaryText}>
              All time
            </AppText>
          </AppCard>

          <AppCard style={styles.statCard}>
            <AppText variant="captionSmall" color={colors.secondaryText}>
              SECURITY ALERTS
            </AppText>
            <AppText
              variant="h2"
              weight="extraBold"
              color={auditLogs.some((l) => l.action === 'security_alert') ? colors.error : colors.text}
              style={{ marginTop: 2 }}
            >
              {auditLogs.filter((l) => l.action === 'security_alert').length}
            </AppText>
            <AppText variant="captionSmall" color={colors.secondaryText}>
              Flagged entries
            </AppText>
          </AppCard>

          <AppCard style={styles.statCard}>
            <AppText variant="captionSmall" color={colors.secondaryText}>
              BARRIER ENTRIES
            </AppText>
            <AppText variant="h2" weight="extraBold" color={colors.success} style={{ marginTop: 2 }}>
              {auditLogs.filter((l) => l.action === 'guest_entry_logged').length}
            </AppText>
            <AppText variant="captionSmall" color={colors.secondaryText}>
              Gate 1 & Gate 2
            </AppText>
          </AppCard>
        </View>

        {/* Search Bar */}
        <View style={{ marginTop: spacing.md }}>
          <AppInput
            placeholder="Search by vehicle, resident, staff or ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<AppIcon name="search-outline" size={18} color={colors.secondaryText} />}
            rightIcon={
              searchQuery.length > 0 ? (
                <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                  <AppIcon name="close-circle" size={18} color={colors.secondaryText} />
                </Pressable>
              ) : null
            }
          />
        </View>

        {/* Category Filters */}
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
                  variant="caption"
                  weight={isSelected ? 'bold' : 'medium'}
                  color={isSelected ? colors.pricePinText : colors.text}
                >
                  {opt.label} ({opt.count})
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Export Action Bar */}
        <View style={styles.exportRow}>
          <AppText variant="captionSmall" color={colors.secondaryText}>
            Showing {filteredLogs.length} matching events
          </AppText>
          <Pressable onPress={handleExportAudit} hitSlop={8} style={styles.exportBtn}>
            <AppIcon name="download-outline" size={16} color={isDark ? colors.primary : '#49570B'} />
            <AppText
              variant="captionSmall"
              weight="bold"
              color={isDark ? colors.primary : '#49570B'}
              style={{ marginLeft: 4 }}
            >
              Export Report
            </AppText>
          </Pressable>
        </View>

        {/* Audit Log Timeline */}
        <View style={{ marginTop: spacing.sm, gap: 10 }}>
          {filteredLogs.length === 0 ? (
            <AppCard style={styles.emptyCard}>
              <AppIcon name="file-tray-outline" size={40} color={colors.secondaryText} />
              <AppText variant="bodyBold" style={{ marginTop: 8 }}>
                No Audit Events Found
              </AppText>
              <AppText
                variant="caption"
                color={colors.secondaryText}
                style={{ textAlign: 'center', marginTop: 4 }}
              >
                No society records match your search or selected filter.
              </AppText>
              {searchQuery.length > 0 && (
                <AppButton
                  title="Clear Search"
                  variant="outline"
                  size="sm"
                  onPress={() => setSearchQuery('')}
                  style={{ marginTop: 12 }}
                />
              )}
            </AppCard>
          ) : (
            filteredLogs.map((log) => {
              const config = getActionConfig(log.action);
              return (
                <AppCard key={log.id} style={styles.auditCard}>
                  {/* Top Bar: Action badge + timestamp */}
                  <View style={styles.auditCardTop}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <AppBadge
                        label={config.label}
                        variant={config.variant}
                        size="sm"
                        icon={<AppIcon name={config.icon} size={13} color={config.accentColor} />}
                      />
                      <AppBadge label="VERIFIED" variant="default" size="sm" />
                    </View>
                    <AppText variant="captionSmall" color={colors.secondaryText}>
                      {log.timestamp}
                    </AppText>
                  </View>

                  {/* Main Event Headline */}
                  <AppText variant="bodyBold" style={{ marginTop: 8 }}>
                    {log.targetDescription}
                  </AppText>

                  {/* Detail description if present */}
                  {log.details && (
                    <View
                      style={[
                        styles.detailsBox,
                        {
                          backgroundColor: colors.surfaceSubtle,
                          borderRadius: radius.sm,
                          padding: 8,
                          marginTop: 6,
                        },
                      ]}
                    >
                      <AppText variant="captionSmall" color={colors.text}>
                        {log.details}
                      </AppText>
                    </View>
                  )}

                  {/* Footer: Actor, Role and Ref ID */}
                  <View
                    style={[
                      styles.auditCardFooter,
                      {
                        borderTopColor: colors.border,
                        borderTopWidth: 1,
                        marginTop: 10,
                        paddingTop: 8,
                      },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <AppIcon name="person-circle-outline" size={16} color={colors.secondaryText} />
                      <AppText
                        variant="captionSmall"
                        weight="semiBold"
                        color={colors.text}
                        style={{ marginLeft: 4 }}
                      >
                        {log.actorName}
                      </AppText>
                      <AppText variant="captionSmall" color={colors.secondaryText}>
                        {' '}• {log.actorRole}
                      </AppText>
                    </View>

                    <AppText variant="captionSmall" color={colors.secondaryText}>
                      ID: {log.targetId.slice(0, 16)}
                    </AppText>
                  </View>
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
  demoBanner: {
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  filtersContainer: {
    paddingVertical: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  exportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  auditCard: {
    padding: 12,
  },
  auditCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsBox: {},
  auditCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
    marginTop: 12,
  },
});
