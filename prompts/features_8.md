# Feature 8 — Mid-day Check-in

## Context

Project: `Daily_Journal` — Next.js 16, TypeScript, Tailwind v4, Vercel AI SDK.

Features 1–7 are complete. `src/lib/ai.ts` has `generate()` and `PROMPTS.checkin`. You are implementing Feature 8 only.

---

## Your Task

---

### `src/app/api/entries/[date]/checkin/route.ts`

`POST /api/entries/[date]/checkin`
- No request body needed — uses the current entry content
- Fetch entry content from db
- If content is empty or < 20 words: return `{ error: 'Not enough content' }` with status 400
- Call `generate(buildPrompt('checkin', content))`
- Save result via `updateCheckin(date, result)`
- Return `{ checkin: result }`
- On error: return `{ error: 'Generation failed' }` with status 500

---

### `src/components/checkin-section.tsx`

`'use client'` component.

Props:
```ts
{
  date: string;
  initialCheckin: string | null;
}
```

**Button states:**

| State | Button label |
|-------|-------------|
| No checkin yet | "☀️ Mid-day Check-in" |
| After first use | "↺ Refresh Check-in" |
| Loading | "Checking in…" + spinner; button disabled |
| Error | Button reverts; inline: "Check-in failed — [Retry]" |

**On button click:**
1. Set loading state
2. `POST /api/entries/[date]/checkin`
3. On success: set `checkin` state; expand the result card
4. On failure: show inline error

**Result card (collapsible):**
- Collapsed by default if `initialCheckin` is null; expanded after generation
- Header: "Today's priorities" with a `▾` / `▸` toggle
- Body: render checkin text via `react-markdown`
- If `initialCheckin` is not null on mount: card is expanded automatically

**Placement:**
- Sits between the editor and the summary section divider
- Always visible (button always shown; card appears after first use)

---

### Update `src/app/entries/[date]/page.tsx`

- Pass `initialCheckin` from the db entry to `<CheckinSection>`

---

## Rules

- Checkin is completely independent from the summary — different field, different API route
- Collapsible card uses local `isOpen: boolean` state
- `react-markdown` for rendering the checkin result
- Same spinner style as the summary generate button

---

## After Completing This Feature

Update `tracker.md`: mark all Feature 8 rows as ✅ Done.