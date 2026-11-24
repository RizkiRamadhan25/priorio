"use client";

import { AlertCircle, CalendarDays, CircleCheck, ClipboardList, Clock3, FolderPlus, Layers3, Plus, Zap } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useMemo } from "react";
import { statistics } from "@/domain/statistics";
import { statuses } from "@/domain/types";
import { useWorkspace } from "@/components/shell/workspace-context";
import { TaskList } from "@/components/tasks/task-list";
import { Button, Empty, PageHeader } from "@/components/ui/primitives";

const metrics = [
  { key: "total", icon: ClipboardList },
  { key: "active", icon: Clock3 },
  { key: "completed", icon: CircleCheck },
  { key: "overdue", icon: AlertCircle },
] as const;
const chartColors = ["var(--text-muted)", "var(--primary)", "var(--success)"];

export function DashboardPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { workspace, now, openTask } = useWorkspace();
  const stats = useMemo(() => statistics(workspace, now), [workspace, now]);
  const number = new Intl.NumberFormat(locale);
  const percent = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }).format(stats.percentage / 100);
  const dataset = statuses.map((status) => ({ label: t(`task.statusLabels.${status}`), count: stats.status[status] }));
  const add = <Button variant="primary" onClick={() => openTask()}><Plus size={17} />{t("action.newTask")}</Button>;

  return <>
    <PageHeader title={t("page.dashboard")} description={t("page.dashboardDescription")} />
    <div className="metric-grid">
      {metrics.map(({ key, icon: Icon }) => <article className={`panel metric metric-${key}`} key={key}>
        <span className="metric-icon"><Icon size={18} /></span>
        <div><span className="metric-label">{t(`dashboard.${key}`)}</span><strong>{number.format(stats[key])}</strong></div>
      </article>)}
    </div>
    <div className="dashboard-grid">
      <div className="dashboard-column">
        <section className="panel dashboard-section">
          <div className="section-heading"><h2><Zap size={19} />{t("dashboard.top")}</h2>
            <Link href="/priority">{t("action.viewAll")}</Link></div>
          <TaskList tasks={stats.top.map(({ task }) => task)} priorities={new Map(stats.top.map((item) => [item.task.id, item]))}
            mode="compact" emptyTitle={t("empty.priority")} emptyDetail={t("empty.priorityDescription")}
            emptyAction={<div className="empty-actions">{add}{!workspace.courses.length &&
              <Link className="button button-secondary" href="/courses"><FolderPlus size={17} />{t("group.newCourse")}</Link>}</div>} />
        </section>
        <section className="panel dashboard-section">
          <div className="section-heading"><div><h2><CalendarDays size={19} />{t("dashboard.upcoming")}</h2>
            <p>{t("dashboard.upcomingDescription")}</p></div><Link href="/calendar">{t("action.viewAll")}</Link></div>
          <TaskList tasks={stats.upcoming} mode="compact" emptyTitle={t("empty.upcoming")} />
        </section>
      </div>
      <div className="dashboard-column">
        <section className="panel progress-panel">
          <h2>{t("dashboard.progress")}</h2>
          <strong>{percent}</strong>
          <progress max={100} value={stats.percentage} aria-label={t("dashboard.progress")} />
          <p>{t("dashboard.progressSummary", { completed: stats.completed, total: stats.total })}</p>
        </section>
        <section className="panel dashboard-section distribution">
          <div className="section-heading"><h2>{t("dashboard.status")}</h2></div>
          {stats.total > 0 && <div className="status-chart" aria-hidden="true">
            <ResponsiveContainer width="100%" height={108}>
              <BarChart data={dataset} margin={{ top: 6, right: 0, bottom: 0, left: 0 }} accessibilityLayer={false}>
                <XAxis hide dataKey="label" /><YAxis hide allowDecimals={false} />
                <Bar dataKey="count" name={t("dashboard.total")} barSize={48} radius={[5, 5, 0, 0]} isAnimationActive={false}>
                  {dataset.map(({ label }, index) => <Cell key={label} fill={chartColors[index]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>}
          <dl className="distribution-list">
            {dataset.map(({ label, count }, index) => <div key={label}>
              <dt><span className="color-dot" style={{ backgroundColor: chartColors[index] }} aria-hidden="true" />{label}</dt>
              <dd>{number.format(count)}</dd>
            </div>)}
          </dl>
        </section>
        <section className="panel dashboard-section distribution">
          <div className="section-heading"><h2><Layers3 size={18} />{t("dashboard.groups")}</h2></div>
          {stats.groups.length ? <dl className="distribution-list">
            {stats.groups.map((group) => <div key={group.id}>
              <dt><span className="color-dot" style={{ backgroundColor: group.color }} aria-hidden="true" />{group.name}
                {group.isArchived && <span className="badge">{t("group.archived")}</span>}</dt><dd>{number.format(group.count)}</dd></div>)}
          </dl> : <Empty title={t("dashboard.emptyGroups")} />}
        </section>
      </div>
    </div>
  </>;
}
