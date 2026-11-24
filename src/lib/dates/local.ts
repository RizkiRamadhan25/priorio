const dayMs = 86_400_000;
const formatters = new Map<string, Intl.DateTimeFormat>();

function utc(year: number, month: number, day: number, hour = 0, minute = 0, second = 0, ms = 0) {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute, second, ms);
  return date.getTime();
}

function dateParts(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}

function isoDate(date: Date) {
  return [String(date.getUTCFullYear()).padStart(4, "0"), String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0")].join("-");
}

export function dateOrdinal(value: string) {
  const { year, month, day } = dateParts(value);
  return utc(year, month, day) / dayMs;
}

export function isLocalDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/u.test(value) && !value.startsWith("0000-") &&
    isoDate(new Date(dateOrdinal(value) * dayMs)) === value;
}

export function addDays(value: string, days: number) {
  return isoDate(new Date((dateOrdinal(value) + days) * dayMs));
}

export function localWeekday(value: string) {
  return new Date(dateOrdinal(value) * dayMs).getUTCDay();
}

function wallParts(instant: number, zone: string) {
  let formatter = formatters.get(zone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: zone, calendar: "gregory", numberingSystem: "latn", hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
    formatters.set(zone, formatter);
  }
  const info = Object.fromEntries(formatter.formatToParts(instant).map(({ type, value }) => [type, value]));
  return { date: info.year.padStart(4, "0") + "-" + info.month + "-" + info.day,
    hour: Number(info.hour), minute: Number(info.minute), second: Number(info.second) };
}

export function localDate(instant: number, zone: string) {
  return wallParts(instant, zone).date;
}

function localAsUtc(instant: number, zone: string) {
  const parts = wallParts(instant, zone);
  const { year, month, day } = dateParts(parts.date);
  return utc(year, month, day, parts.hour, parts.minute, parts.second, ((instant % 1000) + 1000) % 1000);
}

export function localInstant(value: string, time: string, zone: string, endOfDay = false) {
  const { year, month, day } = dateParts(value);
  const [hour, minute] = time.split(":").map(Number);
  const target = utc(year, month, day, hour, minute, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
  const before = target - dayMs;
  const after = target + dayMs;
  const offsetBefore = localAsUtc(before, zone) - before;
  const offsetAfter = localAsUtc(after, zone) - after;
  // A repeated time uses the earlier instant. A skipped time advances by the gap.
  const fromBefore = target - offsetBefore;
  const fromAfter = target - offsetAfter;
  if (offsetBefore === offsetAfter || localAsUtc(fromBefore, zone) === target) return fromBefore;
  return localAsUtc(fromAfter, zone) === target ? fromAfter : fromBefore;
}

export function deadlineInstant(date: string, time: string | null, zone: string) {
  return localInstant(date, time ?? "23:59", zone, time === null);
}

export function formatLocalDate(value: string, locale: string, options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(dateOrdinal(value) * dayMs);
}

export function shiftMonth(month: string, delta: number) {
  const { year, month: part } = dateParts(month + "-01");
  return isoDate(new Date(utc(year, part + delta, 1))).slice(0, 7);
}

export function daysInMonth(month: string) {
  const parts = dateParts(month + "-01");
  return new Date(utc(parts.year, parts.month + 1, 0)).getUTCDate();
}
