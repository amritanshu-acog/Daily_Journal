# Daily Journal

An AI-powered daily journaling app for developers. Write Markdown notes, generate AI summaries in multiple formats, track tasks with automatic carryover, and visualize your writing streak — all with a keyboard-first workflow.

Live at [journal.aganitha.ai](http://journal.aganitha.ai)

---

## Features

- **Markdown Editor** — Full-featured editor with live preview, undo/redo, and autosave
- **AI Summaries** — Generate standup, manager update, or personal reflection from your notes via Gemini 2.5 Flash
- **Mid-Day Check-in** — Get an AI-prioritized list of your top remaining tasks
- **Weekly Digest** — AI-generated weekly review from all your entries
- **Task Carryover** — Unchecked tasks automatically carry to the next day
- **Tag System** — Organize entries with `#tags`, autocomplete from existing tags
- **Calendar Heatmap** — GitHub-style activity graph showing 3 months or the full year
- **Streak Tracking** — Consecutive weekday journaling streak (weekends excluded)
- **Copy & Export** — Copy as plain text, Slack-formatted, or send via email
- **Zen Mode** — Distraction-free writing
- **Dark / Light Theme** — System-default or manually toggled, persisted
- **Keyboard Shortcuts** — 14 shortcuts for formatting, navigation, and actions
- **Offline Detection** — Graceful offline banner with reconnect handling
- **Date Navigation** — Previous/next day, calendar picker, quick-jump to today
- **Dockerized** — Containerized with nginx reverse proxy, one-command deploy

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server Components, API Routes) |
| UI | React 19, Tailwind CSS v4, next-themes |
| Database | SQLite via better-sqlite3 |
| AI | Vercel AI SDK + Google Gemini 2.5 Flash (@ai-sdk/google) |
| Markdown | react-markdown + remark-gfm |
| Dates | date-fns |
| Fonts | Geist (Sans + Mono) via next/font |
| Linting | ESLint |
| Deployment | Docker, docker-compose, nginx |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm or bun
- A Google Generative AI API key

### Setup

```bash
# Clone the repo
git clone <repo-url> Daily_Journal
cd Daily_Journal

# Install dependencies
npm install

# Set your API key
echo "GOOGLE_GENERATIVE_AI_API_KEY=your_key_here" > .env

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The SQLite database is auto-created at `data/journal.db` on first request.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Deployment

### Docker

```bash
docker compose up -d
```

This starts the Next.js app and an nginx reverse proxy. The SQLite database is persisted via the `journal_data` named volume.

### Production deploy (via deploy.sh)

```bash
./deploy.sh
```

Pulls latest from `origin/master`, rebuilds Docker images, performs a rolling restart, reloads nginx, and prunes old images.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | API key for Google Gemini 2.5 Flash |

---

## Project Structure

```
src/
├── app/
│   ├── api/            # REST API routes (entries, tags, weekly, carryover)
│   ├── entries/[date]/ # Individual journal entry page
│   ├── weekly/[date]/  # Weekly digest page
│   ├── today/          # Redirects to today's entry
│   ├── globals.css     # Design system & theme variables
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home → redirect to /today
├── components/
│   ├── layout/         # Header, Sidebar, OfflineDetector
│   ├── editor/         # EntryEditor, Editor, Toolbar, TagAutocomplete, SaveIndicator
│   ├── summary/        # SummarySection, EodNudge, CopyToolbar
│   ├── sidebar/        # CalendarHeatmap, TagFilter
│   └── ...             # Checkin, WeeklyDigest, CarryoverBanner, etc.
└── lib/
    ├── db.ts           # SQLite database layer
    ├── ai.ts           # AI generation (Gemini) + prompt templates
    ├── markdown.ts     # Markdown parsing utilities
    └── dates.ts        # Date helpers (date-fns wrappers)
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `` Ctrl+` `` | Inline code |
| `Ctrl+Shift+C` | Toggle task checkbox |
| `Ctrl+Shift+T` | Insert timestamp |
| `Ctrl+/` | Toggle preview |
| `Ctrl+Enter` | Generate summary |
| `T` | Jump to today |
| `?` | Open shortcuts panel |
| `Escape` | Close panel / cancel edit |

---

## License

MIT
