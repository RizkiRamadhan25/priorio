import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client";
import { databaseLocation } from "../../lib/env/database";

export function createDatabase(url = databaseLocation().url) {
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
}
