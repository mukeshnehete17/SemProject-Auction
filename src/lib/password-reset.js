import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const TOKEN_EXPIRY_MINUTES = 30;

/**
 * Hash raw token with SHA-256 before storing or querying the database.
 */
export function hashToken(token) {
  if (!token || typeof token !== "string") return "";
  return crypto.createHash("sha256").update(token.trim()).digest("hex");
}

/**
 * Generate a cryptographically secure 256-bit random hex token.
 */
export function generateSecureToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Request a password reset link for an email address.
 * Employs generic response to mitigate email enumeration.
 */
export async function requestPasswordReset(email) {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return {
      ok: true,
      message: "If an account exists with this email, a password reset link has been dispatched.",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Return identical success response to prevent timing/enumeration attacks
      return {
        ok: true,
        message: "If an account exists with this email, a password reset link has been dispatched.",
      };
    }

    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

    // Invalidate any previous unused tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Store token hash in database
    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    // In local development, log reset link safely for testing
    if (process.env.NODE_ENV !== "production") {
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      console.log(`[TORI Auth] Password reset requested for ${normalizedEmail}:`);
      console.log(`  Reset URL: ${baseUrl}/reset-password?token=${rawToken}`);
    }

    return {
      ok: true,
      message: "If an account exists with this email, a password reset link has been dispatched.",
      // In non-production only, supply token for automated testing
      ...(process.env.NODE_ENV === "test" ? { debugToken: rawToken } : {}),
    };
  } catch (err) {
    console.error("[TORI Auth] Error in requestPasswordReset:", err);
    return {
      ok: true,
      message: "If an account exists with this email, a password reset link has been dispatched.",
    };
  }
}

/**
 * Verify if a given reset token is valid and not expired.
 */
export async function verifyResetToken(rawToken) {
  if (!rawToken || typeof rawToken !== "string" || rawToken.trim().length < 10) {
    return { valid: false, error: "Invalid or malformed reset token." };
  }

  const tokenHash = hashToken(rawToken);

  try {
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    if (!record) {
      return { valid: false, error: "This password reset link is invalid or has expired." };
    }

    if (record.usedAt) {
      return { valid: false, error: "This password reset link has already been used." };
    }

    if (new Date() > new Date(record.expiresAt)) {
      return { valid: false, error: "This password reset link has expired. Please request a new one." };
    }

    return { valid: true, user: record.user };
  } catch (err) {
    console.error("[TORI Auth] Error in verifyResetToken:", err);
    return { valid: false, error: "Unable to verify reset link. Please try again." };
  }
}

/**
 * Reset password using a valid token and hash the new password with bcryptjs.
 */
export async function resetPasswordWithToken(rawToken, newPassword) {
  if (!rawToken || typeof rawToken !== "string") {
    return { error: "Invalid password reset link." };
  }
  if (!newPassword || newPassword.length < 6 || newPassword.length > 128) {
    return { error: "Password must be between 6 and 128 characters." };
  }

  const tokenHash = hashToken(rawToken);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const record = await tx.passwordResetToken.findUnique({
        where: { tokenHash },
      });

      if (!record) {
        return { error: "This password reset link is invalid or has expired." };
      }

      if (record.usedAt) {
        return { error: "This password reset link has already been used." };
      }

      if (new Date() > new Date(record.expiresAt)) {
        return { error: "This password reset link has expired. Please request a new one." };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user password
      await tx.user.update({
        where: { id: record.userId },
        data: { password: hashedPassword },
      });

      // Mark token as used
      await tx.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      });

      // Invalidate all other reset tokens for this user
      await tx.passwordResetToken.deleteMany({
        where: {
          userId: record.userId,
          id: { not: record.id },
        },
      });

      return { ok: true };
    });

    return result;
  } catch (err) {
    console.error("[TORI Auth] Error in resetPasswordWithToken:", err);
    return { error: "Failed to reset password. Please try again." };
  }
}
