import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import HomeHero from "@/components/home/HomeHero";
import HomeFeatured from "@/components/home/HomeFeatured";
import HomeCategories from "@/components/home/HomeCategories";
import HomeHowItWorks from "@/components/home/HomeHowItWorks";
import HomeStats from "@/components/home/HomeStats";
import HomeCta from "@/components/home/HomeCta";
import { deriveStatus } from "@/lib/auctions";
import { prisma } from "@/lib/prisma";

async function getFeaturedAuctions() {
  try {
    const auctions = await prisma.auction.findMany({
      where: { status: { not: "CANCELLED" } },
      include: {
        category: { select: { name: true } },
        seller: { select: { name: true } },
        _count: { select: { bids: true } },
      },
      orderBy: [{ status: "asc" }, { endTime: "asc" }],
      take: 8,
    });
    return auctions.map((a) => ({
      id: a.id,
      title: a.title,
      image: a.image,
      category: a.category?.name || "Other",
      seller: { name: a.seller?.name || "Unknown" },
      currentBid: a.currentPrice,
      startingPrice: a.startingPrice,
      bidCount: a._count.bids,
      status: deriveStatus(a.status, a.startTime, a.endTime),
      startTime: a.startTime.toISOString(),
      endTime: a.endTime.toISOString(),
    }));
  } catch {
    return [];
  }
}

async function getHeroAuction() {
  try {
    const auction = await prisma.auction.findFirst({
      where: { status: { not: "CANCELLED" }, bids: { some: {} } },
      include: {
        category: { select: { name: true } },
        seller: { select: { name: true } },
        _count: { select: { bids: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    if (!auction) return null;
    return {
      id: auction.id,
      title: auction.title,
      image: auction.image,
      category: auction.category?.name || "Other",
      seller: auction.seller?.name || "Unknown",
      currentBid: auction.currentPrice,
      startingPrice: auction.startingPrice,
      bidCount: auction._count.bids,
      status: deriveStatus(auction.status, auction.startTime, auction.endTime),
      startTime: auction.startTime.toISOString(),
      endTime: auction.endTime.toISOString(),
    };
  } catch {
    return null;
  }
}

const iconMap = {
  Electronics: "Smartphone",
  Computers: "Laptop",
  Cameras: "Camera",
  Gaming: "Gamepad2",
  Watches: "Watch",
  Sneakers: "Footprints",
  Collectibles: "Gem",
  "Art & Design": "Palette",
  Fashion: "Shirt",
};

async function getCategoryCounts() {
  try {
    const counts = await prisma.category.findMany({
      where: { slug: { not: "fashion" } },
      select: { name: true, slug: true, _count: { select: { auctions: true } } },
      orderBy: { name: "asc" },
    });
    return counts.map((c) => ({
      name: c.name,
      slug: c.slug,
      icon: iconMap[c.name] || "Smartphone",
      image: `/images/categories/${c.slug}.jpg`,
      count: c._count.auctions,
    }));
  } catch {
    return [];
  }
}

async function getStats() {
  try {
    const [userCount, auctionCount, bidCount, endedCount] = await Promise.all([
      prisma.user.count(),
      prisma.auction.count({ where: { status: { not: "CANCELLED" } } }),
      prisma.bid.count(),
      prisma.auction.count({ where: { status: "ENDED" } }),
    ]);
    return { userCount, auctionCount, bidCount, endedCount };
  } catch {
    return { userCount: 0, auctionCount: 0, bidCount: 0, endedCount: 0 };
  }
}

export default async function HomePage() {
  const [featuredAuctions, heroAuction, categories, stats] = await Promise.all([
    getFeaturedAuctions(),
    getHeroAuction(),
    getCategoryCounts(),
    getStats(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      {/* Unified Full-Viewport Dark Hero Region with Top Announcement & Floating Glass Navbar */}
      <div className="bg-zinc-950 text-white relative min-h-screen flex flex-col justify-between">
        <div>
          <AnnouncementBar />
          <Navbar />
        </div>
        <HomeHero heroAuction={heroAuction} stats={stats} />
      </div>

      {/* Featured Auctions with Staggered Scroll Entrance */}
      <HomeFeatured auctions={featuredAuctions} />

      {/* Categories Grid with Staggered Scroll Entrance */}
      <HomeCategories categories={categories} />

      {/* How It Works Editorial Section with Protocol Reveal */}
      <HomeHowItWorks />

      {/* Platform Real-Time Stats with Telemetry Reveal */}
      <HomeStats stats={stats} />

      {/* Closing Editorial Call-To-Action */}
      <HomeCta />

      <Footer />
    </div>
  );
}
