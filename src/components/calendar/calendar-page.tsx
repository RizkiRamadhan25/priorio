"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { monthGrid, tasksByDay } from "@/domain/calendar";
import { taskGroup } from "@/domain/types";
import { addDays, formatLocalDate, isLocalDate, localDate, shiftMonth } from "@/lib/dates/local";
import { useWorkspace } from "@/components/shell/workspace-context";
import { TaskList } from "@/components/tasks/task-list";
import { Button, IconButton, PageHeader } from "@/components/ui/primitives";

export function CalendarPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { workspace, now, openTask } = useWorkspace();
  const today = localDate(now, workspace.zone);
  const [selected, setSelected] = useState(today);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [yearDraft, setYearDraft] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  const [completed, setCompleted] = useState(true);
  const range = useMemo(() => tasksByDay(workspace.tasks, active, completed), [workspace.tasks, active, completed]);
  const names = Array.from({ length: 7 }, (_, index) => addDays("2026-01-05", index));
  const monthOptions = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
  const selectedLabel = formatLocalDate(selected, locale, { dateStyle: "long" });
  const add = <Button variant="primary" onClick={() => openTask(selected)}><Plus size={17} />{t("action.newTask")}</Button>;

  function chooseDate(day: string) {
    setSelected(day);
    setMonth(day.slice(0, 7));
  }

  function applyYear() {
    if (yearDraft && /^\d{1,4}$/u.test(yearDraft) && Number(yearDraft) > 0) {
      setMonth(yearDraft.padStart(4, "0") + month.slice(4));
    }
    setYearDraft(null);
  }

  return <>
    <PageHeader title={t("nav.calendar")} description={t("page.calendarDescription")} action={add} />
    <section className="panel calendar-panel" aria-label={t("aria.calendar")}>
      <div className="calendar-toolbar">
        <div className="calendar-navigation">
          <IconButton label={t("calendar.prev")} disabled={month === "0001-01"} onClick={() => setMonth(shiftMonth(month, -1))}><ChevronLeft size={20} /></IconButton>
          <h2>{formatLocalDate(month + "-01", locale, { month: "long", year: "numeric" })}</h2>
          <IconButton label={t("calendar.next")} disabled={month === "9999-12"} onClick={() => setMonth(shiftMonth(month, 1))}><ChevronRight size={20} /></IconButton>
        </div>
        <div className="calendar-controls">
          <select className="month-select" aria-label={t("calendar.month")} value={month.slice(5)}
            onChange={(event) => setMonth(month.slice(0, 5) + event.target.value)}>
            {monthOptions.map((option) => <option key={option} value={option}>
              {formatLocalDate("2026-" + option + "-01", locale, { month: "long" })}
            </option>)}
          </select>
          <input className="year-input" aria-label={t("calendar.year")} inputMode="numeric" maxLength={4}
            value={yearDraft ?? month.slice(0, 4)} onChange={(event) => setYearDraft(event.target.value)} onBlur={applyYear}
            onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} />
          <Button onClick={() => chooseDate(today)}>{t("action.today")}</Button>
        </div>
      </div>
      <div className="calendar-filters">
        <label className="check-label"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />{t("calendar.active")}</label>
        <label className="check-label"><input type="checkbox" checked={completed} onChange={(event) => setCompleted(event.target.checked)} />{t("calendar.completed")}</label>
      </div>
      <div className="calendar-grid">
        {names.map((day) => <span className="weekday" key={day}>{formatLocalDate(day, locale, { weekday: "short" })}</span>)}
        {monthGrid(month).map((day) => {
          if (!isLocalDate(day)) return <span key={day} className="calendar-day outside-month" aria-hidden="true" />;
          const tasks = range.get(day) ?? [];
          return <button type="button" key={day}
            className={`calendar-day ${day.startsWith(month) ? "" : "outside-month"} ${day === selected ? "selected-day" : ""}`}
            aria-label={t("calendar.day", { date: formatLocalDate(day, locale, { dateStyle: "long" }), count: tasks.length })}
            aria-current={day === today ? "date" : undefined} aria-pressed={day === selected} onClick={() => chooseDate(day)}>
            <span className={`day-number ${day === today ? "day-today" : ""}`}>{Number(day.slice(-2))}</span>
            <span className="day-indicators" aria-hidden="true">
              {tasks.slice(0, 3).map((task) => <span key={task.id} className="calendar-task-mark">
                <span className="color-dot" style={{ backgroundColor: taskGroup(task, workspace)?.color }} />
                <span className="calendar-task-title">{task.title}</span>
              </span>)}
              {tasks.length > 3 && <span className="day-more">{t("calendar.more", { count: tasks.length - 3 })}</span>}
              {tasks.length > 0 && <span className="mobile-day-count">{tasks.length}</span>}
            </span>
          </button>;
        })}
      </div>
    </section>
    <section className="panel calendar-agenda" aria-label={t("aria.dayList", { date: selectedLabel })}>
      <div className="section-heading"><h2><CalendarDays size={18} />{selectedLabel}</h2></div>
      <TaskList key={selected} tasks={range.get(selected) ?? []} mode="compact" emptyTitle={t("empty.day")} emptyAction={add} />
    </section>
  </>;
}
