# Feature 3 — Date Navigation + Streak

## Context

Project: `Daily_Journal` — Next.js 16 App Router, TypeScript, Tailwind CSS.

Features 1 and 2 are complete. The editor renders on `/entries/[date]`. You are implementing Feature 3 only.

---

## Your Task

---

### `src/lib/dates.ts`

Export these pure functions:

- `toDateString(d: Date): string` → `'YYYY-MM-DD'`
- `fromDateString(s: string): Date`
- `prevDay(date: string): string` — subtract 1 calendar day
- `nextDay(date: string): string` — add 1 calendar day
- `todayString(): string` — today as `'YYYY-MM-DD'`
- `isToday(date: string): boolean`
- `formatDisplay(date: string): string` → e.g. `"Monday, June 7, 2026"`
- `formatDayOfWeek(date: string): string` → e.g. `"Monday"`
- `formatShort(date: string): string` → e.g. `"Jun 7"`
- `getMondayOfWeek(date: string): string` — returns the Monday of that week
- `getWeekDays(weekStart: string): string[]` — returns Mon–Fri as date strings
- `calculateStreak(entryDates: string[]): number`
  - Counts consecutive **weekdays** (Mon–Fri) working backward from today
  - If today has no entry, start counting from yesterday
  - Saturday/Sunday are skipped — they never break the streak

---

### `src/components/date-nav.tsx`

`'use client'` component. Props: `{ date: string; streak: number }`.

Renders:

```
[← Jun 6]    Monday · June 7, 2026    [Jun 8 →]
              🔥 Streak: 12 weekdays
```

- Left arrow: navigates to `prevDay(date)` via `router.push`
- Right arrow: navigates to `nextDay(date)`; **disabled and greyed out** when `date === todayString()`
- Clicking the date string (e.g. "June 7, 2026") opens a mini calendar picker modal
- "→ Today" button: appears only when `date !== todayString()`; navigates to `/today`
- Keyboard: Left arrow → prev day, Right arrow → next day (when focus not in a text input)

**Calendar picker modal:**
- Shows a month grid (current month of the `date` prop)
- Prev/Next month arrows
- Clicking a date cell navigates to `/entries/[date]`; closes modal
- Future dates are disabled (greyed, not clickable)
- Press Escape to close
- Rendered as a positioned dropdown below the date string

---

### Update `src/app/entries/[date]/page.tsx`

- Import and calculate streak: call `getAllEntryDates()` from db, then `calculateStreak(dates)`
- Render `<DateNav date={date} streak={streak} />` above the editor
- Render a subtle amber banner when `date !== todayString()`:
  ```
  Viewing [formatted date] · not today's entry
  ```
- Update browser tab title: `"Journal — Monday, June 7"`
  (use `export const metadata` or dynamic metadata via `generateMetadata`)

---

## Rules

- `router.push` from `next/navigation` for client-side navigation
- All date arithmetic via `date-fns` — no manual millisecond math
- The calendar picker is a plain Tailwind-styled div, no external date picker library
- `'use client'` only on components that use hooks or browser events

---

## After Completing This Feature

Update `tracker.md`: mark all Feature 3 rows as ✅ Done.
