import { prisma } from "@/lib/prisma";

export async function createNotification({
  userId,
  message,
  type = null,
  referenceId = null,
  dedupe = false,
}) {
  if (!userId) return null;

  if (dedupe && type && referenceId) {
    const existing = await prisma.notification.findFirst({
      where: { userId, type, referenceId },
    });
    if (existing) return existing;
  }

  return prisma.notification.create({
    data: {
      userId,
      message,
      type,
      referenceId,
    },
  });
}

function notificationHref(notification) {
  if (notification.referenceId) {
    return `/auctions/${notification.referenceId}`;
  }
  return "/dashboard";
}

export function toNotificationShape(notification) {
  return {
    id: notification.id,
    message: notification.message,
    type: notification.type,
    referenceId: notification.referenceId,
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
    href: notificationHref(notification),
  };
}

export async function getNotificationsByUser(userId) {
  try {
    const rows = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toNotificationShape);
  } catch {
    return [];
  }
}

export async function getRecentNotifications(userId, limit = 5) {
  try {
    const rows = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map(toNotificationShape);
  } catch {
    return [];
  }
}

export async function getUnreadNotificationCount(userId) {
  try {
    return await prisma.notification.count({
      where: { userId, isRead: false },
    });
  } catch {
    return 0;
  }
}

export async function markNotificationAsRead(userId, notificationId) {
  const numericId = Number.parseInt(notificationId, 10);
  if (Number.isNaN(numericId)) return false;
  try {
    const result = await prisma.notification.updateMany({
      where: { id: numericId, userId },
      data: { isRead: true },
    });
    return result.count > 0;
  } catch {
    return false;
  }
}

export async function markAllNotificationsAsRead(userId) {
  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return true;
  } catch {
    return false;
  }
}