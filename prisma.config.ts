import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 has no `directUrl`: the CLI uses this single datasource URL.
// Precedence: DIRECT_URL (Supabase Session-mode/direct connection, required
// for `migrate` commands) -> DATABASE_URL -> local SQLite file.
// The schema + migrations directory follow the URL scheme so local SQLite
// development keeps working unchanged while Supabase uses its own set.
const cliUrl =
  process.env.DIRECT_URL || process.env.DATABASE_URL || "file:./prisma/dev.db";
const isPostgres = /^(postgres(ql)?):\/\//i.test(cliUrl);

export default defineConfig({
  schema: isPostgres ? "prisma/postgres/schema.prisma" : "prisma/schema.prisma",
  migrations: {
    path: isPostgres ? "prisma/postgres/migrations" : "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    url: cliUrl,
  },
});
