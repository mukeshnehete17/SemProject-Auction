"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { deriveStatus } from "@/lib/auctions";
import { normalizeBidAmount, validateBid, MAX_PRICE } from "@/lib/bids";
import { formatPrice } from "@/lib/utils";
import { broadcastAuctionUpdate } from "@/lib/auction-events";
import { sendOutbidEmail } from "@/lib/email";
import { createAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Module-private caps ("use server" modules may only export async actions).
const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_IMAGE_URL_LENGTH = 2048;

function toPositiveNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0 || n > MAX_PRICE) return null;
  // Whole rupees — avoids Float rounding drift in currency math.
  return Number.isInteger(n) ? n : null;
}

function parseDateTime(date, time) {
  if (!date || !time) return null;
  const d = new Date(`${date}T${time}:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeImage(image) {
  const value = image ? image.trim().slice(0, MAX_IMAGE_URL_LENGTH) : "";
  if (!value) return null;
  if (/^https?:\/\/\S+$/i.test(value) || value.startsWith("/")) return value;
  return null;
}

function normalizeImages(imagesInput, fallbackImage) {
  let list = [];
  if (Array.isArray(imagesInput)) {
    list = imagesInput;
  } else if (typeof imagesInput === "string" && imagesInput.trim()) {
    try {
      const parsed = JSON.parse(imagesInput);
      if (Array.isArray(parsed)) list = parsed;
      else list = [imagesInput];
    } catch {
      list = imagesInput.split(",").map((s) => s.trim());
    }
  }
  const valid = list.map(normalizeImage).filter(Boolean);
  if (valid.length === 0 && fallbackImage) {
    valid.push(fallbackImage);
  }
  return valid.length > 0 ? JSON.stringify(valid) : null;
}

function getEditableFields(data) {
  const title = typeof data.title === "string" ? data.title.trim().slice(0, MAX_TITLE_LENGTH) : "";
  const description = typeof data.description === "string" ? data.description.trim().slice(0, MAX_DESCRIPTION_LENGTH) : "";
  const startingPrice = toPositiveNumber(data.startingPrice);
  const minimumIncrement = toPositiveNumber(data.minimumIncrement);
  const startTime = parseDateTime(data.startDate, data.startTime);
  const endTime = parseDateTime(data.endDate, data.endTime);
  const fallbackImage = normalizeImage(data.imageUrl);
  const images = normalizeImages(data.images, fallbackImage);
  const image = images ? JSON.parse(images)[0] : fallbackImage;
  const categoryId = Number.parseInt(data.categoryId, 10);

  return { title, description, image, images, startingPrice, minimumIncrement, startTime, endTime, categoryId };
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
    const newAuction = await prisma.auction.create({
      data: {
        title,
        description,
        image,
        images,
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

    await createAuditLog({
      action: "AUCTION_CREATE",
      entityType: "Auction",
      entityId: newAuction.id,
      actorId: user.id,
      metadata: { title, startingPrice, categoryId: category.id },
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
        images,
        startingPrice,
        currentPrice: startingPrice,
        minimumIncrement,
        startTime,
        endTime,
        status,
        categoryId: category.id,
      },
    });

    await createAuditLog({
      action: "AUCTION_UPDATE",
      entityType: "Auction",
      entityId: numericId,
      actorId: user.id,
      metadata: { title, startingPrice },
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

    await createAuditLog({
      action: "AUCTION_CANCEL",
      entityType: "Auction",
      entityId: numericId,
      actorId: user.id,
      metadata: { title: existing.title },
    });

    broadcastAuctionUpdate(numericId, {
      type: "AUCTION_CANCELLED",
      auctionId: numericId,
      status: "cancelled",
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

  const bidAmount = normalizeBidAmount(amount);
  if (bidAmount === null) {
    return { error: "Please enter a valid whole-rupee bid amount." };
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

      const policyError = validateBid({
        auction,
        userId: user.id,
        userRole: user.role,
        amount: bidAmount,
      });
      if (policyError) return { error: policyError };

      // Concurrency check: query the true, committed highest bid inside this transaction.
      // If two concurrent requests started with the same stale auction.currentPrice,
      // the second transaction to execute will see the newly committed highest bid here.
      const previousTop = await tx.bid.findFirst({
        where: { auctionId: numericId },
        orderBy: { amount: "desc" },
        include: { bidder: { select: { id: true, name: true, email: true } } },
      });

      const effectiveCurrentPrice = previousTop ? previousTop.amount : auction.currentPrice;
      const minimumRequired = effectiveCurrentPrice + auction.minimumIncrement;

      if (bidAmount < minimumRequired) {
        return {
          error: `A competing bid of ${formatPrice(effectiveCurrentPrice)} was just accepted. Your bid must be at least ${formatPrice(minimumRequired)}.`,
          code: "OUTDATED_BID",
        };
      }

      // Safe creation of the winning bid
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

      // Record immutable audit log inside the same transaction
      await tx.auditLog.create({
        data: {
          action: "BID_PLACED",
          entityType: "Auction",
          entityId: numericId,
          actorId: user.id,
          metadata: JSON.stringify({ amount: bidAmount, bidId: bid.id }),
        },
      });

      // Notify outbid user
      if (previousTop && previousTop.bidderId !== user.id) {
        await tx.notification.create({
          data: {
            userId: previousTop.bidderId,
            message: `You have been outbid on "${auction.title}". The new highest bid is ${formatPrice(bidAmount)}.`,
            type: "OUTBID",
            referenceId: numericId,
          },
        });
      }

      return {
        ok: true,
        amount: bidAmount,
        bidId: bid.id,
        auctionTitle: auction.title,
        outbidUser: previousTop && previousTop.bidderId !== user.id ? previousTop.bidder : null,
      };
    });

    if (result.error) return result;

    // Asynchronously dispatch outbid email (non-blocking)
    if (result.outbidUser?.email) {
      sendOutbidEmail({
        to: result.outbidUser.email,
        userName: result.outbidUser.name,
        auctionTitle: result.auctionTitle,
        auctionId: numericId,
        newHighestBid: result.amount,
      }).catch((err) => console.error("[TORI Email] Error sending outbid email:", err));
    }

    // Broadcast live update to all SSE subscribers
    const totalBids = await prisma.bid.count({ where: { auctionId: numericId } });
    broadcastAuctionUpdate(numericId, {
      type: "NEW_BID",
      auctionId: numericId,
      currentPrice: result.amount,
      numberOfBids: totalBids,
      newBid: {
        id: result.bidId,
        amount: result.amount,
        bidder: user.name || "Bidder",
        time: new Date().toISOString(),
      },
    });

    revalidatePath(`/auctions/${numericId}`);
    revalidatePath("/auctions");
    revalidatePath("/dashboard/my-bids");
    revalidatePath("/dashboard");
    return { ok: true, amount: result.amount, bidId: result.bidId };
  } catch (err) {
    console.error("[TORI Auction] Error placing bid:", err);
    return { error: "Something went wrong. Please try again." };
  }
}