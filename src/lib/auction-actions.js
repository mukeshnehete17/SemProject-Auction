"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { deriveStatus } from "@/lib/auctions";
import { formatPrice } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function toPositiveNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseDateTime(date, time) {
  if (!date || !time) return null;
  const d = new Date(`${date}T${time}:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeImage(image) {
  const value = image ? image.trim() : "";
  if (!value) return null;
  if (/^https?:\/\/\S+$/i.test(value) || value.startsWith("/")) return value;
  return null;
}

function getEditableFields(data) {
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const description = typeof data.description === "string" ? data.description.trim() : "";
  const startingPrice = toPositiveNumber(data.startingPrice);
  const minimumIncrement = toPositiveNumber(data.minimumIncrement);
  const startTime = parseDateTime(data.startDate, data.startTime);
  const endTime = parseDateTime(data.endDate, data.endTime);
  const image = normalizeImage(data.imageUrl);
  const categoryId = Number.parseInt(data.categoryId, 10);

  return { title, description, image, startingPrice, minimumIncrement, startTime, endTime, categoryId };
}

export async function createAuctionAction(data) {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in to create an auction." };
  if (user.role !== "SELLER" && user.role !== "ADMIN") {
    return { error: "Only sellers can create auctions." };
  }

  const { title, description, image, startingPrice, minimumIncrement, startTime, endTime, categoryId } =
    getEditableFields(data);

  if (!title || title.length < 3) {
    return { error: "Product name must be at least 3 characters." };
  }
  if (!description || description.length < 20) {
    return { error: "Description must be at least 20 characters." };
  }
  if (Number.isNaN(categoryId)) {
    return { error: "Please select a valid category." };
  }
  if (
    startingPrice === null ||
    startingPrice === undefined ||
    startingPrice <= 0
  ) {
    return { error: "Starting price must be greater than 0." };
  }
  if (minimumIncrement === null || minimumIncrement <= 0) {
    return { error: "Minimum bid increment must be greater than 0." };
  }
  if (!startTime || !endTime) {
    return { error: "Start and end date/time are required." };
  }
  if (endTime <= startTime) {
    return { error: "End date/time must be after start date/time." };
  }
  if (endTime <= new Date()) {
    return { error: "End time must be in the future." };
  }
  if (image === null && data.imageUrl) {
    return { error: "Please enter a valid image URL." };
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return { error: "Please select a valid category." };
  }

  try {
    const status = startTime > new Date() ? "UPCOMING" : "ACTIVE";
    await prisma.auction.create({
      data: {
        title,
        description,
        image,
        startingPrice,
        currentPrice: startingPrice,
        minimumIncrement,
        startTime,
        endTime,
        status,
        sellerId: user.id,
        categoryId: category.id,
      },
    });
  } catch {
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/auctions");
  redirect("/dashboard/my-auctions?created=1");
}

export async function updateAuctionAction(id, data) {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in to edit this auction." };

  const numericId = Number.parseInt(id, 10);
  if (Number.isNaN(numericId)) return { error: "Auction not found." };

  const existing = await prisma.auction.findUnique({ where: { id: numericId } });
  if (!existing) return { error: "Auction not found." };
  if (existing.sellerId !== user.id) {
    return { error: "Only the auction owner can edit this auction." };
  }

  const derived = deriveStatus(existing.status, existing.startTime, existing.endTime);
  if (derived !== "upcoming") {
    return { error: "This auction can only be edited while it is upcoming and has no bids." };
  }
  const bidCount = await prisma.bid.count({ where: { auctionId: numericId } });
  if (bidCount > 0) {
    return { error: "Auctions that already have bids cannot be edited." };
  }

  const { title, description, image, startingPrice, minimumIncrement, startTime, endTime, categoryId } =
    getEditableFields(data);

  if (!title || title.length < 3) {
    return { error: "Product name must be at least 3 characters." };
  }
  if (!description || description.length < 20) {
    return { error: "Description must be at least 20 characters." };
  }
  if (Number.isNaN(categoryId)) {
    return { error: "Please select a valid category." };
  }
  if (startingPrice === null || startingPrice <= 0) {
    return { error: "Starting price must be greater than 0." };
  }
  if (minimumIncrement === null || minimumIncrement <= 0) {
    return { error: "Minimum bid increment must be greater than 0." };
  }
  if (!startTime || !endTime) {
    return { error: "Start and end date/time are required." };
  }
  if (endTime <= startTime) {
    return { error: "End date/time must be after start date/time." };
  }
  if (endTime <= new Date()) {
    return { error: "End time must be in the future." };
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return { error: "Please select a valid category." };
  }

  try {
    const status = startTime > new Date() ? "UPCOMING" : "ACTIVE";
    await prisma.auction.update({
      where: { id: numericId },
      data: {
        title,
        description,
        image,
        startingPrice,
        currentPrice: startingPrice,
        minimumIncrement,
        startTime,
        endTime,
        status,
        categoryId: category.id,
      },
    });
  } catch {
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/auctions");
  revalidatePath(`/auctions/${numericId}`);
  redirect("/dashboard/my-auctions?updated=1");
}

export async function cancelAuctionAction(id) {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in to cancel this auction." };

  const numericId = Number.parseInt(id, 10);
  if (Number.isNaN(numericId)) return { error: "Auction not found." };

  const existing = await prisma.auction.findUnique({
    where: { id: numericId },
    include: { _count: { select: { bids: true } } },
  });
  if (!existing) return { error: "Auction not found." };
  if (existing.sellerId !== user.id) {
    return { error: "Only the auction owner can cancel this auction." };
  }

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

  revalidatePath("/dashboard/my-auctions");
  revalidatePath("/auctions");
  revalidatePath(`/auctions/${numericId}`);
  return { ok: true };
}

export async function placeBidAction(auctionId, amount) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Please sign in to place a bid.", code: "UNAUTHENTICATED" };
  }
  if (user.role === "ADMIN") {
    return { error: "Admins cannot place bids." };
  }

  const bidAmount = Number(amount);
  if (!Number.isFinite(bidAmount) || bidAmount <= 0) {
    return { error: "Please enter a valid bid amount." };
  }

  const numericId = Number.parseInt(auctionId, 10);
  if (Number.isNaN(numericId)) {
    return { error: "Auction not found." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({
        where: { id: numericId },
      });
      if (!auction) return { error: "Auction not found." };

      if (auction.status === "CANCELLED") {
        return { error: "This auction has been cancelled." };
      }

      const now = new Date();
      if (now < auction.startTime) {
        return { error: "This auction hasn't started yet." };
      }
      if (now >= auction.endTime) {
        return { error: "This auction has already ended." };
      }

      if (auction.sellerId === user.id) {
        return { error: "You cannot bid on your own auction." };
      }

      const minimumBid = auction.currentPrice + auction.minimumIncrement;
      if (bidAmount < minimumBid) {
        return {
          error: `Your bid must be at least ${formatPrice(minimumBid)}.`,
        };
      }

      const previousTop = await tx.bid.findFirst({
        where: { auctionId: numericId },
        orderBy: { amount: "desc" },
        select: { bidderId: true },
      });

      const bid = await tx.bid.create({
        data: {
          amount: bidAmount,
          auctionId: numericId,
          bidderId: user.id,
        },
      });

      await tx.auction.update({
        where: { id: numericId },
        data: { currentPrice: bidAmount },
      });

      if (previousTop && previousTop.bidderId !== user.id) {
        await tx.notification.create({
          data: {
            userId: previousTop.bidderId,
            message: `You have been outbid on "${auction.title}".`,
            type: "OUTBID",
            referenceId: numericId,
          },
        });
      }

      return { ok: true, amount: bidAmount, bidId: bid.id };
    });

    if (result.error) return result;

    revalidatePath(`/auctions/${numericId}`);
    revalidatePath("/auctions");
    revalidatePath("/dashboard/my-bids");
    revalidatePath("/dashboard");
    return result;
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}