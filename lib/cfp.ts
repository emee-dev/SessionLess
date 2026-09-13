export function formatDateRange(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
    return `${startsAt} – ${endsAt}`;
  const sameMonth =
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();
  const month = start.toLocaleDateString("en-GB", { month: "short" });
  if (sameMonth) {
    return `${month} ${start.getDate()}–${end.getDate()}, ${end.getFullYear()}`;
  }
  return `${start.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function daysUntil(
  value: string,
  now: Date = new Date(),
): number | undefined {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return Math.ceil((date.getTime() - now.getTime()) / 86_400_000);
}
