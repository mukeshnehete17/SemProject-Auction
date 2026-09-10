# TORI

Online Auction Platform — Semester 3 Project

## Current Phase

Phase 7 — Final Testing, Production Readiness & Deployment Prep

## Tech Stack

- Next.js 16 (App Router)
- React 19
- JavaScript
- Tailwind CSS
- Lucide React
- Prisma 7 ORM
- SQLite (better-sqlite3 driver adapter)
- Auth.js (NextAuth v5 beta) + bcryptjs

## Features

- Public pages: Home, Auctions (live DB data), How It Works, About
- Auction detail pages with live bid history from the database
- Authentication (email + password) via Auth.js Credentials provider
- Passwords hashed with bcryptjs (never stored in plain text)
- Registration — create a Buyer or Seller account (no public Admin registration)
- Role-based access:
  - `/dashboard/*` — any logged-in user
  - `/admin/*` — ADMIN only (others are redirected to `/unauthorized`)
- Session-aware navbar (name, Dashboard, Logout), logout wired across the app
- `/unauthorized` access-denied page
- **Real auction creation** (server action): SELLER/ADMIN only; validation on both
  client and server; product image stored as a URL with live preview
- **Edit / cancel your auctions** (server actions): edit is allowed only while an
  auction is upcoming and has no bids; cancel is allowed for upcoming auctions or
  active auctions with no bids (marked `CANCELLED` — never really deleted)
- **Real bidding** (server action): validated server-side, executed with Prisma
  transactions (`bid` create + `currentPrice` update happen atomically). Bids must
  be at least `currentPrice + minimumIncrement`; users cannot bid on their own
  auctions and Admins cannot bid
- Auction status (`upcoming` / `active` / `ending_soon` / `ended` / `cancelled`)
  is derived from start/end time at read time (plus the `CANCELLED` flag)
- Dashboard with **real counts**: bids placed, active bids, auctions created,
  active listings, and DB-driven recent bid activity
- **My Auctions** — DB-driven management table (current price, bid count, end
  time, status badges, View/Edit/Cancel actions with confirmation modal)
- **My Bids** — DB-driven, grouped per auction with winning/outbid status
- Seed is fully idempotent and also provisions demo-seller auctions
- **Auction Completion Lifecycle**: when an auction's `endTime` passes, the winner
  (highest bidder) is derived lazily on read; winners and sellers get persistent
  notifications (`AUCTION_WON` / `AUCTION_ENDED`) with dedup safety
- **Won Auctions** (DB-driven): real auction data; shows winning bid, seller, and
  a congratulatory banner when the current user is the winner
- **Persistent Watchlist**: add/remove auctions with database persistence;
  real-time ♡/♥ toggle on the auction detail page with toast feedback
- **Notifications**: persistent unread/read state; `OUTBID` notifications created
  atomically inside the bid transaction; notification bell in the navbar shows a
  live unread count with a dropdown of recent items
- **Notification Page** (`/dashboard/notifications`): full notification list with
  per-item and "mark all as read" actions
- **Dashboard Stats**: role-aware — Buyers see Active Bids / Auctions Won /
  Watchlist / Unread Notifications; Sellers see My Auctions / Active / Completed /
  Unread Notifications; plus a notifications summary widget
- **My Auctions Winner Info**: ended rows display the winning bidder and their bid;
  rows with no bids show "No winner"
- **Auction Detail Ended State**: winner card with name and bid amount; when the
  current user is the winner a green congratulatory banner is shown; auctions
  that ended with no bids display a neutral "No bids were placed" message
- **Real Admin Dashboard** (`/admin`): DB-driven stat cards (users, auctions,
  active, ending soon, bids, ended), live auction-status summary, and recent
  auctions/users tables
- **Manage Users** (`/admin/users`): real user list with per-user bid/auction/won
  counts, search + role tabs, and safe role changes (BUYER ↔ SELLER only) with a
  confirmation modal. Admin roles cannot be changed, an admin cannot change their
  own role, and there is no destructive user deletion
- **Manage Auctions** (`/admin/auctions`): server-side search + status filtering
  via URL query params, view details modal, and admin cancel (same eligibility
  rules as seller cancel — upcoming or active-without-bids only), with a
  confirmation modal
- **Platform Reports** (`/admin/reports`): real analytics — auction status
  breakdown, average & highest bid, total listings value, auctions by category
  (progress bars), top sellers, and most active bidders
- **Advanced Search & Filtering** on `/auctions`: URL-query-parameter driven with
  server-side Prisma filtering — keyword (title + description), category, status
  (active / ending soon / upcoming / ended / cancelled), min & max price, and
  sorts (ending soon, newest, price low→high, price high→low, most bids). All
  filters combine, the query string is shareable, "Clear Filters" resets, and a
  no-results empty state is shown
- **Auction Card polish**: real time-remaining labels derived from start/end
  times (no fake countdown text), category icons matched to actual categories,
  product image support, and a focus-safe "View Auction" element
- **Loading & error states**: `loading.js` for dashboard/admin/auctions segments
  plus a global error boundary; EmptyState used consistently across lists
- All admin pages and routes are server-side guarded twice: by middleware
  (`/admin/*` ⇒ ADMIN only) and by an in-page `getAdminUser()` redirect, and the
  admin server actions re-verify the role before any mutation

### Demo Accounts

Registered by the seed script (password for all: `TORI@123`):

| Role   | Email                    |
| ------ | ------------------------ |
| Admin  | admin@bidzone.local     |
| Seller | seller@bidzone.local    |
| Buyer  | buyer@bidzone.local     |

## Getting Started

```bash
npm install
cp .env.example .env        # then set DATABASE_URL and AUTH_SECRET
npx prisma migrate dev     # or npm run db:migrate
npm run db:seed            # idempotent — safe to re-run, preserves existing data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable      | Description                                                        |
| ------------- | ------------------------------------------------------------------ |
| `DATABASE_URL` | SQLite database URL, e.g. `file:./prisma/dev.db`                   |
| `AUTH_SECRET`  | Secret used to sign auth session JWTs. Generate with `openssl rand -base64 32` |

`.env` is git-ignored; only `.env.example` is committed (with placeholders).

## Security Notes

- Passwords are hashed with bcrypt (cost factor 10); plain-text passwords are never stored.
- Auth sessions use Auth.js JWT strategy; the session exposes only `id`, `name`, `email`, `role` — never the password. The user id is always converted to a number server-side before use in queries/comparisons.
- Registration never allows the `ADMIN` role; roles are mapped server-side from the selected account type.
- `/dashboard/*` and `/admin/*` are protected by middleware; `/admin/*` is ADMIN-only.
- All auction mutations go through server actions; `sellerId`, `currentPrice`, and role are taken from the session/DB, never from the client.
- Bidding runs inside a `prisma.$transaction` so the bid and the `currentPrice` update are atomic, and the previous top bidder is notified of an outbid in the same transaction.
- Watchlist and notification server actions are all protected by `getCurrentUser()`, never accepting a user ID from the client.
- Admin server actions (`adminChangeRoleAction`, `adminCancelAuctionAction`)
  independently verify `getCurrentUser().role === "ADMIN"` before acting; role
  changes are restricted to BUYER ↔ SELLER (never to/from ADMIN, and you cannot
  change your own role), so the last admin can never be accidentally removed.
- Product images are remote URLs only (no file upload / local storage), which keeps the app Vercel-friendly.
- `.env` is git-ignored; `AUTH_SECRET` and `DATABASE_URL` live there, never in the repo.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Lint
npm run db:migrate   # Run Prisma migration
npm run db:seed      # Seed database (idempotent)
npm run db:studio    # Open Prisma Studio
```

## Deployment

### Pushing to GitHub

```bash
git init
git add .
git commit -m "TORI: complete auction platform"
git remote add origin https://github.com/<your-username>/bidzone.git
git push -u origin main
```

The `.gitignore` excludes `.env`, `prisma/dev.db`, `node_modules`, and build artifacts.

### Deploying to Vercel

1. Push the repository to GitHub.
2. Import the repository at [vercel.com/new](https://vercel.com/new).
3. Set the **Root Directory** to `bidzone/` (the subfolder containing `package.json`).
4. Vercel auto-detects Next.js — the build command and output are correct by default.
5. Add the following **Environment Variables**:

   | Variable      | Value                                                        |
   | ------------- | ------------------------------------------------------------ |
   | `DATABASE_URL` | `file:./prisma/dev.db`                                      |
   | `AUTH_SECRET`  | Generate via `openssl rand -base64 32`                       |

6. Deploy.

### SQLite / Vercel Limitations

The application currently uses **SQLite** via `@prisma/adapter-better-sqlite3`.

- **Builds succeed** on Vercel's serverless runtime — Prisma generates and bundles correctly.
- **Read operations** (home page, auctions, auction detail) work after build because the seed data is bundled at build time.
- **Write operations** (login, bidding, creating auctions, notifications) require a **read-write filesystem**, which Vercel serverless functions do **not** provide persistently. Database writes will work within a single function invocation but **will not persist** across cold starts or different instances.
- The **AUTH_SECRET** environment variable is required for JWT session signing in production.

**For a fully persistent production deployment**, the SQLite adapter would need to be replaced with a serverless-compatible database (e.g., PostgreSQL via Prisma's standard adapter, or Turso). This was intentionally kept outside the scope of this semester project.