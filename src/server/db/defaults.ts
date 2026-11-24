import type { PrismaClient } from "../../generated/prisma/client";
import { normalize } from "../../lib/validation/normalization";

const defaults = [
  { name: "Personal", color: "#6366F1" },
  { name: "Organization", color: "#0D9488" },
  { name: "Project", color: "#B45309" },
  { name: "Others", color: "#64748B" },
];

export async function seedDefaults(client: PrismaClient) {
  await client.$transaction(async (tx) => {
    await tx.appSettings.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} });
    const claimed = await tx.appSettings.updateMany({
      where: { id: 1, seededDefaults: false }, data: { seededDefaults: true },
    });
    if (!claimed.count) return;
    for (const entry of defaults) {
      const nameKey = normalize(entry.name);
      await tx.category.upsert({ where: { nameKey }, create: { ...entry, nameKey }, update: {} });
    }
  });
}
