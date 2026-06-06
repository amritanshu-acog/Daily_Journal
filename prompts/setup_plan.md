# Daily_Journal — Setup Plan

## 1. Scaffold Project

```bash
npx create-next-app@latest Daily_Journal \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd Daily_Journal
```

> `create-next-app@latest` pulls Next.js 16.x and Tailwind v4 automatically.

---

## 2. Install Packages

```bash
# Database
npm install better-sqlite3
npm install --save-dev @types/better-sqlite3

# Markdown
npm install react-markdown remark-gfm

# AI — Vercel AI SDK + Google provider
npm install ai @ai-sdk/google

# Date utilities
npm install date-fns

# Dark mode (SSR-safe, works with Tailwind v4)
npm install next-themes
```

---

## 3. Tailwind v4 Dark Mode

Tailwind v4 has no `tailwind.config.ts`. Dark mode is configured in CSS.

In `src/app/globals.css`, add after `@import "tailwindcss"`:

```css
@import "tailwindcss";
@variant dark (&:where(.dark, .dark *));
```

That's it. The `dark:` prefix works exactly as before in your components.

---

## 4. Environment File

Create `.env.local` at project root:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key_here
```

> Note: the Vercel AI SDK's Google provider reads `GOOGLE_GENERATIVE_AI_API_KEY`, not `GOOGLE_API_KEY`.

---

## 5. Create Folder Structure

```bash
mkdir -p src/app/today
mkdir -p src/app/entries/\[date\]
mkdir -p src/app/weekly/\[date\]
mkdir -p src/app/api/entries/\[date\]/summary
mkdir -p src/app/api/entries/\[date\]/checkin
mkdir -p src/app/api/weekly/\[date\]
mkdir -p src/app/api/tags
mkdir -p src/app/api/carryover/skip
mkdir -p src/lib
mkdir -p src/components/layout
mkdir -p src/components/sidebar
mkdir -p src/components/editor
mkdir -p src/components/summary
mkdir -p data
```

---

## 6. Create Placeholder Files

### Pages
```
src/app/page.tsx
src/app/layout.tsx
src/app/today/page.tsx
src/app/entries/[date]/page.tsx
src/app/weekly/[date]/page.tsx
```

### API Routes
```
src/app/api/entries/route.ts
src/app/api/entries/[date]/route.ts
src/app/api/entries/[date]/summary/route.ts
src/app/api/entries/[date]/checkin/route.ts
src/app/api/weekly/[date]/route.ts
src/app/api/tags/route.ts
src/app/api/carryover/skip/route.ts
```

### Lib
```
src/lib/db.ts
src/lib/ai.ts
src/lib/markdown.ts
src/lib/dates.ts
```

### Components
```
src/components/layout/header.tsx
src/components/layout/sidebar.tsx
src/components/sidebar/calendar-heatmap.tsx
src/components/sidebar/tag-filter.tsx
src/components/date-nav.tsx
src/components/carryover-banner.tsx
src/components/editor/editor.tsx
src/components/editor/toolbar.tsx
src/components/editor/tag-autocomplete.tsx
src/components/editor/save-indicator.tsx
src/components/checkin-section.tsx
src/components/summary/summary-section.tsx
src/components/summary/copy-toolbar.tsx
src/components/summary/eod-nudge.tsx
src/components/weekly-digest.tsx
src/components/shortcuts-panel.tsx
```

---

## 7. gitignore additions

Append to `.gitignore`:
```
.env.local
data/
```

---

## 8. Verify

```bash
npm run dev   # should open on localhost:3000 with no errors
```