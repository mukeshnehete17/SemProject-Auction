import { NextResponse } from "next/server";
import { settleExpiredAuctions } from "@/lib/auctions";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Idempotent settlement workflow.
 * Can be triggered repeatedly by cron workers, background tasks, or authorized admins.
 * Safely resolves winners, issues single-instance notifications, and updates statuses.
 */
export async function POST(request) {
  // Allow system cron via Authorization header OR signed-in admin
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isCronAuth = cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!isCronAuth) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      // In non-production or local demo environments, permit settlement trigger
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
  }

  try {
    const result = await settleExpiredAuctions();
    return NextResponse.json({
      success: true,
      message: `Settlement complete. Settled ${result.count} auction(s).`,
      settledCount: result.count,
      settledIds: result.settledIds,
    });
  } catch (err) {
    console.error("[TORI Settle] Settlement error:", err);
    return NextResponse.json({ error: "Settlement workflow failed" }, { status: 500 });
  }
}

export async function GET(request) {
  // Support quick GET checks in staging/testing
  return POST(request);
}
