# Daily Journal — User Guide

A complete walkthrough of every feature in the Daily Journal app.

---

## Table of Contents

1. [Getting Around](#1-getting-around)
2. [Writing a Journal Entry](#2-writing-a-journal-entry)
3. [Auto-Save & Save Indicator](#3-auto-save--save-indicator)
4. [Formatting with Markdown](#4-formatting-with-markdown)
5. [Live Preview](#5-live-preview)
6. [Tags](#6-tags)
7. [Task Carryover](#7-task-carryover)
8. [Mid-Day Check-in](#8-mid-day-check-in)
9. [AI Summary Generation](#9-ai-summary-generation)
10. [Copy & Export](#10-copy--export)
11. [End-of-Day Nudge](#11-end-of-day-nudge)
12. [Weekly Digest](#12-weekly-digest)
13. [Calendar Heatmap](#13-calendar-heatmap)
14. [Tag Filtering](#14-tag-filtering)
15. [Streak Tracking](#15-streak-tracking)
16. [Date Navigation](#16-date-navigation)
17. [Zen Mode](#17-zen-mode)
18. [Dark / Light Theme](#18-dark--light-theme)
19. [Keyboard Shortcuts](#19-keyboard-shortcuts)
20. [First-Time Welcome](#20-first-time-welcome)
21. [Offline Mode](#21-offline-mode)

---

## 1. Getting Around

The app has three main pages:

| Page | URL | What it does |
|------|-----|-------------|
| **Daily Entry** | `/entries/YYYY-MM-DD` | Your main journal page — write notes, check in, generate summaries |
| **Weekly Digest** | `/weekly/YYYY-MM-DD` | View and generate a weekly AI review |
| **Home** | `/` | Redirects to today's entry |

The **sidebar** (left side) shows your calendar heatmap and tags. The **header** has the theme toggle, keyboard shortcuts button, and app logo.

---

## 2. Writing a Journal Entry

Navigate to any date and start typing in the large textarea. The editor supports full Markdown syntax. Use it to:

- Note what you worked on
- List tasks with checkboxes (`- [ ]` and `- [x]`)
- Add `#tags` for organization
- Write code blocks, quotes, headings, etc.

The editor placeholder gives you a quick template to get started.

---

## 3. Auto-Save & Save Indicator

Every change is automatically saved **1.5 seconds after you stop typing**. No save button needed.

A status indicator in the editor footer shows:

| State | What it means |
|-------|---------------|
| *Idle* | Everything is saved |
| *Spinning icon* | Saving… |
| *"Saved just now"* | Just saved |
| *"Saved 2m ago"* | Saved 2 minutes ago |
| *Error icon* | Save failed — check your connection |

---

## 4. Formatting with Markdown

The toolbar gives you quick buttons for common formatting:

- **Bold** (`**text**`)
- **Italic** (`*text*`)
- **Inline Code** (`` `code` ``)
- **Task List** (`- [ ] task`)
- **Horizontal Rule** (`---`)
- **Insert Timestamp** (inserts the current time)
- **Toggle Preview** (switch between edit and rendered view)
- **Zen Mode** (distraction-free writing)

All formatting buttons have corresponding keyboard shortcuts (see [§19](#19-keyboard-shortcuts)).

---

## 5. Live Preview

Click the **Preview** button (or press `Ctrl+/`) to see your Markdown rendered in real time. Features:

- GitHub Flavored Markdown (tables, checkboxes, strikethrough, etc.)
- **Clickable checkboxes** — check off tasks directly in preview mode
- Clean typography with the Geist font

Click **Edit** or press `Ctrl+/` again to return to editing.

---

## 6. Tags

Tag any entry with `#project` or `#topic` notation.

- **Autocomplete** — As you type `#`, a dropdown shows existing tags from your journal
- **Keyboard navigable** — Use arrow keys and Enter to select a tag
- **Tags are stored** per entry and shown in the sidebar
- **Tag counts** show how many entries use each tag

Tags power the calendar heatmap filtering (see [§14](#14-tag-filtering)).

---

## 7. Task Carryover

One of the most powerful features: **unfinished tasks automatically follow you to the next day.**

When you visit today's entry and yesterday has unchecked tasks (`- [ ]`), a banner appears at the top showing each task. For each task you can:

- **+ Add** — Insert the task into today's editor
- **Skip** — Dismiss the task permanently (it won't reappear)

Use **Add all** or **Skip all** for bulk actions.

If yesterday had no unfinished tasks, you'll see a brief "All done yesterday" celebration banner.

> Skipped tasks are recorded in the database and will never be suggested again.

---

## 8. Mid-Day Check-in

The mid-day check-in generates an AI-prioritized list of your most important remaining tasks.

1. Click **"Generate Mid-Day Check-in"** below the editor
2. The AI analyzes your current notes and produces **3-5 priority tasks**
3. Use the **Refresh** button to regenerate

Requires at least **20 words** written in the entry.

---

## 9. AI Summary Generation

Turn your raw notes into polished summaries in three formats:

### Format options

| Format | Style | Best for |
|--------|-------|----------|
| **Standup** | Emoji-bulleted "Did / Doing / Blockers" | Daily team standups |
| **Manager Update** | Professional prose | Manager 1:1s or skip-level updates |
| **Reflection** | Conversational tone | Personal end-of-day journaling |

### How to generate

1. Write at least **30 words** in your entry
2. Select a format (Standup / Manager / Reflection)
3. Click **"Generate Summary"** (or press `Ctrl+Enter`)
4. The AI summary appears below with Markdown rendering

### After generation

- **Regenerate** — Get a fresh version
- **Edit** — Switch to a textarea to make manual changes (`Ctrl+Enter` to save, `Escape` to cancel)
- **Copy / Export** — See [§10](#10-copy--export)

---

## 10. Copy & Export

Every generated summary has an export toolbar with three options:

| Button | What it does |
|--------|-------------|
| **Copy** | Copies plain text (Markdown formatting stripped) |
| **Slack** | Copies Slack-friendly markdown (bold → `*bold*`, checkboxes → unicode symbols) |
| **Email** | Opens your default email client with the summary as the body |

Each button shows brief feedback — "Copied!" or "Failed" — so you know it worked.

---

## 11. End-of-Day Nudge

After **4 PM**, if you've written **50+ words** and haven't generated a summary yet, a gentle reminder appears:

> "It's after 4 PM — ready to wrap up?"

This only shows on today's entry. The hour check updates every 60 seconds.

---

## 12. Weekly Digest

The weekly digest aggregates all your entries from Monday to Friday into a single AI-generated review.

1. Navigate to the **Weekly Digest** page from the sidebar link
2. The page shows which days have entries (checkmark) and which don't (dash)
3. Click **"Generate Weekly Digest"** — requires at least **2 days** with 30+ words each
4. The AI produces a cohesive weekly summary
5. Use the **Copy Toolbar** to export
6. Navigate between weeks with **Previous / Next** week links

---

## 13. Calendar Heatmap

The sidebar contains a GitHub-style activity heatmap showing your journaling history.

- **Color coding:**
  - *No square* — No entry (or filtered out)
  - *Light green* — Entry exists, no summary
  - *Bright green* — Entry has a summary
- **View toggle** — Switch between "Last 3 months" and "This year"
- **Click a day** — Navigate directly to that day's entry
- **Hover** — Tooltip shows the date and entry status
- **Streak display** — Your current consecutive writing streak is shown above the heatmap

---

## 14. Tag Filtering

The **Tag Filter** section in the sidebar lists every tag used in your journal with its entry count.

- Click a tag to **filter** — the heatmap dims entries that don't match the tag
- Click again to **remove the filter**
- Select multiple tags to narrow further
- A hint appears if no tags exist yet

This makes it easy to see your writing patterns for specific projects or topics.

---

## 15. Streak Tracking

Your **current streak** is the number of consecutive weekdays (Mon–Fri) you've written an entry, counting backward from today. Weekends are skipped, so writing every weekday maintains your streak.

The streak is displayed in the date navigation bar and the sidebar heatmap. Miss a weekday and the streak resets.

---

## 16. Date Navigation

The date navigation bar at the top lets you move between entries:

| Control | Action |
|---------|--------|
| **◀ Previous Day** | Go back one day |
| **▶ Next Day** | Go forward one day |
| **Date text** | Click to open a **calendar picker** with a mini month view |
| **Today button** | Jump back to today (only shown when viewing a non-today date) |
| **Streak badge** | Shows your current streak count |

The calendar picker lets you navigate months and click any date. Future dates are disabled.

---

## 17. Zen Mode

Zen Mode provides a **distraction-free writing experience**:

- The sidebar collapses
- Check-in and summary sections collapse
- Only the editor remains visible

Toggle it via the toolbar button or by pressing the Zen Mode button. Exit by toggling it off.

---

## 18. Dark / Light Theme

Toggle between dark and light themes using the sun/moon icon in the header.

- Defaults to your **system preference**
- Your choice is **persisted** across sessions
- All components respect the active theme

---

## 19. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `` Ctrl+` `` | Inline code |
| `Ctrl+Shift+C` | Toggle task checkbox |
| `Ctrl+Shift+T` | Insert timestamp |
| `Ctrl+/` | Toggle edit/preview |
| `Ctrl+Enter` | Generate AI summary |
| `T` | Jump to today's entry |
| `?` | Open shortcuts panel |
| `Escape` | Close panel / cancel edit |

Press `?` at any time to see the full list in a modal.

---

## 20. First-Time Welcome

The first time you visit the app, a welcome banner appears explaining the core workflow:

1. Write notes throughout the day
2. Generate a summary when you're done
3. Unfinished tasks automatically carry to tomorrow

This banner is shown only once (tracked in localStorage). Dismiss it to start writing.

---

## 21. Offline Mode

If your internet connection drops, a banner appears at the top of the screen:

> "You are offline. Changes will sync when you reconnect."

Your edits are still auto-saved locally. When the connection returns, the banner disappears and data syncs normally.

---

## Tips & Best Practices

- **Write as you go** — Jot down notes throughout the day rather than all at once
- **Use tags consistently** — Tag entries by project (`#project-alpha`) or category (`#meeting`, `#learning`) for easy filtering later
- **Generate the standup summary** before your morning standup — it formats your notes into a ready-to-read format
- **Run a mid-day check-in** after lunch to re-prioritize your afternoon
- **Review the weekly digest** on Friday to capture accomplishments for your performance review
- **Don't skip two days in a row** — your streak resets and carryover stacks up
