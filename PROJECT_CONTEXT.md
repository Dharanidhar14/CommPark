# COMMUNITY PARK — MASTER PROJECT CONTEXT

## 1. Project identity
- Project name: CommunityPark
- Product category: Community-based parking marketplace
- Platform: Cross-platform mobile application
- Target platforms: Android and iOS (with desktop responsive web preview)
- Development framework: React Native + Expo
- Language: TypeScript
- Navigation: Expo Router
- Development environment: Google Antigravity
- Current development stage: Milestone 7: Backend Security, Financial Integrity & Production Readiness Audit Completed

## 2. Product vision
CommunityPark is a community-driven parking marketplace that allows people to discover and book available parking spaces while enabling property owners and residents to monetize unused parking spaces.
The platform connects:
- People looking for parking.
- Individuals and residents with unused parking spaces.
- Apartment communities and property managers.
- Security personnel responsible for authorised vehicle entry.
- Commercial parking facility operators.

Core proposition: Find a space. Book it. Park. Or share your unused space and earn.

## 3. Core differentiating concept: 4 Access Types
1. **Access type A: Security-verified parking**
   Apartment resident lists unused parking slot. Customer books and arrives. Security guard scans customer QR code, verifies vehicle and booking validity, confirms entry, and records the event. Eligible guards receive an operational incentive (₹15/verification).
2. **Access type B: Owner-assisted parking**
   Individual house with privately controlled parking. Customer follows owner's approved access instructions or obtains owner confirmation.
3. **Access type C: Direct-access parking**
   Independently accessible parking space not requiring separate security check. Customer receives parking instructions or digital gate passcode.
4. **Access type D: Facility-managed parking**
   Commercial parking facilities with their own entry and verification procedures (e.g. ANPR cameras).

## 4. Community Approval Lifecycle
For apartment and gated-community residential spaces:
- Supported states: `submitted`, `pending_approval`, `approved`, `rejected`, `suspended`.
- Mandatory RWA / Estate Office validation before public discoverability.
- Owners cannot bypass association approval for residential bays.
- Unapproved spaces remain invisible in public customer discovery.

## 5. Unified user experience
One application and one user account supporting:
1. Customer mode — Discover and book parking.
2. Owner mode — List spaces, manage availability, and track earnings.
3. Security staff mode — Verify authorised bookings and log incentives.
4. Community administrator mode — Approve listings and manage access policies.

## 6. Approved technology stack
- React Native
- Expo managed workflow (SDK 58)
- TypeScript (strict mode, version ~6.0.3)
- Expo Router v4
- Zustand for client-side state (`useThemeStore`, `useAuthStore`, `useBookingStore`, `useOwnerStore`, `useSecurityStore`, `useAdminStore`, `useWalletStore`, `useNotificationStore`, `useReviewStore`, `useSupportStore`)
- TanStack Query for server state
- React Hook Form + Zod for form validations
- Expo SecureStore
- Expo Location, Image Picker, Notifications
- React Native Reanimated & Worklets
- React Native StyleSheet with centralised design tokens
- Font package: Official `@expo-google-fonts/google-sans`

## 7. Maps architecture
- Provider-independent map abstraction (`IMapProvider`, `CommunityMapView`, `SimulatedMap`).
- Interactive vector map rendering without external API keys or native binaries.
- Map components, markers, location services, and configuration kept strictly isolated for seamless future swap with Google Maps or Mapbox.

## 8. Localization & Market Configuration
- Currency: Indian Rupee (`₹`), formatted without awkward decimal zeroes on round values.
- Primary geographic hubs: Bengaluru (Indiranagar, Koramangala, Whitefield, HSR Layout, MG Road) and Mumbai (Bandra West).
- Vehicle registration standard: Indian state/RTO series (e.g. `KA 01 MJ 4821`, `MH 02 BP 9920`).
- Payment methods simulated: UPI (Google Pay, PhonePe, Paytm, BHIM), Debit/Credit Cards (RuPay/Visa/MasterCard), CommunityPark Wallet.
- Mock/Demo Identification: All simulated passes, QR codes, financial records, and transactions explicitly feature prominent DEMO warning tags.

## 9. Brand identity and visual direction
- Signature brand colour: **Electric Lime (`#D9F542`)**
- Light theme: Primary `#D9F542`, Background `#F7F8F5`, Surface `#FFFFFF`, Text `#171A18`, Secondary `#747B75`, Border `#E7EAE4`, Success `#3F865B`, Error `#D84C4C`
- Dark theme: Primary `#D9F542`, Background `#171A18`, Surface `#242925`, Text `#F4F6F1`, Secondary `#A0AAA1`, Border `#343C35`, Success `#80C995`, Error `#FF7777`
- Typography: Official **Google Sans** (`GoogleSans_400Regular`, `GoogleSans_500Medium`, `GoogleSans_600SemiBold`, `GoogleSans_700Bold`) with cross-platform system fallbacks.

## 10. Navigation architecture
- Bottom tabs: Home, Explore, Bookings, Wallet, Profile.
- Customer routes: `/parking/[id]`, `/booking/summary`, `/booking/confirmation`, `/booking/pass`, `/about`, `/review/[bookingId]`.
- Profile routes: `/profile/vehicles`, `/profile/saved-places`, `/profile/preferences`, `/profile/privacy`.
- Notifications routes: `/notifications`, `/notifications/settings`.
- Support routes: `/support`, `/support/report`, `/support/tickets`.
- Owner routes: `/owner`, `/owner/new-listing`, `/owner/earnings`, `/owner/listing/[id]`.
- Security routes: `/security`, `/security/verify`.
- Admin routes: `/admin`, `/admin/approvals`, `/admin/policies`, `/admin/staff`, `/admin/audit`.
- Responsive container: Centered `maxWidth: 480` viewport wrapper on desktop web.

## 11. Backend & Database Architecture (Task 06)
- **Runtime & Framework**: Node.js (`v24.19.0`), Express.js, TypeScript with REST architecture under `/api/v1`.
- **Database & ORM**: PostgreSQL with Prisma ORM (`@prisma/client@6.19.3`) and dual-mode in-memory repository fallback.
- **17 Prisma Entities**: `User`, `Role`, `Vehicle`, `Community`, `CommunityMembership`, `ParkingListing`, `ParkingImage`, `CommunityApproval`, `Booking`, `BookingStatusHistory`, `Wallet`, `WalletTransaction`, `SecurityVerification`, `Notification`, `Review`, `SupportTicket`, `AuditLog`.
- **Monetary Precision**: Exact `Decimal(10, 2)` monetary values across hourly pricing, subtotals, ₹15 platform service fee, host earnings, and guard incentives.
- **Validation & Security**: Zod schemas for request validation, bcrypt password hashing, JWT authentication provider abstraction (`IAuthService`), and role-based authorisation middleware.
- **Supabase Migration Blueprint**: Documented in `docs/SUPABASE_MIGRATION.md` (RLS policies, schema push, auth adapter, storage bucket mapping, realtime subscriptions).
- **Frontend API Client**: Located at `src/services/api/` with automatic offline fallback to local mock stores.

## 12. Backend Security, Financial Integrity & Production Hardening (Task 07)
- **Authentication & Role Hardening**: Public registration is strictly locked to `CUSTOMER` role. Privileged roles (`COMMUNITY_ADMIN`, `SECURITY`) are stripped from public payloads and cannot be self-assigned. Server-side role switching (`POST /api/v1/auth/switch-role`) verifies eligibility in the database before issuing an updated JWT.
- **Community-Scoped Authorization**: Committee administrators and guards are strictly scoped to communities where they hold authorized `CommunityMembership`. Self-approval of residential parking spaces by committee members is blocked (HTTP 403 Forbidden).
- **Concurrency & Double-Booking Prevention**: Serialized overlap checks and reservation inserts via PostgreSQL advisory transactional locks (`pg_advisory_xact_lock`) and memory mutex locks, ensuring concurrent overlapping requests fail gracefully with HTTP 409 Conflict.
- **Financial Ledger & Idempotency**: Added unique `idempotencyKey` on `WalletTransaction` and `SecurityVerification`. Endpoints accept `Idempotency-Key` HTTP headers to prevent double-charging or duplicate credits on network retries.
- **Cryptographic Security**: Migrated all tokens, booking numbers, and transaction references from `Math.random()` to Node's `crypto.randomBytes(16)`.
- **Security Guard Verification Boundaries**: Access is restricted to a 30-minute arrival window before booking start time up to end time. Guard incentives are credited idempotently (awarded once upon first entry). Explicit hardware disclaimers highlight simulation boundaries.
- **Production Environment Hardening**: Fail-fast environment validation in production mode rejecting weak JWT secrets (<32 characters), default database credentials, or wildcard CORS. Integrated `helmet` security headers and `express-rate-limit`.
- **Mobile Token Storage**: Integrated `expo-secure-store` with web `localStorage` fallback to persist JWT tokens securely across app lifecycles.
- **Automated Test Coverage**: 45/45 tests passing across 9 test suites (`auth`, `auth_security`, `booking`, `concurrency_booking`, `community_auth`, `security`, `wallet`, `wallet_integrity`, `config_hardening`).
