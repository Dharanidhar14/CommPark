# CommunityPark Backend API

Production-ready Node.js, Express, TypeScript, and Prisma ORM backend service for CommunityPark — the neighbourhood and community parking marketplace.

---

## 🌟 Key Features

- **Decoupled Architecture**: Clean Repository Pattern separating database operations from domain services.
- **Dual-Mode Engine**: Operates natively in In-Memory Mode with realistic Indian demo seeds (Bengaluru localities like Indiranagar, Koramangala, Whitefield) or in Database Mode with PostgreSQL via Prisma ORM.
- **Supabase-Ready**: Full migration blueprint available in `docs/SUPABASE_MIGRATION.md`.
- **Server-Authoritative Pricing & Concurrency**: Atomic overlap verification prevents double-booking; subtotal and service fee are strictly computed on the server.
- **RWA Gated Community Gatekeeper**: Residential parking bays are strictly unbookable until approved by the Community Admin.
- **Double-Entry Financial Ledger**: Immutable transactions for wallet top-ups, parking debits, owner payouts, and ₹15 guard gate verification rewards.
- **Automated Test Suite**: 100% passing Jest + Supertest integration tests covering auth, pricing, concurrency, refunds, and gate security.

---

## 🚀 Quick Start

### 1. Installation
```bash
cd backend
npm install
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Run Automated Tests
```bash
npm test
```

### 4. Start Development Server
```bash
# Starts in In-Memory mode by default for zero-setup local dev
npm run dev
```

The API will be available at:
- Base: `http://localhost:5000/api/v1`
- Health: `http://localhost:5000/api/v1/health`

---

## 🐳 Running with PostgreSQL & Docker Compose

To run with a live PostgreSQL database:
```bash
# Start PostgreSQL container
docker compose up -d postgres

# Push schema to PostgreSQL
npx prisma db push

# Start backend server
npm start
```

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/health` | Service health and operating mode | No |
| `POST` | `/api/v1/auth/register` | Register new account | No |
| `POST` | `/api/v1/auth/login` | Authenticate with credentials | No |
| `GET` | `/api/v1/auth/me` | Fetch active user profile and wallet | Yes (Bearer) |
| `GET` | `/api/v1/parking` | Search & filter parking spaces | Optional |
| `GET` | `/api/v1/parking/:id` | Get parking space details | No |
| `POST` | `/api/v1/parking` | Create new parking space listing | Yes (OWNER) |
| `GET` | `/api/v1/parking/owner/my-listings` | Get owner's listings | Yes (OWNER) |
| `POST` | `/api/v1/bookings` | Create reservation & debit wallet | Yes (CUSTOMER) |
| `GET` | `/api/v1/bookings` | List user's bookings | Yes (CUSTOMER) |
| `POST` | `/api/v1/bookings/:id/cancel` | Cancel reservation & issue refund | Yes (CUSTOMER) |
| `GET` | `/api/v1/wallet` | Get wallet balance breakdown | Yes |
| `GET` | `/api/v1/wallet/transactions` | Fetch financial transaction ledger | Yes |
| `POST` | `/api/v1/wallet/topup` | Add funds via UPI | Yes |
| `POST` | `/api/v1/security/verify` | Verify QR pass & license plate | Yes (SECURITY) |
| `POST` | `/api/v1/security/exit` | Record vehicle exit & payout owner | Yes (SECURITY) |
| `GET` | `/api/v1/communities/:id/approvals` | View pending RWA listing approvals | Yes (COMMUNITY_ADMIN) |
| `POST` | `/api/v1/communities/approvals/:id/process` | Approve/Reject residential listing | Yes (COMMUNITY_ADMIN) |
| `POST` | `/api/v1/reviews` | Submit review for completed booking | Yes (CUSTOMER) |
| `POST` | `/api/v1/support/tickets` | Submit customer support ticket | Yes |
