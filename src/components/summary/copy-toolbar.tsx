'use client';

import { useState, useCallback } from 'react';
import { format, parseISO } from 'date-fns';

function toPlainText(md: string): string {
  return md
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^###?\s+/gm, '')
    .replace(/^-\s\[ \]\s+/gm, '')
    .replace(/^-\s\[x\]\s+/gm, '✓ ')
    .trim();
}

function toSlackMarkdown(md: string): string {
  return md
    .replace(/\*\*(.+?)\*\*/g, '*$1*')
    .replace(/^-\s\[ \]\s+/gm, '☐ ')
    .replace(/^-\s\[x\]\s+/gm, '☑ ')
    .replace(/^###?\s+(.+)/gm, '*$1*')
    .trim();
}

type FeedbackState = 'idle' | 'success' | 'error';

export default function CopyToolbar({
  summary,
  date,
  format: formatLabel,
}: {
  summary: string;
  date: string;
  format: string;
}) {
  const [copyState, setCopyState] = useState<FeedbackState>('idle');
  const [slackState, setSlackState] = useState<FeedbackState>('idle');

  const flash = (setter: (s: FeedbackState) => void, ok: boolean) => {
    setter(ok ? 'success' : 'error');
    setTimeout(() => setter('idle'), 1500);
  };

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(toPlainText(summary));
      flash(setCopyState, true);
    } catch {
      flash(setCopyState, false);
    }
  }, [summary]);

  const handleSlack = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(toSlackMarkdown(summary));
      flash(setSlackState, true);
    } catch {
      flash(setSlackState, false);
    }
  }, [summary]);

  const handleEmail = useCallback(() => {
    const label = formatLabel.charAt(0).toUpperCase() + formatLabel.slice(1);
    const subject = `${label} — ${format(parseISO(date), 'MMMM d, yyyy')}`;
    const body = toPlainText(summary);
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [summary, date, formatLabel]);

  const copyLabel = copyState === 'success' ? '✓ Copied!' : copyState === 'error' ? 'Copy failed' : '📋 Copy';
  const slackLabel = slackState === 'success'
    ? '✓ Copied for Slack!'
    : slackState === 'error'
      ? 'Copy failed'
      : 'Slack';

  return (
    <div className="flex items-center gap-2 pt-2">
      <button
        type="button"
        onClick={handleCopy}
        disabled={copyState !== 'idle'}
        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
          copyState === 'idle'
            ? 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            : copyState === 'success'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
        }`}
      >
        {copyLabel}
      </button>
      <button
        type="button"
        onClick={handleSlack}
        disabled={slackState !== 'idle'}
        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
          slackState === 'idle'
            ? 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            : slackState === 'success'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
        }`}
      >
        {slackLabel}
      </button>
      <button
        type="button"
        onClick={handleEmail}
        className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        ✉ Email
      </button>
    </div>
  );
}
