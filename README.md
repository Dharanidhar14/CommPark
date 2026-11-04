# CommunityPark Mobile Application

> A community-driven parking marketplace that allows people to discover and book available parking spaces while enabling residents and property owners to monetize unused parking spaces.

---

## Brand & Visual Identity
- **Signature Accent:** Electric Lime (`#D9F542`)
- **Light Theme:** Background `#F7F8F5` | Surface `#FFFFFF` | Text `#171A18`
- **Dark Theme:** Background `#171A18` | Surface `#242925` | Text `#F4F6F1`
- **Typography:** Manrope (`@expo-google-fonts/manrope`)
- **Localization:** Indian Market Standard — Indian Rupee (`₹`), localities in Bengaluru and Mumbai, Indian vehicle registration plates (`KA 01 MJ 4821`), and demo UPI payment simulation.
- **Desktop Web Support:** Centered mobile viewport container (`maxWidth: 480`) to ensure a native smartphone look and feel on desktop browsers.
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
│   ├── _layout.tsx               # Root layout: ThemeProvider, QueryClient, Font loading, Web responsive wrapper
│   ├── index.tsx                 # Root redirect to main tabs
│   ├── about.tsx                 # About CommunityPark (Mission, values, 4 access types, responsible parking)
│   ├── (tabs)/                   # 5 primary bottom navigation tabs
│   │   ├── _layout.tsx           # Custom styled tab bar with Electric Lime indicators
│   │   ├── index.tsx             # 1. Customer Home (hero, locality selector, active pass, monetize banner, nearby spots)
│   │   ├── explore.tsx           # 2. Explore Map (vector discovery map, floating pins & interactive filter sheet)
│   │   ├── bookings.tsx          # 3. Bookings list & active pass shortcut
│   │   ├── wallet.tsx            # 4. Wallet, payouts, and guard incentives in INR (₹)
│   │   └── profile.tsx           # 5. Profile & multi-role switcher (+ Add vehicle, About, Owner dashboard links)
│   ├── parking/
│   │   └── [id].tsx              # 6. Parking details (carousel dots, dimensions, landmarks, security rules)
│   ├── booking/
│   │   ├── summary.tsx           # 7. Booking checkout (date, time, duration, vehicle, simulated UPI/Card/Wallet)
│   │   ├── confirmation.tsx      # 8. Booking confirmation screen (booking ID, reservation summary)
│   │   └── pass.tsx              # 9. Digital parking pass with demo watermark, dynamic QR, directions
│   ├── owner/
│   │   ├── index.tsx             # 10. Owner dashboard (metrics, listings with approval states, upcoming reservations)
│   │   ├── new-listing.tsx       # 11. 5-step guided listing workflow with apartment RWA approval rules
│   │   ├── earnings.tsx          # 12. Owner earnings breakdown, utilization & simulated IMPS bank transfers
│   │   └── listing/
│   │       └── [id].tsx          # 13. Listing management, edit rates, availability toggle & RWA simulator
│   ├── security/
│   │   └── verify.tsx            # 14. Security guard QR scanner & vehicle check (+₹15 incentive log)
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
│   │   ├── parking/              # Parking domain components (ParkingCard, Price, AccessPill, FilterBottomSheet, etc.)
│   │   ├── booking/              # Booking components (AddVehicleModal with RHF & Zod validation)
│   │   ├── home/                 # Home components (LocationSelectorModal)
│   │   └── common/               # Cross-cutting components (ActivePassBanner)
│   ├── services/
│   │   └── maps/                 # Provider-independent Map Abstraction
│   │   │   ├── types.ts          # Map interfaces (IMapProvider, MapCoordinate, MapMarkerItem)
│   │   │   ├── SimulatedMap.tsx  # Vector canvas map with lime user pin & price tags in INR
│   │   │   └── MapView.tsx       # Unified CommunityMapView wrapper
│   ├── store/                    # Zustand stores (useThemeStore, useAuthStore, useBookingStore, useOwnerStore)
│   ├── types/                    # Domain models (ParkingSpace, Booking, User, AccessType, OwnerReservation, etc.)
│   ├── constants/
│   │   └── mockData.ts           # Single source of truth mock database localized in INR
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

# Run on web
npm run web

# Check TypeScript compiler
npm run ts:check

# Run Expo Doctor diagnostic
npx expo-doctor
```

---

## Key Design Principles
- **No Random Emojis as UI Icons:** Consistent vector iconography via `@expo/vector-icons` Ionicons.
- **Provider-Independent Mapping:** Vector map rendering runs without external API keys or native binaries, fully tested on Web, iOS and Android.
- **Explicit Mock & Demo Identification:** All simulated parking passes, vehicle checks, and payment transactions carry prominent DEMO visual badges to prevent confusion with real-world security credentials.
- **Apartment Community Governance:** Residential parking bays require RWA verification before becoming publicly discoverable and bookable; owners cannot bypass society rules.
- **Single Source of Truth:** Centralized mock database in `src/constants/mockData.ts` and `src/store/useOwnerStore.ts` drives all customer, owner, and security views consistently.
