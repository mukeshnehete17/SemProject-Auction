const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const bcrypt = require("bcryptjs");
require("dotenv/config");

const dbPath = (process.env.DATABASE_URL || "file:./prisma/dev.db")
  .replace("file:", "")
  .replace(".\\", "./");

const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

const SEED_PASSWORD = "BidZone@123";

const USER_SEEDS = [
  { name: "BidZone Admin", email: "admin@bidzone.local", role: "ADMIN" },
  { name: "Demo Seller", email: "seller@bidzone.local", role: "SELLER" },
  { name: "Demo Buyer", email: "buyer@bidzone.local", role: "BUYER" },
  { name: "Vikram Singh", email: "admin@bidzone.com", role: "ADMIN" },
  { name: "Amit Kumar", email: "amit.seller@bidzone.com", role: "SELLER" },
  { name: "Sneha Reddy", email: "sneha.seller@bidzone.com", role: "SELLER" },
  { name: "Arjun Mehta", email: "arjun.seller@bidzone.com", role: "SELLER" },
  { name: "Krishna Patel", email: "krishna.buyer@bidzone.com", role: "BUYER" },
  { name: "Priya Sharma", email: "priya.buyer@bidzone.com", role: "BUYER" },
  { name: "Rahul Verma", email: "rahul.buyer@bidzone.com", role: "BUYER" },
];

const CATEGORY_SEEDS = [
  { name: "Electronics", slug: "electronics" },
  { name: "Computers", slug: "computers" },
  { name: "Cameras", slug: "cameras" },
  { name: "Gaming", slug: "gaming" },
  { name: "Fashion", slug: "fashion" },
  { name: "Collectibles", slug: "collectibles" },
];

async function ensureUsers() {
  const hash = await bcrypt.hash(SEED_PASSWORD, 10);
  const userByEmail = {};
  for (const seed of USER_SEEDS) {
    const user = await prisma.user.upsert({
      where: { email: seed.email },
      update: { name: seed.name, role: seed.role, password: hash },
      create: { ...seed, password: hash },
    });
    userByEmail[seed.email] = user;
  }
  return userByEmail;
}

async function ensureCategories() {
  const categoryBySlug = {};
  for (const seed of CATEGORY_SEEDS) {
    const category = await prisma.category.upsert({
      where: { slug: seed.slug },
      update: { name: seed.name },
      create: seed,
    });
    categoryBySlug[seed.slug] = category;
  }
  return categoryBySlug;
}

async function seedAuctionData(userByEmail, categoryBySlug) {
  const now = new Date();
  const future = new Date(now.getTime() + 60 * 60 * 24 * 1000 * 5);
  const past = new Date(now.getTime() - 60 * 60 * 24 * 1000 * 5);

  const {
    amit: amit,
    sneha: sneha,
    arjun: arjun,
    krishna: krishna,
    priya: priya,
    rahul: rahul,
  } = {
    amit: userByEmail["amit.seller@bidzone.com"],
    sneha: userByEmail["sneha.seller@bidzone.com"],
    arjun: userByEmail["arjun.seller@bidzone.com"],
    krishna: userByEmail["krishna.buyer@bidzone.com"],
    priya: userByEmail["priya.buyer@bidzone.com"],
    rahul: userByEmail["rahul.buyer@bidzone.com"],
  };

  const {
    electronics: electronics,
    computers: computers,
    cameras: cameras,
    gaming: gaming,
    fashion: fashion,
    collectibles: collectibles,
  } = {
    electronics: categoryBySlug["electronics"],
    computers: categoryBySlug["computers"],
    cameras: categoryBySlug["cameras"],
    gaming: categoryBySlug["gaming"],
    fashion: categoryBySlug["fashion"],
    collectibles: categoryBySlug["collectibles"],
  };

  await Promise.all([
    prisma.auction.create({
      data: {
        title: "MacBook Air M2",
        description: "Brand new Apple MacBook Air with M2 chip, 8GB RAM, 256GB SSD. Perfect for students and professionals.",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop",
        startingPrice: 65000,
        currentPrice: 72500,
        minimumIncrement: 1000,
        startTime: past,
        endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
        sellerId: amit.id,
        categoryId: computers.id,
        bids: {
          create: [
            { amount: 66500, bidderId: rahul.id, createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
            { amount: 68000, bidderId: priya.id, createdAt: new Date(now.getTime() - 60 * 60 * 1000) },
            { amount: 69500, bidderId: krishna.id, createdAt: new Date(now.getTime() - 25 * 60 * 1000) },
            { amount: 71000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 8 * 60 * 1000) },
            { amount: 72500, bidderId: amit.id, createdAt: new Date(now.getTime() - 2 * 60 * 1000) },
          ],
        },
      },
    }),
    prisma.auction.create({
      data: {
        title: "iPhone 15 Pro Max",
        description: "Apple iPhone 15 Pro Max 256GB in Natural Titanium. Unlocked, with all accessories and warranty intact.",
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=400&fit=crop",
        startingPrice: 85000,
        currentPrice: 98500,
        minimumIncrement: 1500,
        startTime: past,
        endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
        sellerId: sneha.id,
        categoryId: electronics.id,
        bids: {
          create: [
            { amount: 90000, bidderId: priya.id, createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000) },
            { amount: 92500, bidderId: rahul.id, createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
            { amount: 95000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 40 * 60 * 1000) },
            { amount: 97000, bidderId: priya.id, createdAt: new Date(now.getTime() - 15 * 60 * 1000) },
            { amount: 98500, bidderId: rahul.id, createdAt: new Date(now.getTime() - 5 * 60 * 1000) },
          ],
        },
      },
    }),
    prisma.auction.create({
      data: {
        title: "Sony WH-1000XM5",
        description: "Sony industry-leading noise cancelling headphones with exceptional sound quality and 30-hour battery life.",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop",
        startingPrice: 18000,
        currentPrice: 22500,
        minimumIncrement: 500,
        startTime: past,
        endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
        sellerId: sneha.id,
        categoryId: electronics.id,
        bids: {
          create: [
            { amount: 19000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000) },
            { amount: 20000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
            { amount: 21000, bidderId: priya.id, createdAt: new Date(now.getTime() - 60 * 60 * 1000) },
            { amount: 22000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 30 * 60 * 1000) },
            { amount: 22500, bidderId: rahul.id, createdAt: new Date(now.getTime() - 10 * 60 * 1000) },
          ],
        },
      },
    }),
    prisma.auction.create({
      data: {
        title: 'Canon EOS R50 Camera',
        description: "Canon EOS R50 mirrorless camera with 18-45mm lens kit. 24.2MP APS-C sensor with 4K video recording.",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop",
        startingPrice: 42000,
        currentPrice: 48500,
        minimumIncrement: 1000,
        startTime: past,
        endTime: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
        sellerId: arjun.id,
        categoryId: cameras.id,
        bids: {
          create: [
            { amount: 43000, bidderId: priya.id, createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000) },
            { amount: 44000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000) },
            { amount: 45500, bidderId: rahul.id, createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
            { amount: 47000, bidderId: priya.id, createdAt: new Date(now.getTime() - 60 * 60 * 1000) },
            { amount: 48500, bidderId: krishna.id, createdAt: new Date(now.getTime() - 20 * 60 * 1000) },
          ],
        },
      },
    }),
    prisma.auction.create({
      data: {
        title: "PlayStation 5",
        description: "Sony PlayStation 5 Disc Edition with one DualSense controller. Includes 3 months of PS Plus subscription.",
        image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=400&fit=crop",
        startingPrice: 38000,
        currentPrice: 46500,
        minimumIncrement: 1000,
        startTime: past,
        endTime: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
        sellerId: amit.id,
        categoryId: gaming.id,
        bids: {
          create: [
            { amount: 40000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000) },
            { amount: 42000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 90 * 60 * 1000) },
            { amount: 43500, bidderId: priya.id, createdAt: new Date(now.getTime() - 35 * 60 * 1000) },
            { amount: 45000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 12 * 60 * 1000) },
            { amount: 46500, bidderId: krishna.id, createdAt: new Date(now.getTime() - 3 * 60 * 1000) },
          ],
        },
      },
    }),
    prisma.auction.create({
      data: {
        title: "Custom Mechanical Keyboard",
        description: "Custom-built mechanical keyboard with Gateron Yellow switches, PBT keycaps, and RGB backlighting. Hot-swappable.",
        image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600&h=400&fit=crop",
        startingPrice: 8500,
        currentPrice: 12000,
        minimumIncrement: 500,
        startTime: past,
        endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
        sellerId: arjun.id,
        categoryId: electronics.id,
        bids: {
          create: [
            { amount: 9500, bidderId: priya.id, createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000) },
            { amount: 10000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000) },
            { amount: 11000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 60 * 60 * 1000) },
            { amount: 11500, bidderId: priya.id, createdAt: new Date(now.getTime() - 45 * 60 * 1000) },
            { amount: 12000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 15 * 60 * 1000) },
          ],
        },
      },
    }),
    prisma.auction.create({
      data: {
        title: "Samsung Galaxy S24 Ultra",
        description: "Samsung Galaxy S24 Ultra 512GB in Titanium Black. S Pen included, with Samsung Care+ warranty.",
        image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=400&fit=crop",
        startingPrice: 72000,
        currentPrice: 81000,
        minimumIncrement: 1500,
        startTime: past,
        endTime: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
        sellerId: amit.id,
        categoryId: electronics.id,
        bids: {
          create: [
            { amount: 74000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000) },
            { amount: 76000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000) },
            { amount: 78000, bidderId: priya.id, createdAt: new Date(now.getTime() - 60 * 60 * 1000) },
            { amount: 79500, bidderId: krishna.id, createdAt: new Date(now.getTime() - 25 * 60 * 1000) },
            { amount: 81000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 8 * 60 * 1000) },
          ],
        },
      },
    }),
    prisma.auction.create({
      data: {
        title: "Vintage Rolex Watch",
        description: "Vintage Rolex Datejust 36mm from 1985. Gold and steel combination, recently serviced with papers.",
        image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&h=400&fit=crop",
        startingPrice: 150000,
        currentPrice: 185000,
        minimumIncrement: 5000,
        startTime: past,
        endTime: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
        sellerId: arjun.id,
        categoryId: collectibles.id,
        bids: {
          create: [
            { amount: 160000, bidderId: priya.id, createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000) },
            { amount: 170000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000) },
            { amount: 175000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000) },
            { amount: 180000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
            { amount: 185000, bidderId: priya.id, createdAt: new Date(now.getTime() - 30 * 60 * 1000) },
          ],
        },
      },
    }),
    prisma.auction.create({
      data: {
        title: "iPad Air M1",
        description: "Apple iPad Air M1 with 64GB storage, Wi-Fi model in Space Grey. Includes Apple Pencil 2nd gen.",
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop",
        startingPrice: 42000,
        currentPrice: 47000,
        minimumIncrement: 1000,
        startTime: past,
        endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
        sellerId: sneha.id,
        categoryId: computers.id,
        bids: {
          create: [
            { amount: 43000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 14 * 60 * 60 * 1000) },
            { amount: 44000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 10 * 60 * 60 * 1000) },
            { amount: 45000, bidderId: priya.id, createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000) },
            { amount: 46000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000) },
            { amount: 47000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 60 * 60 * 1000) },
          ],
        },
      },
    }),
    prisma.auction.create({
      data: {
        title: "Xbox Series X",
        description: "Microsoft Xbox Series X 1TB console with two wireless controllers. Includes 3 Game Pass Ultimate months.",
        image: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600&h=400&fit=crop",
        startingPrice: 35000,
        currentPrice: 41000,
        minimumIncrement: 1000,
        startTime: past,
        endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        status: "ACTIVE",
        sellerId: amit.id,
        categoryId: gaming.id,
        bids: {
          create: [
            { amount: 36000, bidderId: priya.id, createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000) },
            { amount: 37500, bidderId: krishna.id, createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000) },
            { amount: 39000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 90 * 60 * 1000) },
            { amount: 40000, bidderId: priya.id, createdAt: new Date(now.getTime() - 40 * 60 * 1000) },
            { amount: 41000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 12 * 60 * 1000) },
          ],
        },
      },
    }),
    prisma.auction.create({
      data: {
        title: "GoPro Hero 12",
        description: "GoPro Hero 12 Black action camera with waterproof housing. 5.3K video, HyperSmooth 6.0 stabilization.",
        image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=400&fit=crop",
        startingPrice: 28000,
        currentPrice: 0,
        minimumIncrement: 1000,
        startTime: future,
        endTime: new Date(future.getTime() + 5 * 24 * 60 * 60 * 1000),
        status: "UPCOMING",
        sellerId: sneha.id,
        categoryId: cameras.id,
        bids: { create: [] },
      },
    }),
    prisma.auction.create({
      data: {
        title: "Rare Pokemon Cards Collection",
        description: "Collection of 50 rare Pokemon cards including holographic Charizard, Blastoise, and Pikachu. Mint condition.",
        image: "https://images.unsplash.com/photo-1611374243147-44a792e6f468?w=600&h=400&fit=crop",
        startingPrice: 25000,
        currentPrice: 0,
        minimumIncrement: 1000,
        startTime: future,
        endTime: new Date(future.getTime() + 10 * 24 * 60 * 60 * 1000),
        status: "UPCOMING",
        sellerId: arjun.id,
        categoryId: collectibles.id,
        bids: { create: [] },
      },
    }),
    prisma.auction.create({
      data: {
        title: "Nike Air Jordan 1",
        description: "Nike Air Jordan 1 Retro High OG in Chicago colorway. Size 10 UK, brand new with original box.",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop",
        startingPrice: 12000,
        currentPrice: 16500,
        minimumIncrement: 500,
        startTime: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        endTime: past,
        status: "ENDED",
        sellerId: sneha.id,
        categoryId: fashion.id,
        bids: {
          create: [
            { amount: 13000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000) },
            { amount: 14000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
            { amount: 15000, bidderId: priya.id, createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
            { amount: 16000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 20 * 60 * 60 * 1000) },
            { amount: 16500, bidderId: krishna.id, createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000) },
          ],
        },
      },
    }),
    prisma.auction.create({
      data: {
        title: 'Dell 27" Monitor',
        description: "Dell S2722QC 27-inch 4K UHD monitor with USB-C connectivity. Perfect for work from home setup.",
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=400&fit=crop",
        startingPrice: 18500,
        currentPrice: 21000,
        minimumIncrement: 500,
        startTime: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        endTime: past,
        status: "ENDED",
        sellerId: amit.id,
        categoryId: computers.id,
        bids: {
          create: [
            { amount: 19000, bidderId: priya.id, createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
            { amount: 19500, bidderId: rahul.id, createdAt: new Date(now.getTime() - 60 * 60 * 1000) },
            { amount: 20000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 30 * 60 * 1000) },
            { amount: 20500, bidderId: priya.id, createdAt: new Date(now.getTime() - 15 * 60 * 1000) },
            { amount: 21000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 3 * 60 * 1000) },
          ],
        },
      },
    }),
    prisma.auction.create({
      data: {
        title: "Adidas Ultraboost",
        description: "Adidas Ultraboost 22 running shoes in Core Black. Size 10 UK, brand new with tags attached.",
        image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=400&fit=crop",
        startingPrice: 8000,
        currentPrice: 10500,
        minimumIncrement: 500,
        startTime: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        endTime: past,
        status: "ENDED",
        sellerId: sneha.id,
        categoryId: fashion.id,
        bids: {
          create: [
            { amount: 8500, bidderId: krishna.id, createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
            { amount: 9000, bidderId: priya.id, createdAt: new Date(now.getTime() - 90 * 60 * 1000) },
            { amount: 9500, bidderId: rahul.id, createdAt: new Date(now.getTime() - 45 * 60 * 1000) },
            { amount: 10000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 18 * 60 * 1000) },
            { amount: 10500, bidderId: priya.id, createdAt: new Date(now.getTime() - 5 * 60 * 1000) },
          ],
        },
      },
    }),
  ]);

  await prisma.notification.createMany({
    data: [
      { userId: krishna.id, message: "You placed a bid on MacBook Air M2", isRead: false },
      { userId: krishna.id, message: "You have been outbid on iPhone 15 Pro Max", isRead: false },
      { userId: rahul.id, message: "Your auction listing went live!", isRead: true },
    ],
  });
}

async function seedDemoSellerAuctions(userByEmail, categoryBySlug) {
  const seller = userByEmail["seller@bidzone.local"];
  const buyer = userByEmail["buyer@bidzone.local"];
  if (!seller || !buyer) return;

  const existing = await prisma.auction.count({ where: { sellerId: seller.id } });
  if (existing > 0) return;

  const now = new Date();
  const electronics = categoryBySlug["electronics"];
  const gaming = categoryBySlug["gaming"];

  await prisma.auction.create({
    data: {
      title: "Logitech MX Master 3S Wireless Mouse",
      description:
        "The Logitech MX Master 3S wireless mouse with 8,000 DPI sensor, quiet clicks, and MagSpeed electromagnetic scrolling. In flawless condition with original packaging.",
      image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=400&fit=crop",
      startingPrice: 4000,
      currentPrice: 6000,
      minimumIncrement: 500,
      startTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      status: "ACTIVE",
      sellerId: seller.id,
      categoryId: electronics.id,
      bids: {
        create: [
          { amount: 4500, bidderId: buyer.id, createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
          { amount: 5000, bidderId: buyer.id, createdAt: new Date(now.getTime() - 60 * 60 * 1000) },
          { amount: 5500, bidderId: buyer.id, createdAt: new Date(now.getTime() - 30 * 60 * 1000) },
          { amount: 6000, bidderId: buyer.id, createdAt: new Date(now.getTime() - 5 * 60 * 1000) },
        ],
      },
    },
  });

  const upcomingStart = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  await prisma.auction.create({
    data: {
      title: "SteelSeries Arctis Nova Pro Wireless Headset",
      description:
        "SteelSeries Arctis Nova Pro wireless gaming headset with lossless 2.4GHz, Bluetooth, and simultaneous audio mixing. Includes dual batteries and ANC.",
      image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=400&fit=crop",
      startingPrice: 15000,
      currentPrice: 15000,
      minimumIncrement: 500,
      startTime: upcomingStart,
      endTime: new Date(upcomingStart.getTime() + 5 * 24 * 60 * 60 * 1000),
      status: "UPCOMING",
      sellerId: seller.id,
      categoryId: gaming.id,
      bids: { create: [] },
    },
  });

  console.log("Seeded demo seller auctions.");
}

async function seedPhase5Data(userByEmail, categoryBySlug) {
  const seller = userByEmail["seller@bidzone.local"];
  const buyer = userByEmail["buyer@bidzone.local"];
  const rahul = userByEmail["rahul.buyer@bidzone.com"];
  if (!seller || !buyer) return;

  const now = new Date();
  const electronics = categoryBySlug["electronics"];
  const gaming = categoryBySlug["gaming"];

  async function ensureAuction({ title, categoryId, ...rest }) {
    const existing = await prisma.auction.findFirst({
      where: { title, sellerId: seller.id },
    });
    if (existing) return existing;
    return prisma.auction.create({
      data: { title, sellerId: seller.id, categoryId, ...rest },
    });
  }

  const wonAuction = await ensureAuction({
    title: "Apple AirPods Pro 2",
    description:
      "Apple AirPods Pro 2 with Adaptive ANC, USB-C charging case, and four sizes of silicone tips. Brand new, sealed in original packaging.",
    image: "https://images.unsplash.com/photo-1487058716971-5d5192523bfe?w=600&h=400&fit=crop",
    startingPrice: 17000,
    currentPrice: 19500,
    minimumIncrement: 500,
    startTime: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    endTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    status: "ENDED",
    categoryId: electronics.id,
    bids: {
      create: [
        { amount: 18000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000) },
        { amount: 19000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 60 * 60 * 1000) },
        { amount: 19500, bidderId: buyer.id, createdAt: new Date(now.getTime() - 30 * 60 * 1000) },
      ],
    },
  });

  const noBidsAuction = await ensureAuction({
    title: "Bose QuietComfort Ultra Headphones",
    description:
      "Bose QuietComfort Ultra wireless headphones with world-class noise cancellation and immersive spatial audio. Like new condition.",
    image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=400&fit=crop",
    startingPrice: 28000,
    currentPrice: 28000,
    minimumIncrement: 1000,
    startTime: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
    endTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    status: "ENDED",
    categoryId: electronics.id,
    bids: { create: [] },
  });

  async function ensureWatchlist(userId, auctionId) {
    await prisma.watchlist.upsert({
      where: { userId_auctionId: { userId, auctionId } },
      update: {},
      create: { userId, auctionId },
    });
  }

  const logitech = await prisma.auction.findFirst({
    where: { title: "Logitech MX Master 3S Wireless Mouse", sellerId: seller.id },
    select: { id: true },
  });

  const activeAuction = await prisma.auction.findFirst({
    where: { title: "Sony WH-1000XM5" },
    select: { id: true },
  });

  if (logitech) await ensureWatchlist(buyer.id, logitech.id);
  if (activeAuction) await ensureWatchlist(buyer.id, activeAuction.id);

  async function ensureNotification({ userId, message, type = null, referenceId = null, isRead = false }) {
    const existing = await prisma.notification.findFirst({ where: { userId, message } });
    if (existing) return;
    await prisma.notification.create({ data: { userId, message, type, referenceId, isRead } });
  }

  await ensureNotification({
    userId: buyer.id,
    message: "Welcome to TORI! Explore auctions, bid, and track what you win.",
    type: null,
  });
  await ensureNotification({
    userId: buyer.id,
    message: "You added a listing to your watchlist.",
    type: null,
    isRead: true,
  });
  await ensureNotification({
    userId: seller.id,
    message: `Your auction "${noBidsAuction.title}" has ended with no bids.`,
    type: "AUCTION_ENDED",
    referenceId: noBidsAuction.id,
    isRead: false,
  });

  const cancelledAuction = await ensureAuction({
    title: 'LG C3 65" OLED TV',
    description:
      'Premium 65-inch OLED smart TV with 4K resolution, Dolby Vision, and webOS. Originally purchased in 2024. Cancelled due to seller no longer available.',
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=400&fit=crop",
    startingPrice: 85000,
    currentPrice: 0,
    minimumIncrement: 2000,
    startTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    status: "CANCELLED",
    categoryId: electronics.id,
    bids: { create: [] },
  });

  console.log(
    `Phase 5 demo: ended-with-winner #${wonAuction.id}, ended-without-bids #${noBidsAuction.id}, cancelled #${cancelledAuction.id}.`
  );
}

async function main() {
  const userByEmail = await ensureUsers();
  const categoryBySlug = await ensureCategories();

  const existingAuctionCount = await prisma.auction.count();
  if (existingAuctionCount === 0) {
    await seedAuctionData(userByEmail, categoryBySlug);
    console.log("Seeded fresh auction/bid data.");
  } else {
    console.log(`Found ${existingAuctionCount} existing auctions — skipped auction/bid seeding to preserve data.`);
  }

  await seedDemoSellerAuctions(userByEmail, categoryBySlug);

  await seedPhase5Data(userByEmail, categoryBySlug);

  const auctionCount = await prisma.auction.count();
  const bidCount = await prisma.bid.count();
  const userCount = await prisma.user.count();
  const categoryCount = await prisma.category.count();
  const endedCount = await prisma.auction.count({ where: { status: "ENDED" } });
  const cancelledCount = await prisma.auction.count({ where: { status: "CANCELLED" } });
  const watchlistCount = await prisma.watchlist.count();
  const notificationCount = await prisma.notification.count();

  console.log("Seed complete:");
  console.log(`  Users: ${userCount}`);
  console.log(`  Categories: ${categoryCount}`);
  console.log(`  Auctions: ${auctionCount} (${endedCount} ended, ${cancelledCount} cancelled)`);
  console.log(`  Bids: ${bidCount}`);
  console.log(`  Watchlists: ${watchlistCount}`);
  console.log(`  Notifications: ${notificationCount}`);
  console.log("");
  console.log("Demo accounts (password: BidZone@123):");
  console.log(`  Admin:  admin@bidzone.local`);
  console.log(`  Seller: seller@bidzone.local`);
  console.log(`  Buyer:  buyer@bidzone.local`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });