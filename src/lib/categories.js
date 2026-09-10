import { prisma } from "@/lib/prisma";

export async function getCategories() {
  const rows = await prisma.category.findMany({
    include: { _count: { select: { auctions: true } } },
    orderBy: { name: "asc" },
  });
  return rows.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    count: category._count.auctions,
  }));
}