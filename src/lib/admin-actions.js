"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { deriveStatus } from "@/lib/auctions";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const ROLES = ["BUYER", "SELLER"];

export async function adminChangeRoleAction(userId, newRole) {
  const admin = await getCurrentUser();
  if (!admin) return { error: "Please sign in." };
  if (admin.role !== "ADMIN") {
    return { error: "You are not authorized to perform this action." };
  }

  const numericId = Number.parseInt(userId, 10);
  if (Number.isNaN(numericId)) return { error: "Invalid user." };

  if (!ROLES.includes(newRole)) return { error: "Invalid role." };

  if (numericId === admin.id) {
    return { error: "You cannot change your own role." };
  }

  const target = await prisma.user.findUnique({ where: { id: numericId } });
  if (!target) return { error: "User not found." };
  if (target.role === "ADMIN") {
    return { error: "Admin roles cannot be changed." };
  }

  try {
    await prisma.user.update({
      where: { id: numericId },
      data: { role: newRole },
    });
  } catch {
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true };
}

export async function adminCancelAuctionAction(auctionId) {
  const admin = await getCurrentUser();
  if (!admin) return { error: "Please sign in." };
  if (admin.role !== "ADMIN") {
    return { error: "You are not authorized to perform this action." };
  }

  const numericId = Number.parseInt(auctionId, 10);
  if (Number.isNaN(numericId)) return { error: "Auction not found." };

  let existing;
  try {
    existing = await prisma.auction.findUnique({
      where: { id: numericId },
      include: { _count: { select: { bids: true } } },
    });
  } catch {
    return { error: "Auction not found." };
  }
  if (!existing) return { error: "Auction not found." };

  const derived = deriveStatus(existing.status, existing.startTime, existing.endTime);
  const canCancel =
    derived === "upcoming" ||
    (derived === "active" && existing._count.bids === 0) ||
    (derived === "ending_soon" && existing._count.bids === 0);

  if (!canCancel) {
    return { error: "Upcoming auctions, or active auctions without bids, can be cancelled." };
  }

  try {
    await prisma.auction.update({
      where: { id: numericId },
      data: { status: "CANCELLED" },
    });
  } catch {
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/admin/auctions");
  revalidatePath("/admin");
  revalidatePath("/auctions");
  revalidatePath(`/auctions/${numericId}`);
  return { ok: true };
}

export async function adminAccessCheck() {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") redirect("/unauthorized");
  return { ok: true };
}