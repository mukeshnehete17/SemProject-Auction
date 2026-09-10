"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/notifications";

export async function markNotificationReadAction(notificationId) {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in." };

  await markNotificationAsRead(user.id, notificationId);
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function markAllNotificationsReadAction() {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in." };

  await markAllNotificationsAsRead(user.id);
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard");
  return { ok: true };
}