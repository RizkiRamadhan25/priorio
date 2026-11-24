"use client";

import { Database, Globe2, Monitor, Moon, PanelLeft, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useWorkspace } from "@/components/shell/workspace-context";
import { PageHeader } from "@/components/ui/primitives";
import manifest from "../../../package.json";

export function SettingsPage() {
  const t = useTranslations();
  const { workspace: { settings, databasePath }, updateSettings, settingsPending } = useWorkspace();
  return <>
    <PageHeader title={t("nav.settings")} description={t("page.settingsDescription")} />
    <div className="settings-layout">
      <section className="panel settings-panel">
        <h2><Monitor size={19} />{t("settings.appearance")}</h2>
        <fieldset className="setting-row">
          <legend><Sun size={17} />{t("settings.theme")}</legend>
          <p>{t("settings.themeDescription")}</p>
          <div className="segments settings-segments">
            {(["light", "dark"] as const).map((theme) => <label key={theme}>
              <input type="radio" name="theme" checked={settings.theme === theme} disabled={settingsPending}
                onChange={() => updateSettings({ theme })} />
              <span>{theme === "light" ? <Sun size={17} /> : <Moon size={17} />}{t(`settings.${theme}`)}</span>
            </label>)}
          </div>
        </fieldset>
        <fieldset className="setting-row">
          <legend><Globe2 size={17} />{t("settings.language")}</legend>
          <p>{t("settings.languageDescription")}</p>
          <div className="segments settings-segments">
            {(["id", "en"] as const).map((language) => <label key={language}>
              <input type="radio" name="language" checked={settings.language === language} disabled={settingsPending}
                onChange={() => updateSettings({ language })} />
              <span>{t(`settings.${language}`)}</span>
            </label>)}
          </div>
        </fieldset>
        <div className="setting-row">
          <label className="check-label settings-check"><PanelLeft size={17} />
            {t("settings.sidebar")}<input type="checkbox" disabled={settingsPending} checked={settings.sidebarCollapsed}
              onChange={(event) => updateSettings({ sidebarCollapsed: event.target.checked })} />
          </label>
          <p>{t("settings.sidebarDescription")}</p>
        </div>
      </section>
      <section className="panel settings-panel">
        <h2><Database size={19} />{t("settings.application")}</h2>
        <dl className="app-information">
          <div><dt>{t("settings.version")}</dt><dd>{manifest.version}</dd></div>
          <div><dt>{t("settings.database")}</dt><dd className="database-path">{databasePath}</dd></div>
        </dl>
        <p className="muted">{t("settings.localDescription")}</p>
      </section>
    </div>
  </>;
}
