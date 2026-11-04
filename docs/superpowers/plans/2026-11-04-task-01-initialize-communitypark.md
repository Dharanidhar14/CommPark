# Task 01: Initialise CommunityPark Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the complete project foundation for CommunityPark—including Expo SDK 58 / Expo Router v4 setup, strict TypeScript configuration, centralised theme tokens with Electric Lime brand identity, reusable UI & parking components, unified mock data, 5-tab navigation shell, and the 6 core visual prototype screens.

**Architecture:** A feature-modular Expo Router architecture separating routing (`app/`) from reusable presentation (`src/components/`), theme tokens (`src/theme/`), state stores (`src/store/`), domain types (`src/types/`), and mock databases (`src/constants/mockData.ts`). Map rendering is abstracted behind an interactive vector surface component (`src/services/maps/`) until a provider is selected.

**Tech Stack:** React Native 0.88+, Expo SDK 58, Expo Router, TypeScript, Zustand, TanStack Query, React Hook Form, Zod, React Native Reanimated, Safe Area Context, Vector Icons, Expo Fonts (Manrope).

**Spec:** `docs/superpowers/specs/2026-11-03-milestone-1-foundation-design.md` & `PROJECT_CONTEXT.md`.

## Global Constraints
- Primary Brand Color: Electric Lime `#D9F542` (non-negotiable).
- Light Background: `#F7F8F5` | Light Surface: `#FFFFFF` | Text: `#171A18`.
- Dark Background: `#171A18` | Dark Surface: `#242925` | Text: `#F4F6F1`.
- Font: Manrope (primary) with system sans-serif fallback.
- No hardcoded colors scattered inside component files; all styles must consume `src/theme/`.
- No Google Maps or Mapbox native binaries installed; strictly use provider-independent abstraction for Milestone 1.
- Unified mock dataset consumed across Home, Explore, and Details.

---

### Task 1: Project Scaffolding & Configuration
**Files:**
- Create: `package.json`
- Create: `app.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `assets/icon.png`, `assets/splash.png`, `assets/adaptive-icon.png`, `assets/favicon.png`

**Interfaces:**
- Produces: Base project structure and config files needed by Expo CLI and TypeScript compiler.

- [ ] **Step 1: Write root package.json**
Configure package.json with CommunityPark metadata, scripts, and initial dependencies.
- [ ] **Step 2: Write app.json**
Configure application name (`CommunityPark`), slug (`communitypark`), orientation (`portrait`), iOS bundle identifier (`com.communitypark.app`), and Android package (`com.communitypark.app`).
- [ ] **Step 3: Write tsconfig.json & .gitignore**
Configure path aliases (`@/*` pointing to `src/*`) and standard Expo gitignore rules.
- [ ] **Step 4: Generate minimal SVG/PNG asset placeholders**
Place required icon and splash assets in `assets/`.
- [ ] **Step 5: Commit**
`git add package.json app.json tsconfig.json .gitignore assets/; git commit -m "chore: scaffold base project configuration"`

---

### Task 2: Install and Verify Dependencies
**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces: Installed node_modules supporting Expo Router, Zustand, Query, Reanimated, Lucide/Vector Icons, Manrope fonts, Location, SecureStore, ImagePicker, Notifications.

- [ ] **Step 1: Install Expo SDK 58 runtime and core libraries**
Run `npm install` with all required dependencies matching Expo SDK 58 compatibility.
- [ ] **Step 2: Verify dependency tree**
Run `npx expo-doctor` or `npx expo --version` to ensure no conflicting dependencies.
- [ ] **Step 3: Commit**
`git add package.json package-lock.json; git commit -m "chore: install and verify runtime dependencies"`

---

### Task 3: Centralised Theme Engine & Design Tokens
**Files:**
- Create: `src/theme/colors.ts`
- Create: `src/theme/lightTheme.ts`
- Create: `src/theme/darkTheme.ts`
- Create: `src/theme/typography.ts`
- Create: `src/theme/spacing.ts`
- Create: `src/theme/radius.ts`
- Create: `src/theme/index.ts`
- Create: `src/store/useThemeStore.ts`

**Interfaces:**
- Produces: `useTheme()` hook providing `{ colors, typography, spacing, radius, isDark, mode, setMode }`
- Consumes: Zustand store and React context.

- [ ] **Step 1: Implement color tokens and palettes**
Create `colors.ts`, `lightTheme.ts`, and `darkTheme.ts` containing the approved brand tokens (`#D9F542`, `#F7F8F5`, `#171A18`, etc.).
- [ ] **Step 2: Implement typography, spacing, and radius tokens**
Create `typography.ts` (Manrope sizes/weights), `spacing.ts` (4pt grid), `radius.ts` (`sm: 8`, `md: 12`, `lg: 16`, `xl: 24`, `full: 9999`).
- [ ] **Step 3: Implement ThemeContext & useTheme hook**
Create `src/theme/index.ts` with typed `ThemeProvider` and `useTheme()`.
- [ ] **Step 4: Implement persistent theme store**
Create `src/store/useThemeStore.ts` supporting `'light' | 'dark' | 'system'`.
- [ ] **Step 5: Commit**
`git add src/theme/ src/store/useThemeStore.ts; git commit -m "feat(theme): implement centralised design tokens and theme engine"`

---

### Task 4: Domain Types & Unified Mock Data Architecture
**Files:**
- Create: `src/types/parking.ts`
- Create: `src/types/booking.ts`
- Create: `src/types/user.ts`
- Create: `src/types/index.ts`
- Create: `src/constants/mockData.ts`
- Create: `src/features/discovery/types.ts`
- Create: `src/features/discovery/index.ts`

**Interfaces:**
- Produces: `ParkingSpace`, `AccessType`, `Vehicle`, `Booking`, `SecurityRecord`, `MOCK_PARKING_SPACES`, `MOCK_CURRENT_USER`, `MOCK_ACTIVE_BOOKING`.

- [ ] **Step 1: Define comprehensive TypeScript interfaces**
Write `src/types/parking.ts` (covering all 4 access types, rates, amenities, ratings, coordinates), `src/types/booking.ts`, and `src/types/user.ts`.
- [ ] **Step 2: Implement single-source-of-truth mock database**
Populate `src/constants/mockData.ts` with 8+ diverse, realistic parking listings across residential apartments (security-verified), independent driveways (owner-assisted), direct street/bay spots (direct-access), and downtown commercial garages (facility-managed).
- [ ] **Step 3: Implement discovery feature helper queries**
Create `src/features/discovery/index.ts` with filtering, search, and category aggregation functions.
- [ ] **Step 4: Commit**
`git add src/types/ src/constants/mockData.ts src/features/discovery/; git commit -m "feat(mock): create domain models and unified mock database"`

---

### Task 5: Zustand Client Stores (Auth, Roles & Bookings)
**Files:**
- Create: `src/store/useAuthStore.ts`
- Create: `src/store/useBookingStore.ts`
- Create: `src/store/index.ts`

**Interfaces:**
- Produces: `useAuthStore` (active user, current mode: Customer | Owner | Security), `useBookingStore` (active pass, booking history, draft booking).

- [ ] **Step 1: Implement useAuthStore**
Manage user profile and role switching (`customer` | `owner` | `security` | `community_admin`) for testing unified user experience.
- [ ] **Step 2: Implement useBookingStore**
Manage active pass, draft checkout state, and recent bookings.
- [ ] **Step 3: Commit**
`git add src/store/; git commit -m "feat(store): implement auth, role switcher, and booking state stores"`

---

### Task 6: Reusable UI Component Primitives
**Files:**
- Create: `src/components/ui/AppText.tsx`
- Create: `src/components/ui/AppButton.tsx`
- Create: `src/components/ui/AppInput.tsx`
- Create: `src/components/ui/AppCard.tsx`
- Create: `src/components/ui/AppHeader.tsx`
- Create: `src/components/ui/AppIcon.tsx`
- Create: `src/components/ui/AppBadge.tsx`
- Create: `src/components/ui/AppDivider.tsx`
- Create: `src/components/ui/LoadingIndicator.tsx`
- Create: `src/components/ui/EmptyState.tsx`
- Create: `src/components/ui/ErrorState.tsx`
- Create: `src/components/ui/BottomSheet.tsx`
- Create: `src/components/ui/index.ts`

**Interfaces:**
- Produces: Clean, accessible, theme-aware primitive components with zero hardcoded colors.

- [ ] **Step 1: Implement AppText, AppIcon, AppBadge, AppDivider**
Create fundamental typography, badge, and icon wrapper components.
- [ ] **Step 2: Implement AppButton & AppInput**
Create interactive button (primary lime, secondary, ghost, dark) and search/form input components.
- [ ] **Step 3: Implement AppCard, BottomSheet, LoadingIndicator, EmptyState, ErrorState**
Create structural containers and feedback state components.
- [ ] **Step 4: Commit**
`git add src/components/ui/; git commit -m "feat(ui): implement reusable UI primitives with full theme support"`

---

### Task 7: Parking Domain Components & Map Abstraction
**Files:**
- Create: `src/components/parking/ParkingCard.tsx`
- Create: `src/components/parking/ParkingImage.tsx`
- Create: `src/components/parking/ParkingPrice.tsx`
- Create: `src/components/parking/ParkingAvailabilityBadge.tsx`
- Create: `src/components/parking/ParkingCategoryBadge.tsx`
- Create: `src/components/parking/ParkingSearchBar.tsx`
- Create: `src/components/parking/AccessTypePill.tsx`
- Create: `src/components/parking/index.ts`
- Create: `src/services/maps/types.ts`
- Create: `src/services/maps/SimulatedMap.tsx`
- Create: `src/services/maps/MapView.tsx`

**Interfaces:**
- Produces: Specialized parking cards, price badges, category chips, access-type pills, and decoupled interactive vector map.

- [ ] **Step 1: Implement parking badge & price components**
Create `ParkingPrice.tsx`, `ParkingAvailabilityBadge.tsx`, `ParkingCategoryBadge.tsx`, and `AccessTypePill.tsx`.
- [ ] **Step 2: Implement ParkingImage & ParkingCard**
Create photography-led cards showcasing spot photo, title, distance, access badge, price pill, and rating.
- [ ] **Step 3: Implement ParkingSearchBar**
Create search bar with filter trigger button and category selector tabs.
- [ ] **Step 4: Implement provider-independent SimulatedMap**
Create interactive vector map component with draggable grid, Electric Lime user location pin, and dark price markers.
- [ ] **Step 5: Commit**
`git add src/components/parking/ src/services/maps/; git commit -m "feat(parking): implement parking components and map abstraction"`

---

### Task 8: Navigation Architecture & Custom Tab Bar
**Files:**
- Create: `app/_layout.tsx`
- Create: `app/index.tsx`
- Create: `app/(tabs)/_layout.tsx`
- Create: `app/+not-found.tsx`

**Interfaces:**
- Produces: Root layout with ThemeProvider, Font loading, custom bottom navigation bar with 5 tabs and Electric Lime indicator.

- [ ] **Step 1: Implement app/_layout.tsx**
Wrap application in ThemeProvider, load Manrope fonts, handle splash screen release.
- [ ] **Step 2: Implement app/(tabs)/_layout.tsx**
Build custom bottom tab bar with 5 destinations (Home, Explore, Bookings, Wallet, Profile) with haptic feedback, badges, and safe area insets.
- [ ] **Step 3: Implement app/index.tsx redirect & +not-found.tsx**
Route root navigation directly into `/(tabs)`.
- [ ] **Step 4: Commit**
`git add app/; git commit -m "feat(nav): establish Expo Router layout and custom 5-tab navigation"`

---

### Task 9: Core Application Screens & Secondary Placeholders
**Files:**
- Create: `app/(tabs)/index.tsx` (Customer Home)
- Create: `app/(tabs)/explore.tsx` (Explore Map Discovery)
- Create: `app/(tabs)/bookings.tsx` (Bookings & Active Pass)
- Create: `app/(tabs)/wallet.tsx` (Wallet & Credits)
- Create: `app/(tabs)/profile.tsx` (Profile & Multi-Role Switcher)
- Create: `app/parking/[id].tsx` (Parking Details)
- Create: `app/booking/summary.tsx` (Booking Summary / Checkout)
- Create: `app/booking/pass.tsx` (Digital Parking Pass)
- Create: `app/owner/index.tsx` (Owner Dashboard Placeholder)
- Create: `app/security/verify.tsx` (Security Guard QR Scanner Placeholder)

**Interfaces:**
- Produces: Complete working 6-screen interactive visual prototype satisfying all Master Context and Task 01 requirements.

- [ ] **Step 1: Implement Customer Home Screen (`app/(tabs)/index.tsx`)**
Hero header, active pass banner, search bar, "Find Parking" / "List Space" action cards, category filters, and nearby spots horizontal list.
- [ ] **Step 2: Implement Explore Screen (`app/(tabs)/explore.tsx`)**
Top search overlay, interactive vector map with dark floating price pins, category chips, and bottom spot preview card.
- [ ] **Step 3: Implement Bookings Screen (`app/(tabs)/bookings.tsx`)**
Active booking pass highlight, upcoming reservations, past booking history, and quick access to digital QR pass.
- [ ] **Step 4: Implement Wallet & Profile Screens (`wallet.tsx`, `profile.tsx`)**
Wallet balance card, transaction history, role switcher bar (Customer/Owner/Security), and theme appearance selector (Light/Dark/System).
- [ ] **Step 5: Implement Parking Details Screen (`app/parking/[id].tsx`)**
High-res image gallery, title/address, host info, access-type breakdown, security instructions, amenities chips, pricing, and "Reserve Space" button.
- [ ] **Step 6: Implement Booking Summary & Pass Screens (`summary.tsx`, `pass.tsx`)**
Vehicle selection, time duration, price breakdown, and digital parking pass with simulated QR code and gate instructions.
- [ ] **Step 7: Implement Owner & Security Dashboard Placeholders (`owner/index.tsx`, `security/verify.tsx`)**
Owner earnings preview, listings manager, and guard vehicle entry verification interface.
- [ ] **Step 8: Commit**
`git add app/; git commit -m "feat(screens): implement 6 core visual prototype screens and role dashboards"`

---

### Task 10: Documentation & Comprehensive Validation
**Files:**
- Create: `README.md`
- Modify: `PROJECT_CONTEXT.md`
- Modify: `PROGRESS.md`

**Interfaces:**
- Produces: Updated documentation, verification evidence, zero TypeScript errors (`tsc --noEmit`), and running Expo development server.

- [ ] **Step 1: Create README.md**
Document setup, architecture, scripts, dependencies, and testing guide.
- [ ] **Step 2: Update PROGRESS.md and PROJECT_CONTEXT.md**
Reflect completed Task 01 work, component catalogue, and current status.
- [ ] **Step 3: Run TypeScript compiler check**
Execute `npx tsc --noEmit` and fix any type discrepancies.
- [ ] **Step 4: Run Expo config and diagnostics**
Execute `npx expo config --type public` and verify configuration.
- [ ] **Step 5: Start Expo development server and inspect output**
Execute Expo server command to confirm clean startup without runtime errors.
- [ ] **Step 6: Final Commit**
`git add .; git commit -m "docs: finalize Task 01 documentation and validation evidence"`
