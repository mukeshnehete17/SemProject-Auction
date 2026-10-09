"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Persist the editable profile fields. Only name and email exist on the
 * User model — role, phone, location and bio sent by the client are
 * deliberately ignored so crafted requests can never escalate privilege
 * or write to columns that do not exist.
 */
export async function updateProfileAction({ name, email }) {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in to update your profile." };

  const cleanName = typeof name === "string" ? name.trim().slice(0, 100) : "";
  const cleanEmail =
    typeof email === "string" ? email.trim().toLowerCase().slice(0, 254) : "";

  if (!cleanName || cleanName.length < 2) {
    return { error: "Please enter your full name." };
  }
  if (!EMAIL_RE.test(cleanEmail)) {
    return { error: "Please enter a valid email address." };
  }

  if (cleanEmail !== user.email) {
    const taken = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true },
    });
    if (taken && taken.id !== user.id) {
      return { error: "An account with this email already exists." };
    }
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { name: cleanName, email: cleanEmail },
    });
  } catch (err) {
    if (err?.code === "P2002") {
      return { error: "An account with this email already exists." };
    }
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}
