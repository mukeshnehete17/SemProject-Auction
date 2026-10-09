import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { tmpdir } from "os";
import { join, dirname } from "path";
import { unlinkSync, existsSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

vi.mock("@/lib/session", () => ({
  getCurrentUser: async () => mockSession.value,
}));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("next/navigation", () => ({
  redirect: (url) => {
    const err = new Error(`REDIRECT:${url}`);
    err.isRedirect = true;
    throw err;
  },
}));

const mockSession = vi.hoisted(() => ({ value: null }));

const dbFile = join(tmpdir(), `tori-auth-test-${process.pid}.db`);
process.env.DATABASE_URL = `file:${dbFile}`;
process.env.NODE_ENV = "test";

let prisma;
let registerAction;
let requestPasswordReset;
let verifyResetToken;
let resetPasswordWithToken;

beforeAll(async () => {
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const setup = new Database(dbFile);
  try {
    const migrations = [
      "20260910103445_init",
      "20260910114613_phase5_watchlist_notifications",
      "20261010_password_reset_token",
    ];
    for (const m of migrations) {
      setup.exec(
        readFileSync(join(repoRoot, "prisma", "migrations", m, "migration.sql"), "utf8")
      );
    }
  } finally {
    setup.close();
  }

  vi.resetModules();
  ({ prisma } = await import("@/lib/prisma.js"));
  ({ registerAction } = await import("@/app/register/actions.js"));
  ({
    requestPasswordReset,
    verifyResetToken,
    resetPasswordWithToken,
  } = await import("@/lib/password-reset.js"));
}, 60000);

afterAll(async () => {
  await prisma?.$disconnect();
  for (const f of [dbFile, `${dbFile}-journal`]) {
    try {
      if (existsSync(f)) unlinkSync(f);
    } catch {}
  }
});

describe("Account Registration & Password Hashing", () => {
  it("registers a new buyer account and hashes password with bcryptjs", async () => {
    let redirectUrl = null;
    try {
      await registerAction("Aarav Patel", "aarav@tori.local", "SuperSecret123", "buyer");
    } catch (err) {
      if (err.isRedirect) {
        redirectUrl = err.message.replace("REDIRECT:", "");
      } else {
        throw err;
      }
    }

    expect(redirectUrl).toBe("/login?registered=1");

    const user = await prisma.user.findUnique({
      where: { email: "aarav@tori.local" },
    });

    expect(user).not.toBeNull();
    expect(user.name).toBe("Aarav Patel");
    expect(user.role).toBe("BUYER");
    expect(user.password).not.toBe("SuperSecret123");
    expect(await bcrypt.compare("SuperSecret123", user.password)).toBe(true);
  });

  it("rejects duplicate email registration with a clear message", async () => {
    const res = await registerAction("Aarav Clone", "AARAV@tori.local", "AnotherPass123", "buyer");
    expect(res.error).toBe("An account with this email already exists.");
  });

  it("validates required fields and email format", async () => {
    const res1 = await registerAction("", "invalid@test.local", "123456", "buyer");
    expect(res1.error).toBe("Please enter your full name.");

    const res2 = await registerAction("Test User", "not-an-email", "123456", "buyer");
    expect(res2.error).toBe("Please enter a valid email address.");

    const res3 = await registerAction("Test User", "valid@test.local", "123", "buyer");
    expect(res3.error).toBe("Password must be between 6 and 128 characters.");
  });
});

describe("Credential Authentication Verification", () => {
  it("validates correct credentials successfully", async () => {
    const user = await prisma.user.findUnique({
      where: { email: "aarav@tori.local" },
    });
    expect(user).not.toBeNull();

    const isMatch = await bcrypt.compare("SuperSecret123", user.password);
    expect(isMatch).toBe(true);
  });

  it("rejects incorrect credentials", async () => {
    const user = await prisma.user.findUnique({
      where: { email: "aarav@tori.local" },
    });
    const isMatch = await bcrypt.compare("WrongPassword!", user.password);
    expect(isMatch).toBe(false);
  });
});

describe("Secure Password Recovery Workflow", () => {
  let validToken = "";

  it("returns generic response for both registered and unregistered emails", async () => {
    const resRegistered = await requestPasswordReset("aarav@tori.local");
    expect(resRegistered.ok).toBe(true);
    expect(resRegistered.message).toContain("If an account exists with this email");
    validToken = resRegistered.debugToken;

    const resUnregistered = await requestPasswordReset("nonexistent@tori.local");
    expect(resUnregistered.ok).toBe(true);
    expect(resUnregistered.message).toContain("If an account exists with this email");
    expect(resUnregistered.debugToken).toBeUndefined();
  });

  it("verifies that token is stored only as a cryptographic hash in database", async () => {
    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: { user: { email: "aarav@tori.local" } },
    });
    expect(tokenRecord).not.toBeNull();
    expect(tokenRecord.tokenHash).not.toBe(validToken);
    expect(tokenRecord.tokenHash.length).toBe(64); // SHA-256 hex length
    expect(tokenRecord.usedAt).toBeNull();
    expect(new Date(tokenRecord.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it("validates a legitimate token successfully", async () => {
    const res = await verifyResetToken(validToken);
    expect(res.valid).toBe(true);
    expect(res.user.email).toBe("aarav@tori.local");
  });

  it("rejects an invalid token", async () => {
    const res = await verifyResetToken("invalid-token-1234567890abcdef");
    expect(res.valid).toBe(false);
    expect(res.error).toMatch(/invalid or has expired/i);
  });

  it("rejects an expired token", async () => {
    // Create an expired token record
    const expiredRaw = "expired-token-1234567890abcdef";
    const crypto = await import("crypto");
    const expiredHash = crypto.createHash("sha256").update(expiredRaw).digest("hex");

    const user = await prisma.user.findUnique({ where: { email: "aarav@tori.local" } });
    await prisma.passwordResetToken.create({
      data: {
        tokenHash: expiredHash,
        userId: user.id,
        expiresAt: new Date(Date.now() - 60000), // 1 minute in the past
      },
    });

    const res = await verifyResetToken(expiredRaw);
    expect(res.valid).toBe(false);
    expect(res.error).toMatch(/expired/i);
  });

  it("successfully resets password and updates user hash", async () => {
    const resetRes = await resetPasswordWithToken(validToken, "BrandNewPassword456");
    expect(resetRes.ok).toBe(true);

    const updatedUser = await prisma.user.findUnique({
      where: { email: "aarav@tori.local" },
    });

    // Old password should fail
    const oldPassOk = await bcrypt.compare("SuperSecret123", updatedUser.password);
    expect(oldPassOk).toBe(false);

    // New password should succeed
    const newPassOk = await bcrypt.compare("BrandNewPassword456", updatedUser.password);
    expect(newPassOk).toBe(true);
  });

  it("rejects reuse of an already-used token", async () => {
    const resVerify = await verifyResetToken(validToken);
    expect(resVerify.valid).toBe(false);
    expect(resVerify.error).toMatch(/already been used/i);

    const resReset = await resetPasswordWithToken(validToken, "AnotherAttempt789");
    expect(resReset.error).toMatch(/already been used/i);
  });
});
