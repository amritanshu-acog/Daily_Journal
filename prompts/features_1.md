# Feature 1 — Database + Core API

## Context

Project: `Daily_Journal` — a single-user daily work journal built with Next.js 16 (App Router), TypeScript, Tailwind CSS, SQLite via `better-sqlite3`, and Gemini AI.

The project has been scaffolded. All folders and placeholder files exist. You are implementing Feature 1 only.

---

## Your Task

Write the complete code for the following files:

### `src/lib/db.ts`

- Import and initialise `better-sqlite3` pointing to `data/journal.db`
- Create all 4 tables on first run (if not exists):

```sql
CREATE TABLE entries (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  date           TEXT NOT NULL UNIQUE,
  content        TEXT NOT NULL DEFAULT '',
  summary        TEXT DEFAULT NULL,
  summary_format TEXT DEFAULT NULL,
  checkin        TEXT DEFAULT NULL,
  created        TEXT NOT NULL DEFAULT (datetime('now')),
  updated        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE tags (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  tag  TEXT NOT NULL,
  FOREIGN KEY (date) REFERENCES entries(date) ON DELETE CASCADE
);
CREATE INDEX idx_tags_tag  ON tags(tag);
CREATE INDEX idx_tags_date ON tags(date);

CREATE TABLE weekly_digests (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  week_start TEXT NOT NULL UNIQUE,
  content    TEXT NOT NULL,
  created    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE skipped_carryover (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  task_text  TEXT NOT NULL,
  skipped_on TEXT NOT NULL DEFAULT (datetime('now'))
);
```

- Export typed query helpers:
  - `getEntry(date: string)` → entry row or undefined
  - `upsertEntry(date: string, content: string)` → void
  - `updateSummary(date: string, summary: string, format: string)` → void
  - `updateCheckin(date: string, checkin: string)` → void
  - `getAllEntryDates()` → `{ date: string; hasSummary: boolean }[]`
  - `getTagsForDate(date: string)` → `string[]`
  - `rebuildTags(date: string, tags: string[])` → void (delete + insert)
  - `getAllTags()` → `{ tag: string; count: number }[]`
  - `getSkippedTasks()` → `string[]`
  - `skipTask(taskText: string)` → void
  - `getWeeklyDigest(weekStart: string)` → digest row or undefined
  - `upsertWeeklyDigest(weekStart: string, content: string)` → void
  - `getEntriesForWeek(weekStart: string)` → entry rows array (Mon–Fri)

---

### `src/lib/markdown.ts`

- `extractTags(content: string): string[]` — regex `/#+([a-zA-Z0-9_-]+)/g`, returns unique lowercase tags
- `extractUncheckedTasks(content: string): string[]` — finds all `- [ ] text` lines, returns the text part only

---

### `src/app/api/entries/route.ts`

`GET /api/entries`
- Returns `{ dates: { date, hasSummary, tags }[] }`
- Used by the heatmap and sidebar

---

### `src/app/api/entries/[date]/route.ts`

`GET /api/entries/[date]`
- Fetch entry for `date`
- Fetch previous calendar day's entry; extract unchecked tasks; remove any in `skipped_carryover`
- Return `{ entry, carryOver: string[] }`

`PUT /api/entries/[date]`
- Body: `{ content: string }`
- Upsert the entry
- Extract tags from content → `rebuildTags`
- Return `{ ok: true }`

---

## Rules

- Use Next.js 16 App Router conventions (`route.ts` with exported `GET`, `PUT`, `POST` functions)
- All responses use `NextResponse.json(...)`
- `better-sqlite3` is synchronous — no async/await needed for DB calls
- The `data/` folder must exist before DB init; create it with `fs.mkdirSync` if missing
- No UI code in this feature — pure backend only

---

## After Completing This Feature

Update `tracker.md`: mark all Feature 1 rows as ✅ Done.
