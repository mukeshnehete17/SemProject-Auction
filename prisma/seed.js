const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const bcrypt = require("bcryptjs");
const { isProductionSeedBlocked } = require("../scripts/seed-guard.cjs");
require("dotenv/config");

const path = require("path");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

const rawUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";

let pgPool = null;

function createPrisma() {
  if (/^(postgres(ql)?):\/\//i.test(rawUrl)) {
    pgPool = new Pool({ connectionString: rawUrl });
    return new PrismaClient({ adapter: new PrismaPg(pgPool) });
  }
  const cleanPath = rawUrl.replace(/^file:/, "").replace(".\\", "./");
  const absolutePath = path.isAbsolute(cleanPath)
    ? cleanPath
    : path.resolve(process.cwd(), cleanPath);
  const adapter = new PrismaBetterSqlite3({ url: absolutePath });
  return new PrismaClient({ adapter });
}

const prisma = createPrisma();

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
  { name: "Watches", slug: "watches" },
  { name: "Gaming", slug: "gaming" },
  { name: "Cameras", slug: "cameras" },
  { name: "Sneakers", slug: "sneakers" },
  { name: "Collectibles", slug: "collectibles" },
  { name: "Art & Design", slug: "art-design" },
  // Keep Fashion alias for backwards compatibility
  { name: "Fashion", slug: "fashion" },
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

// 20 distinct fictional demo auctions with real local product photography files
function getDemoAuctionDefinitions(users, categories) {
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const hourMs = 60 * 60 * 1000;

  const { amit, sneha, arjun, seller, krishna, priya, rahul, buyer } = {
    amit: users["amit.seller@bidzone.com"],
    sneha: users["sneha.seller@bidzone.com"],
    arjun: users["arjun.seller@bidzone.com"],
    seller: users["seller@bidzone.local"],
    krishna: users["krishna.buyer@bidzone.com"],
    priya: users["priya.buyer@bidzone.com"],
    rahul: users["rahul.buyer@bidzone.com"],
    buyer: users["buyer@bidzone.local"],
  };

  return [
    // 1. Ultrabook Laptop
    {
      title: "ApexBook Ultra 16 OLED",
      description: "Precision-milled aerospace magnesium chassis featuring a 16-inch 4K OLED HDR display, 64GB unified memory, and 2TB NVMe PCIe Gen 4 storage. Studio-grade dual fans with liquid-metal thermal architecture.",
      image: "/images/products/ultrabook_laptop.jpg",
      startingPrice: 115000,
      currentPrice: 132000,
      minimumIncrement: 2000,
      startTime: new Date(now.getTime() - 2 * dayMs),
      endTime: new Date(now.getTime() + 4 * dayMs),
      status: "ACTIVE",
      sellerId: amit.id,
      categoryId: categories["computers"].id,
      bids: [
        { amount: 118000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 36 * hourMs) },
        { amount: 122000, bidderId: priya.id, createdAt: new Date(now.getTime() - 24 * hourMs) },
        { amount: 126000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 12 * hourMs) },
        { amount: 130000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 4 * hourMs) },
        { amount: 132000, bidderId: buyer.id, createdAt: new Date(now.getTime() - 30 * 60 * 1000) },
      ],
    },
    // 2. Flagship Smartphone
    {
      title: "Aether Phone Pro Max 512GB",
      description: "Flagship smartphone forged with an aerospace titanium frame, periscope optical zoom 10x lens, ceramic shield front glass, and 120Hz LTPO ProMotion AMOLED panel with satellite SOS capability.",
      image: "/images/products/flagship_smartphone.jpg",
      startingPrice: 89000,
      currentPrice: 104000,
      minimumIncrement: 1500,
      startTime: new Date(now.getTime() - 3 * dayMs),
      endTime: new Date(now.getTime() + 3 * dayMs),
      status: "ACTIVE",
      sellerId: sneha.id,
      categoryId: categories["electronics"].id,
      bids: [
        { amount: 92000, bidderId: priya.id, createdAt: new Date(now.getTime() - 40 * hourMs) },
        { amount: 95000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 20 * hourMs) },
        { amount: 98000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 10 * hourMs) },
        { amount: 101000, bidderId: priya.id, createdAt: new Date(now.getTime() - 3 * hourMs) },
        { amount: 104000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 15 * 60 * 1000) },
      ],
    },
    // 3. Luxury Diver Watch
    {
      title: "Vanguard DeepSea Chronometer 300M",
      description: "Luxury Swiss automatic chronometer with helium escape valve, ceramic unidirectional bezel, sapphire crystal caseback, and 70-hour power reserve. Water resistant to 300 meters.",
      image: "/images/products/luxury_diver_watch.jpg",
      startingPrice: 240000,
      currentPrice: 285000,
      minimumIncrement: 5000,
      startTime: new Date(now.getTime() - 4 * dayMs),
      endTime: new Date(now.getTime() + 6 * dayMs),
      status: "ACTIVE",
      sellerId: arjun.id,
      categoryId: categories["watches"].id,
      bids: [
        { amount: 250000, bidderId: priya.id, createdAt: new Date(now.getTime() - 60 * hourMs) },
        { amount: 260000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 30 * hourMs) },
        { amount: 270000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 12 * hourMs) },
        { amount: 280000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 2 * hourMs) },
        { amount: 285000, bidderId: priya.id, createdAt: new Date(now.getTime() - 20 * 60 * 1000) },
      ],
    },
    // 4. Gaming Console
    {
      title: "NovaStation X Pro Console & Dual Controllers",
      description: "Next-generation gaming console with custom 8-core Zen 3 CPU, 12 TFLOPS RDNA graphics, 2TB custom SSD, and two wireless haptic-feedback controllers with studio charging dock.",
      image: "/images/products/gaming_console.jpg",
      startingPrice: 42000,
      currentPrice: 51000,
      minimumIncrement: 1000,
      startTime: new Date(now.getTime() - 1 * dayMs),
      endTime: new Date(now.getTime() + 2 * dayMs),
      status: "ACTIVE",
      sellerId: amit.id,
      categoryId: categories["gaming"].id,
      bids: [
        { amount: 44000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 18 * hourMs) },
        { amount: 46000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 10 * hourMs) },
        { amount: 48000, bidderId: priya.id, createdAt: new Date(now.getTime() - 4 * hourMs) },
        { amount: 50000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 1 * hourMs) },
        { amount: 51000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 10 * 60 * 1000) },
      ],
    },
    // 5. Mirrorless Camera
    {
      title: "Lumix Pro 50mm F/1.2 Mirrorless Studio Kit",
      description: "Professional full-frame mirrorless camera with 45MP BSI CMOS sensor, 8K 60fps ProRes internal recording, 5-axis in-body stabilization, and f/1.2 prime lens with weatherproof sealing.",
      image: "/images/products/mirrorless_camera.jpg",
      startingPrice: 125000,
      currentPrice: 148000,
      minimumIncrement: 2500,
      startTime: new Date(now.getTime() - 3 * dayMs),
      endTime: new Date(now.getTime() + 5 * dayMs),
      status: "ACTIVE",
      sellerId: arjun.id,
      categoryId: categories["cameras"].id,
      bids: [
        { amount: 130000, bidderId: priya.id, createdAt: new Date(now.getTime() - 48 * hourMs) },
        { amount: 135000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 24 * hourMs) },
        { amount: 140000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 8 * hourMs) },
        { amount: 145000, bidderId: priya.id, createdAt: new Date(now.getTime() - 2 * hourMs) },
        { amount: 148000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 45 * 60 * 1000) },
      ],
    },
    // 6. Collectible Sneakers
    {
      title: "Air Heritage 'Chicago 85' Collector Edition",
      description: "Iconic red-white-black collectible high-top basketball sneakers in unworn vault condition with original box, authenticated numbered card, and spare wax laces. Size UK 10.",
      image: "/images/products/collectible_sneakers.jpg",
      startingPrice: 28000,
      currentPrice: 39500,
      minimumIncrement: 1000,
      startTime: new Date(now.getTime() - 2 * dayMs),
      endTime: new Date(now.getTime() + 1 * dayMs),
      status: "ACTIVE",
      sellerId: sneha.id,
      categoryId: categories["sneakers"].id,
      bids: [
        { amount: 30000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 30 * hourMs) },
        { amount: 33000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 16 * hourMs) },
        { amount: 36000, bidderId: priya.id, createdAt: new Date(now.getTime() - 6 * hourMs) },
        { amount: 38000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 90 * 60 * 1000) },
        { amount: 39500, bidderId: krishna.id, createdAt: new Date(now.getTime() - 15 * 60 * 1000) },
      ],
    },
    // 7. Graphics Card
    {
      title: "RTX Titan Foundry Extreme 24GB GPU",
      description: "Triple-fan flagship graphics card engineered with 24GB GDDR6X memory, vapor chamber cooling, full metal backplate, and 4th Gen ray-tracing Tensor cores. Never used for mining.",
      image: "/images/products/graphics_card.jpg",
      startingPrice: 145000,
      currentPrice: 172000,
      minimumIncrement: 3000,
      startTime: new Date(now.getTime() - 4 * dayMs),
      endTime: new Date(now.getTime() + 7 * dayMs),
      status: "ACTIVE",
      sellerId: amit.id,
      categoryId: categories["computers"].id,
      bids: [
        { amount: 150000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 50 * hourMs) },
        { amount: 158000, bidderId: priya.id, createdAt: new Date(now.getTime() - 28 * hourMs) },
        { amount: 164000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 12 * hourMs) },
        { amount: 169000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 3 * hourMs) },
        { amount: 172000, bidderId: priya.id, createdAt: new Date(now.getTime() - 35 * 60 * 1000) },
      ],
    },
    // 8. Sci-Fi Collectible Spaceship
    {
      title: "Starship Voyager Studio Scale Model",
      description: "Hand-painted heavy resin scale replica of the deep-space exploration vessel with illuminated fiber-optic nacelles, magnetic display stand, and numbered certificate of authenticity.",
      image: "/images/products/scifi_spaceship.jpg",
      startingPrice: 65000,
      currentPrice: 78000,
      minimumIncrement: 1500,
      startTime: new Date(now.getTime() - 2 * dayMs),
      endTime: new Date(now.getTime() + 5 * dayMs),
      status: "ACTIVE",
      sellerId: arjun.id,
      categoryId: categories["collectibles"].id,
      bids: [
        { amount: 68000, bidderId: priya.id, createdAt: new Date(now.getTime() - 36 * hourMs) },
        { amount: 71000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 20 * hourMs) },
        { amount: 74000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 8 * hourMs) },
        { amount: 76500, bidderId: priya.id, createdAt: new Date(now.getTime() - 2 * hourMs) },
        { amount: 78000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 25 * 60 * 1000) },
      ],
    },
    // 9. Premium Wireless Headphones
    {
      title: "Symphony Master Acoustic ANC Headphones",
      description: "Audiophile wireless over-ear headphones featuring 40mm custom beryllium drivers, lossless LDAC codec support, active noise cancellation, and memory foam lambskin pads.",
      image: "/images/products/wireless_headphones.jpg",
      startingPrice: 29000,
      currentPrice: 34500,
      minimumIncrement: 1000,
      startTime: new Date(now.getTime() - 3 * dayMs),
      endTime: new Date(now.getTime() + 3 * dayMs),
      status: "ACTIVE",
      sellerId: sneha.id,
      categoryId: categories["electronics"].id,
      bids: [
        { amount: 30500, bidderId: krishna.id, createdAt: new Date(now.getTime() - 40 * hourMs) },
        { amount: 32000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 20 * hourMs) },
        { amount: 33500, bidderId: priya.id, createdAt: new Date(now.getTime() - 6 * hourMs) },
        { amount: 34500, bidderId: buyer.id, createdAt: new Date(now.getTime() - 50 * 60 * 1000) },
      ],
    },
    // 10. Mechanical Gaming Keyboard
    {
      title: "KeyForge Custom CNC Brass Mechanical Keyboard",
      description: "Gasket-mounted mechanical keyboard machined from solid anodized aluminum and polished brass weight, hand-lubed linear switches, and custom doubleshot PBT keycaps.",
      image: "/images/products/mechanical_keyboard.jpg",
      startingPrice: 19500,
      currentPrice: 26000,
      minimumIncrement: 500,
      startTime: new Date(now.getTime() - 2 * dayMs),
      endTime: new Date(now.getTime() + 4 * dayMs),
      status: "ACTIVE",
      sellerId: arjun.id,
      categoryId: categories["computers"].id,
      bids: [
        { amount: 21000, bidderId: priya.id, createdAt: new Date(now.getTime() - 30 * hourMs) },
        { amount: 22500, bidderId: rahul.id, createdAt: new Date(now.getTime() - 15 * hourMs) },
        { amount: 24000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 5 * hourMs) },
        { amount: 25000, bidderId: priya.id, createdAt: new Date(now.getTime() - 1 * hourMs) },
        { amount: 26000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 12 * 60 * 1000) },
      ],
    },
    // 11. Designer Lounge Chair
    {
      title: "Eames Style Sculptural Walnut Lounge Chair",
      description: "Mid-century modern lounge chair and ottoman hand-crafted with seven-ply molded walnut veneer, top-grain Italian black leather, and die-cast aluminum swivel base.",
      image: "/images/products/designer_lounge_chair.jpg",
      startingPrice: 85000,
      currentPrice: 105000,
      minimumIncrement: 2500,
      startTime: new Date(now.getTime() - 5 * dayMs),
      endTime: new Date(now.getTime() + 6 * dayMs),
      status: "ACTIVE",
      sellerId: seller.id,
      categoryId: categories["art-design"].id,
      bids: [
        { amount: 90000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 72 * hourMs) },
        { amount: 95000, bidderId: priya.id, createdAt: new Date(now.getTime() - 40 * hourMs) },
        { amount: 100000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 18 * hourMs) },
        { amount: 102500, bidderId: krishna.id, createdAt: new Date(now.getTime() - 4 * hourMs) },
        { amount: 105000, bidderId: buyer.id, createdAt: new Date(now.getTime() - 40 * 60 * 1000) },
      ],
    },
    // 12. Abstract Collectible Sculpture
    {
      title: "Brutalist Bronze Monolith Sculpture",
      description: "Original cast-bronze geometric sculpture finished with a hand-rubbed acid patina, mounted on an ebony granite pedestal. Edition 3 of 10 with gallery authentication documentation.",
      image: "/images/products/abstract_sculpture.jpg",
      startingPrice: 75000,
      currentPrice: 92000,
      minimumIncrement: 2000,
      startTime: new Date(now.getTime() - 3 * dayMs),
      endTime: new Date(now.getTime() + 8 * dayMs),
      status: "ACTIVE",
      sellerId: arjun.id,
      categoryId: categories["art-design"].id,
      bids: [
        { amount: 79000, bidderId: priya.id, createdAt: new Date(now.getTime() - 45 * hourMs) },
        { amount: 84000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 25 * hourMs) },
        { amount: 88000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 10 * hourMs) },
        { amount: 92000, bidderId: priya.id, createdAt: new Date(now.getTime() - 1 * hourMs) },
      ],
    },
    // 13. Premium Smartwatch
    {
      title: "ChronoTrack Titanium Smartwatch Ultra",
      description: "Grade 5 titanium smartwatch with dual-frequency GPS, sapphire glass, 100m water resistance, ECG/SpO2 biometric array, and 7-day endurance battery with magnetic fast charging.",
      image: "/images/products/premium_smartwatch.jpg",
      startingPrice: 38000,
      currentPrice: 46000,
      minimumIncrement: 1000,
      startTime: new Date(now.getTime() - 2 * dayMs),
      endTime: new Date(now.getTime() + 3 * dayMs),
      status: "ACTIVE",
      sellerId: sneha.id,
      categoryId: categories["watches"].id,
      bids: [
        { amount: 40000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 32 * hourMs) },
        { amount: 42000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 16 * hourMs) },
        { amount: 44000, bidderId: priya.id, createdAt: new Date(now.getTime() - 5 * hourMs) },
        { amount: 46000, bidderId: buyer.id, createdAt: new Date(now.getTime() - 30 * 60 * 1000) },
      ],
    },
    // 14. Gaming Mouse
    {
      title: "CyberGrip Ultralight Wireless Gaming Mouse",
      description: "49-gram magnesium alloy honeycomb mouse with 30,000 DPI optical sensor, 8000Hz polling rate, optical micro-switches, and zero-latency 2.4GHz wireless receiver.",
      image: "/images/products/gaming_mouse.jpg",
      startingPrice: 7500,
      currentPrice: 9500,
      minimumIncrement: 500,
      startTime: new Date(now.getTime() - 1 * dayMs),
      endTime: new Date(now.getTime() + 2 * dayMs),
      status: "ACTIVE",
      sellerId: amit.id,
      categoryId: categories["gaming"].id,
      bids: [
        { amount: 8000, bidderId: krishna.id, createdAt: new Date(now.getTime() - 16 * hourMs) },
        { amount: 8500, bidderId: rahul.id, createdAt: new Date(now.getTime() - 8 * hourMs) },
        { amount: 9000, bidderId: priya.id, createdAt: new Date(now.getTime() - 2 * hourMs) },
        { amount: 9500, bidderId: krishna.id, createdAt: new Date(now.getTime() - 15 * 60 * 1000) },
      ],
    },
    // 15. Studio Microphone
    {
      title: "Aura Pro Studio Condenser Microphone",
      description: "Large-diaphragm cardioid condenser microphone with discrete Class-A JFET electronics, gold-sputtered capsule, shock mount, and heavy brass pop filter.",
      image: "/images/products/studio_microphone.jpg",
      startingPrice: 22000,
      currentPrice: 27500,
      minimumIncrement: 500,
      startTime: new Date(now.getTime() - 3 * dayMs),
      endTime: new Date(now.getTime() + 5 * dayMs),
      status: "ACTIVE",
      sellerId: seller.id,
      categoryId: categories["electronics"].id,
      bids: [
        { amount: 23500, bidderId: rahul.id, createdAt: new Date(now.getTime() - 40 * hourMs) },
        { amount: 25000, bidderId: priya.id, createdAt: new Date(now.getTime() - 20 * hourMs) },
        { amount: 26500, bidderId: krishna.id, createdAt: new Date(now.getTime() - 6 * hourMs) },
        { amount: 27500, bidderId: buyer.id, createdAt: new Date(now.getTime() - 45 * 60 * 1000) },
      ],
    },
    // 16. Retro Handheld Gaming Device (UPCOMING)
    {
      title: "PocketRetro OLED Handheld Console",
      description: "CNC aluminum shell retro handheld with a 4.95-inch OLED display, Hall-effect analog joysticks, microswitch D-pad, and quad-core processor preloaded with custom Linux OS.",
      image: "/images/products/retro_handheld.jpg",
      startingPrice: 14000,
      currentPrice: 14000,
      minimumIncrement: 500,
      startTime: new Date(now.getTime() + 1 * dayMs),
      endTime: new Date(now.getTime() + 6 * dayMs),
      status: "UPCOMING",
      sellerId: amit.id,
      categoryId: categories["gaming"].id,
      bids: [],
    },
    // 17. Limited-Edition Art Print (UPCOMING)
    {
      title: "Neon Geometry Limited Edition Archival Print",
      description: "Museum-grade giclée print on 310gsm Hahnemühle cotton rag paper. Hand-signed and numbered 12/50 by the artist with certificate of authenticity and custom walnut frame.",
      image: "/images/products/art_print.jpg",
      startingPrice: 16000,
      currentPrice: 16000,
      minimumIncrement: 500,
      startTime: new Date(now.getTime() + 2 * dayMs),
      endTime: new Date(now.getTime() + 7 * dayMs),
      status: "UPCOMING",
      sellerId: arjun.id,
      categoryId: categories["art-design"].id,
      bids: [],
    },
    // 18. Premium Backpack (UPCOMING)
    {
      title: "Vanguard Tactical Cordura Commuter Backpack",
      description: "Weatherproof 30L technical backpack constructed from 1000D Cordura ballistic nylon, Fidlock magnetic buckles, YKK AquaGuard zippers, and padded 16-inch laptop compartment.",
      image: "/images/products/premium_backpack.jpg",
      startingPrice: 11000,
      currentPrice: 11000,
      minimumIncrement: 500,
      startTime: new Date(now.getTime() + 1 * dayMs),
      endTime: new Date(now.getTime() + 5 * dayMs),
      status: "UPCOMING",
      sellerId: sneha.id,
      categoryId: categories["collectibles"].id,
      bids: [],
    },
    // 19. Modern Desk Lamp (ENDED)
    {
      title: "Minimalist Brass Architectural Desk Lamp",
      description: "Counter-balanced solid brushed brass desk lamp with high-CRI 98 warm LED diffuser, stepless touch dimmer, and solid Nero Marquina marble base.",
      image: "/images/products/modern_desk_lamp.jpg",
      startingPrice: 18500,
      currentPrice: 24000,
      minimumIncrement: 500,
      startTime: new Date(now.getTime() - 10 * dayMs),
      endTime: new Date(now.getTime() - 1 * dayMs),
      status: "ENDED",
      sellerId: seller.id,
      categoryId: categories["art-design"].id,
      bids: [
        { amount: 19500, bidderId: krishna.id, createdAt: new Date(now.getTime() - 8 * dayMs) },
        { amount: 21000, bidderId: priya.id, createdAt: new Date(now.getTime() - 5 * dayMs) },
        { amount: 22500, bidderId: rahul.id, createdAt: new Date(now.getTime() - 3 * dayMs) },
        { amount: 24000, bidderId: buyer.id, createdAt: new Date(now.getTime() - 36 * hourMs) },
      ],
    },
    // 20. Collectible Model Car (ENDED)
    {
      title: "Le Mans 1966 GT40 1:18 Diecast Masterpiece",
      description: "Precision diecast replica with over 350 individual components, opening doors, detailed engine bay with wiring, real rubber Goodyear tires, and display case.",
      image: "/images/products/model_car.jpg",
      startingPrice: 21000,
      currentPrice: 31500,
      minimumIncrement: 1000,
      startTime: new Date(now.getTime() - 12 * dayMs),
      endTime: new Date(now.getTime() - 2 * dayMs),
      status: "ENDED",
      sellerId: arjun.id,
      categoryId: categories["collectibles"].id,
      bids: [
        { amount: 23000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 10 * dayMs) },
        { amount: 25500, bidderId: krishna.id, createdAt: new Date(now.getTime() - 7 * dayMs) },
        { amount: 28000, bidderId: priya.id, createdAt: new Date(now.getTime() - 5 * dayMs) },
        { amount: 30000, bidderId: rahul.id, createdAt: new Date(now.getTime() - 3 * dayMs) },
        { amount: 31500, bidderId: buyer.id, createdAt: new Date(now.getTime() - 50 * hourMs) },
      ],
    },
  ];
}

async function seedAuctionData(userByEmail, categoryBySlug) {
  const definitions = getDemoAuctionDefinitions(userByEmail, categoryBySlug);

  for (const def of definitions) {
    const { bids, ...auctionData } = def;

    // Check if auction with this title already exists
    let auction = await prisma.auction.findFirst({
      where: { title: auctionData.title },
    });

    if (!auction) {
      auction = await prisma.auction.create({
        data: {
          ...auctionData,
          bids: bids && bids.length > 0 ? { create: bids } : undefined,
        },
      });
    } else {
      // Update image and attributes idempotently
      await prisma.auction.update({
        where: { id: auction.id },
        data: {
          description: auctionData.description,
          image: auctionData.image,
          startingPrice: auctionData.startingPrice,
          currentPrice: auctionData.currentPrice,
          minimumIncrement: auctionData.minimumIncrement,
          startTime: auctionData.startTime,
          endTime: auctionData.endTime,
          status: auctionData.status,
          categoryId: auctionData.categoryId,
        },
      });
    }
  }
}

async function seedWatchlistAndNotifications(userByEmail) {
  const buyer = userByEmail["buyer@bidzone.local"];
  const krishna = userByEmail["krishna.buyer@bidzone.com"];
  const seller = userByEmail["seller@bidzone.local"];

  if (!buyer || !krishna || !seller) return;

  const activeAuctions = await prisma.auction.findMany({
    where: { status: "ACTIVE" },
    take: 3,
  });

  for (const a of activeAuctions) {
    await prisma.watchlist.upsert({
      where: { userId_auctionId: { userId: buyer.id, auctionId: a.id } },
      update: {},
      create: { userId: buyer.id, auctionId: a.id },
    });
  }

  const notifs = [
    {
      userId: buyer.id,
      message: "Welcome to TORI! Explore luxury auctions, place bids, and track your lots.",
      type: null,
      isRead: false,
    },
    {
      userId: buyer.id,
      message: "You are currently the leading bidder on ApexBook Ultra 16 OLED.",
      type: "BID_PLACED",
      isRead: true,
    },
    {
      userId: krishna.id,
      message: "You placed a bid on Aether Phone Pro Max 512GB.",
      type: "BID_PLACED",
      isRead: false,
    },
    {
      userId: krishna.id,
      message: "You have been outbid on Vanguard DeepSea Chronometer 300M.",
      type: "OUTBID",
      isRead: false,
    },
    {
      userId: seller.id,
      message: "Your auction listing for Eames Style Sculptural Walnut Lounge Chair received new bids.",
      type: "AUCTION_BID",
      isRead: true,
    },
  ];

  for (const n of notifs) {
    const existing = await prisma.notification.findFirst({
      where: { userId: n.userId, message: n.message },
    });
    if (!existing) {
      await prisma.notification.create({ data: n });
    }
  }
}

async function main() {
  const userByEmail = await ensureUsers();
  const categoryBySlug = await ensureCategories();

  await seedAuctionData(userByEmail, categoryBySlug);
  await seedWatchlistAndNotifications(userByEmail);

  const auctionCount = await prisma.auction.count();
  const bidCount = await prisma.bid.count();
  const userCount = await prisma.user.count();
  const categoryCount = await prisma.category.count();
  const activeCount = await prisma.auction.count({ where: { status: "ACTIVE" } });
  const upcomingCount = await prisma.auction.count({ where: { status: "UPCOMING" } });
  const endedCount = await prisma.auction.count({ where: { status: "ENDED" } });
  const watchlistCount = await prisma.watchlist.count();
  const notificationCount = await prisma.notification.count();

  console.log("TORI Marketplace Seed Complete:");
  console.log(`  Users: ${userCount}`);
  console.log(`  Categories: ${categoryCount}`);
  console.log(`  Total Auctions: ${auctionCount} (${activeCount} active, ${upcomingCount} upcoming, ${endedCount} ended)`);
  console.log(`  Total Bids: ${bidCount}`);
  console.log(`  Watchlist Items: ${watchlistCount}`);
  console.log(`  Notifications: ${notificationCount}`);
  console.log("");
  if (process.env.NODE_ENV !== "production") {
    console.log("Demo credentials (password: BidZone@123):");
    console.log("  Admin:  admin@bidzone.local");
    console.log("  Seller: seller@bidzone.local");
    console.log("  Buyer:  buyer@bidzone.local");
  }
}

module.exports = { isProductionSeedBlocked };

if (require.main === module) {
  if (isProductionSeedBlocked()) {
    console.error(
      "Refusing to seed: NODE_ENV=production without " +
        "ALLOW_PROD_SEED=i-understand-data-loss. Demo seeding must never " +
        "run against production; see docs/supabase-migration.md."
    );
    process.exit(1);
  }
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
      if (pgPool) await pgPool.end();
    });
}