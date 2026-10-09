"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function normalizeRole(accountType) {
  if (accountType === "seller") return "SELLER";
  if (accountType === "buyer") return "BUYER";
  return null;
}

export async function registerAction(name, email, password, accountType) {
  const fullName = name?.trim().slice(0, 100);
  const normalizedEmail = email?.trim().toLowerCase().slice(0, 254);
  const role = normalizeRole(accountType);

  if (!fullName || fullName.length < 2) {
    return { error: "Please enter your full name." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail || "")) {
    return { error: "Please enter a valid email address." };
  }
  if (!password || password.length < 6 || password.length > 128) {
    return { error: "Password must be between 6 and 128 characters." };
  }
  if (!role) {
    return { error: "Please select an account type." };
  }

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        name: fullName,
        email: normalizedEmail,
        password: hashedPassword,
        role,
      },
    });
  } catch (err) {
    // Race-safe: a concurrent registration for the same email hits the
    // unique constraint (P2002) — report it as a duplicate, not a crash.
    if (err?.code === "P2002") {
      return { error: "An account with this email already exists." };
    }
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/login?registered=1");
}