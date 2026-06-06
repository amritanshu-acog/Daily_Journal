# Feature 2 — Layout + Editor

## Context

Project: `Daily_Journal` — Next.js 16 App Router, TypeScript, Tailwind CSS, SQLite, Gemini AI.

Feature 1 (Database + Core API) is complete. `GET` and `PUT /api/entries/[date]` work. You are implementing Feature 2 only.

---

## Your Task

Write complete code for the following files:

---

### `src/app/layout.tsx`

- Root layout wrapping all pages
- Sets `<html>` with `suppressHydrationWarning`
- Dark mode via `next-themes` — wrap children in `<ThemeProvider attribute="class">` from `next-themes`; no manual localStorage needed
- Imports global CSS (`globals.css`)
- Renders `<Header />` + `<Sidebar />` + `{children}` in a two-column layout:
  - Sidebar: fixed width ~260px, left
  - Main: takes remaining space, right

---

### `src/components/layout/header.tsx`

- Left: text "Daily Journal" (bold)
- Right:
  - Dark/light mode toggle button (☀️ / 🌙) — use `useTheme()` from `next-themes`; call `setTheme` to toggle between `"light"` and `"dark"`
  - `?` help button — clicking it fires a `CustomEvent('open-shortcuts')` on `window` (the shortcuts panel listens for this in Feature 10)
- Fully responsive, no broken layout on narrow screens

---

### `src/components/layout/sidebar.tsx`

- Shell component
- Renders two placeholder `<div>` sections for now:
  - "Heatmap goes here" (replaced in Feature 5)
  - "Tags go here" (replaced in Feature 5)
- Sidebar link: "→ This week's digest" — links to `/weekly/[today's date]`

---

### `src/components/editor/editor.tsx`

A controlled React component. Props: `{ date: string; initialContent: string }`.

Behaviour:
- Manages `content` state (initialised from `initialContent`)
- Renders `<Toolbar />` above the textarea
- Renders the `<textarea>` with:
  - Placeholder text (shown only when content is empty):
    ```
    What did you work on today?

    - [ ] Add a todo like this
    - [x] Check off a completed task like this
    Tag a project with a hashtag: #project-name

    Or just write freely — notes, decisions, blockers, wins.
    ```
  - Word count bottom-right (muted text, updates live)
  - Full height, resizable vertically
- Renders `<SaveIndicator />` below the textarea
- Auto-save: 1.5 s debounce after any content change → `PUT /api/entries/[date]`
- Preview mode toggle: when active, renders content via `react-markdown` with `remark-gfm` instead of textarea

---

### `src/components/editor/toolbar.tsx`

Props: `{ content: string; onChange: (v: string) => void; onTogglePreview: () => void; isPreview: boolean }`

Seven buttons. Each wraps selected text or inserts at cursor. Use a ref to the textarea (passed via `forwardRef` or context).

| Button | Inserts | Shortcut |
|--------|---------|----------|
| **B** | `**text**` | Ctrl+B |
| **I** | `_text_` | Ctrl+I |
| **`** | `` `text` `` | Ctrl+` |
| **☑ Task** | `- [ ] ` | Ctrl+Shift+C |
| **— Rule** | `\n---\n` | — |
| **⏱ Time** | `**[HH:MM AM/PM]**` | Ctrl+Shift+T |
| **👁 Preview** | Toggle preview mode | Ctrl+/ |

Implement keyboard shortcuts by attaching a `keydown` listener in the editor component.

---

### `src/components/editor/save-indicator.tsx`

Props: `{ status: 'idle' | 'saving' | 'saved' | 'retrying' | 'error' }`

| Status | Dot colour | Text |
|--------|-----------|------|
| idle | grey | — |
| saving | amber | "Saving…" |
| saved | green | "Saved just now" → after 3 s fades to "Saved 2 min ago" |
| retrying | amber | "Retrying…" |
| error | red | "Save failed — check your connection" |

---

### `src/app/today/page.tsx`

- Server component that computes today's date as `YYYY-MM-DD`
- Redirects to `/entries/[today]` using Next.js `redirect()`

---

### `src/app/entries/[date]/page.tsx`

- Server component
- Fetches entry via `getEntry(date)` from db
- Passes `initialContent` and `date` to `<Editor />`
- Renders the full page layout: date nav placeholder (Feature 3), carry-over placeholder (Feature 4), editor, summary placeholder (Feature 6)

---

## Rules

- All components use `'use client'` where they need state or browser APIs
- Tailwind only for styling; dark mode classes: `dark:bg-gray-900` etc.
- No inline styles
- No hard-coded dates — always derive from JS `Date` or from `date-fns`

---

## After Completing This Feature

Update `tracker.md`: mark all Feature 2 rows as ✅ Done.