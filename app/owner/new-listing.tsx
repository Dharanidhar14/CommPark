import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Switch,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useOwnerStore } from '../../src/store/useOwnerStore';
import {
  ParkingCategory,
  AccessType,
  VehicleType,
  Amenity,
  ApprovalStatus,
  ParkingSpace,
} from '../../src/types/parking';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppInput } from '../../src/components/ui/AppInput';
import { AppBadge } from '../../src/components/ui/AppBadge';
import { AppButton } from '../../src/components/ui/AppButton';
import { AccessTypePill } from '../../src/components/parking/AccessTypePill';

const SAMPLE_PARKING_PHOTOS = [
  'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
];

export default function NewListingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const addListing = useOwnerStore((s) => s.addListing);

  const [step, setStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [createdListing, setCreatedListing] = useState<ParkingSpace | null>(null);

  // Form State
  const [locality, setLocality] = useState('Indiranagar');
  const [city, setCity] = useState('Bengaluru');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState<ParkingCategory>('residential');
  const [description, setDescription] = useState('');

  // Specs & Amenities
  const [lengthMeters, setLengthMeters] = useState('5.2');
  const [widthMeters, setWidthMeters] = useState('2.6');
  const [clearanceMeters, setClearanceMeters] = useState('2.2');
  const [isCovered, setIsCovered] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(SAMPLE_PARKING_PHOTOS[0]);
  const [supportedVehicles, setSupportedVehicles] = useState<VehicleType[]>(['sedan', 'suv', 'ev']);
  const [amenities, setAmenities] = useState<Amenity[]>([
    'covered',
    'cctv',
    'gated',
    '24_7_access',
  ]);

  // Pricing & Schedule
  const [pricePerHour, setPricePerHour] = useState('40');
  const [pricePerDay, setPricePerDay] = useState('250');
  const [operatingHours, setOperatingHours] = useState('24 Hours (Daily)');

  // Access & Community Approval
  const [accessType, setAccessType] = useState<AccessType>('security_verified');
  const [societyName, setSocietyName] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [slotNumber, setSlotNumber] = useState('');
  const [hasOwnershipCertified, setHasOwnershipCertified] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const toggleVehicle = (v: VehicleType) => {
    if (supportedVehicles.includes(v)) {
      if (supportedVehicles.length > 1) {
        setSupportedVehicles(supportedVehicles.filter((item) => item !== v));
      }
    } else {
      setSupportedVehicles([...supportedVehicles, v]);
    }
  };

  const toggleAmenity = (a: Amenity) => {
    if (amenities.includes(a)) {
      setAmenities(amenities.filter((item) => item !== a));
    } else {
      setAmenities([...amenities, a]);
    }
  };

  const validateCurrentStep = (): boolean => {
    setFormError(null);
    if (step === 1) {
      if (!name.trim()) {
        setFormError('Please enter a descriptive name for your parking space.');
        return false;
      }
      if (!address.trim()) {
        setFormError('Please provide the street address.');
        return false;
      }
    } else if (step === 3) {
      const parsedRate = parseInt(pricePerHour, 10);
      if (isNaN(parsedRate) || parsedRate < 10) {
        setFormError('Please enter a valid hourly rate (minimum ₹10/hr).');
        return false;
      }
    } else if (step === 4) {
      if (category === 'residential') {
        if (!societyName.trim()) {
          setFormError('Resident Welfare Association / Apartment Society name is required.');
          return false;
        }
        if (!slotNumber.trim()) {
          setFormError('Parking bay / slot ID (e.g. Basement Bay 14) is required.');
          return false;
        }
        if (!hasOwnershipCertified) {
          setFormError('You must certify legal rights to list this apartment parking bay.');
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (step < 5) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = () => {
    const isApartment = category === 'residential';
    const status: ApprovalStatus = isApartment ? 'pending_approval' : 'approved';

    const newSpaceData: Omit<ParkingSpace, 'id'> = {
      name: name.trim(),
      description:
        description.trim() ||
        `${isCovered ? 'Covered' : 'Open'} parking space in ${locality}, suitable for daily and hourly reservation.`,
      address: address.trim(),
      locality,
      neighborhood: locality,
      city,
      state: 'Karnataka',
      postalCode: '560038',
      coordinates: { latitude: 12.9716, longitude: 77.6412 },
      distanceKm: 0.9,
      category,
      accessType,
      pricePerHour: parseInt(pricePerHour, 10) || 40,
      pricePerDay: parseInt(pricePerDay, 10) || 250,
      currency: '₹',
      covered: isCovered,
      supportedVehicles,
      amenities,
      images: [selectedPhoto],
      rating: 0,
      reviewCount: 0,
      isAvailable: status === 'approved',
      availableSpots: status === 'approved' ? 1 : 0,
      totalSpots: 1,
      approvalStatus: status,
      communityInfo: isApartment
        ? {
            societyName: societyName.trim(),
            unitOrFlatNumber: unitNumber.trim(),
            slotNumber: slotNumber.trim(),
            submittedAt: new Date().toISOString(),
          }
        : undefined,
      accessInstructions:
        accessType === 'security_verified'
          ? `Present QR code at security gate. Security guard checks vehicle plate against booking for slot ${slotNumber || 'A-1'}.`
          : accessType === 'direct_access'
          ? 'Enter gate access PIN on barrier keypad upon arrival.'
          : 'Host will assist and guide vehicle to allocated parking bay upon arrival.',
      securityGuardOnSite: accessType === 'security_verified',
      guardVerificationReward: accessType === 'security_verified' ? 15 : undefined,
      owner: {
        id: 'usr_sarah_01',
        name: 'Sarah Jenkins',
        rating: 5.0,
        responseRatePercent: 100,
        isVerified: true,
        communityName: societyName || 'CommunityPark Resident',
        joinedYear: 2026,
      },
      rules: [
        'Park strictly within marked bay lines',
        'Speed limit 10 km/h on internal premises',
        'No hazardous substances or vehicle repair',
      ],
      dimensions: {
        lengthMeters: parseFloat(lengthMeters) || 5.2,
        widthMeters: parseFloat(widthMeters) || 2.6,
        heightClearanceMeters: isCovered ? parseFloat(clearanceMeters) || 2.2 : undefined,
      },
      operatingHours,
      nearbyLandmarks: [`${locality} Main Commercial Hub`],
      isDemoData: true,
    };

    const saved = addListing(newSpaceData);
    setCreatedListing(saved);
    setIsSubmitted(true);
  };

  // Submission Complete View
  if (isSubmitted && createdListing) {
    const isPending = createdListing.approvalStatus === 'pending_approval';

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Listing Submitted" showBack={false} />
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 40 },
          ]}
        >
          <View style={{ alignItems: 'center', marginTop: 24 }}>
            <View
              style={[
                styles.successCircle,
                {
                  backgroundColor: isPending
                    ? 'rgba(234, 179, 8, 0.15)'
                    : 'rgba(217, 245, 66, 0.2)',
                  borderColor: isPending ? colors.warning : colors.primary,
                },
              ]}
            >
              <AppIcon
                name={isPending ? 'time-outline' : 'checkmark-circle'}
                size={52}
                color={isPending ? colors.warning : (isDark ? colors.primary : '#49570B')}
              />
            </View>

            <AppBadge
              label={isPending ? 'PENDING RWA APPROVAL' : 'LISTING IS LIVE'}
              variant={isPending ? 'warning' : 'success'}
              size="md"
              style={{ marginTop: spacing.md }}
            />

            <AppText variant="h2" align="center" style={{ marginTop: spacing.sm }}>
              {isPending ? 'Submitted for Verification' : 'Parking Space Published!'}
            </AppText>

            <AppText
              variant="body"
              color={colors.secondaryText}
              align="center"
              style={{ marginTop: 6, maxWidth: 320, lineHeight: 20 }}
            >
              {isPending
                ? `Your apartment slot at ${createdListing.communityInfo?.societyName} has been submitted for society committee authorization. It will remain private until approved.`
                : 'Your driveway parking space is verified and now active on the CommunityPark Explore map for drivers to book.'}
            </AppText>
          </View>

          {/* Listing Summary Preview */}
          <AppCard style={{ marginTop: spacing.xl }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <AccessTypePill accessType={createdListing.accessType} compact />
                <AppText variant="h3" style={{ marginTop: 8 }}>
                  {createdListing.name}
                </AppText>
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                  {createdListing.address}, {createdListing.locality}
                </AppText>
              </View>
              <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
                <AppText variant="h3" color={isDark ? colors.primary : '#49570B'}>
                  ₹{createdListing.pricePerHour}
                </AppText>
                <AppText variant="captionSmall" color={colors.secondaryText}>
                  per hour
                </AppText>
              </View>
            </View>
          </AppCard>

          <View style={{ marginTop: spacing.xl, gap: 12 }}>
            <AppButton
              title="Go to Owner Dashboard"
              onPress={() => router.replace('/owner' as any)}
              variant="primary"
              size="lg"
            />
            <AppButton
              title="View on Customer Map"
              onPress={() => router.replace('/(tabs)/explore' as any)}
              variant="outline"
              size="md"
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="List Your Parking Space"
        subtitle={`Step ${step} of 5 • Guided listing workflow`}
        showBack
        onBack={() => {
          if (step > 1) {
            setStep(step - 1);
          } else {
            router.back();
          }
        }}
      />

      {/* Visual Step Progress Bar */}
      <View style={[styles.stepperContainer, { paddingHorizontal: spacing.lg }]}>
        {[1, 2, 3, 4, 5].map((s) => (
          <View
            key={s}
            style={[
              styles.stepBar,
              {
                backgroundColor: s <= step ? colors.primary : colors.surfaceSubtle,
              },
            ]}
          />
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing.lg,
            paddingBottom: insets.bottom + 90,
          },
        ]}
      >
        {/* Error Notification */}
        {formError && (
          <View
            style={[
              styles.errorBanner,
              {
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: colors.error,
                borderRadius: radius.md,
                padding: spacing.sm,
                marginTop: spacing.sm,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <AppIcon name="alert-circle" size={16} color={colors.error} />
              <AppText variant="captionSmall" weight="bold" color={colors.error} style={{ flex: 1 }}>
                {formError}
              </AppText>
            </View>
          </View>
        )}

        {/* STEP 1: LOCATION & CATEGORY */}
        {step === 1 && (
          <View style={{ marginTop: spacing.md }}>
            <AppText variant="h3">Step 1: Location & Category</AppText>
            <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
              Where is your parking space situated, and what type of property is it?
            </AppText>

            {/* Category Selector */}
            <AppText variant="bodyBold" style={{ marginTop: spacing.md }}>
              Property Category
            </AppText>
            <View style={{ marginTop: spacing.xs, gap: 8 }}>
              {[
                {
                  cat: 'residential' as ParkingCategory,
                  title: 'Apartment / Gated Society Bay',
                  desc: 'Allotted slot in apartment basement/podium. Requires society RWA approval.',
                  icon: 'business-outline',
                },
                {
                  cat: 'driveway' as ParkingCategory,
                  title: 'Private Bungalow Driveway',
                  desc: 'Independent bungalow or house driveway with direct street approach.',
                  icon: 'home-outline',
                },
                {
                  cat: 'street_bay' as ParkingCategory,
                  title: 'Independent Gated Space',
                  desc: 'Private standalone commercial or residential plot with keypad/lockbox.',
                  icon: 'key-outline',
                },
                {
                  cat: 'commercial' as ParkingCategory,
                  title: 'Commercial Facility',
                  desc: 'Multi-level garage, mall, or office tech park parking bay.',
                  icon: 'car-sport-outline',
                },
              ].map((item) => {
                const isSelected = category === item.cat;
                return (
                  <Pressable
                    key={item.cat}
                    onPress={() => setCategory(item.cat)}
                    style={[
                      styles.categoryOption,
                      {
                        backgroundColor: isSelected ? colors.surfaceSubtle : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderRadius: radius.md,
                        padding: spacing.md,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                  >
                    <AppIcon
                      name={item.icon as any}
                      size={22}
                      color={isSelected ? (isDark ? colors.primary : '#49570B') : colors.secondaryText}
                    />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <AppText variant="bodyBold">{item.title}</AppText>
                      <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                        {item.desc}
                      </AppText>
                    </View>
                    <AppIcon
                      name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={20}
                      color={isSelected ? (isDark ? colors.primary : '#49570B') : colors.secondaryText}
                    />
                  </Pressable>
                );
              })}
            </View>

            {/* Locality Selector */}
            <AppText variant="bodyBold" style={{ marginTop: spacing.lg }}>
              Locality
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, marginTop: spacing.xs }}
            >
              {['Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'MG Road', 'Bandra West'].map((loc) => {
                const isSel = locality === loc;
                return (
                  <Pressable
                    key={loc}
                    onPress={() => setLocality(loc)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSel ? colors.pricePinBg : colors.surface,
                        borderColor: isSel ? colors.primary : colors.border,
                        borderRadius: radius.pill,
                        paddingVertical: spacing.sm,
                        paddingHorizontal: spacing.md,
                        borderWidth: isSel ? 2 : 1,
                      },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      weight={isSel ? 'bold' : 'medium'}
                      color={isSel ? colors.pricePinText : colors.text}
                    >
                      {loc}
                    </AppText>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={{ marginTop: spacing.md }}>
              <AppInput
                label="Space Title"
                placeholder="e.g. Palm Meadows Gated Basement Bay"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={{ marginTop: spacing.sm }}>
              <AppInput
                label="Street Address"
                placeholder="e.g. 12th Main Road, HAL 2nd Stage"
                value={address}
                onChangeText={setAddress}
              />
            </View>

            <View style={{ marginTop: spacing.sm }}>
              <AppInput
                label="City"
                value={city}
                onChangeText={setCity}
              />
            </View>
          </View>
        )}

        {/* STEP 2: SPECS, PHOTOS & AMENITIES */}
        {step === 2 && (
          <View style={{ marginTop: spacing.md }}>
            <AppText variant="h3">Step 2: Specifications & Media</AppText>
            <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
              Dimensions, vehicle clearance, and parking photo.
            </AppText>

            {/* Photo Picker */}
            <AppText variant="bodyBold" style={{ marginTop: spacing.md }}>
              Primary Space Photograph
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, marginTop: spacing.xs }}
            >
              {SAMPLE_PARKING_PHOTOS.map((imgUrl, idx) => {
                const isSel = selectedPhoto === imgUrl;
                return (
                  <Pressable
                    key={imgUrl}
                    onPress={() => setSelectedPhoto(imgUrl)}
                    style={[
                      styles.photoOption,
                      {
                        borderColor: isSel ? colors.primary : colors.border,
                        borderWidth: isSel ? 3 : 1,
                        borderRadius: radius.md,
                        overflow: 'hidden',
                      },
                    ]}
                  >
                    <Image source={{ uri: imgUrl }} style={{ width: 120, height: 80 }} />
                    {isSel && (
                      <View style={[styles.photoCoverBadge, { backgroundColor: colors.primary }]}>
                        <AppText variant="captionSmall" weight="bold" color={colors.primaryForeground}>
                          COVER
                        </AppText>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Covered Space Toggle */}
            <View
              style={[
                styles.toggleRow,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  marginTop: spacing.lg,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <AppText variant="bodyBold">Covered Parking Bay</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText}>
                  Protected from rain, direct sun, and weather elements
                </AppText>
              </View>
              <Switch
                value={isCovered}
                onValueChange={setIsCovered}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={isDark ? '#000' : '#fff'}
              />
            </View>

            {/* Dimensions */}
            <AppText variant="bodyBold" style={{ marginTop: spacing.lg }}>
              Bay Dimensions (Meters)
            </AppText>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.xs }}>
              <View style={{ flex: 1 }}>
                <AppInput
                  label="Length (m)"
                  value={lengthMeters}
                  onChangeText={setLengthMeters}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <AppInput
                  label="Width (m)"
                  value={widthMeters}
                  onChangeText={setWidthMeters}
                  keyboardType="numeric"
                />
              </View>
              {isCovered && (
                <View style={{ flex: 1 }}>
                  <AppInput
                    label="Height (m)"
                    value={clearanceMeters}
                    onChangeText={setClearanceMeters}
                    keyboardType="numeric"
                  />
                </View>
              )}
            </View>

            {/* Vehicle Compatibility */}
            <AppText variant="bodyBold" style={{ marginTop: spacing.lg }}>
              Supported Vehicle Types
            </AppText>
            <View style={[styles.chipGrid, { marginTop: spacing.xs }]}>
              {[
                { type: 'sedan' as VehicleType, label: 'Sedan' },
                { type: 'suv' as VehicleType, label: 'SUV' },
                { type: 'ev' as VehicleType, label: 'Electric Vehicle' },
                { type: 'hatchback' as VehicleType, label: 'Hatchback' },
                { type: 'motorcycle' as VehicleType, label: '2-Wheeler' },
              ].map((veh) => {
                const isSelected = supportedVehicles.includes(veh.type);
                return (
                  <Pressable
                    key={veh.type}
                    onPress={() => toggleVehicle(veh.type)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.pricePinBg : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderRadius: radius.pill,
                        paddingVertical: 6,
                        paddingHorizontal: spacing.md,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      weight={isSelected ? 'bold' : 'medium'}
                      color={isSelected ? colors.pricePinText : colors.text}
                    >
                      {veh.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            {/* Amenities */}
            <AppText variant="bodyBold" style={{ marginTop: spacing.lg }}>
              Amenities Available
            </AppText>
            <View style={[styles.chipGrid, { marginTop: spacing.xs }]}>
              {[
                { id: 'ev_charging' as Amenity, label: 'EV Charger (7.4kW)' },
                { id: 'cctv' as Amenity, label: 'CCTV Surveillance' },
                { id: 'security_guard' as Amenity, label: '24/7 Security Guard' },
                { id: 'gated' as Amenity, label: 'Gated / Boom Barrier' },
                { id: '24_7_access' as Amenity, label: '24/7 Access' },
              ].map((amenity) => {
                const isSelected = amenities.includes(amenity.id);
                return (
                  <Pressable
                    key={amenity.id}
                    onPress={() => toggleAmenity(amenity.id)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.pricePinBg : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderRadius: radius.pill,
                        paddingVertical: 6,
                        paddingHorizontal: spacing.md,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      weight={isSelected ? 'bold' : 'medium'}
                      color={isSelected ? colors.pricePinText : colors.text}
                    >
                      {amenity.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* STEP 3: PRICING & OPERATING SCHEDULE */}
        {step === 3 && (
          <View style={{ marginTop: spacing.md }}>
            <AppText variant="h3">Step 3: Pricing & Operating Schedule</AppText>
            <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
              Set competitive rates in Indian Rupees and define availability.
            </AppText>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: spacing.md }}>
              <View style={{ flex: 1 }}>
                <AppInput
                  label="Hourly Rate (₹/hr)"
                  value={pricePerHour}
                  onChangeText={setPricePerHour}
                  keyboardType="numeric"
                  leftIcon={<AppText variant="bodyBold" color={colors.secondaryText}>₹</AppText>}
                />
              </View>
              <View style={{ flex: 1 }}>
                <AppInput
                  label="Daily Rate (₹/day)"
                  value={pricePerDay}
                  onChangeText={setPricePerDay}
                  keyboardType="numeric"
                  leftIcon={<AppText variant="bodyBold" color={colors.secondaryText}>₹</AppText>}
                />
              </View>
            </View>

            {/* Revenue Estimation Card */}
            <AppCard
              style={{
                marginTop: spacing.md,
                backgroundColor: isDark ? 'rgba(217, 245, 66, 0.08)' : 'rgba(217, 245, 66, 0.15)',
                borderColor: colors.primary,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AppIcon name="trending-up" size={18} color={isDark ? colors.primary : '#49570B'} />
                <AppText variant="bodyBold" color={isDark ? colors.primary : '#49570B'}>
                  Estimated Monthly Potential
                </AppText>
              </View>
              <AppText variant="h2" weight="extraBold" style={{ marginTop: 6 }}>
                ₹{((parseInt(pricePerHour, 10) || 40) * 6 * 25).toLocaleString('en-IN')}
                <AppText variant="caption" color={colors.secondaryText}> / month</AppText>
              </AppText>
              <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 4 }}>
                Based on an average of 6 hours booked per day over 25 days/month.
              </AppText>
            </AppCard>

            {/* Operating Hours */}
            <AppText variant="bodyBold" style={{ marginTop: spacing.lg }}>
              Operating Hours
            </AppText>
            <View style={{ marginTop: spacing.xs, gap: 8 }}>
              {['24 Hours (Daily)', '08:00 AM – 10:00 PM (Daytime Only)', 'Weekdays Only (09:00 AM – 07:00 PM)'].map((hrs) => {
                const isSelected = operatingHours === hrs;
                return (
                  <Pressable
                    key={hrs}
                    onPress={() => setOperatingHours(hrs)}
                    style={[
                      styles.categoryOption,
                      {
                        backgroundColor: isSelected ? colors.surfaceSubtle : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderRadius: radius.md,
                        padding: spacing.md,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                  >
                    <AppText variant="bodyBold" style={{ flex: 1 }}>{hrs}</AppText>
                    <AppIcon
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={isSelected ? (isDark ? colors.primary : '#49570B') : colors.secondaryText}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* STEP 4: ACCESS METHOD & COMMUNITY APPROVAL */}
        {step === 4 && (
          <View style={{ marginTop: spacing.md }}>
            <AppText variant="h3">Step 4: Access Method & Community Approval</AppText>
            <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
              Configure entry procedure and verify gated community credentials.
            </AppText>

            {/* Access Method Selection */}
            <AppText variant="bodyBold" style={{ marginTop: spacing.md }}>
              Access Workflow
            </AppText>
            <View style={{ marginTop: spacing.xs, gap: 8 }}>
              {[
                {
                  id: 'security_verified' as AccessType,
                  title: 'Security-Verified Access',
                  desc: 'Gate guard scans mobile booking QR code and verifies vehicle plate. Includes ₹15 guard incentive.',
                  icon: 'shield-checkmark-outline',
                },
                {
                  id: 'owner_assisted' as AccessType,
                  title: 'Owner-Assisted Access',
                  desc: 'Host greets driver or confirms entry directly without gate security personnel.',
                  icon: 'people-outline',
                },
                {
                  id: 'direct_access' as AccessType,
                  title: 'Direct Access',
                  desc: 'Keypad PIN, smart bollard, or lockbox code automatically provided to customer upon booking.',
                  icon: 'key-outline',
                },
                {
                  id: 'facility_managed' as AccessType,
                  title: 'Facility-Managed Access',
                  desc: 'Automated ANPR camera scans plate or boom barrier tickets issued at commercial facility.',
                  icon: 'business-outline',
                },
              ].map((acc) => {
                const isSelected = accessType === acc.id;
                return (
                  <Pressable
                    key={acc.id}
                    onPress={() => setAccessType(acc.id)}
                    style={[
                      styles.categoryOption,
                      {
                        backgroundColor: isSelected ? colors.surfaceSubtle : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderRadius: radius.md,
                        padding: spacing.md,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                  >
                    <AppIcon
                      name={acc.icon as any}
                      size={22}
                      color={isSelected ? (isDark ? colors.primary : '#49570B') : colors.secondaryText}
                    />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <AppText variant="bodyBold">{acc.title}</AppText>
                      <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                        {acc.desc}
                      </AppText>
                    </View>
                    <AppIcon
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={isSelected ? (isDark ? colors.primary : '#49570B') : colors.secondaryText}
                    />
                  </Pressable>
                );
              })}
            </View>

            {/* If Category is Apartment / Residential: Mandatory Community Approval Section */}
            {category === 'residential' && (
              <View style={{ marginTop: spacing.xl }}>
                <View
                  style={[
                    styles.societyPolicyBox,
                    {
                      backgroundColor: 'rgba(234, 179, 8, 0.12)',
                      borderColor: colors.warning,
                      borderRadius: radius.md,
                      padding: spacing.md,
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <AppIcon name="shield-half" size={18} color={colors.warning} />
                    <AppText variant="caption" weight="bold" color={colors.warning}>
                      Apartment Society Verification Required
                    </AppText>
                  </View>
                  <AppText variant="captionSmall" color={colors.warning} style={{ marginTop: 4, lineHeight: 16 }}>
                    To protect gated community safety, residential parking listings must be validated by the Resident Welfare Association (RWA) or Estate Office. Your listing will enter a pending approval state and cannot be publicly booked until verified.
                  </AppText>
                </View>

                <View style={{ marginTop: spacing.md }}>
                  <AppInput
                    label="Apartment Society / RWA Name"
                    placeholder="e.g. Greenwood Palms RWA / Prestige Sunrise"
                    value={societyName}
                    onChangeText={setSocietyName}
                  />
                </View>

                <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.sm }}>
                  <View style={{ flex: 1 }}>
                    <AppInput
                      label="Flat / Unit Number"
                      placeholder="e.g. Tower B, Flat 402"
                      value={unitNumber}
                      onChangeText={setUnitNumber}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppInput
                      label="Slot Identification"
                      placeholder="e.g. Basement Bay 14"
                      value={slotNumber}
                      onChangeText={setSlotNumber}
                    />
                  </View>
                </View>

                {/* Certification Checkbox */}
                <Pressable
                  onPress={() => setHasOwnershipCertified(!hasOwnershipCertified)}
                  style={[
                    styles.certifyRow,
                    {
                      borderColor: hasOwnershipCertified ? colors.primary : colors.border,
                      borderRadius: radius.md,
                      padding: spacing.md,
                      marginTop: spacing.md,
                      backgroundColor: colors.surfaceSubtle,
                    },
                  ]}
                >
                  <AppIcon
                    name={hasOwnershipCertified ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={hasOwnershipCertified ? (isDark ? colors.primary : '#49570B') : colors.secondaryText}
                  />
                  <AppText variant="captionSmall" color={colors.text} style={{ marginLeft: 10, flex: 1, lineHeight: 16 }}>
                    I certify that I am the authorized owner or primary tenant of this parking bay and have the legal right to list it under society guidelines.
                  </AppText>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* STEP 5: PREVIEW & SUBMISSION */}
        {step === 5 && (
          <View style={{ marginTop: spacing.md }}>
            <AppText variant="h3">Step 5: Review & Publish</AppText>
            <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
              Review your parking listing preview before publishing to CommunityPark.
            </AppText>

            {/* Publication Status Notice */}
            <View
              style={[
                styles.statusNotice,
                {
                  backgroundColor:
                    category === 'residential' ? 'rgba(234, 179, 8, 0.12)' : 'rgba(34, 197, 94, 0.12)',
                  borderColor: category === 'residential' ? colors.warning : colors.success,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  marginTop: spacing.sm,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AppIcon
                  name={category === 'residential' ? 'time' : 'checkmark-circle'}
                  size={18}
                  color={category === 'residential' ? colors.warning : colors.success}
                />
                <AppText
                  variant="caption"
                  weight="bold"
                  color={category === 'residential' ? colors.warning : colors.success}
                >
                  {category === 'residential'
                    ? 'Submission State: PENDING RWA APPROVAL'
                    : 'Submission State: IMMEDIATE PUBLIC ACTIVATION'}
                </AppText>
              </View>
              <AppText
                variant="captionSmall"
                color={category === 'residential' ? colors.warning : colors.success}
                style={{ marginTop: 4, lineHeight: 16 }}
              >
                {category === 'residential'
                  ? 'This apartment listing will not appear in customer search until your Society Estate Office validates slot rights.'
                  : 'This driveway listing will be immediately active and bookable by community drivers.'}
              </AppText>
            </View>

            {/* Customer Facing Card Preview */}
            <AppCard style={{ marginTop: spacing.md }}>
              <Image
                source={{ uri: selectedPhoto }}
                style={[styles.previewImage, { borderRadius: radius.md }]}
              />

              <View style={{ marginTop: spacing.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <AccessTypePill accessType={accessType} compact />
                  {isCovered && <AppBadge label="COVERED" variant="default" size="sm" />}
                </View>

                <AppText variant="h3" style={{ marginTop: 8 }}>
                  {name}
                </AppText>
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                  {address}, {locality}, {city}
                </AppText>

                <View style={[styles.divider, { backgroundColor: colors.borderSubtle, marginVertical: spacing.sm }]} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <AppText variant="captionSmall" color={colors.secondaryText}>
                      Hourly Rate
                    </AppText>
                    <AppText variant="h3" color={isDark ? colors.primary : '#49570B'}>
                      ₹{pricePerHour}/hr
                    </AppText>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <AppText variant="captionSmall" color={colors.secondaryText}>
                      Daily Rate
                    </AppText>
                    <AppText variant="bodyBold">
                      ₹{pricePerDay}/day
                    </AppText>
                  </View>
                </View>
              </View>
            </AppCard>
          </View>
        )}
      </ScrollView>

      {/* Floating Bottom Navigation Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingBottom: Math.max(insets.bottom, 12),
            paddingHorizontal: spacing.lg,
          },
        ]}
      >
        <AppButton
          title={step === 5 ? (category === 'residential' ? 'Submit for Society Approval' : 'Publish Listing Now') : 'Continue to Next Step'}
          onPress={handleNext}
          variant="primary"
          size="lg"
          rightIcon={<AppIcon name={step === 5 ? 'checkmark' : 'arrow-forward'} size={18} color={colors.primaryForeground} />}
        />
      </View>
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
  stepperContainer: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 10,
  },
  stepBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  errorBanner: {
    borderWidth: 1,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoOption: {
    position: 'relative',
  },
  photoCoverBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  societyPolicyBox: {
    borderWidth: 1,
  },
  certifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  statusNotice: {
    borderWidth: 1,
  },
  previewImage: {
    width: '100%',
    height: 160,
  },
  divider: {
    height: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
  },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
