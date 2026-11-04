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
import { useSupportStore } from '../../src/store/useSupportStore';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon, IconName } from '../../src/components/ui/AppIcon';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppBadge } from '../../src/components/ui/AppBadge';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppInput } from '../../src/components/ui/AppInput';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq_01',
    category: 'Booking & Passes',
    question: 'How do I access an apartment parking bay at the boom barrier?',
    answer: 'Once your reservation is confirmed, open your Digital Parking Pass. Present the dynamic QR code to the on-duty security guard at Gate 2. The guard scans your QR pass, inspects your license plate, grants entry, and issues your bay assignment slip.',
  },
  {
    id: 'faq_02',
    category: 'Booking & Passes',
    question: 'Can I extend my booking if I am delayed?',
    answer: 'Yes! If the space does not have an immediate upcoming reservation from another neighbour, you can extend your duration from the active pass screen before the validity window ends.',
  },
  {
    id: 'faq_03',
    category: 'Payments & Refunds',
    question: 'How do refunds work if I cancel a booking?',
    answer: 'If you cancel before your reservation start time, 100% of the booking amount is instantly refunded to your CommunityPark Wallet balance. Funds can be used immediately for future parking or withdrawn via IMPS.',
  },
  {
    id: 'faq_04',
    category: 'Payments & Refunds',
    question: 'What payment methods are supported in the app?',
    answer: 'We support all popular Indian payment flows: UPI (Google Pay, PhonePe, Paytm, BHIM), Debit & Credit cards (RuPay, Visa, MasterCard), and the CommunityPark Wallet.',
  },
  {
    id: 'faq_05',
    category: 'Community & Security',
    question: 'Why does my apartment slot require RWA certification?',
    answer: 'To protect residential peace and comply with society bylaws, all apartment listings must be verified by the resident welfare association or estate office before appearing in public discovery.',
  },
  {
    id: 'faq_06',
    category: 'Community & Security',
    question: 'What is the speed limit inside gated apartment basements?',
    answer: 'CommunityPark enforces a mandatory 10 km/h speed limit across all internal basement parking ramps. Please yield right of way to walking residents and children.',
  },
  {
    id: 'faq_07',
    category: 'Host Monetization',
    question: 'How do I earn money by sharing my unused parking bay?',
    answer: 'Go to Owner Mode from your Profile tab or tap "+ List Parking Space" on the Home screen. Complete the 5-step guided form with your bay specifications, photos, and hourly/daily rates.',
  },
  {
    id: 'faq_08',
    category: 'Security Guards',
    question: 'How do security guards receive the ₹15 verification incentive?',
    answer: 'On-duty guards earn ₹15 for every authorized vehicle check-in logged via the gate scanner. Verification incentives accumulate directly in the guard wallet and are settled weekly.',
  },
];

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const tickets = useSupportStore((s) => s.tickets);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq_01');

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return FAQ_DATA;
    const q = searchQuery.toLowerCase();
    return FAQ_DATA.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const toggleFaq = (id: string) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  const handleCallEmergencyIntercom = () => {
    Alert.alert(
      'Gate 2 Security Intercom',
      'Connecting to Greenwood Palms Central Security Control Room...\n\nDuty Guard: Ramesh Kumar\nGate 2 Boom Barrier Direct Line: +91 98450 44102',
      [{ text: 'Simulate Call', style: 'default' }, { text: 'Cancel', style: 'cancel' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Help & Support Centre"
        subtitle="Frequently asked questions & assistance"
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
        {/* Emergency Gate Intercom Banner */}
        <AppCard
          style={[
            styles.emergencyCard,
            {
              backgroundColor: isDark ? 'rgba(217, 245, 66, 0.12)' : 'rgba(217, 245, 66, 0.25)',
              borderColor: colors.primary,
              marginTop: spacing.sm,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.emergencyIconCircle, { backgroundColor: colors.primary }]}>
              <AppIcon name="call" size={20} color={colors.primaryForeground} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <AppText variant="bodyBold">On-Site Security Assistance</AppText>
              <AppText variant="captionSmall" color={colors.text} style={{ marginTop: 2 }}>
                Gate 2 boom barrier security intercom available 24/7
              </AppText>
            </View>
            <AppButton
              title="Call Gate"
              variant="primary"
              size="sm"
              onPress={handleCallEmergencyIntercom}
              fullWidth={false}
            />
          </View>
        </AppCard>

        {/* Quick Action Navigation Grid */}
        <View style={[styles.actionGrid, { marginTop: spacing.md }]}>
          <Pressable
            onPress={() => router.push('/support/report' as any)}
            style={({ pressed }) => [
              styles.actionBox,
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
            <View style={[styles.actionIconCircle, { backgroundColor: colors.surfaceSubtle }]}>
              <AppIcon name="alert-circle-outline" size={22} color={colors.error} />
            </View>
            <AppText variant="bodyBold" style={{ marginTop: 8 }}>
              Report an Issue
            </AppText>
            <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
              Access, payments or parking disputes
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => router.push('/support/tickets' as any)}
            style={({ pressed }) => [
              styles.actionBox,
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
            <View style={[styles.actionIconCircle, { backgroundColor: colors.surfaceSubtle }]}>
              <AppIcon name="chatbubble-ellipses-outline" size={22} color={colors.primary} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <AppText variant="bodyBold">My Tickets</AppText>
              <AppBadge label={`${tickets.length}`} variant="default" size="sm" />
            </View>
            <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
              Track reported ticket resolutions
            </AppText>
          </Pressable>
        </View>

        {/* Search FAQ */}
        <View style={{ marginTop: spacing.xl }}>
          <AppText variant="h3">Frequently Asked Questions</AppText>
          <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
            Instant answers for common parking and society gate inquiries
          </AppText>

          <View style={{ marginTop: spacing.sm }}>
            <AppInput
              placeholder="Search guides, passes, refunds, RWA rules..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={<AppIcon name="search-outline" size={18} color={colors.secondaryText} />}
            />
          </View>
        </View>

        {/* FAQ Accordion List */}
        <View style={{ marginTop: spacing.md, gap: 10 }}>
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedFaqId === faq.id;
            return (
              <AppCard key={faq.id} style={styles.faqCard}>
                <Pressable
                  onPress={() => toggleFaq(faq.id)}
                  style={styles.faqHeader}
                >
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <AppBadge label={faq.category.toUpperCase()} variant="default" size="sm" style={{ alignSelf: 'flex-start', marginBottom: 4 }} />
                    <AppText variant="bodyBold">{faq.question}</AppText>
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
                      styles.faqAnswerBox,
                      {
                        borderTopColor: colors.border,
                        borderTopWidth: 1,
                        marginTop: 10,
                        paddingTop: 10,
                      },
                    ]}
                  >
                    <AppText variant="body" color={colors.secondaryText}>
                      {faq.answer}
                    </AppText>
                  </View>
                )}
              </AppCard>
            );
          })}
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
  emergencyCard: {
    padding: 12,
  },
  emergencyIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBox: {
    flex: 1,
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqCard: {
    padding: 14,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqAnswerBox: {},
});
