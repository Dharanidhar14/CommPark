# CommunityPark — Security, Financial Integrity & Production Readiness Audit (Task 07)

**Document Reference**: SEC-AUDIT-TASK07  
**Date**: November 2026  
**Auditor**: Lead Security Architect & Mobile Backend Engineer  
**Baseline Commit**: `f3be9a2`  
**Status**: COMPLETED & VERIFIED  

---

## 1. Executive Summary & Scope

An in-depth security, concurrency, financial integrity, and authorization audit was conducted across the CommunityPark backend and mobile integration layer following the completion of Milestone 6 (Task 06).

While Task 06 established a solid foundational architecture with standard REST patterns, Prisma ORM, and decoupled repositories, several critical vulnerabilities and architectural race conditions were identified and systematically resolved:

1. **Authentication Privilege Escalation**: Public registration accepted an optional `role` parameter, allowing self-assignment of `COMMUNITY_ADMIN` or `SECURITY` roles.
2. **Missing Community-Scoped Authorization**: Administrators and guards had global role checks rather than community-specific membership checks, allowing cross-community access and self-approval of residential listings.
3. **Time-of-Check to Time-of-Use (TOCTOU) Concurrency Race in Reservations**: Overlapping reservations could be created under concurrent requests due to non-atomic check-then-insert patterns.
4. **Lack of Atomicity in Financial Operations**: Booking creation and wallet debits (as well as cancellations and refunds) executed in decoupled steps, risking orphaned active reservations on payment failure or duplicate refunds on concurrent cancellations.
5. **Missing Financial Idempotency**: Transactions lacked an idempotency key mechanism, creating severe vulnerability to double-charging on network retries.
6. **Non-Cryptographic Token Generation**: Security-sensitive tokens and transaction references relied on `Math.random()`.
7. **Insecure Production Environment Fallbacks**: Configuration silently defaulted to weak secrets and wildcard CORS if validation failed.
8. **In-Memory Mobile Authentication State**: Mobile API tokens were kept only in volatile memory, failing to persist across app lifecycles via `Expo SecureStore`.

---

## 2. Detailed Vulnerability Findings & Root Causes

### 2.1 [CRITICAL] Privilege Escalation via Public Registration
- **Location**: `backend/src/routes/auth.routes.ts`, `backend/src/services/auth.service.ts`.
- **Finding**: Registration schema permitted `role` in the request body. If passed, the user was granted elevated privileges directly in `eligibleRoles` and `activeRole`.
- **Remediation**:
  - Removed `role` and `roles` parameters from public `registerSchema`.
  - Hardcoded `activeRole: 'CUSTOMER'` and `eligibleRoles: ['CUSTOMER']` on registration.
  - Implemented server-controlled role switching via `POST /api/v1/auth/switch-role` that verifies `user.eligibleRoles.includes(targetRole)` against the database before issuing an updated JWT.

### 2.2 [HIGH] Cross-Community Access & Self-Approval Vulnerability
- **Location**: `backend/src/services/community.service.ts`, `backend/src/routes/community.routes.ts`, `backend/src/services/security.service.ts`.
- **Finding**: Committee actions and guard pass verifications did not verify community-specific tenancy or active membership status. Committee members could also approve their own listings.
- **Remediation**:
  - Added `ICommunityRepository.getMembership(communityId, userId)` checks verifying that the administrator is a verified `COMMITTEE_MEMBER` and `isAuthorized === true`.
  - Added self-approval check: `if (listing.ownerId === adminId) throw new Error('Forbidden: Self-approval is strictly prohibited. An administrator cannot approve their own parking space listing.')`.
  - Added guard community verification: guards can only verify QR passes for listings located in communities where they hold authorized `SECURITY_STAFF` membership.

### 2.3 [HIGH] Booking Concurrency & TOCTOU Race Condition
- **Location**: `backend/src/repositories/prisma/PrismaBookingRepository.ts`, `backend/src/repositories/memory/MemoryBookingRepository.ts`.
- **Finding**: Overlap checks and reservation creation occurred across non-atomic database queries. Under concurrent load, multiple threads passed validation simultaneously, allowing double bookings for the same spot.
- **Remediation**:
  - **PostgreSQL**: Implemented transactional advisory locking `pg_advisory_xact_lock(hashtext(listingId))` inside an isolated `prisma.$transaction` block with overlap validation and insertion serialized per listing.
  - **Memory Repository**: Added per-listing async mutex locks (`listingLocks`) to serialize check-and-insert operations.
  - Comprehensive concurrency test verifies that out of two simultaneous overlapping requests, exactly 1 receives HTTP 201 and the other receives HTTP 409 Conflict.

### 2.4 [HIGH] Payment & Refund Atomicity Disconnect
- **Location**: `backend/src/services/booking.service.ts`, `backend/src/services/wallet.service.ts`.
- **Finding**: Reservations could be created even if user wallet balance was insufficient, or cancellation refunds could fail midway leaving bookings in undefined states.
- **Remediation**:
  - Pre-validates wallet balance before reservation creation.
  - Couples wallet debit and booking creation atomically with idempotency keys.
  - Strict booking state machine prevents duplicate cancellations (`already been cancelled` -> 409) and prevents double refunds on network retries.

### 2.5 [HIGH] Missing Financial Idempotency
- **Location**: `backend/prisma/schema.prisma`, `backend/src/repositories/IWalletRepository.ts`, `backend/src/services/wallet.service.ts`.
- **Finding**: Retried API requests resulted in multiple debit or credit operations.
- **Remediation**:
  - Added `@unique idempotencyKey` to `WalletTransaction` and `SecurityVerification` in Prisma schema.
  - Endpoints accept `Idempotency-Key` HTTP header.
  - If a transaction with matching idempotency key exists, the service returns the existing transaction and current balance without performing redundant mutations.

### 2.6 [MEDIUM] Predictable Randomness in Tokens & References
- **Location**: All booking and wallet repositories.
- **Finding**: Tokens relied on `Math.random().toString(36)`.
- **Remediation**: Migrated all token generation to Node's `crypto.randomBytes(16).toString('hex').toUpperCase()` ensuring cryptographically secure entropy.

### 2.7 [MEDIUM] Permissive Environment Validation in Production
- **Location**: `backend/src/config/env.ts`.
- **Finding**: If environment variables were missing or invalid, configuration silently fell back to development defaults.
- **Remediation**: Implemented strict fail-fast validation in `loadAndValidateEnv()` when `NODE_ENV === 'production'`: throws fatal errors if `JWT_SECRET` is default/short, `DATABASE_URL` is default, or `CORS_ORIGIN` is wildcard `'*'`.

### 2.8 [MEDIUM] Guard Verification Arrival Window & Information Leakage
- **Location**: `backend/src/services/security.service.ts`.
- **Finding**: Security guards could verify passes days before scheduled start time, and pass verification returned sensitive customer personal details.
- **Remediation**:
  - Entry is strictly permitted only within the arrival window: from 30 minutes before booking start time until scheduled end time.
  - Responses expose only minimal vehicle and gate data (`bookingNumber`, `vehiclePlate`, `slotNumber`, `validUntil`) while withholding customer PII.
  - Clear hardware disclaimer: emphasizes that verification is a simulation and not connected to physical barrier hardware.

### 2.9 [MEDIUM] Mobile Token Persistence
- **Location**: `src/services/api/client.ts`.
- **Finding**: Auth token was kept solely in memory variable, lost on app reload.
- **Remediation**: Integrated `expo-secure-store` with web `localStorage` fallback to securely persist and load JWT tokens across app launches.

---

## 3. Automated Test Verification Results

All 9 test suites and 45 integration test cases passed with 100% success rate:

```
Test Suites: 9 passed, 9 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        7.471 s
```

### Breakdown of Test Suites:
1. `tests/auth.test.ts` (6 tests): Public customer registration, duplicate prevention, password validation, and profile retrieval.
2. `tests/auth_security.test.ts` (6 tests): Privilege escalation prevention, server-side role switching verification, and JWT signature verification.
3. `tests/booking.test.ts` (4 tests): Server-authoritative fee calculation, residential listing approval gate, and booking cancellation.
4. `tests/concurrency_booking.test.ts` (4 tests): Parallel overlapping reservation serialization (409 Conflict), non-overlapping concurrency, duplicate cancellation prevention, and insufficient funds handling.
5. `tests/community_auth.test.ts` (6 tests): Scoped committee authorization, cross-community rejection (403), self-approval prohibition (403), suspended committee member rejection (403), and third-party residential listing approval.
6. `tests/security.test.ts` (6 tests): Gate QR verification, plate matching, arrival window enforcement, idempotent guard incentive, and exit recording.
7. `tests/wallet.test.ts` (3 tests): Initial zero balance, top-up credit, ledger consistency, and non-positive amount rejection.
8. `tests/wallet_integrity.test.ts` (5 tests): Idempotency header deduplication, non-predictable reference numbers, and input validation.
9. `tests/config_hardening.test.ts` (5 tests): Production fail-fast validation on weak JWT secrets, default database credentials, and wildcard CORS.

---

## 4. Code Quality & Static Analysis Checks
- **Root TypeScript Check (`tsc --noEmit`)**: 0 errors.
- **Backend TypeScript Check (`cd backend; npx tsc --noEmit`)**: 0 errors.
- **Expo Doctor (`npx expo-doctor`)**: 20/20 checks passed.

---

## 5. Production Readiness Status & Residual Recommendations
1. **Production Database**: Prior to cloud deployment, apply Prisma migrations against an Amazon RDS or Supabase PostgreSQL instance via `npx prisma migrate deploy`.
2. **Secrets Management**: Inject high-entropy secrets (>32 characters) for `JWT_SECRET` via environment variables (AWS SSM, GCP Secret Manager, or Vercel Environment Variables).
3. **Physical Hardware Disclaimers**: Maintained clear disclaimers across all security and gate verification screens clarifying that actions simulate community access and do not drive physical barrier gates.
