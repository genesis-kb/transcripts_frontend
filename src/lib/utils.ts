import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely format a date string. Returns the fallback if the input
 * is empty, undefined, or produces an invalid Date.
 */
export function formatDate(
  dateStr: string | undefined | null,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" },
  fallback = "Date unknown"
): string {
  if (!dateStr) return fallback;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString("en-US", options);
}
