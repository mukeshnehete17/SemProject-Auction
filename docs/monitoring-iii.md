# TORI — Online Auction Marketplace
## Semester Project Monitoring-III Technical Specification & Comprehensive Documentation

---

## 1. Project Overview & Objectives

**TORI** is an editorial, high-trust online auction marketplace dedicated to fine collectibles, horology, cameras, and rare artifacts. The platform bridges discerning consignors and collectors with real-time bidding, rigorous lot provenance, transparent valuation, and institutional auditability.

### Primary Objectives for Monitoring-III:
- **Live Real-Time Auction Bidding:** Deliver sub-second bidding feedback via Server-Sent Events (SSE) with robust polling fallback and eliminate page-reload friction.
- **Strict Concurrency & Integrity Controls:** Eliminate race conditions and double-winning bids using ACID transactions and authoritative server-side validation.
- **Authoritative Auction Lifecycle:** Enforce authoritative server timestamps across Upcoming, Active, Ending Soon, Ended, and Cancelled states with an idempotent settlement workflow.
- **Provider-Based Email Integration:** Implement direct Resend HTTP API notifications for outbid alerts, won lots, ending-soon warnings, seller summaries, and secure password resets with graceful logging fallback.
- **Consignor Portfolio Intelligence (Seller Analytics):** Provide sellers with real database-backed KPIs, velocity histograms, category distribution, and live lot activity feeds.
- **Administrator Audit Trail & Moderation:** Log all critical system events into an immutable audit table and deploy automated heuristics for detecting anomalous/suspicious bidding patterns.
- **Multi-Image Lot Presentation:** Support multi-image galleries, cover selection, thumbnail previews, and image validation without breaking existing single-image records.

---

## 2. System Architecture

```mermaid
graph TD
    subgraph Client Tier
        UI[Next.js 16 / React 19 Client UI]
        SSE_Client[EventSource SSE Listener]
        Poll_Client[Polling Fallback Engine]
    end

    subgraph Application Tier [Next.js App Router]
        Auth[NextAuth v5 Credentials Provider]
        Actions[Server Actions: placeBid, createAuction, adminActions]
        SSE_Route[GET /api/auctions/:id/live]
        Poll_Route[GET /api/auctions/:id/poll]
        Settle_Route[POST /api/auctions/settle]
        EventBus[In-Memory Auction Event Emitter]
        AuditEngine[Audit & Anomaly Detection Service]
        EmailService[Resend Email Provider Service]
    end

    subgraph Persistence Tier
        Prisma[Dual Prisma 7 ORM Layer]
        SQLite[(Local Dev / Vitest: SQLite)]
        Postgres[(Production: Supabase PostgreSQL Pooler)]
    end

    subgraph External Services
        Resend[Resend Email API]
    end

    UI -->|Invoke Server Actions| Actions
    UI -->|Subscribe SSE Stream| SSE_Route
    UI -->|Fallback Poll| Poll_Route
    SSE_Route -->|Listen to Events| EventBus
    Actions -->|Broadcast Event| EventBus
    Actions -->|Enforce Policy & Concurrency| Prisma
    Actions -->|Dispatch Outbid Alerts| EmailService
    Actions -->|Record Immutable Audit| AuditEngine
    Settle_Route -->|Idempotent Settlement| Prisma
    Settle_Route -->|Broadcast Close & Winner| EventBus
    Settle_Route -->|Dispatch Won/Ended Emails| EmailService
    AuditEngine -->|Write Audit Log| Prisma
    EmailService -->|HTTPS POST| Resend
    Prisma --> SQLite
    Prisma --> Postgres
```

---

## 3. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | Next.js (App Router) | 16.3.4 | Server components, route handlers, server actions |
| **UI Library** | React | 19.2.8 | Declarative reactive user interface |
| **Styling** | Tailwind CSS PostCSS | 4.x | B&W design system with restrained indigo/purple accents |
| **Icons** | Lucide React | 1.44.0 | Consistent iconography |
| **ORM** | Prisma ORM | 7.10.0 | Type-safe schema, migrations, transaction engine |
| **Database (Dev/Test)** | Better-SQLite3 | 12.11.1 | Zero-overhead local development & test execution |
| **Database (Prod)** | PostgreSQL / Supabase | 8.23.1 (`pg` Pool) | Production relational storage via Transaction Pooler |
| **Authentication** | NextAuth (Auth.js) | 5.0.0-beta.32 | JWT session management & credentials authorization |
| **Password Security** | bcryptjs | 3.0.3 | Salted password hashing (cost factor 10) |
| **Real-Time** | Server-Sent Events (SSE) | Native Web Streams | Sub-second live bidding push to browser clients |
| **Email** | Resend HTTP API | Native Fetch | Outbid, settlement, and password recovery emails |
| **Test Framework** | Vitest | 5.0.3 | Unit, integration, concurrency, and E2E test runner |

---

## 4. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    User ||--o{ Auction : "sells"
    User ||--o{ Bid : "places"
    User ||--o{ Watchlist : "tracks"
    User ||--o{ Notification : "receives"
    User ||--o{ PasswordResetToken : "requests"
    User ||--o{ AuditLog : "acts in"
    Category ||--o{ Auction : "categorizes"
    Auction ||--o{ Bid : "receives"
    Auction ||--o{ Watchlist : "included in"

    User {
        int id PK
        string name
        string email UK
        string password
        string role "BUYER | SELLER | ADMIN"
        datetime createdAt
        datetime updatedAt
    }

    Category {
        int id PK
        string name UK
        string slug UK
        datetime createdAt
    }

    Auction {
        int id PK
        string title
        string description
        string image "Cover Image"
        string images "JSON array of gallery URLs"
        float startingPrice
        float currentPrice
        float minimumIncrement
        datetime startTime
        datetime endTime
        string status "ACTIVE | ENDED | CANCELLED | UPCOMING"
        int sellerId FK
        int categoryId FK
        datetime createdAt
        datetime updatedAt
    }

    Bid {
        int id PK
        float amount
        int auctionId FK
        int bidderId FK
        datetime createdAt
    }

    Watchlist {
        int id PK
        int userId FK
        int auctionId FK
        datetime createdAt
    }

    Notification {
        int id PK
        int userId FK
        string message
        string type "OUTBID | AUCTION_WON | AUCTION_ENDED"
        int referenceId
        boolean isRead
        datetime createdAt
    }

    PasswordResetToken {
        int id PK
        int userId FK
        string tokenHash UK "SHA-256"
        datetime expiresAt
        datetime usedAt
        datetime createdAt
    }

    AuditLog {
        int id PK
        string action "BID_PLACED | AUCTION_CREATE | ROLE_CHANGE | etc."
        string entityType
        int entityId
        int actorId FK
        string metadata "JSON string"
        datetime createdAt
    }
```

---

## 5. Use-Case Diagram

```mermaid
flowchart LR
    subgraph Actors
        Buyer((Buyer))
        Seller((Seller))
        Admin((Admin))
        Cron((System Cron / Timer))
    end

    subgraph Marketplace Features
        UC_Search[Browse & Search Catalogue]
        UC_Watch[Bookmark to Watchlist]
        UC_Bid[Place Live Bid with Concurrency Guard]
        UC_SSE[Receive Sub-Second Live Price Updates]
        UC_Create[Catalogue Lot & Upload Gallery]
        UC_SellerAnalytics[View Seller Velocity & Valuation Analytics]
        UC_Moderation[Review Suspicious Bidding & Audit Logs]
        UC_CancelLot[Cancel / Moderate Auction Lot]
        UC_Role[Update User Role Permissions]
        UC_Settlement[Execute Idempotent Auction Settlement]
        UC_Email[Dispatch Outbid & Won Email Alerts]
    end

    Buyer --> UC_Search
    Buyer --> UC_Watch
    Buyer --> UC_Bid
    Buyer --> UC_SSE

    Seller --> UC_Create
    Seller --> UC_SellerAnalytics
    Seller --> UC_CancelLot

    Admin --> UC_Moderation
    Admin --> UC_CancelLot
    Admin --> UC_Role
    Admin --> UC_Settlement

    Cron --> UC_Settlement
    UC_Bid -.->|Triggers| UC_Email
    UC_Settlement -.->|Triggers| UC_Email
```

---

## 6. Sequence Diagram: Placing a Bid with Concurrency Guard

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Collector (Client)
    participant Action as placeBidAction (Server Action)
    participant Tx as Prisma $transaction
    participant DB as Relational Database
    participant Bus as Auction Event Emitter
    participant SSE as Connected SSE Clients
    participant Email as Email Notification Service

    Buyer->>Action: placeBidAction(auctionId, amount)
    Action->>Action: Authenticate User & Validate Whole-Rupee Amount
    Action->>Tx: Begin Atomic Isolation Transaction
    Tx->>DB: Fetch Auction Record & Lock/Read
    Tx->>DB: Query True Committed Top Bid (orderBy amount DESC)
    
    alt Competing Bid Exceeds Minimum Increment
        Tx-->>Action: Reject with OUTDATED_BID error
        Action-->>Buyer: "A competing bid of ₹X was just accepted. Your bid must be at least ₹Y."
    else Bid Satisfies Policy & Strict Concurrency
        Tx->>DB: INSERT into Bid (amount, auctionId, bidderId)
        Tx->>DB: UPDATE Auction SET currentPrice = amount
        Tx->>DB: INSERT into AuditLog (action: BID_PLACED, actorId)
        Tx->>DB: INSERT into Notification for previous bidder (type: OUTBID)
        Tx->>DB: Commit Transaction
        Action->>Bus: broadcastAuctionUpdate(auctionId, NEW_BID payload)
        Bus->>SSE: Push text/event-stream update to all room clients
        SSE-->>Buyer: Instant UI Price & Ledger Update (No Page Reload)
        opt Previous Bidder has Email
            Action->>Email: sendOutbidEmail(previousBidderEmail)
        end
        Action-->>Buyer: { ok: true, amount, bidId }
    end
```

---

## 7. Auction Lifecycle Flowchart

```mermaid
stateDiagram-v2
    [*] --> UPCOMING : Consignor publishes lot (startTime in future)
    UPCOMING --> ACTIVE : startTime reached
    UPCOMING --> CANCELLED : Cancelled by owner / admin (0 bids)
    ACTIVE --> ENDING_SOON : Within 24 hours of endTime
    ACTIVE --> CANCELLED : Cancelled by owner / admin (0 bids only)
    ENDING_SOON --> ENDED : endTime reached (Authoritative Server Time)
    ENDED --> SETTLED : Idempotent Settlement Trigger
    
    state SETTLED {
        [*] --> CheckWinner
        CheckWinner --> NotifyWinner : Winner Exists (Send AUCTION_WON Email & Notification)
        CheckWinner --> NotifySeller : Send AUCTION_ENDED Email & Notification
        NotifyWinner --> AuditRecord : Record AUCTION_SETTLED AuditLog
        NotifySeller --> AuditRecord
        AuditRecord --> BroadcastEnded : SSE Broadcast to Room
    }

    SETTLED --> [*]
    CANCELLED --> [*]
```

---

## 8. Feature Implementation Details

### A. Real-Time Bidding Engine (Phase Two)
- **SSE Endpoint (`/api/auctions/[id]/live`):** Streams Server-Sent Events with HTTP streaming headers (`Content-Type: text/event-stream`, `Cache-Control: no-cache, no-transform`, `Connection: keep-alive`). Sends an immediate `SNAPSHOT` event on connection, registers with the in-memory global event emitter, and pulses a `: ping` heartbeat every 15 seconds.
- **Client Reactive Sync (`AuctionDetailContent.js`):** Listens to live updates, optimistically pushes bids, highlights incoming competitor bids, updates the highest valuation, and displays connection status via a live indicator (`LIVE SSE STREAM` / `POLLING SYNC` / `HAMMER FALLEN`).
- **Polling Fallback Route (`/api/auctions/[id]/poll`):** If an intermediate corporate proxy blocks SSE or network interrupts, client switches to short polling every 4 seconds.
- **Concurrency Barrier:** Inside `prisma.$transaction`, the latest committed top bid is re-queried directly before inserting. If another bid committed milliseconds before, the stale request is rejected with `OUTDATED_BID` and the user is informed of the new minimum reserve.

### B. Auction Lifecycle & Idempotent Settlement (Phase Three)
- **Authoritative Status Calculation (`src/lib/auctions.js`):** `deriveStatus()` calculates status based on current server time against `startTime` and `endTime`. Client clock differences cannot allow unauthorized bidding.
- **Idempotent Settlement (`settleExpiredAuctions()` & `/api/auctions/settle`):** Scans for all expired, unsettled auctions. Identifies top bidder, verifies whether notifications have already been delivered (`findFirst({ userId, type, referenceId })`), issues notifications once and only once, records audit logs, and updates DB status to `ENDED`. Can be safely invoked repeatedly by cron workers or webhooks.

### C. Provider-Based Email Notifications (Phase Four)
- **Resend HTTP Service (`src/lib/email.js`):** Uses direct `fetch` to `https://api.resend.com/emails` (no extra external SDKs required).
- **Graceful Fallback Boundary:** Checks `isEmailConfigured()`. If `RESEND_API_KEY` is not present, suppresses HTTP delivery and safely logs operational messages without false claims of delivery or crashes.
- **Templates Implemented:**
  1. `sendOutbidEmail` — Informs bidder of competing bid amount with direct auction link.
  2. `sendEndingSoonEmail` — Reminds watchlist collectors of impending close.
  3. `sendAuctionWonEmail` — Notifies winner of hammer price and portfolio entry.
  4. `sendSellerAuctionEndedEmail` — Reports final valuation, bidder name, and total bids.
  5. `sendPasswordResetEmail` — Dispatches expiring single-use reset URL containing cryptographic SHA-256 token.

### D. Seller Analytics Dashboard (Phase Five)
- **Backend Analytics Engine (`src/lib/seller-analytics.js`):** Queries lots belonging strictly to `sellerId`. Computes real counts: Total Lots, Active Auctions, Ended Auctions, Total Bids Received, Watchlist Interest, and Gross Valuation.
- **Velocity Histogram:** Groups real bids by date over the previous 14 days, displayed with SVG bar visualization and interactive tooltips.
- **Category Density:** Aggregates percentage of bids across categories.
- **Lot Performance Directory:** Granular lot table showing reserves, top bids, leading bidders, and closing dates.
- **Live Bidding Feed:** Displays the last 15 bids placed across all consignments with bidder names and timestamps.
- **Strict Data Isolation:** Built with strict WHERE clauses (`where: { sellerId }`) preventing cross-seller data exposure.

### E. Admin Audit Trail & Anomaly Moderation (Phase Six)
- **Immutable Audit Engine (`src/lib/audit.js`):** Records actor ID, action type, entity type, entity ID, metadata JSON, and timestamp. Accessible only by authorized `ADMIN` accounts via `adminAccessCheck()`.
- **Algorithmic Anomaly Detection (`getSuspiciousBiddingFlags()`):**
  1. *High-Frequency Bidding:* Detects >= 3 bids placed by a single user within 45 seconds on the same lot.
  2. *Consecutive Self-Outbidding:* Detects a bidder outbidding themselves without an intervening competitor.
  3. *Abnormal Bid Spike:* Flags bids exceeding 5x the starting reserve.
- **Ethical Moderation Rule:** In accordance with safety policies, all automated flags are labeled as algorithmic indicators for manual human review and do not auto-ban accounts.

### F. Multi-Image Lot Management (Phase Seven)
- **Schema Design:** Added `images String?` to `Auction` model (JSON array of URLs), keeping `image String?` as the primary catalogue cover for 100% backward compatibility.
- **Consignment Form Gallery (`AuctionForm.js`):** Supports adding up to 6 image URLs, reordering images, setting primary cover, removing images, and previewing thumbnails.
- **Catalogue Detail Viewer (`AuctionDetailContent.js`):** Interactive thumbnail carousel below the main showcase stage; clicking any thumbnail smoothly switches the viewport.

---

## 9. API Routes & Server Actions Catalog

### API Route Handlers

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/auctions/[id]/live` | Public | Real-time Server-Sent Events (SSE) live auction stream |
| `GET` | `/api/auctions/[id]/poll` | Public | Fallback polling endpoint returning current price, status, bids |
| `POST` | `/api/auctions/settle` | Admin / Cron Bearer | Idempotent batch settlement of all expired auctions |
| `GET` | `/api/notifications/unread` | Authenticated | Count of unread user notifications |
| `GET` | `/api/user/profile` | Authenticated | User account details |

### Critical Server Actions

| Action | Location | Authorization | Description |
|---|---|---|---|
| `placeBidAction(auctionId, amount)` | `@/lib/auction-actions.js` | Authenticated (Buyer/Seller) | Places bid with concurrency barrier, updates price, records audit log, triggers outbid notification and SSE broadcast |
| `createAuctionAction(data)` | `@/lib/auction-actions.js` | Seller / Admin | Validates fields, sets up multi-image gallery, creates lot and audit record |
| `updateAuctionAction(id, data)` | `@/lib/auction-actions.js` | Auction Owner | Updates upcoming lots prior to any bids |
| `cancelAuctionAction(id)` | `@/lib/auction-actions.js` | Auction Owner | Cancels upcoming or active lots with zero bids; broadcasts status |
| `adminCancelAuctionAction(id)` | `@/lib/admin-actions.js` | Admin Only | Moderation cancellation with audit trail |
| `adminChangeRoleAction(userId, role)` | `@/lib/admin-actions.js` | Admin Only | Promotes or demotes user with immutable audit log |
| `requestPasswordReset(email)` | `@/lib/password-reset.js` | Public (Enumeration-safe) | Generates cryptographically secure SHA-256 token and dispatches email |
| `resetPasswordWithToken(token, pw)` | `@/lib/password-reset.js` | Public | Verifies single-use unexpired token and updates hashed password |

---

## 10. Environment Variable Reference

The application requires the following environment variables. **No secret values are printed here.**

```bash
# --- Core Runtime ---
# Local SQLite development database (default)
DATABASE_URL="file:./prisma/dev.db"

# NextAuth / Auth.js secret key
AUTH_SECRET="generated-32-byte-base64-secret"
NEXTAUTH_URL="http://localhost:3000"

# --- Supabase PostgreSQL (Production Target) ---
# App runtime: Transaction-mode pooler URL (port 6543)
# DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
# Migrations and CLI: Session-mode direct connection (port 5432)
# DIRECT_URL="postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres?sslmode=require"
# Optional connection pool ceiling (default 5)
# PG_POOL_MAX="5"

# --- Email Notifications (Resend) ---
# If present, emails are dispatched via Resend API; if absent, system logs operational fallbacks
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="TORI Auctions <notifications@yourdomain.com>"

# --- Automated Settlement Cron ---
# Bearer secret for protecting the /api/auctions/settle endpoint
CRON_SECRET="your-cron-secret-token"
```

---

## 11. Testing Strategy & Verification Results

All tests execute against an isolated temporary SQLite database populated exclusively by committed migration SQL files, completely isolating development and production databases.

### Execution Command:
```bash
npm test
```

### Test Suite Summary:
```text
Test Files  6 passed (6)
     Tests  72 passed (72)
  Duration  ~1.0s
```

### Breakdown of Test Suites:
1. `tests/monitoring-iii.test.js` (11 tests):
   - Rejection of unauthenticated bid attempts (`UNAUTHENTICATED`)
   - Rejection of bids below minimum increment
   - Acceptance of valid bids and highest price calculation
   - Concurrency barrier: rejection of stale bids once a higher bid has committed
   - Simultaneous identical bid resolution (exactly 1 winner, 1 failure)
   - Immutable audit logging on bids
   - Rejection of bids on expired/ended lots
   - Idempotent settlement workflow (zero duplicate notifications on rerun)
   - Seller analytics data isolation (zero leakage between Seller A and Seller B)
   - Email service fallback boundary check
   - Admin authorization check (`adminAccessCheck` redirection)
   - Anomaly heuristic detection for high-frequency bidding
2. `tests/backend.test.js` (17 tests):
   - Auction creation, updates, and cancellations
   - Bid validation, price convergence, and outbid notifications
   - Auction completion and winner naming
   - Watchlist addition and removal
   - Admin role changes and permission barriers
   - User profile update and registration
3. `tests/auth-and-password-reset.test.js` (12 tests):
   - Account registration and bcrypt password hashing
   - Generic enumeration-safe password recovery responses
   - Single-use cryptographically hashed reset token workflow
   - Token expiration and reuse prevention
4. `tests/bid-policy.test.js` (10 tests):
   - `normalizeBidAmount` whole-rupee ceiling and validation
   - `validateBid` policy enforcement across all lifecycle states
   - Sort ordering rules
5. `tests/db-kind.test.js` (10 tests):
   - URL parsing and adapter selector rules (`resolveDatabaseKind`)
6. `tests/e2e-auction-marketplace.test.js` (12 tests):
   - Complete two-user bidding room simulation
   - Watchlist bookmarking workflow
   - Price convergence under simulated load

---

## 12. Faculty Demonstration Checklist (Monitoring-III)

Follow these steps to demonstrate all Monitoring-III features to evaluation faculty:

### Step 1: Real-Time Auction Bidding & Live SSE Sync
1. Open two independent browser windows:
   - Window A: Log in as Buyer (`aarav@tori.local` / `Password123!`).
   - Window B: Log in as Buyer (`priya@tori.local` / `Password123!`).
2. Navigate both windows to an active auction lot (e.g. `/auctions/1`).
3. Point out the **"LIVE SSE STREAM"** badge with a pulsating green indicator in the header.
4. In Window A, enter a bid meeting the minimum increment and click **"Transact Official Bid"**.
5. Observe Window B in real-time:
   - Current High Bid price updates immediately **without refreshing the page**.
   - Bid ledger prepends the new bid with bidder name and timestamp.
   - Window B receives a subtle informational toast indicating a new bid was registered.

### Step 2: Concurrency & Race Condition Prevention
1. In Window A and Window B, enter the exact same bid amount (or an amount that will be stale after Window A commits).
2. Click bid in Window A first; observe it commits successfully.
3. Immediately click bid in Window B; observe the server transaction barrier rejects it with:
   *"A competing bid of ₹... was just accepted. Your bid must be at least ₹... "*
4. Confirm in the database/ledger that no duplicate winning prices exist.

### Step 3: Authoritative Auction Lifecycle & Idempotent Settlement
1. Navigate to `/api/auctions/settle` (or trigger via POST).
2. Observe JSON report indicating expired auctions settled.
3. Point out that the winner received the `AUCTION_WON` notification and the consignor received `AUCTION_ENDED`.
4. Trigger `/api/auctions/settle` a second time; confirm `settledCount: 0` and zero duplicate notifications were generated.
5. Attempt to place a bid on an ended lot; verify the server strictly rejects: *"This auction has already ended."*

### Step 4: Provider-Based Email Notifications & Fallback
1. Review `src/lib/email.js` showing direct Resend HTTP integration.
2. Trigger an outbid event or password reset request (`/forgot-password`).
3. Show application logs:
   - If `RESEND_API_KEY` is configured: shows Resend message dispatch ID.
   - If unconfigured: shows graceful fallback log: `[TORI Email] Delivery skipped (RESEND_API_KEY unconfigured). Target: <email>...` proving the system never crashes or makes false claims.

### Step 5: Consignor Portfolio Intelligence (Seller Analytics)
1. Log in as a Seller account (or navigate to `/dashboard/seller-analytics`).
2. Demonstrate the **5 primary KPI cards**: Total Listed, Bids Received, Watchlist Interest, Gross Valuation, Settled Lots.
3. Show the **14-Day Bidding Velocity histogram** with daily counts and interactive hover tooltips.
4. Show the **Category Performance breakdown** and **Live Bidding Feed**.
5. Log in as a different seller; verify that analytics strictly isolate the logged-in seller's data (zero cross-tenant leakage).

### Step 6: Administrator Audit Trail & Anomaly Moderation
1. Log in as an Administrator (`admin@tori.local` / `AdminPass123!`).
2. Click **"Audit & Moderation"** in the sidebar (`/admin/audit-logs`).
3. Show the **Immutable Audit Trail table** detailing `BID_PLACED`, `AUCTION_CREATE`, `ROLE_CHANGE`, and `AUCTION_SETTLED` events with actor names and metadata.
4. Demonstrate the **Suspicious Bidding Heuristics section** flagging rapid bidding or self-outbidding patterns for manual review, highlighting the advisory note.

### Step 7: Multi-Image Product Gallery
1. Navigate to `/dashboard/create-auction`.
2. Add multiple image URLs to the **Product Gallery Imagery** section.
3. Show thumbnail previews, cover image designation badge, "Make Cover" reordering, and image removal.
4. View an auction lot detail page to show the interactive thumbnail strip switching images smoothly.

---

## 13. Known Limitations & Future Scope

| Area | Current Status (Monitoring-III) | Future Scope (Final Submission) |
|---|---|---|
| **Payment Gateway** | Escrow protocol documented; transactions recorded at valuation stage | Integration with Razorpay / Stripe test checkout webhooks |
| **Real-Time Clustering** | Global in-memory EventEmitter + SSE + polling fallback on single server | Redis Pub/Sub backplane for multi-container distributed deployments |
| **Image Storage** | Validated external HTTP/HTTPS image URLs and Supabase storage support | Direct client-to-S3/Supabase drag-and-drop signed upload widget |
| **Push Notifications** | In-app notification bell + Email dispatch | Browser Web Push API (Service Worker) notifications |
| **Automated Cron** | `/api/auctions/settle` webhook ready for Vercel Cron or GitHub Actions | Continuous background worker thread / cloud function trigger |

---

*Document prepared for Semester Project Monitoring-III — TORI Online Auction Marketplace.*
