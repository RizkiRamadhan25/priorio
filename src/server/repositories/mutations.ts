import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { getDatabase } from "@/server/db";

export type Transaction = Prisma.TransactionClient;
export const transaction = <T>(operation: (tx: Transaction) => Promise<T>) => getDatabase().$transaction(operation);
