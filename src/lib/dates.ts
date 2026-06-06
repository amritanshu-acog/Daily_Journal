import { format, parseISO, addDays, subDays, isToday as isTodayDateFns } from "date-fns";

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "yyyy-MM-dd");
}

export function today(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function todayString(): string {
  return today();
}

export function yesterday(): string {
  return format(subDays(new Date(), 1), "yyyy-MM-dd");
}

export function nextDay(date: string): string {
  return format(addDays(parseISO(date), 1), "yyyy-MM-dd");
}

export function prevDay(date: string): string {
  return format(subDays(parseISO(date), 1), "yyyy-MM-dd");
}

export function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

export function toDateString(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function fromDateString(s: string): Date {
  return parseISO(s);
}

export function isToday(date: string): boolean {
  return isTodayDateFns(parseISO(date));
}

export function formatDisplay(date: string): string {
  return format(parseISO(date), "EEEE, MMMM d, yyyy");
}

export function formatDayOfWeek(date: string): string {
  return format(parseISO(date), "EEEE");
}

export function formatShort(date: string): string {
  return format(parseISO(date), "MMM d");
}

export function getMondayOfWeek(date: string): string {
  const d = parseISO(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return format(addDays(d, diff), "yyyy-MM-dd");
}

export function getWeekDays(weekStart: string): string[] {
  const start = parseISO(weekStart);
  const days: string[] = [];
  for (let i = 0; i < 5; i++) {
    days.push(format(addDays(start, i), "yyyy-MM-dd"));
  }
  return days;
}

export function calculateStreak(entryDates: string[]): number {
  const dateSet = new Set(entryDates);
  let streak = 0;
  let current = todayString();

  if (!dateSet.has(current)) {
    current = prevDay(current);
  }

  for (let i = 0; i < 365; i++) {
    const d = parseISO(current);
    const day = d.getDay();

    if (day === 0 || day === 6) {
      current = prevDay(current);
      continue;
    }

    if (dateSet.has(current)) {
      streak++;
      current = prevDay(current);
    } else {
      break;
    }
  }

  return streak;
}
