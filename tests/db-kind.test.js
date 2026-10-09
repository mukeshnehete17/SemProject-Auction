import { describe, it, expect, beforeAll, vi } from "vitest";
import { tmpdir } from "os";
import { join } from "path";
import { isProductionSeedBlocked } from "../scripts/seed-guard.cjs";

let resolveDatabaseKind;
let getDatabaseUrl;

beforeAll(async () => {
  // Point at a throwaway path BEFORE the module builds its client, so this
  // unit test never opens the real development database.
  process.env.DATABASE_URL = `file:${join(tmpdir(), `tori-kind-${process.pid}.db`)}`;
  vi.resetModules();
  ({ resolveDatabaseKind, getDatabaseUrl } = await import("@/lib/prisma.js"));
});

describe("resolveDatabaseKind", () => {
  it("keeps file: URLs on SQLite", () => {
    expect(resolveDatabaseKind("file:./prisma/dev.db")).toBe("sqlite");
  });
  it("keeps bare paths on SQLite", () => {
    expect(resolveDatabaseKind("./prisma/dev.db")).toBe("sqlite");
  });
  it("defaults missing/empty values to SQLite (local-safe)", () => {
    expect(resolveDatabaseKind(undefined)).toBe("sqlite");
    expect(resolveDatabaseKind("")).toBe("sqlite");
  });
  it("selects PostgreSQL for direct session URLs", () => {
    expect(
      resolveDatabaseKind("postgresql://postgres:pw@db.ref.supabase.co:5432/postgres")
    ).toBe("postgresql");
  });
  it("selects PostgreSQL for Supabase pooler URLs", () => {
    expect(
      resolveDatabaseKind(
        "postgresql://postgres.ref:pw@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
      )
    ).toBe("postgresql");
  });
  it("accepts the postgres:// scheme variant", () => {
    expect(resolveDatabaseKind("postgres://user:pw@localhost:5432/db")).toBe("postgresql");
  });
});

describe("getDatabaseUrl", () => {
  it("falls back to the local SQLite file", () => {
    const saved = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    expect(getDatabaseUrl()).toBe("file:./prisma/dev.db");
    process.env.DATABASE_URL = saved;
  });
});

describe("isProductionSeedBlocked", () => {
  it("refuses production seeding by default", () => {
    expect(isProductionSeedBlocked({ NODE_ENV: "production" })).toBe(true);
  });
  it("allows production seeding only with the documented override", () => {
    expect(
      isProductionSeedBlocked({
        NODE_ENV: "production",
        ALLOW_PROD_SEED: "i-understand-data-loss",
      })
    ).toBe(false);
  });
  it("allows non-production seeding", () => {
    expect(isProductionSeedBlocked({ NODE_ENV: "development" })).toBe(false);
    expect(isProductionSeedBlocked({})).toBe(false);
  });
});
