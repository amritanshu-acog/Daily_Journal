# Feature 9 — Weekly Digest

## Context

Project: `Daily_Journal` — Next.js 16, TypeScript, Tailwind v4, Vercel AI SDK.

Features 1–8 are complete. `src/lib/ai.ts` has `generate()` and `PROMPTS.weekly`. `src/lib/dates.ts` has `getMondayOfWeek` and `getWeekDays`. You are implementing Feature 9 only.

---

## Your Task

---

### `src/app/api/weekly/[date]/route.ts`

`GET /api/weekly/[date]`
- `date` is any date within the target week (pass Monday's date from the page)
- Compute `weekStart = getMondayOfWeek(date)`
- Fetch `getWeeklyDigest(weekStart)` from db
- Fetch entry dates for that week (Mon–Fri)
- Return:
  ```ts
  {
    weekStart: string;
    digest: string | null;
    days: { date: string; hasEntry: boolean }[];
  }
  ```

`POST /api/weekly/[date]`
- Compute `weekStart`
- Get all entries for that week via `getEntriesForWeek(weekStart)`
- If fewer than 2 entries have content: return `{ error: 'Not enough entries' }` status 400
- Combine all entry contents: `entries.map(e => \`=== ${e.date} ===\n${e.content}\`).join('\n\n')`
- Call `generate(buildPrompt('weekly', combined))`
- Save via `upsertWeeklyDigest(weekStart, result)`
- Return `{ digest: result }`

---

### `src/app/weekly/[date]/page.tsx`

Server component.
- Compute `weekStart = getMondayOfWeek(date)`
- Fetch weekly data from db directly (or via the API route)
- Pass data to `<WeeklyDigest>`
- Page title: `"Week of June 2 – June 6, 2026"`

---

### `src/components/weekly-digest.tsx`

`'use client'` component.

Props:
```ts
{
  weekStart: string;
  initialDigest: string | null;
  days: { date: string; hasEntry: boolean }[];
}
```

**Page header:**
- "Week of June 2 – June 6, 2026" (formatted from `weekStart`)
- Day contribution pills:
  ```
  Mon ✓   Tue ✓   Wed —   Thu ✓   Fri ✓
  ```

**Generate button:**

| State | Appearance |
|-------|-----------|
| < 2 entries | Disabled; tooltip: "Write at least 2 days this week to generate a digest" |
| Ready | "✨ Generate Weekly Digest" |
| Generating | "Generating…" + spinner |
| Done | "↺ Regenerate" |
| Error | Inline: "Generation failed — [Retry]" |

On success: auto-scroll to digest, render via `react-markdown`.

**Copy toolbar:**
- Reuse `<CopyToolbar>` from Feature 7
- Pass digest as `summary` prop; format as `'weekly'`

**Navigation:**
- "← Previous week" links to `/weekly/[prevMonday]`
- "Next week →" links to `/weekly/[nextMonday]`; disabled if `nextMonday > todayString()`

---

### Update `src/components/layout/sidebar.tsx`

The "→ This week's digest" link must point to `/weekly/[mondayOfThisWeek]`.

---

## Rules

- Week always Mon–Fri; weekends not shown in day pills
- `date-fns` for all date math
- Reuse `<CopyToolbar>` exactly — no duplication
- The page route `/weekly/[date]` always normalises to Monday

---

## After Completing This Feature

Update `tracker.md`: mark all Feature 9 rows as ✅ Done.