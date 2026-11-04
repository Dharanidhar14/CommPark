# Task 02: Customer Discovery & Booking Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete customer-facing parking discovery and booking journey in CommunityPark—including Indian market localization (INR ₹ and realistic metro localities), search suggestions and recent searches, rich filters and sorting, interactive date/time duration selector, vehicle addition with React Hook Form + Zod, simulated multi-method payments (UPI, Card, Wallet) with demo failure/retry handling, booking confirmation, explicit demo pass badges, responsive desktop frame, and the About CommunityPark screen.

**Architecture:** Enhances existing feature-modular architecture without recreating it. Updates centralized mock database in `src/constants/mockData.ts`, builds rich customer discovery features in `src/features/discovery/`, extends booking state machine in `src/store/useBookingStore.ts`, and adds customer routes in `app/`.

**Tech Stack:** React Native, Expo SDK 58, Expo Router v4, TypeScript, Zustand, TanStack Query, React Hook Form, Zod, React Native Reanimated.

**Spec:** TASK 02 Specification, `PROJECT_CONTEXT.md`, and Audit Report.

## Global Constraints
- Brand primary color remains strictly Electric Lime `#D9F542`.
- Currency strictly INR (`₹`) with realistic Indian parking rates (e.g. ₹30 - ₹120/hr, ₹200 - ₹800/day).
- Localities: Bengaluru & Mumbai metropolitan areas.
- Provider-independent map abstraction maintained (no Google Maps or Mapbox native packages).
- All booking, payment, and security actions are explicitly marked as simulation/demo.
- Support Light, Dark, and Follow System themes.

---

### Task 1: Resolve Expo Doctor Issues & Update Project Config
**Files:**
- Modify: `app.json`
- Modify: `package.json`

**Interfaces:**
- Produces: Clean Expo config schema without root `newArchEnabled`, peer dependency `react-native-worklets` installed, TypeScript updated to `~6.0.3`.

- [ ] **Step 1: Fix app.json schema**
Remove redundant root `newArchEnabled` property.
- [ ] **Step 2: Install react-native-worklets and update TypeScript**
Run `npx expo install react-native-worklets` and `npm install typescript@~6.0.3 --save-dev`.
- [ ] **Step 3: Run expo-doctor to verify**
Run `npx expo-doctor` and verify all checks pass.
- [ ] **Step 4: Commit**
`git add app.json package.json package-lock.json; git commit -m "chore: fix expo-doctor configuration and install react-native-worklets"`

---

### Task 2: Indian Market Localization & Central Mock Data
**Files:**
- Modify: `src/types/parking.ts`
- Modify: `src/types/booking.ts`
- Modify: `src/types/user.ts`
- Modify: `src/constants/mockData.ts`
- Modify: `src/features/discovery/index.ts`
- Modify: `src/features/discovery/types.ts`

**Interfaces:**
- Produces: All prices in INR (`₹`), Indian addresses (Indiranagar, Koramangala, HSR Layout, Whitefield, Bandra, BKC), Indian license plates (`KA 01 AB 1234`), search suggestions, recent searches list, explicit `isDemo: true` flags.

- [ ] **Step 1: Update domain types with Indian context and demo flags**
Add `isDemo: boolean`, `operatingHours`, `dimensions`, `landmarks` in `src/types/parking.ts`.
- [ ] **Step 2: Populate Indian market mock database in src/constants/mockData.ts**
Update 6+ detailed spaces with INR pricing (`₹40/hr`, `₹30/hr`, `₹80/hr`), Indian localities, hosts, vehicles (Swift, Creta, Nexon EV, Ather 450X), and wallet balances in INR.
- [ ] **Step 3: Add recent searches and search suggestion helpers in src/features/discovery/**
Provide `RECENT_SEARCHES`, `POPULAR_LANDMARKS`, and autocomplete filter functions.
- [ ] **Step 4: Commit**
`git add src/types/ src/constants/mockData.ts src/features/discovery/; git commit -m "feat(mock): localize mock data to Indian metropolitan markets with INR pricing"`

---

### Task 3: Desktop Viewport Responsive Wrapper
**Files:**
- Modify: `app/_layout.tsx`

**Interfaces:**
- Produces: Centered container with `maxWidth: 480` and subtle border on large desktop viewports, preserving 100% full-screen mobile layouts on phones and tablets.

- [ ] **Step 1: Implement ResponsiveContainer in app/_layout.tsx**
Wrap screen content in a centered container when running on wide desktop screens (`Platform.OS === 'web'`).
- [ ] **Step 2: Commit**
`git add app/_layout.tsx; git commit -m "feat(layout): add responsive desktop max-width centering wrapper"`

---

### Task 4: Home Screen Customer Discovery Enhancements
**Files:**
- Modify: `app/(tabs)/index.tsx`
- Modify: `src/components/parking/ParkingSearchBar.tsx`
- Create: `src/components/home/LocationSelectorModal.tsx`

**Interfaces:**
- Produces: Interactive location picker (Indiranagar, Koramangala, Whitefield, BKC), search suggestions dropdown with recent searches, demo badge on active pass, and grouped access-category parking sections.

- [ ] **Step 1: Create LocationSelectorModal component**
Allow switching destination/locality with instant listing updates.
- [ ] **Step 2: Enhance ParkingSearchBar with search suggestions & recent searches**
Add recent searches chips and autocomplete suggestions dropdown.
- [ ] **Step 3: Update Home screen sections with INR and Indian cards**
Show Security-Verified, Owner Driveways, Direct Bays, and Commercial sections.
- [ ] **Step 4: Commit**
`git add app/(tabs)/index.tsx src/components/; git commit -m "feat(home): enhance location selection, search suggestions and Indian market discovery"`

---

### Task 5: Explore Screen & Interactive Filter Modal
**Files:**
- Modify: `app/(tabs)/explore.tsx`
- Create: `src/components/parking/FilterBottomSheet.tsx`
- Modify: `src/services/maps/SimulatedMap.tsx`

**Interfaces:**
- Produces: Functional filter interface (price slider, distance, access method, vehicle type, covered), sorting options (Recommended, Price low/high, Distance, Rating), "Search this area" button on vector map.

- [ ] **Step 1: Create FilterBottomSheet component**
Inputs for min/max price (₹20 to ₹150/hr), distance, access method badges, covered/open toggle, vehicle compatibility, Reset and Apply actions.
- [ ] **Step 2: Wire filters and sorting to Explore screen**
Connect filter state to `getFilteredParkingSpaces()`, updating map markers and list in real time.
- [ ] **Step 3: Add "Search This Area" and marker selection feedback on SimulatedMap**
Add re-center / search this area trigger and selected marker callout.
- [ ] **Step 4: Commit**
`git add app/(tabs)/explore.tsx src/components/parking/FilterBottomSheet.tsx src/services/maps/; git commit -m "feat(explore): implement filter modal, sorting controls, and interactive map exploration"`

---

### Task 6: Parking Details Screen Enhancements
**Files:**
- Modify: `app/parking/[id].tsx`

**Interfaces:**
- Produces: Complete parking details with specifications (covered, height clearance, dimensions, 24/7 access), Access Type detailed procedure (stating community approval & security guard procedure for apartments), image carousel preview, trust indicators, and prominent "Book Now" CTA.

- [ ] **Step 1: Add detailed specifications & operating hours to Parking Details**
Display vehicle compatibility, dimensions, hours, and host trust metrics.
- [ ] **Step 2: Update access procedure card with Indian community security guidelines**
Clearly differentiate Guard QR verification from Direct Access and Owner Assist.
- [ ] **Step 3: Commit**
`git add app/parking/[id].tsx; git commit -m "feat(details): enrich parking specifications, access workflow, and host trust metrics"`

---

### Task 7: Complete Customer Booking Journey
**Files:**
- Modify: `app/booking/summary.tsx`
- Modify: `app/booking/pass.tsx`
- Create: `app/booking/confirmation.tsx`
- Create: `src/components/booking/AddVehicleModal.tsx`
- Create: `src/components/booking/PaymentMethodSelector.tsx`
- Modify: `src/store/useBookingStore.ts`

**Interfaces:**
- Produces: Date/time selector, Add Vehicle form (React Hook Form + Zod), transparent INR fee breakdown, simulated multi-method payment (UPI / Card / Wallet) with demo failure/retry toggle, booking confirmation screen, and explicit demo digital pass.

- [ ] **Step 1: Create AddVehicleModal with React Hook Form and Zod**
Form fields: Registration plate number (`KA 01 AB 1234`), Make & Model, Vehicle Type (Sedan, SUV, EV, Bike), Color.
- [ ] **Step 2: Create PaymentMethodSelector component**
Demo UPI (GPay, PhonePe, Paytm, BHIM), Cards, and Community Wallet.
- [ ] **Step 3: Update booking summary & payment simulation in summary.tsx**
Support date/duration picker, simulated processing spinner, toggleable demo failure and retry, and success navigation.
- [ ] **Step 4: Create Booking Confirmation screen (app/booking/confirmation.tsx)**
Display booking ID, parking location, plate, access instructions, and "View Parking Pass" CTA.
- [ ] **Step 5: Update Digital Pass (pass.tsx) with prominent DEMO PASS watermark & instructions**
Clearly identify demo status, gate passcode, directions action.
- [ ] **Step 6: Commit**
`git add app/booking/ src/components/booking/ src/store/useBookingStore.ts; git commit -m "feat(booking): complete simulated booking journey from duration selection to pass generation"`

---

### Task 8: About CommunityPark Screen
**Files:**
- Create: `app/about.tsx`
- Modify: `app/(tabs)/profile.tsx`

**Interfaces:**
- Produces: High-quality product information screen accessible via Profile -> About CommunityPark, covering Sections A-H: brand intro, problem, solution, how it works, differentiators, mission, responsible parking, app info/version/tagline.

- [ ] **Step 1: Create app/about.tsx**
Implement all 8 sections (A to H) with clean typography, iconography, and CommunityPark branding.
- [ ] **Step 2: Add navigation link in app/(tabs)/profile.tsx**
Link to `/about` from Profile settings list.
- [ ] **Step 3: Commit**
`git add app/about.tsx app/(tabs)/profile.tsx; git commit -m "feat(about): create About CommunityPark screen with mission, differentiators and responsible sharing"`

---

### Task 9: Documentation & Comprehensive Validation
**Files:**
- Modify: `PROJECT_CONTEXT.md`
- Modify: `PROGRESS.md`
- Modify: `README.md`

**Interfaces:**
- Produces: Updated documentation, zero TypeScript errors (`tsc --noEmit`), passing Expo Doctor checks, and verified development server.

- [ ] **Step 1: Run TypeScript validation**
Execute `npm run ts:check` and fix any type issues.
- [ ] **Step 2: Run Expo Doctor validation**
Execute `npx expo-doctor` and verify clean diagnostic output.
- [ ] **Step 3: Update PROGRESS.md, README.md, and PROJECT_CONTEXT.md**
Document Task 02 completion, screens, components, mock data updates, and verification evidence.
- [ ] **Step 4: Commit**
`git add PROGRESS.md README.md PROJECT_CONTEXT.md; git commit -m "docs: finalize Task 02 documentation and validation records"`
