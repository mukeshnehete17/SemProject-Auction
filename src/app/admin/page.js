import AdminOverviewContent from "./AdminOverviewContent";
import {
  getAdminUser,
  getAdminStats,
  getAdminAuctions,
  getAdminUsers,
} from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await getAdminUser();

  const [stats, recentAuctions, recentUsers] = await Promise.all([
    getAdminStats(),
    getAdminAuctions({}),
    getAdminUsers({}),
  ]);

  return (
    <AdminOverviewContent
      stats={stats}
      recentAuctions={recentAuctions.slice(0, 5)}
      recentUsers={recentUsers.slice(0, 5)}
    />
  );
}