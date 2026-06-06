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

const FORMAT_ICONS: Record<Format, React.ReactNode> = {
  standup: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  manager: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  reflection: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
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
  const [collapsed, setCollapsed] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const canGenerate = wordCount >= 30;
  const showSummary = summary !== null;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isCollapsed = localStorage.getItem('summary-collapsed') === 'true';
      setCollapsed(isCollapsed);
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('summary-collapsed', String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    const handleZen = (e: Event) => {
      const active = (e as CustomEvent).detail?.active;
      setCollapsed(active);
    };
    window.addEventListener('toggle-zen-mode', handleZen);
    return () => window.removeEventListener('toggle-zen-mode', handleZen);
  }, []);

  useEffect(() => {
    const handleSaved = (e: Event) => {
      const detailContent = (e as CustomEvent).detail?.content;
      if (detailContent !== undefined && !detailContent.trim()) {
        setSummary(null);
        setStatus('idle');
      }
    };
    window.addEventListener('entry-saved', handleSaved);
    return () => window.removeEventListener('entry-saved', handleSaved);
  }, []);

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
      window.dispatchEvent(new CustomEvent('entry-saved', { detail: { date } }));
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
        window.dispatchEvent(new CustomEvent('entry-saved', { detail: { date } }));
      }
    } catch {
      // silently fail — user can retry
    }
    setIsEditing(false);
  }, [date, editText, summary]);

  if (loading) {
    return (
      <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[80, 110, 80].map((w, i) => (
            <div key={i} className="animate-shimmer" style={{ height: 32, width: w, borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
        <div className="animate-shimmer" style={{ height: 12, width: 260, borderRadius: 'var(--radius-sm)' }} />
        <div className="animate-shimmer" style={{ height: 40, width: 160, borderRadius: 'var(--radius-md)' }} />
      </div>
    );
  }

  return (
    <div
      style={{
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header bar */}
      <div
        onClick={toggleCollapsed}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          cursor: 'pointer',
          background: 'var(--surface-muted)',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          Summary & Insights
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {showSummary && !collapsed && (
            <span style={{ fontSize: '0.7rem', color: 'var(--success-text)', background: 'var(--success-soft)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
              Generated
            </span>
          )}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.2s ease',
              color: 'var(--text-tertiary)',
            }}
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </div>
      </div>

      {!collapsed && (
        <div
          className="animate-fade-in"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <EodNudge
            wordCount={wordCount}
            hasSummary={showSummary}
            isToday={isToday}
          />

          {/* Format selector */}
          <div style={{ display: 'flex', gap: 6 }}>
            {(Object.keys(FORMAT_LABELS) as Format[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                disabled={status === 'generating'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.8rem',
                  fontWeight: format === f ? 600 : 500,
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: format === f ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                  background: format === f ? 'var(--accent-soft)' : 'transparent',
                  color: format === f ? 'var(--accent-text)' : 'var(--text-secondary)',
                  cursor: status === 'generating' ? 'not-allowed' : 'pointer',
                  opacity: status === 'generating' ? 0.5 : 1,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (format !== f && status !== 'generating') {
                    (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (format !== f) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
                  }
                }}
              >
                {FORMAT_ICONS[f]}
                {FORMAT_LABELS[f]}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: -4 }}>
            {FORMAT_DESCRIPTIONS[format]}
          </p>

          {/* Generate button */}
          <div>
            {!canGenerate ? (
              <span
                title="Add a bit more first — at least a few sentences"
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
                Generate Summary
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
                {status === 'done' ? 'Regenerate Summary' : 'Generate Summary'}
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

          {showSummary && (
            <div
              ref={summaryRef}
              className="animate-slide-up"
              style={{
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                padding: 20,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--text-muted)',
                  }}
                >
                  Generated as {FORMAT_LABELS[format]}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: 'var(--accent-text)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--accent-soft)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    Regenerate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditText(summary ?? '');
                      setIsEditing(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: 'var(--text-secondary)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    Edit
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
                  style={{
                    width: '100%',
                    minHeight: 120,
                    resize: 'vertical',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid var(--border-focus)',
                    padding: 14,
                    fontSize: '0.85rem',
                    lineHeight: 1.65,
                    outline: 'none',
                    fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
                    background: 'var(--surface)',
                    color: 'var(--text-primary)',
                    transition: 'border-color 0.15s ease',
                  }}
                  autoFocus
                />
              ) : (
                <div
                  className="prose dark:prose-invert"
                  style={{ maxWidth: 'none', fontSize: '0.88rem', lineHeight: 1.7 }}
                >
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
      )}
    </div>
  );
}
