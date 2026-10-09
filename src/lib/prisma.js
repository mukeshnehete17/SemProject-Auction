import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { copyFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const globalForPrisma = globalThis;

/**
 * Pure selector used by the runtime, the Prisma config convention, and
 * unit tests. Postgres (incl. Supabase pooler/direct URLs) selects the
 * pg adapter; anything else keeps the local SQLite behaviour.
 */
export function resolveDatabaseKind(url) {
  const value = typeof url === "string" ? url.trim() : "";
  if (/^(postgres(ql)?):\/\//i.test(value)) return "postgresql";
  return "sqlite";
}

/**
 * Runtime connection string. The app server always uses DATABASE_URL —
 * on Supabase this must be the Transaction-mode pooler URL
 * (port 6543, `pgbouncer=true`). Migrations and the one-time transfer
 * script use DIRECT_URL instead (see prisma.config.ts).
 */
export function getDatabaseUrl() {
  return process.env.DATABASE_URL || "file:./prisma/dev.db";
}

function getSqliteSource(url) {
  return url.replace("file:", "").replace(".\\", "./");
}

function ensureWritableDb(url) {
  const source = getSqliteSource(url);
  const absolute = path.isAbsolute(source)
    ? source
    : path.join(process.cwd(), source);

  const runningOnServerless =
    process.env.VERCEL === "1" || Boolean(process.env.NOW_REGION);

  if (!runningOnServerless) return source;

  const tmpDir = path.join("/tmp", "tori-db");
  mkdirSync(tmpDir, { recursive: true });
  const target = path.join(tmpDir, path.basename(absolute));
  if (!existsSync(target) && existsSync(absolute)) {
    copyFileSync(absolute, target);
  }
  return target;
}

function createPostgresPool(url) {
  // `pg` honours `sslmode` from the connection string — Supabase URLs
  // must carry `sslmode=require`. Pool is deliberately small: serverless
  // instances each hold their own pool against the shared PgBouncer.
  return new Pool({
    connectionString: url,
    max: Number.parseInt(process.env.PG_POOL_MAX || "5", 10) || 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

function createPrismaClient() {
  const url = getDatabaseUrl();
  if (resolveDatabaseKind(url) === "postgresql") {
    const pool = createPostgresPool(url);
    return new PrismaClient({ adapter: new PrismaPg(pool) });
  }
  const adapter = new PrismaBetterSqlite3({ url: ensureWritableDb(url) });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Always cache (all environments): on serverless each uncached client
// would open its own pg Pool and exhaust the database connection limit.
globalForPrisma.prisma = prisma;
