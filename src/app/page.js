import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuctionCard from "@/components/auction/AuctionCard";
import CategoryCard from "@/components/auction/CategoryCard";
import Button from "@/components/ui/Button";
import HeroAuction from "@/components/auction/HeroAuction";
import { deriveStatus } from "@/lib/auctions";
import { prisma } from "@/lib/prisma";
import {
  Search,
  ArrowRight,
  Gavel,
  Clock,
  Trophy,
  TrendingUp,
  Users,
  Package,
} from "lucide-react";

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
  Fashion: "Shirt",
  Collectibles: "Gem",
};

async function getCategoryCounts() {
  try {
    const counts = await prisma.category.findMany({
      select: { name: true, slug: true, _count: { select: { auctions: true } } },
    });
    return counts.map((c) => ({
      name: c.name,
      icon: iconMap[c.name] || "Smartphone",
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

const steps = [
  { icon: Search, title: "Find an Auction", description: "Browse hundreds of live auctions across multiple categories." },
  { icon: Gavel, title: "Place Your Bid", description: "Set your bid and compete with other bidders in real time." },
  { icon: Clock, title: "Watch & Wait", description: "Track your bids as the auction counts down to the final moment." },
  { icon: Trophy, title: "Win the Item", description: "If you are the highest bidder when time runs out, you win!" },
];

export default async function HomePage() {
  const [featuredAuctions, heroAuction, categories, stats] = await Promise.all([
    getFeaturedAuctions(),
    getHeroAuction(),
    getCategoryCounts(),
    getStats(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="bg-[#0f172a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-center">
            <div className="space-y-5 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-gray-300 font-medium">Live auctions happening now</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold leading-[1.1] tracking-tight">
                Bid. Compete.<br />Win.
              </h1>
              <p className="text-base text-gray-400 max-w-md leading-relaxed">
                Discover unique products, place competitive bids, and win auctions
                before time runs out.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button href="/auctions" variant="primary" size="lg">
                  Explore Auctions
                </Button>
                <Button
                  href="/register"
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Start Selling
                </Button>
              </div>
              <div className="flex items-center gap-5 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Package className="h-3.5 w-3.5" />
                  <span>{stats.auctionCount} Auctions</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Gavel className="h-3.5 w-3.5" />
                  <span>{stats.bidCount} Bids</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Users className="h-3.5 w-3.5" />
                  <span>{stats.userCount} Users</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block w-[380px]">
              {heroAuction ? (
                <HeroAuction auction={heroAuction} />
              ) : (
                <div className="bg-white/5 backdrop-blur rounded-xl p-6 w-[340px] text-center text-gray-500">
                  <Gavel className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No live auctions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Auctions</h2>
              <p className="mt-1 text-sm text-gray-500">Don&apos;t miss out on these hot auctions</p>
            </div>
            <Button href="/auctions" variant="ghost" size="sm" className="text-indigo-600 hidden sm:flex">
              View All Auctions
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredAuctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
          <div className="text-center mt-8 sm:hidden">
            <Button href="/auctions" variant="primary" size="md">
              View All Auctions
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Browse Categories</h2>
            <p className="mt-1 text-sm text-gray-500">Find exactly what you&apos;re looking for</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.name} category={category} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">How TORI Works</h2>
            <p className="mt-1 text-sm text-gray-500">Simple steps to start winning auctions</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center relative">
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-7 left-[60%] w-[80%] border-t-2 border-dashed border-gray-200" />
                  )}
                  <div className="relative z-10 h-14 w-14 rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{step.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-[200px] mx-auto">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-14 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: "Registered Users", value: stats.userCount, icon: Users },
              { label: "Active Auctions", value: stats.auctionCount, icon: Package },
              { label: "Bids Placed", value: stats.bidCount, icon: TrendingUp },
              { label: "Auctions Completed", value: stats.endedCount, icon: Trophy },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="flex justify-center mb-2">
                    <Icon className="h-6 w-6 text-indigo-300" />
                  </div>
                  <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                  <p className="mt-1 text-xs text-indigo-200 font-medium">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Ready to place your first bid?
          </h2>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            Join thousands of users who are already winning auctions on TORI.
          </p>
          <div className="mt-6">
            <Button href="/auctions" variant="primary" size="lg">
              Explore Auctions
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
