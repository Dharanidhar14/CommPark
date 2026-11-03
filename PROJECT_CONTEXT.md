# COMMUNITY PARK — MASTER PROJECT CONTEXT

## 1. Project identity
- Project name: CommunityPark
- Product category: Community-based parking marketplace
- Platform: Cross-platform mobile application
- Target platforms: Android and iOS
- Development framework: React Native + Expo
- Language: TypeScript
- Navigation: Expo Router
- Development environment: Google Antigravity
- Current development stage: Milestone 1: Project setup and design foundation

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
   Apartment resident lists unused parking slot. Customer books and arrives. Security guard scans customer QR code, verifies vehicle and booking validity, confirms entry, and records the event. Eligible guards receive an operational incentive.
2. **Access type B: Owner-assisted parking**
   Individual house with privately controlled parking. Customer follows owner's approved access instructions or obtains owner confirmation.
3. **Access type C: Direct-access parking**
   Independently accessible parking space not requiring separate security check. Customer receives parking instructions.
4. **Access type D: Facility-managed parking**
   Commercial parking facilities with their own entry and verification procedures.

## 4. Unified user experience
One application and one user account supporting:
1. Customer mode — Discover and book parking.
2. Owner mode — List spaces and manage earnings.
3. Security staff mode — Verify authorised bookings.
4. Community administrator mode — Approve listings and manage access policies.

## 5. Approved technology stack
- React Native
- Expo managed workflow
- TypeScript
- Expo Router
- Zustand for client-side state
- TanStack Query for server state
- React Hook Form + Zod
- Expo SecureStore
- Expo Location, Image Picker, Notifications
- React Native Reanimated
- React Native StyleSheet with centralised design tokens

## 6. Maps architecture
- Provider-independent map abstraction.
- Map components, markers, location services, and configuration kept isolated.

## 7. Brand identity and visual direction
- Signature brand colour: **Electric Lime (`#D9F542`)**
- Light theme: Primary `#D9F542`, Background `#F7F8F5`, Surface `#FFFFFF`, Text `#171A18`, Secondary `#747B75`, Border `#E7EAE4`, Success `#3F865B`, Error `#D84C4C`
- Dark theme: Primary `#D9F542`, Background `#171A18`, Surface `#242925`, Text `#F4F6F1`, Secondary `#A0AAA1`, Border `#343C35`, Success `#80C995`, Error `#FF7777`
- Typography: Manrope (primary) / Inter (fallback)

## 8. Navigation architecture
Bottom tabs: Home, Explore, Bookings, Wallet, Profile.
Modal/Stack: Parking details, booking checkout, digital pass, owner dashboard, security guard scanner.
