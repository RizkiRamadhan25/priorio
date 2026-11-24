import { getRequestConfig } from "next-intl/server";
import { getWorkspace } from "@/server/services/workspace";
import id from "./messages/id.json";
import en from "./messages/en.json";

const messages = { id, en };

export default getRequestConfig(async () => {
  const { settings, zone } = await getWorkspace();
  return { locale: settings.language, messages: messages[settings.language], timeZone: zone };
});
