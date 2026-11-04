import React, { useState } from 'react';
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
import { useBookingStore } from '../../src/store/useBookingStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { SupportTicketCategory } from '../../src/types/support';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon, IconName } from '../../src/components/ui/AppIcon';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppInput } from '../../src/components/ui/AppInput';

const CATEGORIES: {
  category: SupportTicketCategory;
  label: string;
  icon: IconName;
}[] = [
  { category: 'access_problem', label: 'Vehicle Access Problem', icon: 'shield-outline' },
  { category: 'space_unavailable', label: 'Space Occupied / Blocked', icon: 'close-circle-outline' },
  { category: 'payment_issue', label: 'Payment or Refund Issue', icon: 'wallet-outline' },
  { category: 'booking_issue', label: 'Booking Modification Help', icon: 'calendar-outline' },
  { category: 'incorrect_listing', label: 'Inaccurate Listing Details', icon: 'alert-circle-outline' },
  { category: 'dispute', label: 'Neighbour / Host Dispute', icon: 'people-outline' },
  { category: 'safety_concern', label: 'Security & Safety Concern', icon: 'warning-outline' },
  { category: 'other', label: 'Other General Inquiry', icon: 'help-circle-outline' },
];

export default function ReportIssueScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const user = useAuthStore((s) => s.user);
  const bookings = useBookingStore((s) => s.bookings);
  const createTicket = useSupportStore((s) => s.createTicket);

  const [selectedCategory, setSelectedCategory] = useState<SupportTicketCategory>('access_problem');
  const [selectedBookingId, setSelectedBookingId] = useState<string>(bookings[0]?.id || '');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachedPhoto, setAttachedPhoto] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);

  const handleSubmit = () => {
    if (!subject.trim() || !description.trim()) {
      setErrorMsg('Please enter a subject and detailed description of the issue.');
      return;
    }

    const catObj = CATEGORIES.find((c) => c.category === selectedCategory);

    const ticket = createTicket({
      userId: user.id,
      category: selectedCategory,
      categoryLabel: catObj?.label || 'General Issue',
      subject: subject.trim(),
      description: description.trim(),
      relatedBookingId: selectedBooking?.id,
      relatedBookingNumber: selectedBooking?.bookingNumber,
      imageUri: attachedPhoto ? 'simulated_barrier_photo.jpg' : undefined,
    });

    Alert.alert(
      'Ticket Submitted Successfully',
      `Ticket Reference: #${ticket.ticketNumber}\n\nOur community support desk is reviewing your submission. You can track updates under "My Support Tickets".`,
      [
        {
          text: 'View My Tickets',
          onPress: () => router.replace('/support/tickets' as any),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Report an Issue"
        subtitle="Prompt resolution for parking & gate problems"
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
        {/* Prototype Transparency Notice */}
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
            <AppIcon name="alert-circle" size={16} color={colors.warning} />
            <AppText variant="captionSmall" weight="bold" color={colors.warning}>
              SIMULATED SUPPORT TICKET DISK
            </AppText>
          </View>
          <AppText variant="captionSmall" color={colors.warning} style={{ marginTop: 2 }}>
            Demonstrates in-app customer issue logging, related booking attribution, photo upload simulation, and ticket tracking.
          </AppText>
        </View>

        {errorMsg.length > 0 && (
          <View
            style={[
              styles.errorBox,
              { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: radius.sm, marginTop: 10 },
            ]}
          >
            <AppText variant="captionSmall" color={colors.error}>
              {errorMsg}
            </AppText>
          </View>
        )}

        {/* 1. Category Selector */}
        <View style={{ marginTop: spacing.md }}>
          <AppText variant="caption" weight="bold" color={colors.secondaryText}>
            SELECT ISSUE CATEGORY
          </AppText>
          <View style={[styles.catGrid, { marginTop: 8 }]}>
            {CATEGORIES.map((c) => {
              const isSel = selectedCategory === c.category;
              return (
                <Pressable
                  key={c.category}
                  onPress={() => setSelectedCategory(c.category)}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: isSel ? colors.pricePinBg : colors.surface,
                      borderColor: isSel ? colors.primary : colors.border,
                      borderRadius: radius.md,
                      padding: spacing.sm,
                      borderWidth: isSel ? 2 : 1,
                    },
                  ]}
                >
                  <AppIcon
                    name={c.icon}
                    size={16}
                    color={isSel ? colors.pricePinText : colors.text}
                  />
                  <AppText
                    variant="captionSmall"
                    weight={isSel ? 'bold' : 'medium'}
                    color={isSel ? colors.pricePinText : colors.text}
                    numberOfLines={1}
                    style={{ marginLeft: 6, flex: 1 }}
                  >
                    {c.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 2. Related Booking Selector */}
        <View style={{ marginTop: spacing.lg }}>
          <AppText variant="caption" weight="bold" color={colors.secondaryText}>
            RELATED PARKING RESERVATION
          </AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, marginTop: 8 }}
          >
            {bookings.map((b) => {
              const isSel = selectedBookingId === b.id;
              return (
                <Pressable
                  key={b.id}
                  onPress={() => setSelectedBookingId(b.id)}
                  style={[
                    styles.bookingChip,
                    {
                      backgroundColor: isSel ? colors.surfaceSubtle : colors.surface,
                      borderColor: isSel ? colors.primary : colors.border,
                      borderRadius: radius.card,
                      padding: 10,
                      borderWidth: isSel ? 2 : 1,
                    },
                  ]}
                >
                  <AppText variant="captionSmall" weight="bold" color={isSel ? colors.primary : colors.text}>
                    #{b.bookingNumber}
                  </AppText>
                  <AppText variant="captionSmall" color={colors.secondaryText} numberOfLines={1} style={{ maxWidth: 140 }}>
                    {b.space.name}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* 3. Subject and Description */}
        <View style={{ marginTop: spacing.lg }}>
          <AppInput
            label="Subject"
            placeholder="e.g. Boom barrier wouldn't open at Gate 2"
            value={subject}
            onChangeText={(val) => {
              setSubject(val);
              setErrorMsg('');
            }}
          />
        </View>

        <View style={{ marginTop: spacing.md }}>
          <AppInput
            label="Detailed Description"
            placeholder="Explain what occurred. Include barrier location, vehicle license plate, or intercom conversation with security guard."
            value={description}
            onChangeText={(val) => {
              setDescription(val);
              setErrorMsg('');
            }}
            multiline
            numberOfLines={5}
          />
        </View>

        {/* 4. Photo Evidence Attachment Simulation */}
        <View style={{ marginTop: spacing.lg }}>
          <AppText variant="caption" weight="bold" color={colors.secondaryText}>
            EVIDENCE ATTACHMENT (OPTIONAL)
          </AppText>
          <Pressable
            onPress={() => setAttachedPhoto(!attachedPhoto)}
            style={[
              styles.attachmentBox,
              {
                backgroundColor: colors.surfaceSubtle,
                borderColor: attachedPhoto ? colors.primary : colors.border,
                borderRadius: radius.md,
                padding: spacing.md,
                borderWidth: attachedPhoto ? 2 : 1,
                borderStyle: 'dashed',
                marginTop: 8,
              },
            ]}
          >
            <AppIcon
              name={attachedPhoto ? 'checkmark-circle' : 'camera-outline'}
              size={24}
              color={attachedPhoto ? colors.primary : colors.secondaryText}
            />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <AppText variant="bodyBold">
                {attachedPhoto ? 'Photo Attached: barrier_evidence_photo.jpg' : 'Attach Photo of Space or Gate'}
              </AppText>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                {attachedPhoto
                  ? 'Tap to remove attachment'
                  : 'Tap to simulate camera snapshot or gallery upload'}
              </AppText>
            </View>
          </Pressable>
        </View>

        {/* Submit Button */}
        <View style={{ marginTop: spacing.xl }}>
          <AppButton
            title="Submit Support Ticket"
            variant="primary"
            size="lg"
            onPress={handleSubmit}
          />
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
  errorBox: {
    padding: 10,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  bookingChip: {
    minWidth: 120,
  },
  attachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
