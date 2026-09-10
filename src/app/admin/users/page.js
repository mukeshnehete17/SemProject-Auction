import AdminUsersContent from "./AdminUsersContent";
import { getAdminUser, getAdminUsers } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await getAdminUser();
  const users = await getAdminUsers({});

  return <AdminUsersContent users={users} currentAdminId={admin.id} />;
}