import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import {
  getRecentNotifications,
  getUnreadNotificationCount,
} from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ count: 0, recent: [] });
  }
  const [count, recent] = await Promise.all([
    getUnreadNotificationCount(user.id),
    getRecentNotifications(user.id, 5),
  ]);
  return NextResponse.json({ count, recent });
}