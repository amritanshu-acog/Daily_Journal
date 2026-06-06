# Feature 10 — Empty + Error States + Keyboard Shortcuts

## Context

Project: `Daily_Journal` — Next.js 16 App Router, TypeScript, Tailwind CSS.

Features 1–9 are complete. You are implementing Feature 10 only — wiring up all defined states and shortcuts.

---

## Your Task

---

## Part A — Empty States

Implement every empty state from the spec. Go file by file:

### `src/app/entries/[date]/page.tsx`

- **Past date, no entry:** if `date < todayString()` and entry doesn't exist, render:
  `"No entry for this day."` — show no editor, no generate button

### `src/components/sidebar/calendar-heatmap.tsx`

- **No entry data at all:** render the grid skeleton but show text below:
  `"Your streak starts today"`

### `src/components/carryover-banner.tsx`

- Already hidden when `tasks.length === 0` ✓
- Add: when previous day had tasks but all were checked, show (briefly):
  `"All done yesterday 🎉"` — rendered where the banner would be, fades after 3 s

### Weekly Digest (already handled in Feature 9 with the < 2 entries guard) ✓

---

## Part B — Error States

### `src/components/editor/save-indicator.tsx`

Already handles `error` status ✓

### Offline detection — add to `src/app/layout.tsx`

- Listen for `window` `online` / `offline` events
- When offline: show a persistent top banner:
  `"You're offline. Changes will sync when you reconnect."`
- When back online: banner disappears
- This banner sits above the header, full width, amber background

### AI errors

Already handled inline in summary-section and checkin-section ✓

---

## Part C — Skeleton Loaders

Add skeleton loaders for the three loading states:

### `src/components/editor/editor.tsx`

- While `initialContent` is being fetched (the editor is mounting): show a skeleton textarea (grey animated pulse block, same size as the textarea)
- In practice: Next.js server components mean content is available on render — add a `loading` prop that the page passes `true` while a client-side refetch is happening (if any)

### `src/components/sidebar/calendar-heatmap.tsx`

- While `entries` is `null` (not yet fetched): render a grid of dim grey skeleton cells with a CSS pulse animation

### `src/components/summary/summary-section.tsx`

- If `initialSummary` is loading: show a skeleton card (3 lines of grey animated blocks)

---

## Part D — Keyboard Shortcuts

### `src/components/shortcuts-panel.tsx`

`'use client'` component. No props.

- Listens for `CustomEvent('open-shortcuts')` on `window` (fired by the `?` header button)
- Also opens when `?` key is pressed and `document.activeElement` is not an input/textarea
- Closes on Escape
- Renders as a modal overlay (dark backdrop + centred card)

Content — a table of all shortcuts:

| Shortcut | Action |
|----------|--------|
| Ctrl+B | Bold selected text |
| Ctrl+I | Italic selected text |
| Ctrl+` | Inline code |
| Ctrl+Shift+C | Insert checkbox |
| Ctrl+Shift+T | Insert timestamp |
| Ctrl+/ | Toggle preview |
| Ctrl+Enter | Generate summary |
| T | Jump to today |
| ? | Open this panel |
| Escape | Close any open panel |

### Global shortcut: `T` key

In `src/app/layout.tsx` (or a `GlobalShortcuts` client component mounted there):
- Listen for keydown when active element is not input/textarea
- `T` key → `router.push('/today')`

### `Ctrl+Enter` for generate

In `summary-section.tsx`:
- When focus is anywhere on the page (not in a text input) and `Ctrl+Enter` is pressed, trigger the generate button if it's not disabled

### Escape to close panels

- Calendar picker in `date-nav.tsx` ✓ (already planned)
- Shortcuts panel ✓ (above)
- Any open dropdown in `tag-autocomplete.tsx` ✓ (already planned)

---

## Rules

- All global key listeners use `useEffect` with proper cleanup (`removeEventListener`)
- Check `event.target` is not `INPUT`, `TEXTAREA`, `SELECT` before firing global shortcuts
- Skeleton loader: use Tailwind `animate-pulse` + `bg-gray-200 dark:bg-gray-700` rounded blocks
- The offline banner uses a fixed-position top bar, `z-50`

---

## After Completing This Feature

Update `tracker.md`: mark all Feature 10 rows as ✅ Done.
