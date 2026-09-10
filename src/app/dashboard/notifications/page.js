import { getCurrentUser } from "@/lib/session";
import { getNotificationsByUser } from "@/lib/notifications";
import NotificationsContent from "./NotificationsContent";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  const notifications = user ? await getNotificationsByUser(user.id) : [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationsContent
      notifications={notifications}
      unreadCount={unreadCount}
    />
  );
}