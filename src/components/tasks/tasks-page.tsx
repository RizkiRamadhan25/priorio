"use client";

import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { buckets, rankTasks } from "@/domain/priority";
import { emptyFilters, filterTasks, latestCompleted, orderKeys, sortTasks } from "@/domain/search";
import type { Filters, Order } from "@/domain/search";
import { statuses, taskTypes } from "@/domain/types";
import { useWorkspace } from "@/components/shell/workspace-context";
import { Button, PageHeader } from "@/components/ui/primitives";
import { TaskList } from "./task-list";

function Options<T extends string | number>({ label, options, values, onChange }: {
  label: string; options: { value: T; text: string }[]; values: T[]; onChange: (next: T[]) => void;
}) {
  if (!options.length) return null;
  return <fieldset className="filter-fieldset"><legend>{label}</legend>
    {options.map(({ value, text }) => <label key={value} className="check-label">
      <input type="checkbox" checked={values.includes(value)} onChange={(event) =>
        onChange(event.target.checked ? [...values, value] : values.filter((entry) => entry !== value))} />{text}</label>)}
  </fieldset>;
}

export function TasksPage({ mode, selection }: {
  mode: "tasks" | "priority" | "completed"; selection?: { course?: string; category?: string };
}) {
  const t = useTranslations();
  const { workspace, now, openTask } = useWorkspace();
  const { tasks, courses, categories, zone } = workspace;
  const [filters, setFilters] = useState<Filters>(() => ({
    ...emptyFilters,
    courses: selection?.course && courses.some((group) => group.id === selection.course) ? [selection.course] : [],
    categories: selection?.category && categories.some((group) => group.id === selection.category) ? [selection.category] : [],
  }));
  const [order, setOrder] = useState<Order>("priority");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const ranked = mode === "priority";
  const completed = mode === "completed";
  const ranking = useMemo(() => rankTasks(tasks, now, zone), [tasks, now, zone]);
  const priorities = useMemo(() => new Map(ranking.map((item) => [item.task.id, item])), [ranking]);
  const selected = useMemo(() => {
    const filtered = filterTasks(ranked ? ranking.map(({ task }) => task) :
      completed ? latestCompleted(tasks) : tasks, filters, now, zone);
    return mode === "tasks" ? sortTasks(filtered, order, direction, now, zone) : filtered;
  }, [mode, ranked, completed, ranking, tasks, filters, now, zone, order, direction]);

  const filtered = Object.values(filters).some((part) => part.length > 0);
  const changed = filtered || order !== "priority" || direction !== "desc";
  const reset = () => { setFilters(emptyFilters); setOrder("priority"); setDirection("desc"); };
  const update = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((previous) => ({ ...previous, [key]: value }));
  const makeOptions = <T extends string | number>(values: readonly T[], label: (entry: T) => string) =>
    values.map((value) => ({ value, text: label(value) }));
  const add = <Button variant="primary" onClick={() => openTask()}><Plus size={17} />{t("action.newTask")}</Button>;

  return <>
    <PageHeader title={t(`nav.${mode}`)} description={t(`page.${mode}Description`)} action={!completed ? add : undefined} />
    {ranked && <div className="priority-explanation"><strong>{t("priority.explanation")}</strong><p>{t("priority.tie")}</p></div>}
    <section className="panel">
      <div className="filter-bar">
        <label className="search-field"><Search size={18} aria-hidden="true" />
          <input type="search" aria-label={t("filter.search")} placeholder={t("filter.placeholder")} value={filters.query}
            onChange={(event) => update("query", event.target.value)} /></label>
        {mode === "tasks" && <>
          <label className="filter-select"><span>{t("filter.sort")}</span>
            <select value={order} onChange={(event) => {
              const value = event.target.value as Order;
              setOrder(value);
              setDirection(value === "deadline" || value === "title" ? "asc" : "desc");
            }}>
              {orderKeys.map((key) => <option value={key} key={key}>{t({ priority: "priority.label", deadline: "task.deadline",
                difficulty: "task.level", created: "filter.created", title: "task.title" }[key])}</option>)}
            </select>
          </label>
          <label className="filter-select"><span>{t("filter.direction")}</span>
            <select value={direction} onChange={(event) => setDirection(event.target.value === "asc" ? "asc" : "desc")}>
              <option value="asc">{t("filter.asc")}</option><option value="desc">{t("filter.desc")}</option>
            </select>
          </label>
        </>}
        {changed && <Button variant="ghost" onClick={reset}>{t("action.reset")}</Button>}
      </div>
      <details className="filter-details" open={selection?.course || selection?.category ? true : undefined}>
        <summary><SlidersHorizontal size={16} />{t("filter.more")}</summary>
        <div className="filter-grid" aria-label={t("aria.filters")}>
          {!completed && <Options label={t("task.type")} options={makeOptions(taskTypes, (key) => t(`task.typeLabels.${key}`))}
            values={filters.types} onChange={(value) => update("types", value)} />}
          <Options label={t("group.course")} options={courses.map((group) => ({ value: group.id,
            text: group.name + (group.isArchived ? ` (${t("group.archived")})` : "") }))}
            values={filters.courses} onChange={(value) => update("courses", value)} />
          <Options label={t("group.category")} options={categories.map((group) => ({ value: group.id,
            text: group.name + (group.isArchived ? ` (${t("group.archived")})` : "") }))}
            values={filters.categories} onChange={(value) => update("categories", value)} />
          {!completed && <>
            <Options label={t("task.level")} options={makeOptions([0, 1, 2, 3, 4, 5], (level) => `L${level}`)}
              values={filters.levels} onChange={(value) => update("levels", value)} />
            <Options label={t("task.status")} options={makeOptions(statuses.filter((status) => !ranked || status !== "COMPLETED"),
              (status) => t(`task.statusLabels.${status}`))} values={filters.statuses} onChange={(value) => update("statuses", value)} />
            <Options label={t("filter.deadline")} options={makeOptions(buckets, (bucket) => t(`deadline.${bucket}`))}
              values={filters.deadlines} onChange={(value) => update("deadlines", value)} />
          </>}
        </div>
      </details>
      <div className="result-count" aria-live="polite">{t("filter.results", { count: selected.length })}</div>
      <TaskList key={JSON.stringify([filters, order, direction])} tasks={selected} priorities={priorities} mode={mode}
        emptyTitle={t(filtered ? "empty.filtered" : ranked ? "empty.priority" : completed ? "empty.completed" : "empty.tasks")}
        emptyDetail={t(filtered ? "empty.filteredDescription" : ranked ? "empty.priorityDescription" :
          completed ? "empty.completedDescription" : "empty.tasksDescription")}
        emptyAction={filtered ? <Button onClick={reset}>{t("action.reset")}</Button> : completed ? undefined : add} />
    </section>
  </>;
}
