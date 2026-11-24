import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const config: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  experimental: { cpus: 2 },
};

export default createNextIntlPlugin("./src/i18n/request.ts")(config);
