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

function CopyButton({
  onClick,
  state,
  idleLabel,
  successLabel,
  icon,
}: {
  onClick: () => void;
  state: FeedbackState;
  idleLabel: string;
  successLabel: string;
  icon: React.ReactNode;
}) {
  const color = state === 'success' ? 'var(--success-text)' : state === 'error' ? 'var(--danger-text)' : 'var(--text-secondary)';
  const label = state === 'success' ? successLabel : state === 'error' ? 'Failed' : idleLabel;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state !== 'idle'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '5px 12px',
        borderRadius: 'var(--radius-sm)',
        border: 'none',
        background: 'transparent',
        color,
        fontSize: '0.75rem',
        fontWeight: 500,
        cursor: state !== 'idle' ? 'default' : 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        if (state === 'idle') {
          (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
          (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (state === 'idle') {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
          (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
        }
      }}
    >
      {state === 'success' ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        icon
      )}
      {label}
    </button>
  );
}

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

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        paddingTop: 12,
        marginTop: 12,
        borderTop: '1px solid var(--border-subtle)',
      }}
    >
      <CopyButton
        onClick={handleCopy}
        state={copyState}
        idleLabel="Copy"
        successLabel="Copied!"
        icon={
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        }
      />
      <CopyButton
        onClick={handleSlack}
        state={slackState}
        idleLabel="Slack"
        successLabel="Copied for Slack!"
        icon={
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z" />
            <path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            <path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z" />
            <path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z" />
            <path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z" />
            <path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" />
            <path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z" />
            <path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z" />
          </svg>
        }
      />
      <CopyButton
        onClick={handleEmail}
        state={'idle'}
        idleLabel="Email"
        successLabel=""
        icon={
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        }
      />
    </div>
  );
}
