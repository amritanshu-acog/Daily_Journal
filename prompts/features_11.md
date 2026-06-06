# Feature 11 — Polish Pass

## Context

Project: `Daily_Journal` — Next.js 16, TypeScript, Tailwind v4, Vercel AI SDK.

Features 1–10 are complete. The app is fully functional. This is the final polish pass — no new features, only refinements and edge cases.

---

## Your Task

---

### 1. Welcome Banner

Create a `WelcomeBanner` client component rendered above the editor on first visit only.

- Detect via `localStorage.getItem('welcomed')` — if null, show it
- On `[Got it →]` click: `localStorage.setItem('welcomed', 'true')`, hide the banner
- Content:
  ```
  👋 Welcome to your Daily Journal.
  Write throughout the day. Generate a summary when you're done.
  Unfinished tasks carry forward automatically.
  [Got it →]
  ```

---

### 2. `src/app/page.tsx` — Root redirect

```ts
import { redirect } from 'next/navigation';
export default function Home() {
  redirect('/today');
}
```

---

### 3. Dark mode audit (Tailwind v4 + next-themes)

Verify:
- `globals.css` has `@import "tailwindcss"` and `@variant dark (&:where(.dark, .dark *));`
- `layout.tsx` wraps children in `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>`
- Every component has `dark:` variants on backgrounds, text, borders, cards, modals, banners
- No hydration flash — `next-themes` handles this via `suppressHydrationWarning` on `<html>`
- The `ThemeProvider` must be in a `'use client'` wrapper component since it uses context

Fix any missing dark mode classes across all components.

---

### 4. Tag autocomplete — first-use tooltip

In `src/components/editor/tag-autocomplete.tsx`:
- On the very first `#` typed (ever), show a tooltip for 3 s:
  `"Tagging a project — it'll appear in your sidebar."`
- Track via `localStorage.getItem('tag-tip-shown')` — show once, then set the key

---

### 5. Past entry amber banner

Confirm the amber banner in `src/app/entries/[date]/page.tsx` renders correctly:
- Only when `date !== todayString()`
- Text: `"Viewing [Day, Month D] · edits will update that day's entry"`
- Style: amber background, subtle

---

### 6. Weekends in heatmap — verify

- Sat/Sun cells render at ~70% opacity (`opacity-60`)
- `calculateStreak` in `src/lib/dates.ts` skips weekends — verify

---

### 7. Mobile-safe layout

- On screens `< lg`: sidebar collapses or hides; main content takes full width
- No horizontal scroll on any page
- Toolbar buttons remain usable on touch
- Minimal support only — no full mobile layout needed

---

### 8. `next.config.ts` — native module handling

`better-sqlite3` is a native Node module. Add to `next.config.ts`:

```ts
const nextConfig = {
  webpack: (config: any) => {
    config.externals = [...(config.externals || []), 'better-sqlite3'];
    return config;
  },
};
export default nextConfig;
```

> Note: Next.js 16 uses Turbopack by default for `next dev`. If you run into native module issues with Turbopack, add `--no-turbopack` to your dev script in `package.json` as a fallback: `"dev": "next dev --no-turbopack"`.

---

### 9. Final `npm run build` check

Run `npm run build` and fix any TypeScript errors or build warnings. Common issues:
- Missing `'use client'` directives
- Untyped props
- Unused imports
- `ThemeProvider` not in a client wrapper

Do not introduce new `any` types to silence errors — fix them properly.

---

## After Completing This Feature

Update `tracker.md`: mark all Feature 11 rows as ✅ Done.

Add a final line to `tracker.md`:
```
## ✅ v1 Complete
All features implemented and polished.
```