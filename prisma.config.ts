import "dotenv/config";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { defineConfig } from "prisma/config";
import { databaseLocation } from "./src/lib/env/database";

const database = databaseLocation();
if (process.argv.includes("migrate")) mkdirSync(dirname(database.path), { recursive: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  datasource: { url: database.url },
});
