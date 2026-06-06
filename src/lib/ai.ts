import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export async function generate(prompt: string): Promise<string> {
  const { text } = await generateText({
    model: google('gemini-2.5-flash'),
    prompt,
  });
  return text;
}

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
