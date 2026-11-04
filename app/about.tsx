import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/theme';
import { AppHeader } from '../src/components/ui/AppHeader';
import { AppText } from '../src/components/ui/AppText';
import { AppIcon } from '../src/components/ui/AppIcon';
import { AppCard } from '../src/components/ui/AppCard';
import { AppBadge } from '../src/components/ui/AppBadge';
import { AppDivider } from '../src/components/ui/AppDivider';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="About CommunityPark"
        subtitle="Mission, access models & community values"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing.lg,
            paddingBottom: insets.bottom + 48,
          },
        ]}
      >
        {/* Section A: Brand Introduction */}
        <View style={styles.brandHero}>
          <View
            style={[
              styles.logoCircle,
              {
                backgroundColor: colors.pricePinBg,
                borderColor: colors.primary,
              },
            ]}
          >
            <AppIcon name="car" size={36} color={colors.pricePinText} />
          </View>

          <AppText variant="h1" align="center" style={{ marginTop: spacing.md }}>
            CommunityPark
          </AppText>
          <AppText
            variant="bodyBold"
            color={isDark ? colors.primary : '#49570B'}
            align="center"
            style={{ marginTop: 4 }}
          >
            Find a space. Book it. Park. Or share and earn.
          </AppText>
          <AppText
            variant="body"
            color={colors.secondaryText}
            align="center"
            style={{ marginTop: 8, lineHeight: 22 }}
          >
            CommunityPark is a community-driven parking marketplace that turns idle, unused parking spaces into accessible, discoverable parking while allowing residents and property owners to monetize vacant spots safely.
          </AppText>
        </View>

        <AppDivider style={{ marginVertical: spacing.lg }} />

        {/* Section B: The Problem */}
        <View>
          <View style={styles.sectionTitleRow}>
            <AppIcon name="alert-circle-outline" size={20} color={colors.warning} />
            <AppText variant="h3">The Problem We Solve</AppText>
          </View>
          <AppCard style={{ marginTop: spacing.sm }}>
            <AppText variant="body" color={colors.secondaryText} style={{ lineHeight: 22 }}>
              In rapidly expanding metropolitan centers like Bengaluru, Mumbai, and Delhi-NCR, commuters spend an average of 20 to 35 minutes circling congested streets just to locate parking.
            </AppText>
            <View style={{ marginTop: spacing.sm, gap: 8 }}>
              <View style={styles.bulletRow}>
                <AppIcon name="close-circle" size={16} color={colors.error} />
                <AppText variant="caption" style={{ flex: 1 }}>
                  Wasted fuel, heightened traffic gridlock, and increased vehicle emissions.
                </AppText>
              </View>
              <View style={styles.bulletRow}>
                <AppIcon name="close-circle" size={16} color={colors.error} />
                <AppText variant="caption" style={{ flex: 1 }}>
                  Thousands of private residential bays, bungalow driveways, and commercial slots remain completely vacant and locked behind arbitrary barriers.
                </AppText>
              </View>
              <View style={styles.bulletRow}>
                <AppIcon name="close-circle" size={16} color={colors.error} />
                <AppText variant="caption" style={{ flex: 1 }}>
                  Lack of trusted security verification prevents communities from opening their parking infrastructure to verified neighbours.
                </AppText>
              </View>
            </View>
          </AppCard>
        </View>

        {/* Section C: Our Solution */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={styles.sectionTitleRow}>
            <AppIcon name="bulb-outline" size={20} color={isDark ? colors.primary : '#49570B'} />
            <AppText variant="h3">Our Solution</AppText>
          </View>
          <AppCard style={{ marginTop: spacing.sm }}>
            <AppText variant="body" color={colors.secondaryText} style={{ lineHeight: 22 }}>
              CommunityPark connects commuters with available parking spaces in real time across four distinct property environments. Through verified digital parking passes, number-plate validation, and direct guard integration, we bridge convenience with safety.
            </AppText>
          </AppCard>
        </View>

        {/* Section D: How It Works */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={styles.sectionTitleRow}>
            <AppIcon name="git-branch-outline" size={20} color={isDark ? colors.primary : '#49570B'} />
            <AppText variant="h3">How CommunityPark Works</AppText>
          </View>

          <View style={{ marginTop: spacing.sm, gap: 10 }}>
            {[
              {
                step: '1',
                title: 'Discover & Compare',
                desc: 'Locate nearby spots by locality, price, amenities (EV charging, covered, CCTV), and access method.',
              },
              {
                step: '2',
                title: 'Select Duration & Vehicle',
                desc: 'Pick your scheduled window and link your registered vehicle license plate for verified gate entry.',
              },
              {
                step: '3',
                title: 'Transparent Checkout',
                desc: 'Pay securely in INR with zero surprise charges via UPI, RuPay/Cards, or CommunityPark Wallet.',
              },
              {
                step: '4',
                title: 'Access & Park',
                desc: 'Present your dynamic QR pass at the security booth, enter your barrier PIN, or glide through ANPR gates.',
              },
            ].map((st) => (
              <AppCard key={st.step} style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={[
                      styles.stepBadge,
                      {
                        backgroundColor: colors.pricePinBg,
                      },
                    ]}
                  >
                    <AppText variant="bodyBold" color={colors.pricePinText}>
                      {st.step}
                    </AppText>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <AppText variant="bodyBold">{st.title}</AppText>
                    <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                      {st.desc}
                    </AppText>
                  </View>
                </View>
              </AppCard>
            ))}
          </View>
        </View>

        {/* Section E: What Makes Us Different */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={styles.sectionTitleRow}>
            <AppIcon name="sparkles-outline" size={20} color={isDark ? colors.primary : '#49570B'} />
            <AppText variant="h3">What Makes Us Different</AppText>
          </View>

          <View style={{ marginTop: spacing.sm, gap: 10 }}>
            <AppCard style={{ padding: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <AppIcon name="shield-checkmark" size={20} color={colors.success} style={{ marginTop: 2 }} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <AppText variant="bodyBold">Adaptive Access Types</AppText>
                  <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                    We never force a single access pattern. Whether an apartment gated security booth, a private bungalow driveway, an independent automated bollard, or a commercial multi-level facility, the app adapts the access flow accordingly.
                  </AppText>
                </View>
              </View>
            </AppCard>

            <AppCard style={{ padding: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <AppIcon name="gift-outline" size={20} color={isDark ? colors.primary : '#49570B'} style={{ marginTop: 2 }} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <AppText variant="bodyBold">Guard Verification Incentives</AppText>
                  <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                    On-duty residential security guards earn legitimate micro-incentives (e.g. ₹15 per verified vehicle check) directly into their wallets, promoting attentive, cordial verification without compromising building safety.
                  </AppText>
                </View>
              </View>
            </AppCard>

            <AppCard style={{ padding: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <AppIcon name="people-outline" size={20} color={isDark ? colors.primary : '#49570B'} style={{ marginTop: 2 }} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <AppText variant="bodyBold">Unified Multi-Role Architecture</AppText>
                  <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                    One app, one account. A user can find a spot as a customer in the morning, host their unused parking bay as an owner in the evening, or perform gate checks if authorized as security personnel.
                  </AppText>
                </View>
              </View>
            </AppCard>
          </View>
        </View>

        {/* Section F: Our Mission */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={styles.sectionTitleRow}>
            <AppIcon name="flag-outline" size={20} color={isDark ? colors.primary : '#49570B'} />
            <AppText variant="h3">Our Mission</AppText>
          </View>
          <AppCard
            style={{
              marginTop: spacing.sm,
              backgroundColor: isDark ? 'rgba(217, 245, 66, 0.08)' : 'rgba(217, 245, 66, 0.15)',
              borderColor: colors.primary,
            }}
          >
            <AppText variant="bodyBold" style={{ lineHeight: 22 }}>
              To transform urban mobility and neighborhood collaboration by making every parking space purposeful, secure, and shared.
            </AppText>
            <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 6, lineHeight: 18 }}>
              We envision cities where street congestion is alleviated, property owners unlock sustainable passive income, and community security personnel are recognized and rewarded as key partners in urban accessibility.
            </AppText>
          </AppCard>
        </View>

        {/* Section G: Responsible Community Parking */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={styles.sectionTitleRow}>
            <AppIcon name="heart-outline" size={20} color={colors.error} />
            <AppText variant="h3">Responsible Community Guidelines</AppText>
          </View>
          <AppCard style={{ marginTop: spacing.sm }}>
            <AppText variant="body" color={colors.secondaryText} style={{ lineHeight: 20 }}>
              As a CommunityPark member, your respect for host communities keeps our network safe and welcome:
            </AppText>
            <View style={{ marginTop: spacing.sm, gap: 8 }}>
              <View style={styles.bulletRow}>
                <AppIcon name="speedometer-outline" size={16} color={colors.secondaryText} />
                <AppText variant="caption" style={{ flex: 1 }}>
                  Respect residential speed limits (maximum 10 km/h in basement ramps and internal society roads).
                </AppText>
              </View>
              <View style={styles.bulletRow}>
                <AppIcon name="grid-outline" size={16} color={colors.secondaryText} />
                <AppText variant="caption" style={{ flex: 1 }}>
                  Park strictly within assigned yellow or white bay lines without blocking adjacent bays.
                </AppText>
              </View>
              <View style={styles.bulletRow}>
                <AppIcon name="volume-mute-outline" size={16} color={colors.secondaryText} />
                <AppText variant="caption" style={{ flex: 1 }}>
                  No unnecessary honking or loud music inside residential premises.
                </AppText>
              </View>
              <View style={styles.bulletRow}>
                <AppIcon name="shield-outline" size={16} color={colors.secondaryText} />
                <AppText variant="caption" style={{ flex: 1 }}>
                  Treat security guards and society management with respect and present your QR code courteously.
                </AppText>
              </View>
            </View>
          </AppCard>
        </View>

        {/* Section H: App Information & Tagline */}
        <View style={{ marginTop: spacing.xl, alignItems: 'center' }}>
          <AppBadge label="EXPO SDK 58 • TYPESCRIPT • REACT NATIVE" variant="default" size="sm" />
          <AppText variant="captionSmall" color={colors.secondaryText} align="center" style={{ marginTop: 8 }}>
            CommunityPark Mobile v1.0.0 (Build 2026.11)
          </AppText>
          <AppText variant="captionSmall" color={colors.secondaryText} align="center" style={{ marginTop: 2 }}>
            © 2026 CommunityPark Technologies India Pvt. Ltd. All rights reserved.
          </AppText>
          <AppText
            variant="captionSmall"
            weight="bold"
            color={isDark ? colors.primary : '#49570B'}
            align="center"
            style={{ marginTop: 8 }}
          >
            Find a space. Book it. Park. Or share your unused space and earn.
          </AppText>
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
  brandHero: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
