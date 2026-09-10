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
  const fullName = name?.trim();
  const normalizedEmail = email?.trim().toLowerCase();
  const role = normalizeRole(accountType);

  if (!fullName || fullName.length < 2) {
    return { error: "Please enter your full name." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail || "")) {
    return { error: "Please enter a valid email address." };
  }
  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters." };
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
  } catch {
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/login?registered=1");
}