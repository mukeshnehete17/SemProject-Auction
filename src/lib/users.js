import { prisma } from "@/lib/prisma";

export async function getUsers() {
  const rows = await prisma.user.findMany({
    include: { _count: { select: { bids: true, auctions: true } } },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.toLowerCase(),
    joinedDate: user.createdAt.toISOString().split("T")[0],
    status: "active",
    totalBids: user._count.bids,
    auctionsListed: user._count.auctions,
  }));
}

export async function getUserById(id) {
  const numericId = Number.parseInt(id, 10);
  if (Number.isNaN(numericId)) return null;

  try {
    const row = await prisma.user.findUnique({
      where: { id: numericId },
      include: { _count: { select: { bids: true, auctions: true } } },
    });
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role.toLowerCase(),
      joinedDate: row.createdAt.toISOString().split("T")[0],
      totalBids: row._count.bids,
      auctionsListed: row._count.auctions,
    };
  } catch {
    return null;
  }
}