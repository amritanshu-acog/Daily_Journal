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

  const navLinkStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: '0.85rem',
    fontWeight: 500,
    color: 'var(--accent-text)',
    textDecoration: 'none',
    padding: '6px 14px',
    borderRadius: 'var(--radius-md)',
    transition: 'all 0.15s ease',
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        padding: '32px 28px',
        gap: 24,
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div>
        <h1
          style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            marginBottom: 14,
          }}
        >
          {weekLabel}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {days.map((day, i) => (
            <div
              key={day.date}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 12px',
                borderRadius: 'var(--radius-md)',
                background: day.hasEntry ? 'var(--success-soft)' : 'var(--surface-muted)',
                border: `1px solid ${day.hasEntry ? 'var(--success)' : 'var(--border-subtle)'}`,
                fontSize: '0.8rem',
                fontWeight: 600,
                color: day.hasEntry ? 'var(--success-text)' : 'var(--text-muted)',
                transition: 'all 0.15s ease',
              }}
            >
              {DAY_LABELS[i]}
              {day.hasEntry ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span style={{ fontSize: '0.65rem' }}>—</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <div>
        {!canGenerate ? (
          <span
            title="Write at least 2 days this week to generate a digest"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface-muted)',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'not-allowed',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Generate Weekly Digest
          </span>
        ) : status === 'generating' ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--accent), #a855f7)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 600,
              opacity: 0.8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            Generating…
          </span>
        ) : (
          <button
            type="button"
            onClick={handleGenerate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--accent), #a855f7)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-glow)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            {status === 'done' ? 'Regenerate Digest' : 'Generate Weekly Digest'}
          </button>
        )}
      </div>

      {status === 'error' && (
        <p className="animate-fade-in" style={{ fontSize: '0.85rem', color: 'var(--danger-text)' }}>
          Generation failed —{' '}
          <button
            type="button"
            onClick={handleGenerate}
            style={{
              textDecoration: 'underline',
              cursor: 'pointer',
              color: 'inherit',
              background: 'none',
              border: 'none',
              fontSize: 'inherit',
              fontWeight: 600,
            }}
          >
            Retry
          </button>
        </p>
      )}

      {digest && (
        <div
          ref={digestRef}
          className="animate-slide-up"
          style={{
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            padding: 24,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            className="prose dark:prose-invert"
            style={{ maxWidth: 'none', fontSize: '0.88rem', lineHeight: 1.7 }}
          >
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

      {/* Week navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          paddingTop: 16,
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <Link
          href={`/weekly/${prevMonday}`}
          style={navLinkStyle}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'var(--accent-soft)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Previous week
        </Link>
        {isNextDisabled ? (
          <span
            style={{
              ...navLinkStyle,
              color: 'var(--text-muted)',
              cursor: 'not-allowed',
            }}
          >
            Next week
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        ) : (
          <Link
            href={`/weekly/${nextMonday}`}
            style={navLinkStyle}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--accent-soft)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            Next week
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}
