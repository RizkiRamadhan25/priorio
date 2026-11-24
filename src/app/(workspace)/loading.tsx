import { getTranslations } from "next-intl/server";

export default async function Loading() {
  const t = await getTranslations("feedback");
  return <div className="loading" role="status" aria-busy="true"><span>{t("loading")}</span>
    <div /><div /><div />
  </div>;
}
