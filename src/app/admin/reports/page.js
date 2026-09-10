import AdminReportsContent from "./AdminReportsContent";
import { getAdminUser, getAdminReports } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  await getAdminUser();
  const reports = await getAdminReports();

  return <AdminReportsContent reports={reports} />;
}