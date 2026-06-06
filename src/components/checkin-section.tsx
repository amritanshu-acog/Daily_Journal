"use client";

import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function CheckinSection({
  date,
  initialCheckin,
}: {
  date: string;
  initialCheckin: string | null;
}) {
  const [checkin, setCheckin] = useState<string | null>(initialCheckin);
  const [isOpen, setIsOpen] = useState(initialCheckin !== null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [collapsed, setCollapsed] = useState(false);
  const hasRun = checkin !== null;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isCollapsed = localStorage.getItem('checkin-collapsed') === 'true';
      setCollapsed(isCollapsed);
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('checkin-collapsed', String(next));
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

  const handleCheckin = async () => {
    setStatus("loading");
    try {
      const res = await fetch(`/api/entries/${date}/checkin`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = (await res.json()) as { checkin: string };
      setCheckin(data.checkin);
      setIsOpen(true);
      setStatus("idle");
      window.dispatchEvent(new CustomEvent('entry-saved', { detail: { date } }));
    } catch {
      setStatus("error");
    }
  };

  return (
    <div
      style={{
        borderBottom: '1px solid var(--border-subtle)',
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
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Mid-day Check-in
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {hasRun && !collapsed && (
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-text)', background: 'var(--accent-soft)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
              Completed
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
            padding: '14px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div>
            <button
              type="button"
              onClick={handleCheckin}
              disabled={status === "loading"}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 'var(--radius-md)',
                background: hasRun ? 'var(--surface-hover)' : 'linear-gradient(135deg, var(--accent), #a855f7)',
                padding: '9px 18px',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: hasRun ? 'var(--text-secondary)' : '#ffffff',
                border: hasRun ? '1px solid var(--border)' : 'none',
                cursor: status === "loading" ? 'not-allowed' : 'pointer',
                opacity: status === "loading" ? 0.7 : 1,
                transition: 'all 0.2s ease',
                boxShadow: hasRun ? 'none' : 'var(--shadow-sm)',
              }}
              onMouseEnter={(e) => {
                if (status !== "loading") {
                  if (hasRun) {
                    (e.currentTarget as HTMLElement).style.background = 'var(--surface-muted)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  } else {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (hasRun) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
                } else {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
                }
              }}
            >
              {status === "loading" ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Checking in…
                </>
              ) : hasRun ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  Refresh Check-in
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Mid-day Check-in
                </>
              )}
            </button>
          </div>

          {status === "error" && (
            <p
              className="animate-fade-in"
              style={{ fontSize: '0.82rem', color: 'var(--danger-text)' }}
            >
              Check-in failed —{" "}
              <button
                type="button"
                onClick={handleCheckin}
                style={{
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  color: 'inherit',
                  background: 'none',
                  border: 'none',
                  fontSize: 'inherit',
                  fontWeight: 500,
                }}
              >
                Retry
              </button>
            </p>
          )}

          {checkin && (
            <div style={{ marginTop: 4 }}>
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                Today&apos;s priorities
              </button>
              {isOpen && (
                <div
                  className="prose dark:prose-invert animate-slide-up"
                  style={{
                    marginTop: 10,
                    maxWidth: 'none',
                    fontSize: '0.85rem',
                    lineHeight: 1.65,
                    padding: '14px 16px',
                    background: 'var(--surface-muted)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {checkin}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
