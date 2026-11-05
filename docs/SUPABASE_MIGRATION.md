# CommunityPark — Supabase Migration Architectural Blueprint

This document details the step-by-step strategy for seamlessly transitioning CommunityPark's backend from the current Prisma ORM + Express foundation to a managed Supabase architecture, without refactoring the application's core business logic or frontend user interfaces.

---

## 1. Architectural Independence & Decoupling

The CommunityPark backend was engineered with **strict Supabase readiness** from day one:

- **Repository Abstraction Pattern (`backend/src/repositories/`)**:
  All database operations are mediated through explicit TypeScript interfaces (`IUserRepository`, `IBookingRepository`, `IParkingRepository`, `IWalletRepository`, `ICommunityRepository`, etc.). When moving to Supabase, create Supabase repository implementations or point Prisma directly to the Supabase PostgreSQL connection string with zero business logic changes.

- **Authentication Independence (`backend/src/services/auth.service.ts`)**:
  Authentication logic adheres to the `IAuthService` interface. The current implementation (`JwtAuthService`) uses standard JWT tokens matching the exact payload expectations of Supabase Auth (`sub/id`, `email`, `role`).

- **Storage Provider Independence (`backend/src/storage/IStorageService.ts`)**:
  Object uploads (parking photos, vehicle documents, support ticket attachments) use `IStorageService`, with pre-built adapters for local disk and S3/Supabase Storage.

- **Database-Agnostic Pricing & Ledger**:
  All financial computations (service fees, duration pricing, cancellation refunds, owner payouts, security guard incentives) reside in pure TypeScript service methods with automated test coverage, not in proprietary database triggers.

---

## 2. PostgreSQL Schema Migration to Supabase

The Prisma schema (`backend/prisma/schema.prisma`) uses standard PostgreSQL types, relations, indexes, and constraints.

### Step 2.1 — Supabase Connection String
Obtain your Supabase PostgreSQL connection URI from your Supabase Dashboard:
`Project Settings -> Database -> Connection string (URI)`.

Update `backend/.env`:
```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

### Step 2.2 — Push Schema to Supabase
Run Prisma migration to push all 17 models directly into the Supabase database:
```bash
cd backend
npx prisma db push
```

All 17 entities will be generated with exact data types:
- `Decimal(10, 2)` monetary representations
- PostgreSQL Enums (`Role`, `ParkingCategoryType`, `AccessMethod`, `BookingStatusEnum`, `TransactionTypeEnum`, etc.)
- Foreign keys with cascade or restrict behaviors
- Composite indexes and unique constraints

---

## 3. Supabase Row Level Security (RLS) Policies

When utilizing Supabase Client directly from edge functions or mobile clients, enable Row Level Security on the PostgreSQL tables:

```sql
-- Enable RLS on core tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vehicle" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ParkingListing" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Wallet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WalletTransaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CommunityApproval" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SecurityVerification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SupportTicket" ENABLE ROW LEVEL SECURITY;

-- 1. User Profiles
CREATE POLICY "Users can read own profile" ON "User"
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON "User"
  FOR UPDATE USING (auth.uid()::text = id);

-- 2. Registered Vehicles
CREATE POLICY "Users can manage own vehicles" ON "Vehicle"
  FOR ALL USING (auth.uid()::text = "userId");

-- 3. Parking Listings
CREATE POLICY "Public can view approved listings" ON "ParkingListing"
  FOR SELECT USING ("approvalStatus" = 'APPROVED' AND "isAvailable" = true);

CREATE POLICY "Owners can manage own listings" ON "ParkingListing"
  FOR ALL USING (auth.uid()::text = "ownerId");

CREATE POLICY "Community admins can view community listings" ON "ParkingListing"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "CommunityMembership" cm
      WHERE cm."userId" = auth.uid()::text
        AND cm."communityId" = "ParkingListing"."communityId"
        AND cm."role" = 'COMMITTEE_MEMBER'
    )
  );

-- 4. Bookings & Reservations
CREATE POLICY "Customers can view own bookings" ON "Booking"
  FOR SELECT USING (auth.uid()::text = "customerId");

CREATE POLICY "Hosts can view bookings for their spaces" ON "Booking"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "ParkingListing" pl
      WHERE pl.id = "Booking"."listingId"
        AND pl."ownerId" = auth.uid()::text
    )
  );

-- 5. Wallet & Financial Ledger
CREATE POLICY "Users can view own wallet and transactions" ON "Wallet"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can view own transactions" ON "WalletTransaction"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Wallet" w
      WHERE w.id = "WalletTransaction"."walletId"
        AND w."userId" = auth.uid()::text
    )
  );
```

---

## 4. Auth Provider Migration

To switch to Supabase Auth:

1. Implement `SupabaseAuthService` fulfilling `IAuthService`:
```typescript
import { createClient } from '@supabase/supabase-js';
import { IAuthService, RegisterDTO, LoginDTO, AuthUserPayload } from './auth.service';

export class SupabaseAuthService implements IAuthService {
  private supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

  async register(data: RegisterDTO) {
    const { data: authData, error } = await this.supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name, phone: data.phone, role: data.role || 'CUSTOMER' },
      },
    });
    if (error) throw new Error(error.message);
    // sync with public.User table via trigger or service
    ...
  }

  async login(data: LoginDTO) {
    const { data: authData, error } = await this.supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) throw new Error(error.message);
    ...
  }
}
```

2. Point `createServices()` in `backend/src/services/index.ts` to `SupabaseAuthService`. The REST controllers, middleware, and mobile API clients require zero modification.

---

## 5. Storage Migration to Supabase Buckets

1. Create buckets in Supabase Storage:
   - `parking-spaces`: Public access for parking bay photos.
   - `support-attachments`: Private access for dispute screenshots.

2. In `backend/.env`, set:
```env
STORAGE_PROVIDER="supabase"
SUPABASE_URL="https://[PROJECT_REF].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

`S3StorageService.ts` / `SupabaseStorageService.ts` automatically signs upload URLs and serves bucket assets.

---

## 6. Realtime Subscriptions (Optional Enhancement)

Supabase Realtime can be integrated into the frontend API client (`src/services/api/`):

- **Guard QR Scan Realtime Alert**: When security verifies a QR pass, the customer's active parking pass screen updates automatically.
- **Listing Approval Push**: When an RWA admin approves a residential listing, the owner's dashboard updates instantly without polling.
- **Wallet Credit Notifications**: Balance updates reflect live upon guard verification or owner rental payout.
