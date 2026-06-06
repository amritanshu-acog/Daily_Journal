'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { format, parseISO, addDays, subDays } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CopyToolbar from '@/components/summary/copy-toolbar';
import { todayString } from '@/lib/dates';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export default function WeeklyDigest({
  weekStart,
  initialDigest,
  days,
}: {
  weekStart: string;
  initialDigest: string | null;
  days: { date: string; hasEntry: boolean }[];
}) {
  const [digest, setDigest] = useState<string | null>(initialDigest);
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>(
    initialDigest ? 'done' : 'idle'
  );
  const digestRef = useRef<HTMLDivElement>(null);

  const entriesCount = days.filter((d) => d.hasEntry).length;
  const canGenerate = entriesCount >= 2;

  const monday = parseISO(weekStart);
  const friday = parseISO(days[4].date);
  const weekLabel = `Week of ${format(monday, 'MMMM d')} – ${format(friday, 'MMMM d, yyyy')}`;

  const prevMonday = format(subDays(monday, 7), 'yyyy-MM-dd');
  const nextMonday = format(addDays(monday, 7), 'yyyy-MM-dd');
  const isNextDisabled = nextMonday > todayString();

  const handleGenerate = useCallback(async () => {
    setStatus('generating');
    try {
      const res = await fetch(`/api/weekly/${weekStart}`, { method: 'POST' });
      if (!res.ok) throw new Error('Generation failed');
      const data = (await res.json()) as { digest: string };
      setDigest(data.digest);
      setStatus('done');
      requestAnimationFrame(() => {
        digestRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    } catch {
      setStatus('error');
    }
  }, [weekStart]);

  return (
    <div className="flex flex-col flex-1 p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
            {weekLabel}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            {days.map((day, i) => (
              <span
                key={day.date}
                className={`text-sm font-medium ${
                  day.hasEntry
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-zinc-400 dark:text-zinc-600'
                }`}
              >
                {DAY_LABELS[i]}{' '}
                {day.hasEntry ? (
                  <span className="text-green-600 dark:text-green-400">✓</span>
                ) : (
                  <span className="text-zinc-300 dark:text-zinc-600">—</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div>
        {!canGenerate ? (
          <span
            title="Write at least 2 days this week to generate a digest"
            className="inline-block cursor-not-allowed rounded-lg bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-400 dark:bg-zinc-800"
          >
            ✨ Generate Weekly Digest
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
            {status === 'done' ? '↺ Regenerate' : '✨ Generate Weekly Digest'}
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

      {digest && (
        <div ref={digestRef} className="rounded-lg border bg-white p-4 dark:bg-zinc-900">
          <div className="prose dark:prose-invert max-w-none text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {digest}
            </ReactMarkdown>
          </div>
          <CopyToolbar
            summary={digest}
            date={weekStart}
            format="weekly"
          />
        </div>
      )}

      <div className="flex items-center gap-4 pt-4 border-t">
        <Link
          href={`/weekly/${prevMonday}`}
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Previous week
        </Link>
        {isNextDisabled ? (
          <span className="text-sm text-zinc-400 dark:text-zinc-600 cursor-not-allowed">
            Next week →
          </span>
        ) : (
          <Link
            href={`/weekly/${nextMonday}`}
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            Next week →
          </Link>
        )}
      </div>
    </div>
  );
}
