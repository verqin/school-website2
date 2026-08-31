/** Shared display formatting helpers. Never use an em dash here - hyphens only. */

export function money(cents: number | null | undefined, currency = "USD") {
  const value = (cents ?? 0) / 100;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export function shortDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export function dateTime(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString(undefined, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function timeOnly(value: string | null | undefined) {
  if (!value) return "-";
  return value.slice(0, 5);
}

export function percent(numerator: number, denominator: number) {
  if (!denominator) return "-";
  return `${Math.round((numerator / denominator) * 100)}%`;
}

export function titleCase(value: string | null | undefined) {
  if (!value) return "-";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export const dayNames = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function studentName(student: { first_name?: string | null; last_name?: string | null } | null | undefined) {
  if (!student) return "-";
  return [student.first_name, student.last_name].filter(Boolean).join(" ") || "-";
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
