# TORI SQLite → Supabase PostgreSQL migration

Status: **application-side preparation complete; transfer NOT executed.**
Local SQLite development is unchanged and remains the default.

## 1. Architecture

- `prisma/schema.prisma` — SQLite, local development (unchanged).
- `prisma/postgres/schema.prisma` — identical models, `provider = "postgresql"`.
  Keep both model sets in sync; generate one migration per provider.
- `prisma.config.ts` — selects schema + migrations directory + datasource URL
  from the environment: a `postgres://`/`postgresql://` URL (prefer
  `DIRECT_URL`, else `DATABASE_URL`) activates the Postgres set; anything
  else keeps SQLite.
- `src/lib/prisma.js` — runtime adapter selection: `pg.Pool` + `PrismaPg`
  for Postgres, better-sqlite3 (with the existing `/tmp` fallback) for
  SQLite. The client is cached in all environments so serverless instances
  do not grow unbounded pools.

## 2. Environment variables (placeholders in `.env.example`)

| Variable | Purpose | Example shape (no real secrets) |
|---|---|---|
| `DATABASE_URL` | App runtime. Supabase **pooler**, port **6543**, Transaction mode | `postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require` |
| `DIRECT_URL` | Prisma CLI (`migrate`) + transfer script. **Direct**, port **5432**, Session mode | `postgresql://postgres:[pw]@db.[ref].supabase.co:5432/postgres?sslmode=require` |
| `PG_POOL_MAX` | Optional `pg` pool size (default `5`) | `5` |
| `ALLOW_PROD_SEED` | Override for production seeding (default: refused) | `i-understand-data-loss` |

Rules: `DATABASE_URL` (pooler) for the running app; **never** run DDL,
`migrate`, or the transfer script against the pooler. Credentials live only
in local `.env` and Vercel project settings — never in code or logs.

## 3. Execution steps (explicit review required — NOT done yet)

1. Create the Supabase project; collect the pooler URL → `DATABASE_URL`
   and the direct URL → `DIRECT_URL` (local `.env` + Vercel env).
2. Baseline the empty destination (uses the direct URL; needs a shadow
   database — Supabase users typically point `shadowDatabaseUrl` at a
   second throwaway project or a local Postgres):
   `DIRECT_URL="..." npx prisma migrate dev --name init`
   This creates `prisma/postgres/migrations/`.
3. Reviewer approves; then run the transfer **once** from a dev machine:
   `TARGET_DATABASE_URL="<direct url>" SOURCE_DATABASE_URL="file:./prisma/dev.db" npm run db:transfer`
   The script backs up SQLite to `prisma/backups/` (gitignored), aborts if
   the destination is non-empty (override: `--mode=reviewed` plus
   `REVIEWED_MERGE=i-have-a-reviewed-backup`, still never drops), inserts
   in one transaction with explicit IDs, repairs serial sequences, and
   validates counts + FKs + hashes + prices.
4. Verify: row counts per table, spot-check login/bidding on a staging
   deployment, confirm sequences (`nextval` continues past max id).
5. Cut over Vercel env to the pooler URL; deploy (build runs
   `prisma migrate deploy`, which then applies `prisma/postgres/migrations`).

## 4. Seed policy

- `npm run build` no longer seeds. `npm run db:seed` is the explicit
  local/demo command.
- `prisma/seed.js` refuses when `NODE_ENV=production` unless
  `ALLOW_PROD_SEED=i-understand-data-loss` is set (see
  `scripts/seed-guard.cjs`, unit-tested). Demo records must never be
  seeded into production.

## 5. Rollback

Application code is provider-agnostic at the Prisma Client API level:
reverting means pointing `DATABASE_URL` back at the SQLite file
(the pre-transfer backup in `prisma/backups/` plus the untouched
`prisma/dev.db` remain available). No Supabase-side rollback is needed
because the transfer never modifies or deletes destination data on
failure (single transaction + rollback).

## 6. Known unverified items

- Live Supabase connectivity and end-to-end persistence (no connection
  test has been run from this workspace yet).
- `pgbouncer=true` transaction-mode behavior under serverless load.
- Shadow-database setup for `migrate dev` against Supabase.
