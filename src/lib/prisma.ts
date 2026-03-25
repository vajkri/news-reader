import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";
import { neon, types } from "@neondatabase/serverless";

// Return date/timestamp columns as ISO strings so Prisma can parse them correctly.
// Without this, @neondatabase/serverless returns Date objects which Prisma's HTTP
// adapter cannot handle (expects strings from the wire).
types.setTypeParser(1082, (v: string) => v); // date
types.setTypeParser(1114, (v: string) => v); // timestamp
types.setTypeParser(1184, (v: string) => v); // timestamptz
types.setTypeParser(1083, (v: string) => v); // time
types.setTypeParser(1266, (v: string) => v); // timetz
types.setTypeParser(1700, (v: string) => v); // numeric

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const sql = neon(connectionString);
  const adapter = new PrismaNeonHTTP(sql);
  return new PrismaClient({ adapter });
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
