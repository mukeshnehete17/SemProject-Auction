import { getAdminUser } from "@/lib/admin";
import { getAuditLogs, getSuspiciousBiddingFlags } from "@/lib/audit";
import AdminAuditLogsContent from "./AdminAuditLogsContent";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Audit Logs & Moderation — TORI Admin",
  description: "Immutable platform audit trail and algorithmic bidding flags for manual moderation.",
};

export default async function AdminAuditLogsPage() {
  await getAdminUser(); // Enforces strict server-side admin authorization

  const [logs, flags] = await Promise.all([
    getAuditLogs({ limit: 100 }),
    getSuspiciousBiddingFlags(),
  ]);

  return <AdminAuditLogsContent initialLogs={logs} flags={flags} />;
}
