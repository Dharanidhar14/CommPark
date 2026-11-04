# CommunityPark Mobile Application

> A community-driven parking marketplace that allows people to discover and book available parking spaces while enabling residents and property owners to monetize unused parking spaces.

---

## Brand & Visual Identity
- **Signature Accent:** Electric Lime (`#D9F542`)
- **Light Theme:** Background `#F7F8F5` | Surface `#FFFFFF` | Text `#171A18`
- **Dark Theme:** Background `#171A18` | Surface `#242925` | Text `#F4F6F1`
- **Typography:** Manrope (`@expo-google-fonts/manrope`)
- **Map Philosophy:** Provider-independent vector discovery abstraction (seamlessly swappable for Google Maps or Mapbox).

---

## 4 Distinct Access Types
CommunityPark adapts access workflows based on the location:
1. **Access Type A: Security-Verified Parking** (e.g., apartment community slots where on-duty security guards scan booking QR codes, check vehicle plates, and log verifications with operational incentives).
2. **Access Type B: Owner-Assisted Parking** (e.g., private residential driveways requiring host approval or specific parking lane guidance).
3. **Access Type C: Direct-Access Parking** (e.g., independent parking bays with smart bollards/keypads or open street slots).
4. **Access Type D: Facility-Managed Parking** (e.g., commercial multi-level garages with automatic LPR cameras and entry gates).

---

## Tech Stack
- **Framework:** React Native + Expo (SDK 58 managed workflow)
- **Navigation:** Expo Router v4 (file-based routing with typed routes)
- **State Management:** Zustand (client state) & TanStack React Query (server state ready)
- **Forms & Validation:** React Hook Form + Zod
- **Typography:** Manrope font family (400, 500, 600, 700, 800)
- **Storage:** Expo SecureStore
- **Hardware Integration:** Expo Location, Expo Image Picker, Expo Notifications
- **Design Tokens:** Centralised token architecture with dynamic light/dark/system mode switching

---

## Project Structure

```text
CommPark/
├── app/                          # Expo Router routes
│   ├── _layout.tsx               # Root layout: ThemeProvider, QueryClient, Font loading
│   ├── index.tsx                 # Root redirect to main tabs
│   ├── (tabs)/                   # 5 primary bottom navigation tabs
│   │   ├── _layout.tsx           # Custom styled tab bar with Electric Lime indicators
│   │   ├── index.tsx             # 1. Customer Home (hero, active pass, nearby spots)
│   │   ├── explore.tsx           # 2. Explore Map (vector discovery map & floating pins)
│   │   ├── bookings.tsx          # 3. Bookings list & active pass shortcut
│   │   ├── wallet.tsx            # 4. Wallet, payouts, and guard incentives
│   │   └── profile.tsx           # 5. Profile & multi-role switcher
│   ├── parking/
│   │   └── [id].tsx              # 6. Parking details (access badge, amenities, pricing)
│   ├── booking/
│   │   ├── summary.tsx           # 7. Booking checkout & vehicle selection
│   │   └── pass.tsx              # 8. Digital parking pass with simulated QR code
│   ├── owner/
│   │   └── index.tsx             # 9. Owner dashboard (listings & earnings)
│   ├── security/
│   │   └── verify.tsx            # 10. Security guard QR scanner & vehicle check
│   └── +not-found.tsx            # 404 handler
├── src/
│   ├── theme/                    # Centralised design tokens & hook
│   │   ├── colors.ts             # Electric Lime #D9F542 & color palettes
│   │   ├── lightTheme.ts         # Light mode tokens
│   │   ├── darkTheme.ts          # Dark mode tokens
│   │   ├── typography.ts         # Manrope font definitions & scale
│   │   ├── spacing.ts            # 4pt grid system
│   │   ├── radius.ts             # Restrained border radii
│   │   └── ThemeProvider.tsx     # useTheme() hook supporting Light/Dark/System
│   ├── components/
│   │   ├── ui/                   # Reusable UI primitives (AppButton, AppText, AppCard, etc.)
│   │   ├── parking/              # Parking domain components (ParkingCard, Price, AccessPill, etc.)
│   │   └── common/               # Cross-cutting components (ActivePassBanner)
│   ├── services/
│   │   └── maps/                 # Provider-independent Map Abstraction
│   │       ├── types.ts          # Map interfaces (IMapProvider, MapCoordinate, MapMarkerItem)
│   │       ├── SimulatedMap.tsx  # Vector canvas map with lime user pin & price tags
│   │       └── MapView.tsx       # Unified CommunityMapView wrapper
│   ├── store/                    # Zustand stores (useThemeStore, useAuthStore, useBookingStore)
│   ├── types/                    # Domain models (ParkingSpace, Booking, User, AccessType)
│   ├── constants/
│   │   └── mockData.ts           # Single source of truth mock database
│   └── features/
│       └── discovery/            # Parking search & filtering logic
├── assets/                       # App icons, splash screens, favicons
├── PROJECT_CONTEXT.md            # Living project context & requirements
└── PROGRESS.md                   # Milestone tracker
```

---

## Development & Execution Commands

### Prerequisites
- Node.js >= 20.0
- npm >= 10.0

### Run the App
```bash
# Start development server
npm start

# Run with Web bundler
npm run web

# Run on Android (requires Android device with Expo Go or Android emulator)
npm run android

# Run on iOS (requires macOS with Xcode or iOS device with Expo Go)
npm run ios
```

### TypeScript Validation
```bash
# Check TypeScript types strictly with zero emit
npm run ts:check
```

### Testing on Physical Devices
1. Install **Expo Go** from Google Play Store or Apple App Store.
2. Run `npm start`.
3. Scan the QR code with the Expo Go camera (Android) or default Camera app (iOS).

---

## Implemented Screens (Milestone 1 Prototype)
1. **Customer Home (`/(tabs)`)** — Photography-led hero, current location pill, search bar, dual "Find Parking" / "List Space" actions, active booking banner, and curated parking lists.
2. **Explore Map (`/(tabs)/explore`)** — Interactive vector map canvas with dark floating price pins (`$4.50/hr`), Electric Lime user location pin, search bar, category chips, and bottom spot preview card.
3. **Bookings (`/(tabs)/bookings`)** — Active pass countdown card, filter tabs (All, Active, Completed), and pass history.
4. **Wallet (`/(tabs)/wallet`)** — Total balance card in Electric Lime & dark surface, breakdown of owner earnings & security guard incentives, and recent ledger activity.
5. **Profile (`/(tabs)/profile`)** — Account details, registered vehicle list, appearance theme selector (Light/Dark/System), and **Unified Multi-Role Switcher** (Customer, Owner, Security Guard).
6. **Parking Space Details (`/parking/[id]`)** — High-res photography, access type badge, detailed access procedure explanation, security on-site badge, host verification, amenities grid, and floating reservation CTA.
7. **Booking Summary & Checkout (`/booking/summary`)** — Vehicle selector, duration chips (1h, 2h, 4h, 8h, 24h), cost breakdown with platform fee, and instant simulated confirmation.
8. **Digital Parking Pass (`/booking/pass`)** — Live simulated QR code pass, license plate match verification, gate passcode, directions button, and guard scan simulation.
9. **Owner Dashboard (`/owner`)** — Space host earnings, active listings toggle (Live / Paused), pricing, and calendar link.
10. **Security Guard Verification (`/security/verify`)** — On-duty guard scanner with camera viewfinder, simulated QR reader, vehicle plate matching, and automatic guard incentive logging (+$1.50).
