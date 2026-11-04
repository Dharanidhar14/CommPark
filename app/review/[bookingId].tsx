import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useBookingStore } from '../../src/store/useBookingStore';
import { useReviewStore } from '../../src/store/useReviewStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppBadge } from '../../src/components/ui/AppBadge';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppInput } from '../../src/components/ui/AppInput';

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { colors, spacing, radius, isDark } = useTheme();

  const user = useAuthStore((s) => s.user);
  const bookings = useBookingStore((s) => s.bookings);
  const { hasReviewedBooking, getReviewForBooking, addReview } = useReviewStore();

  const booking = bookings.find((b) => b.id === bookingId);
  const existingReview = bookingId ? getReviewForBooking(bookingId) : undefined;
  const isAlreadyReviewed = !!existingReview;

  // Form State
  const [overallRating, setOverallRating] = useState(5);
  const [parkingExp, setParkingExp] = useState(5);
  const [accessExp, setAccessExp] = useState(5);
  const [cleanliness, setCleanliness] = useState(5);
  const [comment, setComment] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!booking) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Parking Review" showBack onBack={() => router.back()} />
        <View style={styles.centerBox}>
          <AppCard style={{ padding: 24, alignItems: 'center' }}>
            <AppIcon name="alert-circle-outline" size={44} color={colors.error} />
            <AppText variant="h3" style={{ marginTop: 12 }}>
              Booking Not Found
            </AppText>
            <AppText variant="caption" color={colors.secondaryText} style={{ textAlign: 'center', marginTop: 4 }}>
              The requested parking reservation could not be located in your history.
            </AppText>
            <AppButton
              title="Return to Bookings"
              variant="primary"
              size="sm"
              onPress={() => router.back()}
              style={{ marginTop: 16 }}
            />
          </AppCard>
        </View>
      </View>
    );
  }

  const isEligible = booking.status === 'completed';

  const handleSubmit = () => {
    if (!comment.trim()) {
      setErrorMsg('Please share a short comment about your parking experience.');
      return;
    }

    if (isAlreadyReviewed) {
      Alert.alert('Review Blocked', 'You have already submitted a review for this parking reservation.');
      return;
    }

    addReview({
      bookingId: booking.id,
      spaceId: booking.space.id,
      userId: user.id,
      userName: user.name,
      overallRating,
      parkingExperience: parkingExp,
      accessExperience: accessExp,
      cleanlinessSuitability: cleanliness,
      comment: comment.trim(),
    });

    Alert.alert(
      'Review Submitted!',
      `Thank you for rating ${booking.space.name}.\n\nYour review helps neighbours and visitors make informed parking choices.`,
      [{ text: 'Done', onPress: () => router.back() }]
    );
  };

  const renderStarSelector = (
    title: string,
    currentValue: number,
    onSelect: (val: number) => void,
    readOnly = false
  ) => {
    return (
      <View style={styles.starRowContainer}>
        <AppText variant="caption" weight="semiBold" color={colors.text} style={{ flex: 1 }}>
          {title}
        </AppText>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable
              key={star}
              disabled={readOnly}
              onPress={() => onSelect(star)}
              hitSlop={6}
            >
              <AppIcon
                name={star <= currentValue ? 'star' : 'star-outline'}
                size={22}
                color={star <= currentValue ? '#EAB308' : colors.secondaryText}
              />
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title={isAlreadyReviewed ? 'Your Review' : 'Rate Your Parking'}
        subtitle={`Booking #${booking.bookingNumber}`}
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
            <AppIcon name="star" size={16} color={colors.warning} />
            <AppText variant="captionSmall" weight="bold" color={colors.warning}>
              PROTOTYPE COMMUNITY REVIEW SYSTEM
            </AppText>
          </View>
          <AppText variant="captionSmall" color={colors.warning} style={{ marginTop: 2 }}>
            Simulates customer feedback. Duplicate reviews for the same reservation are prevented. Completed bookings only.
          </AppText>
        </View>

        {/* Space Card Summary */}
        <AppCard style={{ marginTop: spacing.md, padding: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <AppText variant="h3">{booking.space.name}</AppText>
              <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                {booking.space.locality}, {booking.space.city} • Plate: {booking.vehicle.licensePlate}
              </AppText>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Parked on {booking.bookingDate} ({booking.durationHours} hrs)
              </AppText>
            </View>
            <AppBadge
              label={isAlreadyReviewed ? 'REVIEWED' : booking.status.toUpperCase()}
              variant={isAlreadyReviewed ? 'primary' : 'success'}
              size="sm"
            />
          </View>
        </AppCard>

        {/* Review Ineligibility Warning if Not Completed */}
        {!isEligible && (
          <AppCard style={{ marginTop: spacing.md, padding: spacing.md, borderColor: colors.error }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <AppIcon name="lock-closed-outline" size={20} color={colors.error} />
              <AppText variant="bodyBold" color={colors.error}>
                Review Not Yet Available
              </AppText>
            </View>
            <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 4 }}>
              To maintain community review integrity, only completed parking sessions can be reviewed. Please complete your reservation at {booking.space.name} before submitting feedback.
            </AppText>
          </AppCard>
        )}

        {/* Already Reviewed Mode */}
        {isAlreadyReviewed && existingReview && (
          <View style={{ marginTop: spacing.lg }}>
            <AppText variant="h3">Submitted Feedback</AppText>
            <AppCard style={{ marginTop: spacing.sm, padding: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <AppIcon
                      key={s}
                      name={s <= existingReview.overallRating ? 'star' : 'star-outline'}
                      size={20}
                      color={s <= existingReview.overallRating ? '#EAB308' : colors.secondaryText}
                    />
                  ))}
                  <AppText variant="bodyBold" style={{ marginLeft: 6 }}>
                    {existingReview.overallRating}.0
                  </AppText>
                </View>
                <AppText variant="captionSmall" color={colors.secondaryText}>
                  {existingReview.createdAt}
                </AppText>
              </View>

              <View
                style={[
                  styles.commentBox,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderRadius: radius.md,
                    padding: spacing.md,
                    marginTop: 12,
                  },
                ]}
              >
                <AppText variant="body" color={colors.text}>
                  "{existingReview.comment}"
                </AppText>
              </View>

              <View style={[styles.breakdownTable, { borderTopColor: colors.border, borderTopWidth: 1, marginTop: 14, paddingTop: 10 }]}>
                <View style={styles.scoreRow}>
                  <AppText variant="captionSmall" color={colors.secondaryText}>Parking Bay Quality</AppText>
                  <AppText variant="captionSmall" weight="bold">{existingReview.parkingExperience} / 5</AppText>
                </View>
                <View style={styles.scoreRow}>
                  <AppText variant="captionSmall" color={colors.secondaryText}>Access Ease & Security</AppText>
                  <AppText variant="captionSmall" weight="bold">{existingReview.accessExperience} / 5</AppText>
                </View>
                <View style={styles.scoreRow}>
                  <AppText variant="captionSmall" color={colors.secondaryText}>Cleanliness & Lighting</AppText>
                  <AppText variant="captionSmall" weight="bold">{existingReview.cleanlinessSuitability} / 5</AppText>
                </View>
              </View>
            </AppCard>
          </View>
        )}

        {/* New Review Form (if completed and not yet reviewed) */}
        {!isAlreadyReviewed && isEligible && (
          <View style={{ marginTop: spacing.lg }}>
            <AppText variant="h3">Rate Your Experience</AppText>
            <AppCard style={{ marginTop: spacing.sm, padding: spacing.md }}>
              {renderStarSelector('Overall Rating', overallRating, setOverallRating)}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              {renderStarSelector('Parking Bay Quality', parkingExp, setParkingExp)}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              {renderStarSelector('Access Ease & Security', accessExp, setAccessExp)}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              {renderStarSelector('Cleanliness & Lighting', cleanliness, setCleanliness)}
            </AppCard>

            <View style={{ marginTop: spacing.lg }}>
              <AppInput
                label="Your Detailed Review"
                placeholder="How was the parking bay? Was gate verification quick? Did you notice any special society rules?"
                value={comment}
                onChangeText={(val) => {
                  setComment(val);
                  setErrorMsg('');
                }}
                multiline
                numberOfLines={4}
                error={errorMsg}
              />
            </View>

            <View style={{ marginTop: spacing.xl }}>
              <AppButton
                title="Submit Community Review"
                variant="primary"
                size="lg"
                onPress={handleSubmit}
              />
            </View>
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
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  demoBanner: {
    borderWidth: 1,
  },
  starRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  commentBox: {},
  breakdownTable: {
    gap: 6,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
