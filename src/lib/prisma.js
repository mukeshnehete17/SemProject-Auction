import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { copyFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const globalForPrisma = globalThis;

function getDbSource() {
  const url = process.env.DATABASE_URL || "file:./prisma/dev.db";
  return url.replace("file:", "").replace(".\\", "./");
}

function ensureWritableDb() {
  const source = getDbSource();
  const absolute = path.isAbsolute(source)
    ? source
    : path.join(process.cwd(), source);

  const runningOnServerless =
    process.env.VERCEL === "1" || Boolean(process.env.NOW_REGION);

  if (!runningOnServerless) return source;

  const tmpDir = path.join("/tmp", "tori-db");
  mkdirSync(tmpDir, { recursive: true });
  const target = path.join(tmpDir, path.basename(absolute));
  if (!existsSync(target) && existsSync(absolute)) {
    copyFileSync(absolute, target);
  }
  return target;
}

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: ensureWritableDb() });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;