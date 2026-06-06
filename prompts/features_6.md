# Feature 6 — Summary Section

## Context

Project: `Daily_Journal` — Next.js 16, TypeScript, Tailwind v4, Vercel AI SDK (`ai` + `@ai-sdk/google`).

Features 1–5 are complete. You are implementing Feature 6 only.

---

## Your Task

---

### `src/lib/ai.ts`

- Use the Vercel AI SDK: `import { generateText } from 'ai'` and `import { google } from '@ai-sdk/google'`
- The Google provider reads `GOOGLE_GENERATIVE_AI_API_KEY` from env automatically — no manual init needed
- Model: `google('gemini-1.5-flash')`
- Export a thin wrapper:

```ts
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export async function generate(prompt: string): Promise<string> {
  const { text } = await generateText({
    model: google('gemini-1.5-flash'),
    prompt,
  });
  return text;
}
```

- Export the prompt templates:

```ts
export const PROMPTS = {
  standup: `You are writing a daily standup update from raw work notes.
Output three sections using emoji bullets:
✅ Did — completed tasks
🔄 Doing — in progress
🚧 Blockers — if none, omit this section
First person. Concise. Max 150 words.`,

  manager: `You are writing a professional daily update for a manager.
Write 2–3 short paragraphs in prose. Lead with the most important
accomplishment. Note key decisions or risks if present.
Professional tone. Max 200 words.`,

  reflection: `You are writing a personal end-of-day reflection.
Conversational tone. Cover: what went well, what was hard, one
thing to carry forward tomorrow. Max 150 words.`,

  checkin: `Given these mid-day work notes, list the 3–5 most important
remaining tasks in priority order. For each, write one sentence
explaining why it is the priority right now. Be direct. Max 120 words.`,

  weekly: `Summarise this week's daily work notes into a concise weekly review.
Highlight key accomplishments, recurring themes, and anything unresolved
carrying into next week. Prose format. Max 300 words.`,
};

export function buildPrompt(type: keyof typeof PROMPTS, content: string): string {
  return `${PROMPTS[type]}\n\nWork notes:\n${content}`;
}
```

---

### `src/app/api/entries/[date]/summary/route.ts`

`POST /api/entries/[date]/summary`
- Body: `{ format: 'standup' | 'manager' | 'reflection' }`
- Fetch the entry's content from db
- Call `generate(buildPrompt(format, content))`
- Save result via `updateSummary(date, summary, format)`
- Return `{ summary, format }`
- On error: return `{ error: 'Generation failed' }` with status 500

---

### `src/components/summary/summary-section.tsx`

`'use client'` component.

Props:
```ts
{
  date: string;
  initialSummary: string | null;
  initialFormat: string | null;
  wordCount: number;
  isToday: boolean;
}
```

**Format picker — 3 tabs:**

| Tab label | Description below |
|-----------|------------------|
| Standup | "Did / Doing / Blockers — for daily team standups" |
| Manager Update | "Professional prose — for 1:1s or status emails" |
| Reflection | "Personal debrief — what worked, what to improve" |

**Generate button states:**

| State | Appearance |
|-------|-----------|
| `wordCount < 30` | Disabled; tooltip on hover: "Add a bit more first — at least a few sentences" |
| Ready | "✨ Generate Summary" |
| Generating | "Generating…" + spinner; button disabled |
| Done | "↺ Regenerate" |
| Error | Inline below button: "Generation failed — [Retry]" |

On click:
1. Set state to generating
2. `POST /api/entries/[date]/summary` with `{ format }`
3. On success: set summary state, auto-scroll to summary card
4. On failure: show error + Retry link

**Summary card (shown when summary exists):**
- Renders `<ReactMarkdown>` of summary text
- Label: "Generated as Standup · [↺ Regenerate]"
- **✏ Edit** button: replaces card with a `<textarea>` pre-filled with summary text
  - On blur: `PATCH /api/entries/[date]/summary` with `{ summary: editedText }` — add this endpoint, or extend the existing PUT to accept an optional `summary` field. Document your choice in a comment.
  - Returns to rendered view on save

**EOD nudge** — render `<EodNudge>` above the format picker.

---

### `src/components/summary/eod-nudge.tsx`

`'use client'` component.

Props: `{ wordCount: number; hasSummary: boolean; isToday: boolean }`

- Renders only when: `isToday && wordCount >= 50 && !hasSummary && currentHour >= 16`
- Checks the hour on mount and every 60 s via `setInterval`
- Shows: `"It's after 4 PM — ready to wrap up? ✨"`

---

### Update `src/app/entries/[date]/page.tsx`

- Pass `initialSummary` and `initialFormat` from the db entry to `<SummarySection>`
- Pass live `wordCount` from the editor — lift word count state up to the page's client wrapper, or use a simple context

---

## Rules

- `react-markdown` with `remark-gfm` for rendering
- Gemini errors must never crash the page — always catch and show inline error
- Auto-scroll: `element.scrollIntoView({ behavior: 'smooth' })` with a ref on the summary card
- The Vercel AI SDK `generate()` wrapper is async — use try/catch in the API route

---

## After Completing This Feature

Update `tracker.md`: mark all Feature 6 rows as ✅ Done.