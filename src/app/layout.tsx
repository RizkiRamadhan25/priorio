import type { Metadata } from "next";
import { connection } from "next/server";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { getWorkspace } from "@/server/services/workspace";
import "./globals.css";

export const metadata: Metadata = { title: "Priorio", description: "Know what to do next." };

export default async function Layout({ children }: { children: ReactNode }) {
  await connection();
  const { settings } = await getWorkspace();
  return <html lang={settings.language} data-theme={settings.theme} suppressHydrationWarning>
    <body><NextIntlClientProvider>{children}</NextIntlClientProvider></body>
  </html>;
}
