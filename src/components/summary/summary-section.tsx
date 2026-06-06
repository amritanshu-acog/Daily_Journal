'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import EodNudge from './eod-nudge';
import CopyToolbar from './copy-toolbar';

type Format = 'standup' | 'manager' | 'reflection';

const FORMAT_LABELS: Record<Format, string> = {
  standup: 'Standup',
  manager: 'Manager Update',
  reflection: 'Reflection',
};

const FORMAT_DESCRIPTIONS: Record<Format, string> = {
  standup: 'Did / Doing / Blockers — for daily team standups',
  manager: 'Professional prose — for 1:1s or status emails',
  reflection: 'Personal debrief — what worked, what to improve',
};

export default function SummarySection({
  date,
  initialSummary,
  initialFormat,
  wordCount,
  isToday,
  loading = false,
}: {
  date: string;
  initialSummary: string | null;
  initialFormat: string | null;
  wordCount: number;
  isToday: boolean;
  loading?: boolean;
}) {
  const [format, setFormat] = useState<Format>(
    (initialFormat as Format) ?? 'standup'
  );
  const [summary, setSummary] = useState<string | null>(initialSummary);
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>(
    initialSummary ? 'done' : 'idle'
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const summaryRef = useRef<HTMLDivElement>(null);

  const canGenerate = wordCount >= 30;
  const showSummary = summary !== null;

  const handleGenerate = useCallback(async () => {
    setStatus('generating');
    try {
      const res = await fetch(`/api/entries/${date}/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = (await res.json()) as { summary: string; format: string };
      setSummary(data.summary);
      setStatus('done');
      requestAnimationFrame(() => {
        summaryRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    } catch {
      setStatus('error');
    }
  }, [date, format]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key !== 'Enter') return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (status === 'generating' || !canGenerate) return;
      e.preventDefault();
      handleGenerate();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canGenerate, status, handleGenerate]);

  const handleEditSave = useCallback(async () => {
    if (editText === summary) {
      setIsEditing(false);
      return;
    }
    try {
      const res = await fetch(`/api/entries/${date}/summary`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: editText }),
      });
      if (res.ok) {
        setSummary(editText);
      }
    } catch {
      // silently fail — user can retry
    }
    setIsEditing(false);
  }, [date, editText, summary]);

  if (loading) {
    return (
      <div className="border-t px-4 py-4 space-y-3 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="h-3 w-64 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-10 w-40 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
        <div className="rounded-lg border p-4 space-y-2">
          <div className="h-3 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-5/6 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-4/6 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="border-t px-4 py-4 space-y-3">
      <EodNudge
        wordCount={wordCount}
        hasSummary={showSummary}
        isToday={isToday}
      />

      <div className="flex items-center gap-4">
        {(Object.keys(FORMAT_LABELS) as Format[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFormat(f)}
            disabled={status === 'generating'}
            className={`text-sm font-medium transition-colors ${
              format === f
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            } ${status === 'generating' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {FORMAT_LABELS[f]}
          </button>
        ))}
      </div>

      <p className="text-xs text-zinc-400">{FORMAT_DESCRIPTIONS[format]}</p>

      <div className="flex items-center gap-2">
        {!canGenerate ? (
          <span
            title="Add a bit more first — at least a few sentences"
            className="inline-block cursor-not-allowed rounded-lg bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-400 dark:bg-zinc-800"
          >
            ✨ Generate Summary
          </span>
        ) : status === 'generating' ? (
          <span className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white opacity-70">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Generating…
          </span>
        ) : (
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            {status === 'done' ? '↺ Regenerate' : '✨ Generate Summary'}
          </button>
        )}
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Generation failed —{' '}
          <button
            type="button"
            onClick={handleGenerate}
            className="underline hover:no-underline"
          >
            Retry
          </button>
        </p>
      )}

      {showSummary && (
        <div ref={summaryRef} className="rounded-lg border bg-white p-4 dark:bg-zinc-900">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              Generated as {FORMAT_LABELS[format]}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                className="text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                ↺ Regenerate
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditText(summary ?? '');
                  setIsEditing(true);
                }}
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                ✏ Edit
              </button>
            </div>
          </div>
          {isEditing ? (
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleEditSave}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsEditing(false);
                } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  handleEditSave();
                }
              }}
              className="w-full min-h-[100px] resize-y rounded border border-zinc-300 dark:border-zinc-600 p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              autoFocus
            />
          ) : (
            <div className="prose dark:prose-invert max-w-none text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {summary}
              </ReactMarkdown>
            </div>
          )}
          {!isEditing && (
            <CopyToolbar
              summary={summary}
              date={date}
              format={format}
            />
          )}
        </div>
      )}
    </div>
  );
}
