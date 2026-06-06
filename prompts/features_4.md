# Feature 4 — Carry-over Banner

## Context

Project: `Daily_Journal` — Next.js 16 App Router, TypeScript, Tailwind CSS.

Features 1–3 are complete. `GET /api/entries/[date]` already returns a `carryOver: string[]` field (unchecked tasks from the previous day, minus skipped ones). `POST /api/carryover/skip` exists. You are implementing Feature 4 only.

---

## Your Task

---

### `src/app/api/carryover/skip/route.ts`

`POST /api/carryover/skip`
- Body: `{ taskText: string }`
- Calls `skipTask(taskText)` from db
- Returns `{ ok: true }`

(This file may already exist as a placeholder — fill it in.)

---

### `src/components/carryover-banner.tsx`

`'use client'` component.

Props:
```ts
{
  tasks: string[];          // carry-over task texts
  onAdd: (task: string) => void;    // appends task to editor content
  onAddAll: (tasks: string[]) => void;
}
```

Behaviour:
- If `tasks.length === 0`: render nothing (hidden entirely)
- If all yesterday's tasks were already checked (handled by parent — tasks array will be empty): render nothing
- Renders a bordered card above the editor:

```
┌─ Yesterday's unfinished tasks ──────────────────┐
│  finish PR review       [+ Add]  [✕ Skip]       │
│  update design doc      [+ Add]  [✕ Skip]       │
│                  [Add all]  [Skip all]           │
└─────────────────────────────────────────────────┘
```

**Per-task [+ Add]:**
- Calls `onAdd(task)` — parent appends `- [ ] {task}\n` to editor content
- Removes the task from the banner's local state (it's been handled)

**Per-task [✕ Skip]:**
- Calls `POST /api/carryover/skip` with `{ taskText: task }`
- Removes the task from local state

**[Add all]:**
- Calls `onAddAll(tasks)` for all remaining tasks
- Clears the banner

**[Skip all]:**
- Calls `POST /api/carryover/skip` for each remaining task (parallel `fetch`)
- Clears the banner

After all tasks are handled (added or skipped), the banner disappears.

---

### Update `src/app/entries/[date]/page.tsx`

- The page already fetches the entry. Now also read `carryOver` from the API response.
- Pass `carryOver` tasks down to the editor area.
- Wire `<CarryoverBanner>` above the editor:
  - `onAdd`: appends `- [ ] {task}\n` to the editor's content state
  - `onAddAll`: appends all tasks at once

Because the page is a Server Component and the editor is a Client Component, pass `carryOver` as a prop to a client wrapper component that manages editor state and renders both the banner and the editor.

---

## Rules

- No library for the banner UI — plain Tailwind
- Skip API calls are fire-and-forget (no loading state needed for individual skips)
- The banner uses local React state for which tasks are still showing; it does not re-fetch
- `onAdd` / `onAddAll` must update the editor's controlled `content` state so the auto-save picks it up

---

## After Completing This Feature

Update `tracker.md`: mark all Feature 4 rows as ✅ Done.
