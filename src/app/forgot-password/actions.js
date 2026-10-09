"use server";

import {
  requestPasswordReset,
  verifyResetToken,
  resetPasswordWithToken,
} from "@/lib/password-reset";

export async function requestResetAction(email) {
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return { error: "Please provide a valid email address." };
  }

  const result = await requestPasswordReset(email.trim());
  return result;
}

export async function verifyTokenAction(token) {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Missing reset token." };
  }

  const result = await verifyResetToken(token.trim());
  return result;
}

export async function resetPasswordAction(token, password, confirmPassword) {
  if (!token || typeof token !== "string") {
    return { error: "Invalid or missing reset token." };
  }
  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }
  if (password.length > 128) {
    return { error: "Password cannot exceed 128 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const result = await resetPasswordWithToken(token.trim(), password);
  return result;
}
