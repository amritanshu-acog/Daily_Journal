# Feature 7 — Copy Toolbar + EOD Nudge

## Context

Project: `Daily_Journal` — Next.js 16 App Router, TypeScript, Tailwind CSS.

Features 1–6 are complete. The summary section generates and renders AI summaries. You are implementing Feature 7 only.

---

## Your Task

---

### `src/components/summary/copy-toolbar.tsx`

`'use client'` component.

Props:
```ts
{
  summary: string;      // raw markdown summary text
  date: string;         // for email subject line
  format: string;       // e.g. 'standup' — for email subject
}
```

Rendered below the summary card, only when a summary exists.

**Three buttons:**

#### 📋 Copy

- Copies `summary` as plain text to clipboard (`navigator.clipboard.writeText`)
- Strip markdown: remove `**`, `_`, `` ` ``, `#` prefixes — plain readable text
- Feedback: button text changes to `"✓ Copied!"` for 1.5 s, then reverts

#### Slack

- Copies Slack-flavoured markdown to clipboard:
  - `**text**` → `*text*` (bold)
  - `_text_` → `_text_` (italic — same)
  - `` `text` `` → `` `text` `` (same)
  - `## Heading` → `*Heading*` (bold)
  - `- [ ] task` → `☐ task`
  - `- [x] task` → `☑ task`
  - Emoji bullets pass through unchanged
- Feedback: `"✓ Copied for Slack!"` for 1.5 s

#### ✉ Email

- Opens `mailto:` link with:
  - `subject`: `"Daily Update — June 7, 2026"` (formatted from `date` prop)
  - `body`: plain text version of summary (same stripping as 📋 Copy)
- Use `window.location.href = 'mailto:...'`
- No feedback state needed (opens email client)

---

### Helper functions (can live inside the component file or in `src/lib/markdown.ts`)

```ts
function toPlainText(markdown: string): string
function toSlackMarkdown(markdown: string): string
```

---

### Wire into summary section

In `summary-section.tsx`, render `<CopyToolbar>` below the summary card when a summary exists.

---

## Rules

- All clipboard operations wrapped in try/catch (clipboard API can fail in some browsers)
- On clipboard failure: show `"Copy failed"` for 1.5 s
- Each button manages its own feedback state independently
- No external clipboard library — native `navigator.clipboard` only
- Slack formatter is a series of `string.replace()` calls, no library

---

## After Completing This Feature

Update `tracker.md`: mark all Feature 7 rows as ✅ Done.
