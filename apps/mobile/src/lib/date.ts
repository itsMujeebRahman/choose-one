type DateInput = string | Date | null | undefined;

function toDate(value: DateInput) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function ago(value: number, unit: string) {
  return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
}

export function timeAgo(value: DateInput) {
  const date = toDate(value);
  if (!date) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return ago(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return ago(hours, "hour");
  const days = Math.round(hours / 24);
  if (days < 7) return ago(days, "day");
  const weeks = Math.floor(days / 7);
  if (days < 30) return ago(weeks, "week");
  const months = Math.floor(days / 30);
  if (days < 365) return ago(months, "month");
  return ago(Math.floor(days / 365), "year");
}

export function fullDate(value: DateInput) {
  const date = toDate(value);
  if (!date) return "";
  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
