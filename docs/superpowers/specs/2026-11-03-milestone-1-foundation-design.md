# Milestone 1: Foundation, Design Tokens & 6-Screen Architecture Specification

## 1. Project Overview & Scope
- **Project Name:** CommunityPark
- **Platform:** Cross-platform mobile (Android & iOS) via React Native + Expo managed workflow + Expo Router.
- **Language:** TypeScript (strict mode).
- **Core Value Proposition:** Community-driven parking marketplace supporting 4 access types (Security-verified, Owner-assisted, Direct-access, Facility-managed) with a unified multi-role account model (Customer, Owner, Security Guard, Community Admin).
- **Milestone 1 Deliverables:**
  1. Clean Expo SDK 52 setup with TypeScript and Expo Router v4.
  2. Centralised Theme Engine with Electric Lime (`#D9F542`) brand signature and Light/Dark/System modes.
  3. Reusable UI component library (Buttons, Cards, BottomSheet, PriceBadge, AccessTypePill, ActivePassBanner).
  4. Provider-independent map abstraction with interactive vector simulator (`SimulatedMap`).
  5. Single source of truth mock database across all 4 access types and vehicles.
  6. Client-side state stores via Zustand (`useThemeStore`, `useAuthStore`, `useBookingStore`).
  7. 6 core screens showcasing the customer flow and multi-role capabilities:
     - Screen 1: Customer Home (Hero photography, quick search, active pass pill, nearby spots preview, role switcher).
     - Screen 2: Explore Map (Provider-independent map abstraction with floating dark price markers, lime user pin, category filters, bottom sheet card).
     - Screen 3: Parking Details (High-res photo gallery, access type badge, pricing, security/owner requirements, reserve CTA).
     - Screen 4: Booking Summary & Checkout (Vehicle selector, time slot, fee breakdown, simulated instant confirmation).
     - Screen 5: Digital Parking Pass & Active Booking Tracker (Live QR code, gate pass status, directions, access instructions).
     - Screen 6: Owner & Guard Verification Showcase (Owner earnings & listings preview + Security QR verification scanner).

## 2. Technical Stack
- **Framework:** React Native (0.76+ / Expo SDK 52)
- **Routing:** Expo Router v4 (file-based navigation with typed routes)
- **Typography:** `@expo-google-fonts/manrope` (with graceful fallback to system sans-serif)
- **Icons:** `@expo/vector-icons` (Lucide / Ionicons / Feather)
- **Animation:** `react-native-reanimated`
- **State Management:** Zustand (lightweight client state) & TanStack Query (prepared for server state)
- **Validation:** Zod
- **Safe Storage:** Expo SecureStore ready

## 3. Architecture & Directory Layout
```text
CommPark/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── explore.tsx
│   │   ├── bookings.tsx
│   │   ├── wallet.tsx
│   │   └── profile.tsx
│   ├── parking/
│   │   └── [id].tsx
│   ├── booking/
│   │   ├── summary.tsx
│   │   └── pass.tsx
│   ├── owner/
│   │   └── index.tsx
│   ├── security/
│   │   └── verify.tsx
│   └── +not-found.tsx
├── src/
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── radii.ts
│   │   ├── shadows.ts
│   │   └── ThemeContext.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── parking/
│   │   ├── booking/
│   │   └── common/
│   ├── services/
│   │   └── maps/
│   │       ├── types.ts
│   │       ├── MapView.tsx
│   │       └── SimulatedMap.tsx
│   ├── store/
│   │   ├── useThemeStore.ts
│   │   ├── useAuthStore.ts
│   │   └── useBookingStore.ts
│   ├── types/
│   ├── data/mock/
│   └── utils/
├── docs/superpowers/specs/
├── PROJECT_CONTEXT.md
└── PROGRESS.md
```

## 4. Theme & Design System Tokens
- **Brand Primary:** `#D9F542` (Electric Lime)
- **Light Mode:**
  - Background: `#F7F8F5`
  - Surface: `#FFFFFF`
  - Text: `#171A18`
  - Secondary Text: `#747B75`
  - Border: `#E7EAE4`
  - Success: `#3F865B`
  - Error: `#D84C4C`
- **Dark Mode:**
  - Background: `#171A18`
  - Surface: `#242925`
  - Text: `#F4F6F1`
  - Secondary Text: `#A0AAA1`
  - Border: `#343C35`
  - Success: `#80C995`
  - Error: `#FF7777`
- **Spacing Scale:** 4pt grid: 4, 8, 12, 16, 20, 24, 32, 40, 48.
- **Border Radii:** `sm: 8`, `md: 12`, `lg: 16`, `xl: 24`, `full: 9999`.

## 5. Map Abstraction Layer
- `IMapProvider` interface decouples UI code from map vendors.
- Vector `SimulatedMap` provides interactive pan/zoom, coordinate rendering, Electric Lime user beacon, and dark pill markers.
- Future migration to Google Maps or Mapbox requires zero screen refactoring.

## 6. Data Models & Single Mock Dataset
- `AccessType`: `'security_verified' | 'owner_assisted' | 'direct_access' | 'facility_managed'`
- `ParkingSpace`: ID, title, description, address, coordinates, pricePerHour, pricePerDay, accessType, securityInstructions, amenities, rating, reviewCount, photos, isAvailable, ownerId, communityId.
- `Vehicle`: ID, userId, make, model, year, licensePlate, color, type (`sedan | suv | ev | bike`).
- `Booking`: ID, spaceId, vehicleId, startTime, endTime, totalAmount, status (`active | upcoming | completed | cancelled`), qrCodeToken, verificationRecord.
- `SecurityVerification`: ID, bookingId, guardId, scannedAt, vehiclePlateVerified, status (`granted | denied`), incentiveEarned.

## 7. Error Handling & Edge Cases
- Network/data errors: Graceful fallback states with retry buttons.
- Empty states: Custom illustrations/icons when no bookings, search results, or listings exist.
- Invalid QR or expired pass: Security verification explicitly indicates "Valid Pass", "Expired Pass", or "Invalid Vehicle".

## 8. Verification & Testing Strategy
- TypeScript: Zero compiler warnings (`tsc --noEmit`).
- Expo config: `npx expo config --type public` verification.
- Route checks: All navigation transitions and modal presentations operate without dead ends.
- Visual inspection: Verifying Electric Lime consistency across buttons, badges, pins, and tab highlights.
