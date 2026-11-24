"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Bucket } from "@/domain/priority";
import type { Status, Task } from "@/domain/types";
import { formatLocalDate } from "@/lib/dates/local";

export function DateLabel({ value, time }: { value: string; time?: string | null }) {
  const locale = useLocale();
  return <time dateTime={time ? value + "T" + time : value}>{formatLocalDate(value, locale)}{time && <span className="date-time">{time}</span>}</time>;
}

export function CompletionLabel({ value, zone }: { value: string; zone: string }) {
  const locale = useLocale();
  return <time dateTime={value}>{new Intl.DateTimeFormat(locale, {
    dateStyle: "medium", timeStyle: "short", hour12: false, timeZone: zone,
  }).format(new Date(value))}</time>;
}

export function StatusLabel({ status }: { status: Status }) {
  const t = useTranslations("task.statusLabels");
  return <span className={`badge status-${status.toLowerCase()}`}>{t(status)}</span>;
}

export function DifficultyLabel({ level }: { level: number }) {
  const t = useTranslations("task.difficulty");
  return <span className={`difficulty level-${level}`} title={t(String(level))}>
    <span className="difficulty-mark">L{level}</span><span className="difficulty-name">{t(String(level))}</span>
  </span>;
}

export function PriorityLabel({ bucket }: { bucket: Bucket }) {
  const t = useTranslations("priority.labels");
  return <span className={`badge priority-${bucket}`}>{t(bucket)}</span>;
}

export function GroupLabel({ task, name, color }: { task: Pick<Task, "taskType">; name?: string; color?: string }) {
  const t = useTranslations("task.typeLabels");
  return <span className="group-label">{color && <span className="color-dot" style={{ backgroundColor: color }} aria-hidden="true" />}
    {name ?? t(task.taskType)}</span>;
}
