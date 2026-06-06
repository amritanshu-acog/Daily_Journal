import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_PATH = "data/journal.db";

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    date           TEXT NOT NULL UNIQUE,
    content        TEXT NOT NULL DEFAULT '',
    summary        TEXT DEFAULT NULL,
    summary_format TEXT DEFAULT NULL,
    checkin        TEXT DEFAULT NULL,
    created        TEXT NOT NULL DEFAULT (datetime('now')),
    updated        TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tags (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    tag  TEXT NOT NULL,
    FOREIGN KEY (date) REFERENCES entries(date) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_tags_tag  ON tags(tag);
  CREATE INDEX IF NOT EXISTS idx_tags_date ON tags(date);

  CREATE TABLE IF NOT EXISTS weekly_digests (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    week_start TEXT NOT NULL UNIQUE,
    content    TEXT NOT NULL,
    created    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS skipped_carryover (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    task_text  TEXT NOT NULL,
    skipped_on TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export interface EntryRow {
  id: number;
  date: string;
  content: string;
  summary: string | null;
  summary_format: string | null;
  checkin: string | null;
  created: string;
  updated: string;
}

export interface DigestRow {
  id: number;
  week_start: string;
  content: string;
  created: string;
}

const getEntryStmt = db.prepare("SELECT * FROM entries WHERE date = ?");
const upsertEntryStmt = db.prepare(
  `INSERT INTO entries (date, content, updated)
   VALUES (?, ?, datetime('now'))
   ON CONFLICT(date) DO UPDATE SET content = excluded.content, updated = datetime('now')`
);
const updateSummaryStmt = db.prepare(
  `UPDATE entries SET summary = ?, summary_format = ?, updated = datetime('now') WHERE date = ?`
);
const updateCheckinStmt = db.prepare(
  `UPDATE entries SET checkin = ?, updated = datetime('now') WHERE date = ?`
);
const getAllEntryDatesStmt = db.prepare(
  "SELECT date, summary IS NOT NULL AS hasSummary FROM entries ORDER BY date DESC"
);
const getTagsForDateStmt = db.prepare("SELECT tag FROM tags WHERE date = ? ORDER BY tag");
const deleteTagsStmt = db.prepare("DELETE FROM tags WHERE date = ?");
const insertTagStmt = db.prepare("INSERT INTO tags (date, tag) VALUES (?, ?)");
const getAllTagsStmt = db.prepare("SELECT tag, COUNT(*) AS count FROM tags GROUP BY tag ORDER BY count DESC");
const getSkippedTasksStmt = db.prepare("SELECT task_text FROM skipped_carryover");
const skipTaskStmt = db.prepare("INSERT INTO skipped_carryover (task_text) VALUES (?)");
const getWeeklyDigestStmt = db.prepare("SELECT * FROM weekly_digests WHERE week_start = ?");
const upsertWeeklyDigestStmt = db.prepare(
  `INSERT INTO weekly_digests (week_start, content)
   VALUES (?, ?)
   ON CONFLICT(week_start) DO UPDATE SET content = excluded.content`
);
const getEntriesForWeekStmt = db.prepare(
  `SELECT * FROM entries WHERE date >= ? AND date < ? ORDER BY date`
);

export function getEntry(date: string): EntryRow | undefined {
  return getEntryStmt.get(date) as EntryRow | undefined;
}

export function upsertEntry(date: string, content: string): void {
  upsertEntryStmt.run(date, content);
}

export function updateSummary(date: string, summary: string, format: string): void {
  updateSummaryStmt.run(summary, format, date);
}

export function updateCheckin(date: string, checkin: string): void {
  updateCheckinStmt.run(checkin, date);
}

export function getAllEntryDates(): { date: string; hasSummary: boolean }[] {
  return getAllEntryDatesStmt.all() as { date: string; hasSummary: boolean }[];
}

export function getTagsForDate(date: string): string[] {
  const rows = getTagsForDateStmt.all(date) as { tag: string }[];
  return rows.map((r) => r.tag);
}

export function rebuildTags(date: string, tags: string[]): void {
  const tx = db.transaction(() => {
    deleteTagsStmt.run(date);
    for (const tag of tags) {
      insertTagStmt.run(date, tag);
    }
  });
  tx();
}

export function getAllTags(): { tag: string; count: number }[] {
  return getAllTagsStmt.all() as { tag: string; count: number }[];
}

export function getSkippedTasks(): string[] {
  const rows = getSkippedTasksStmt.all() as { task_text: string }[];
  return rows.map((r) => r.task_text);
}

export function skipTask(taskText: string): void {
  skipTaskStmt.run(taskText);
}

export function getWeeklyDigest(weekStart: string): DigestRow | undefined {
  return getWeeklyDigestStmt.get(weekStart) as DigestRow | undefined;
}

export function upsertWeeklyDigest(weekStart: string, content: string): void {
  upsertWeeklyDigestStmt.run(weekStart, content);
}

export function getEntriesForWeek(weekStart: string): EntryRow[] {
  const nextWeek = getNextWeekStart(weekStart);
  return getEntriesForWeekStmt.all(weekStart, nextWeek) as EntryRow[];
}

function getNextWeekStart(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 7);
  return d.toISOString().slice(0, 10);
}
