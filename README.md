# CommunityPark Mobile Application

> A community-driven parking marketplace that allows people to discover and book available parking spaces while enabling residents and property owners to monetize unused parking spaces.

---

## Brand & Visual Identity
- **Signature Accent:** Electric Lime (`#D9F542`)
- **Light Theme:** Background `#F7F8F5` | Surface `#FFFFFF` | Text `#171A18`
- **Dark Theme:** Background `#171A18` | Surface `#242925` | Text `#F4F6F1`
- **Typography:** Google Sans (`@expo-google-fonts/google-sans`) with cross-platform fallbacks
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
- **Typography:** Google Sans font family (400, 500, 600, 700)
- **Storage:** Expo SecureStore
- **Hardware Integration:** Expo Location, Expo Image Picker, Expo Notifications
- **Design Tokens:** Centralised token architecture with dynamic light/dark/system mode switching

---

## Project Structure

```text
CommPark/
├── app/                          # Expo Router routes
│   ├── _layout.tsx               # Root layout: ThemeProvider, QueryClient, Google Sans loading, Web responsive wrapper
│   ├── index.tsx                 # Root redirect to main tabs
│   ├── about.tsx                 # About CommunityPark (Mission, values, 4 access types, responsible parking)
│   ├── (tabs)/                   # 5 primary bottom navigation tabs
│   │   ├── _layout.tsx           # Custom styled tab bar with Electric Lime indicators
│   │   ├── index.tsx             # 1. Customer Home (hero, locality selector, active pass, monetize banner, nearby spots)
│   │   ├── explore.tsx           # 2. Explore Map (vector discovery map, floating pins & interactive filter sheet)
│   │   ├── bookings.tsx          # 3. Bookings list, active pass & review launcher
│   │   ├── wallet.tsx            # 4. Wallet, payouts, top-up modal, and guard incentives in INR (₹)
│   │   └── profile.tsx           # 5. Profile & 4-role switcher (+ Edit Profile, Vehicles, Places, Privacy, Support)
│   ├── parking/
│   │   └── [id].tsx              # 6. Parking details (carousel dots, dimensions, landmarks, community reviews)
│   ├── booking/
│   │   ├── summary.tsx           # 7. Booking checkout (date, time, duration, vehicle, simulated UPI/Card/Wallet)
│   │   ├── confirmation.tsx      # 8. Booking confirmation screen (booking ID, reservation summary)
│   │   └── pass.tsx              # 9. Digital parking pass with demo watermark, dynamic QR, directions
│   ├── review/
│   │   └── [bookingId].tsx       # 10. Customer review submission & duplicate prevention
│   ├── notifications/
│   │   ├── index.tsx             # 11. Notification centre (filters, unread badge, deep-link actions)
│   │   └── settings.tsx          # 12. Push notification toggle preferences
│   ├── profile/
│   │   ├── vehicles.tsx          # 13. Vehicle fleet management with active reservation protection
│   │   ├── saved-places.tsx      # 14. Saved places & quick nearby parking search
│   │   ├── preferences.tsx       # 15. Preferences (default vehicle, languages, appearance)
│   │   └── privacy.tsx           # 16. Privacy, gate data disclosure & security recommendations
│   ├── support/
│   │   ├── index.tsx             # 17. Help centre with searchable FAQ & 24/7 gate intercom
│   │   ├── report.tsx            # 18. Issue reporting with booking link & photo evidence
│   │   └── tickets.tsx           # 19. Support ticket history & official resolutions
│   ├── owner/
│   │   ├── index.tsx             # 20. Owner dashboard (metrics, listings with approval states, upcoming reservations)
│   │   ├── new-listing.tsx       # 21. 5-step guided listing workflow with apartment RWA approval rules
│   │   ├── earnings.tsx          # 22. Owner earnings breakdown, utilization & simulated IMPS bank transfers
│   │   └── listing/
│   │       └── [id].tsx          # 23. Listing management, edit rates, availability toggle & RWA simulator
│   ├── security/
│   │   ├── index.tsx             # 24. Security personnel dashboard (duty toggle, arrivals queue, parked registry, guard incentives)
│   │   └── verify.tsx            # 25. QR scanner viewfinder & multi-scenario verification sandbox
│   ├── admin/
│   │   ├── index.tsx             # 26. Community administration dashboard (property metrics & governance overview)
│   │   ├── approvals.tsx         # 27. Listing authorization portal (approve/reject resident slot submissions)
│   │   ├── policies.tsx          # 28. Community parking policies (speed limit, booking window, sharing toggles)
│   │   ├── staff.tsx             # 29. Security staff roster & gate duty management
│   │   └── audit.tsx             # 30. Tamper-evident society audit logs with filters & export
│   └── +not-found.tsx            # 404 handler
├── src/
│   ├── theme/                    # Centralised design tokens & hook
│   │   ├── colors.ts             # Electric Lime #D9F542 & color palettes
│   │   ├── lightTheme.ts         # Light mode tokens
│   │   ├── darkTheme.ts          # Dark mode tokens
│   │   ├── typography.ts         # Google Sans font definitions & scale
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
│   ├── store/                    # Zustand stores (useThemeStore, useAuthStore, useBookingStore, useOwnerStore, useSecurityStore, useAdminStore, useWalletStore, useNotificationStore, useReviewStore, useSupportStore)
│   ├── types/                    # Domain models (ParkingSpace, Booking, User, AccessType, Security, Admin, etc.)
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
# Start frontend Expo development server
npm start

# Run frontend on web
npm run web

# Check frontend TypeScript compiler
npm run ts:check

# Run Expo Doctor diagnostic
npx expo-doctor
```

### Backend & Security Testing
```bash
# Navigate to backend directory
cd backend

# Install dependencies and generate Prisma client
npm install
npx prisma generate

# Run backend development server (Port 5000)
npm run dev

# Run comprehensive test suite (45 tests across 9 suites)
npm test

# Check backend TypeScript compilation
npx tsc --noEmit
```

---

## Security & Financial Integrity Guarantees (Task 07)
- **Zero Public Privilege Escalation**: Public registration strictly creates `CUSTOMER` accounts. Role elevation to `OWNER`, `SECURITY`, or `COMMUNITY_ADMIN` requires server-side validation.
- **Community-Scoped Authorization**: Administrators and guards can only manage listings and verify gates for communities where they hold verified active memberships. Self-approval of residential listings by committee members is blocked.
- **Double-Booking Prevention**: Concurrency race conditions are eliminated through PostgreSQL transactional advisory locks (`pg_advisory_xact_lock`) and memory mutex locks.
- **Financial Idempotency**: Transactions support unique `Idempotency-Key` headers to prevent duplicate debits and credits on network retries.
- **Cryptographic Randomness**: Pass tokens, booking codes, and transaction references use Node's `crypto.randomBytes(16)`.
- **Production Fail-Fast**: Strict configuration validation halts deployment if default credentials, weak JWT secrets (<32 characters), or wildcard CORS are detected.


---

## Key Design Principles
- **No Random Emojis as UI Icons:** Consistent vector iconography via `@expo/vector-icons` Ionicons.
- **Provider-Independent Mapping:** Vector map rendering runs without external API keys or native binaries, fully tested on Web, iOS and Android.
- **Explicit Mock & Demo Identification:** All simulated parking passes, vehicle checks, and payment transactions carry prominent DEMO visual badges to prevent confusion with real-world security credentials.
- **Apartment Community Governance:** Residential parking bays require RWA verification before becoming publicly discoverable and bookable; owners cannot bypass society rules.
- **Single Source of Truth:** Centralized mock database in `src/constants/mockData.ts` and `src/store/useOwnerStore.ts` drives all customer, owner, and security views consistently.
