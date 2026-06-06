# Feature 5 — Calendar Heatmap + Tags

## Context

Project: `Daily_Journal` — Next.js 16 App Router, TypeScript, Tailwind CSS.

Features 1–4 are complete. `GET /api/entries` returns `{ dates: { date, hasSummary, tags }[] }`. `GET /api/tags` returns `{ tag, count }[]`. You are implementing Feature 5 only.

---

## Your Task

---

### `src/app/api/tags/route.ts`

`GET /api/tags`
- Calls `getAllTags()` from db
- Returns `{ tags: { tag: string; count: number }[] }`

---

### `src/components/sidebar/calendar-heatmap.tsx`

`'use client'` component.

Props:
```ts
{
  entries: { date: string; hasSummary: boolean; tags: string[] }[];
  activeTags: string[];   // currently selected tag filters
}
```

**Grid layout:**
- Default: last 3 months of days (from today backward)
- Toggle button: "Last 3 months" / "This year" — switches range
- Days arranged in columns by week (Mon top, Sun bottom — standard heatmap layout)
- Month labels above columns

**Cell appearance per day:**
- No entry: very dim square (e.g. `bg-gray-100 dark:bg-gray-800`)
- Has entry, no summary: medium intensity (e.g. `bg-green-300 dark:bg-green-700`)
- Has entry + summary: full intensity (e.g. `bg-green-500 dark:bg-green-500`)
- Weekend days (Sat/Sun): rendered at 70% opacity to indicate lower expectation
- Today: thin ring/border `ring-2 ring-blue-400`
- Filtered out by active tag: dimmed to near-invisible

**Interactions:**
- Hover: show tooltip `"June 7 · summary generated"` or `"June 7 · notes only"` or `"June 7 · no entry"`
- Click: `router.push('/entries/[date]')`

**Streak counter below the grid:**
- "🔥 12-day streak" (weekdays only)
- "Start your streak today" if streak is 0

---

### `src/components/sidebar/tag-filter.tsx`

`'use client'` component.

Props:
```ts
{
  tags: { tag: string; count: number }[];
  activeTags: string[];
  onToggle: (tag: string) => void;
}
```

- Renders pill buttons: `#work ×12`, `#client ×7`, etc.
- Active tag: highlighted (e.g. `bg-blue-100 dark:bg-blue-900`)
- Clicking a tag calls `onToggle(tag)`
- Multiple active tags = AND filter (heatmap dims non-matching days)
- Clicking an active tag deselects it

---

### `src/components/layout/sidebar.tsx` — Update

Replace the placeholder sections with:
- `<CalendarHeatmap>` — pass entries + activeTags
- `<TagFilter>` — pass tags + activeTags + onToggle handler
- Manage `activeTags: string[]` state in the sidebar
- Sidebar link: "→ This week's digest" linking to `/weekly/[today]`

The sidebar fetches data client-side on mount:
- `GET /api/entries` → entries for heatmap
- `GET /api/tags` → tags for filter

---

### `src/components/editor/tag-autocomplete.tsx`

`'use client'` component.

Props:
```ts
{
  existingTags: string[];
  onSelect: (tag: string) => void;
}
```

Behaviour:
- The editor detects when the user types `#` and shows this dropdown
- Filters `existingTags` by what comes after the `#` as the user continues typing
- Arrow keys navigate the list; Enter selects; Escape closes
- Selecting a tag replaces the partial `#word` in the textarea with `#selectedtag`
- First ever `#` typed: show a one-time tooltip `"Tagging a project — it'll appear in your sidebar."` (stored in `localStorage` to never show again)

Wire into `editor.tsx`: detect `#` on keypress, position the dropdown below the cursor.

---

## Rules

- No external chart/heatmap library — build the grid with CSS Grid or Flexbox + Tailwind
- Tooltip is a plain absolutely-positioned `div`, no library
- Tag filter state lives in sidebar; passed down to heatmap as prop
- Fetch data client-side in sidebar with `useEffect` + `fetch`

---

## After Completing This Feature

Update `tracker.md`: mark all Feature 5 rows as ✅ Done.
