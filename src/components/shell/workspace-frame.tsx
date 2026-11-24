"use client";

import { CalendarDays, ChartNoAxesColumn, CircleCheck, ClipboardList, Folder, GraduationCap, LayoutDashboard, Menu,
  Moon, PanelLeftClose, PanelLeftOpen, Plus, Settings2, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { settingsAction } from "@/server/actions/workspace";
import type { Settings, Workspace } from "@/domain/types";
import { nextBoundary } from "@/domain/priority";
import { Button, DialogFrame, Empty, IconButton } from "@/components/ui/primitives";
import { useMutation } from "@/components/shared/feedback";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { WorkspaceContext } from "./workspace-context";
import type { TaskDialogState } from "./workspace-context";

const navigation = [
  { href: "/", label: "dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "tasks", icon: ClipboardList },
  { href: "/priority", label: "priority", icon: ChartNoAxesColumn },
  { href: "/courses", label: "courses", icon: GraduationCap },
  { href: "/categories", label: "categories", icon: Folder },
  { href: "/calendar", label: "calendar", icon: CalendarDays },
  { href: "/completed", label: "completed", icon: CircleCheck },
  { href: "/settings", label: "settings", icon: Settings2 },
] as const;

function Brand() {
  const t = useTranslations();
  return <Link href="/" className="brand" aria-label={t("aria.brand")}>
    <span className="brand-mark"><ClipboardList size={20} strokeWidth={2.2} /></span>
    <span className="brand-name">Priorio</span>
  </Link>;
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("nav");
  const path = usePathname();
  return <nav className="navigation" aria-label={t("primary")}>
    {navigation.map(({ href, label, icon: Icon }) =>
      <Link key={href} href={href} title={t(label)} aria-label={t(label)} aria-current={path === href ? "page" : undefined}
        onClick={onNavigate} className={label === "settings" ? "nav-settings" : undefined}>
        <Icon size={19} /><span>{t(label)}</span>
      </Link>)}
  </nav>;
}

export function WorkspaceFrame({ workspace, children }: { workspace: Workspace; children: ReactNode }) {
  const t = useTranslations();
  const path = usePathname();
  const router = useRouter();
  const { settings, tasks, zone } = workspace;
  const [lastTick, setLastTick] = useState(workspace.now);
  const [drawer, setDrawer] = useState(false);
  const [taskDialog, setTaskDialog] = useState<TaskDialogState | null>(null);
  const [toast, setToast] = useState<{ message: string } | null>(null);
  const mutation = useMutation();
  const now = Math.max(workspace.now, lastTick);
  const current = navigation.find((item) => item.href === path) ?? navigation[0];
  const openTask = (dueDate?: string) => setTaskDialog({ kind: "new", dueDate });
  const viewTask = (id: string) => setTaskDialog({ kind: "detail", id });
  const notify = (message: string) => setToast({ message });
  const updateSettings = (value: Partial<Settings>) => {
    void mutation.run(() => settingsAction(value), () => notify("feedback.saved"));
  };

  useEffect(() => {
    const delay = Math.max(0, nextBoundary(tasks, now, zone) - Date.now());
    const timer = window.setTimeout(() => setLastTick(Date.now()), Math.min(delay, 2_147_000_000));
    return () => window.clearTimeout(timer);
  }, [tasks, now, zone]);

  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState === "visible") setLastTick(Date.now());
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    const timer = window.setTimeout(onFocus, 0);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [path]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return <ThemeProvider attribute="data-theme" forcedTheme={settings.theme} enableSystem={false} defaultTheme="light">
    <WorkspaceContext.Provider value={{ workspace, now, openTask, viewTask, notify, updateSettings, settingsPending: mutation.pending }}>
      <a className="skip-link" href="#workspace-main">{t("nav.skip")}</a>
      <div className={`app-shell ${settings.sidebarCollapsed ? "is-collapsed" : ""}`}>
        <aside className="sidebar" aria-label={t("nav.workspace")}><Brand /><Navigation />
          <div className="sidebar-base"><span className="local-dot" /><span>{t("settings.local")}</span></div>
        </aside>
        <div className="workspace-main">
          <header className="topbar">
            <div className="topbar-context">
              <div className="desktop-control"><IconButton label={t(settings.sidebarCollapsed ? "action.expand" : "action.collapse")}
                onClick={() => updateSettings({ sidebarCollapsed: !settings.sidebarCollapsed })} disabled={mutation.pending || workspace.error}>
                {settings.sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              </IconButton></div>
              <div className="mobile-control"><IconButton label={t("action.menu")} onClick={() => setDrawer(true)}><Menu size={21} /></IconButton></div>
              <span className="breadcrumb-root">{t("nav.workspace")}</span><span className="breadcrumb-divider" aria-hidden="true">/</span>
              <span className="breadcrumb-current">{t(`nav.${current.label}`)}</span>
            </div>
            <div className="topbar-actions">
              <IconButton label={t(settings.theme === "light" ? "action.dark" : "action.light")} disabled={mutation.pending || workspace.error}
                onClick={() => updateSettings({ theme: settings.theme === "light" ? "dark" : "light" })}>
                {settings.theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
              </IconButton>
              <IconButton label={t("action.language")} disabled={mutation.pending || workspace.error}
                onClick={() => updateSettings({ language: settings.language === "id" ? "en" : "id" })}>
                <span className="language-code">{settings.language.toUpperCase()}</span>
              </IconButton>
              <Button variant="primary" className="new-task-top" onClick={() => openTask()} disabled={workspace.error}>
                <Plus size={17} /><span>{t("action.newTask")}</span>
              </Button>
            </div>
          </header>
          <main id="workspace-main" className="main-content" tabIndex={-1}>
            {workspace.error ? <div className="panel"><Empty title={t("feedback.loadError")} detail={t("feedback.loadDescription")}
              action={<Button onClick={() => router.refresh()}>{t("action.retry")}</Button>} /></div> : children}
          </main>
        </div>
      </div>
      {drawer && <DialogFrame drawer title="Priorio" onClose={() => setDrawer(false)}><Navigation onNavigate={() => setDrawer(false)} /></DialogFrame>}
      {taskDialog && <TaskDialog state={taskDialog} onClose={() => setTaskDialog(null)} />}
      <div className="toast-container" role="status" aria-live="polite">{toast && <div className="toast"><CircleCheck size={18} />{t(toast.message)}</div>}</div>
      {mutation.error && <div className="toast-container"><div className="toast toast-error" role="alert">{mutation.error}</div></div>}
    </WorkspaceContext.Provider>
  </ThemeProvider>;
}
