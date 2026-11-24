import "server-only";
import { settingsInput } from "@/domain/validation";
import { transaction } from "@/server/repositories/mutations";
import { parse } from "./results";

export function saveSettings(input: unknown) {
  const data = parse(settingsInput, input);
  return transaction(async (tx) => {
    await tx.appSettings.update({ where: { id: 1 }, data });
    return data;
  });
}
