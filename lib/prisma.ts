import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig, Pool } from "@neondatabase/serverless";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const databaseUrl = process.env.DATABASE_URL;
const isNeon = Boolean(databaseUrl?.includes("neon.tech"));

if (isNeon) {
  neonConfig.poolQueryViaFetch = true;
}

const adapter =
  isNeon && databaseUrl
    ? new PrismaNeon(
        new Pool({
          connectionString: databaseUrl,
        })
      )
    : undefined;

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(adapter ? ({ adapter } as object) : {}),
    log: ["query", "info", "warn", "error"],
  } as ConstructorParameters<typeof PrismaClient>[0]);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
