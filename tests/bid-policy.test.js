import { describe, it, expect } from "vitest";
import {
  normalizeBidAmount,
  validateBid,
  MAX_PRICE,
} from "@/lib/bids.js";
import { deriveStatus, getAuctionSortOrder } from "@/lib/auctions.js";

function openAuction(overrides = {}) {
  const now = Date.now();
  return {
    id: 1,
    status: "ACTIVE",
    startTime: new Date(now - 3600_000),
    endTime: new Date(now + 3600_000),
    sellerId: 10,
    currentPrice: 5000,
    minimumIncrement: 500,
    ...overrides,
  };
}

describe("normalizeBidAmount", () => {
  it("accepts whole-rupee integers", () => {
    expect(normalizeBidAmount(5500)).toBe(5500);
    expect(normalizeBidAmount("5500")).toBe(5500);
  });
  it("rejects zero, negative, NaN and unbounded values", () => {
    expect(normalizeBidAmount(0)).toBeNull();
    expect(normalizeBidAmount(-100)).toBeNull();
    expect(normalizeBidAmount("abc")).toBeNull();
    expect(normalizeBidAmount(MAX_PRICE + 1)).toBeNull();
  });
  it("rejects fractional amounts to avoid Float rounding drift", () => {
    expect(normalizeBidAmount(5500.5)).toBeNull();
  });
});

describe("validateBid policy", () => {
  it("accepts a bid at exactly currentPrice + increment", () => {
    expect(
      validateBid({ auction: openAuction(), userId: 20, userRole: "BUYER", amount: 5500 })
    ).toBeNull();
  });
  it("rejects missing/cancelled auctions", () => {
    expect(validateBid({ auction: null, userId: 20, userRole: "BUYER", amount: 5500 })).toBe(
      "Auction not found."
    );
    expect(
      validateBid({
        auction: openAuction({ status: "CANCELLED" }),
        userId: 20,
        userRole: "BUYER",
        amount: 5500,
      })
    ).toBe("This auction has been cancelled.");
  });
  it("rejects upcoming and ended auctions (server is authoritative)", () => {
    const now = Date.now();
    expect(
      validateBid({
        auction: openAuction({
          startTime: new Date(now + 3600_000),
          endTime: new Date(now + 7200_000),
        }),
        userId: 20,
        userRole: "BUYER",
        amount: 5500,
      })
    ).toBe("This auction hasn't started yet.");
    expect(
      validateBid({
        auction: openAuction({
          startTime: new Date(now - 7200_000),
          endTime: new Date(now - 1000),
        }),
        userId: 20,
        userRole: "BUYER",
        amount: 5500,
      })
    ).toBe("This auction has already ended.");
  });
  it("rejects seller self-bidding and admin bidding", () => {
    expect(
      validateBid({ auction: openAuction(), userId: 10, userRole: "SELLER", amount: 5500 })
    ).toBe("You cannot bid on your own auction.");
    expect(
      validateBid({ auction: openAuction(), userId: 99, userRole: "ADMIN", amount: 5500 })
    ).toBe("Admins cannot place bids.");
  });
  it("enforces starting price + minimum increment", () => {
    const err = validateBid({
      auction: openAuction(),
      userId: 20,
      userRole: "BUYER",
      amount: 5499,
    });
    expect(err).toMatch(/must be at least/);
  });
});

describe("deriveStatus", () => {
  it("derives cancelled/upcoming/active/ending_soon/ended from server time", () => {
    const now = Date.now();
    expect(deriveStatus("CANCELLED", new Date(now - 1), new Date(now + 1))).toBe("cancelled");
    expect(
      deriveStatus("ACTIVE", new Date(now + 3600_000), new Date(now + 7200_000))
    ).toBe("upcoming");
    expect(
      deriveStatus("ACTIVE", new Date(now - 7200_000), new Date(now - 1000))
    ).toBe("ended");
    expect(
      deriveStatus("ACTIVE", new Date(now - 3600_000), new Date(now + 30 * 60_000))
    ).toBe("ending_soon");
    expect(
      deriveStatus("ACTIVE", new Date(now - 3600_000), new Date(now + 48 * 3600_000))
    ).toBe("active");
  });
  it("falls back to a safe default sort for arbitrary user input", () => {
    expect(getAuctionSortOrder("ending_soon")).toEqual([{ endTime: "asc" }]);
    expect(getAuctionSortOrder("price_low")).toEqual([{ currentPrice: "asc" }]);
    expect(getAuctionSortOrder("'; DROP TABLE Auction; --")).toEqual([{ endTime: "asc" }]);
  });
});
