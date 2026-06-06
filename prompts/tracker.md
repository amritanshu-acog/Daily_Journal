# Daily_Journal — Feature Tracker

> Update this file at the end of every feature session.
> Status: ⬜ Not started | 🔄 In progress | ✅ Done

---

## Setup

| Task | Status | Notes |
|------|--------|-------|
| Scaffold Next.js 16 + Tailwind | ✅ | Next.js 16 + Tailwind v4 with bun |
| Install all packages | ✅ | better-sqlite3, react-markdown, AI SDK, date-fns, next-themes |
| Create folder + file structure | ✅ | All dirs, pages, API routes, lib, components created |
| `.env.local` with Gemini key | ✅ | Placeholder file created |

---

## Feature 1 — Database + Core API

| Task | Status | Notes |
|------|--------|-------|
| `src/lib/db.ts` — SQLite init + all 4 tables | ✅ Done | |
| `GET /api/entries/[date]` — fetch entry | ✅ Done | |
| `PUT /api/entries/[date]` — upsert + tag parse | ✅ Done | |
| `GET /api/entries` — all dates + tags | ✅ Done | |
| `src/lib/markdown.ts` — tag extractor | ✅ Done | |

---

## Feature 2 — Layout + Editor

| Task | Status | Notes |
|------|--------|-------|
| `src/app/layout.tsx` — root layout, dark mode class | ✅ Done | |
| `header.tsx` — app name, dark/light toggle, ? button | ✅ Done | |
| `sidebar.tsx` — shell (heatmap + tags placeholder) | ✅ Done | |
| `editor.tsx` — textarea + placeholder text + word count | ✅ Done | |
| `toolbar.tsx` — 7 buttons (B/I/`/Task/Rule/Time/Preview) | ✅ Done | |
| `save-indicator.tsx` — dot + status text | ✅ Done | |
| Auto-save (1.5s debounce → PUT API) | ✅ Done | |
| `src/app/today/page.tsx` — wires layout + editor | ✅ Done | |

---

## Feature 3 — Date Navigation + Streak

| Task | Status | Notes |
|------|--------|-------|
| `src/lib/dates.ts` — weekday-only streak calc | ✅ Done | |
| `date-nav.tsx` — prev/next arrows, Today button | ✅ Done | |
| Date picker modal (click on date string) | ✅ Done | |
| `src/app/entries/[date]/page.tsx` — entry page | ✅ Done | |
| Keyboard Left/Right for date navigation | ✅ Done | |
| Disable Next arrow on today | ✅ Done | |
| Past entry amber banner | ✅ Done | |
| Browser tab title per date | ✅ Done | |

---

## Feature 4 — Carry-over Banner

| Task | Status | Notes |
|------|--------|-------|
| Carry-over extraction logic in `GET /api/entries/[date]` | ✅ Done | |
| `POST /api/carryover/skip` — permanent skip | ✅ Done | |
| `carryover-banner.tsx` — per-task Add / Skip | ✅ Done | |
| Add All / Skip All buttons | ✅ Done | |
| "All done yesterday 🎉" state | ✅ Done | |
| Hidden when no carry-over tasks | ✅ Done | |

---

## Feature 5 — Calendar Heatmap + Tags

| Task | Status | Notes |
|------|--------|-------|
| `GET /api/tags` — all tags + counts | ✅ Done | |
| `calendar-heatmap.tsx` — 3-month grid, intensity levels | ✅ Done | |
| Today ring, hover tooltip, click-to-navigate | ✅ Done | |
| Weekends lighter shade | ✅ Done | |
| Toggle: last 3 months / this year | ✅ Done | |
| Streak counter below heatmap | ✅ Done | |
| `tag-filter.tsx` — tag chips in sidebar | ✅ Done | |
| Tag filter dims non-matching days (AND logic) | ✅ Done | |
| `tag-autocomplete.tsx` — # dropdown in editor | ✅ Done | |

---

## Feature 6 — Summary Section

| Task | Status | Notes |
|------|--------|-------|
| `src/lib/ai.ts` — Gemini client + all 5 prompts | ✅ Done | |
| `POST /api/entries/[date]/summary` — generate + save | ✅ Done | |
| `summary-section.tsx` — 3 format tabs + descriptions | ✅ Done | |
| Generate button all states (disabled/ready/generating/done/failed) | ✅ Done | |
| Auto-scroll to summary after generation | ✅ Done | |
| `react-markdown` render of summary | ✅ Done | |
| ✏ Edit mode for summary (textarea on click, save on blur) | ✅ Done | |
| ↺ Regenerate always available | ✅ Done | |

---

## Feature 7 — Copy Toolbar + EOD Nudge

| Task | Status | Notes |
|------|--------|-------|
| `copy-toolbar.tsx` — 📋 Copy (plain), Slack, ✉ Email | ✅ Done | |
| Success flash feedback (1.5 s) on all 3 buttons | ✅ Done | |
| Slack markdown formatter | ✅ Done | |
| `mailto:` builder with subject + body | ✅ Done | |
| `eod-nudge.tsx` — after 4 PM, ≥50 words, no summary | ✅ Done | |

---

## Feature 8 — Mid-day Check-in

| Task | Status | Notes |
|------|--------|-------|
| `POST /api/entries/[date]/checkin` — Gemini call + save | ✅ Done | |
| `checkin-section.tsx` — button + collapsible result card | ✅ Done | |
| Button relabels to ↺ Refresh after first use | ✅ Done | |

---

## Feature 9 — Weekly Digest

| Task | Status | Notes |
|------|--------|-------|
| `GET /api/weekly/[date]` — fetch digest | ✅ Done | |
| `POST /api/weekly/[date]` — generate + save | ✅ Done | |
| `src/app/weekly/[date]/page.tsx` — weekly page | ✅ Done | |
| `weekly-digest.tsx` — day pills + generate + copy | ✅ Done | |
| Disable generate if < 2 entries | ✅ Done | |
| Prev/Next week navigation | ✅ Done | |
| Sidebar link "→ This week's digest" | ✅ Done | |

---

## Feature 10 — Empty + Error States + Keyboard Shortcuts

| Task | Status | Notes |
|------|--------|-------|
| All empty states (per State Reference table) | ✅ Done | |
| All error states (per State Reference table) | ✅ Done | |
| Offline detection banner | ✅ Done | |
| `shortcuts-panel.tsx` — all shortcuts listed | ✅ Done | |
| All keyboard shortcuts functional | ✅ Done | |
| T key → today, Escape → close panels | ✅ Done | |

---

## Feature 11 — Polish

| Task | Status | Notes |
|------|--------|-------|
| Welcome banner (one-time, dismissable) | ✅ Done | |
| Skeleton loaders (textarea, summary, heatmap) | ✅ Done | |
| Tag autocomplete first-use tooltip | ✅ Done | |
| `src/app/page.tsx` → redirect to `/today` | ✅ Done | |
| Dark mode polish across all components | ✅ Done | |
| Mobile-safe layout (no breakage on small screens) | ✅ Done | |

---

## ✅ v1 Complete
All features implemented and polished.

_Last updated: setup complete_
