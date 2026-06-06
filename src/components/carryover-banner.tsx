'use client';

import { useState, useCallback, useEffect } from 'react';

interface CarryoverBannerProps {
  tasks: string[];
  allDone?: boolean;
  onAdd: (task: string) => void;
  onAddAll: (tasks: string[]) => void;
}

export default function CarryoverBanner({ tasks, allDone = false, onAdd, onAddAll }: CarryoverBannerProps) {
  const [remaining, setRemaining] = useState(tasks);
  const [showAllDone, setShowAllDone] = useState(false);

  useEffect(() => {
    setRemaining(tasks);
  }, [tasks]);

  useEffect(() => {
    if (allDone) {
      setShowAllDone(true);
      const timer = setTimeout(() => setShowAllDone(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [allDone]);

  if (showAllDone) {
    return (
      <div
        className="animate-fade-in"
        style={{
          margin: '12px 20px 0',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--success-soft)',
          border: '1px solid var(--success)',
          color: 'var(--success-text)',
          fontSize: '0.85rem',
          fontWeight: 600,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        All done yesterday — great work!
      </div>
    );
  }

  const handleAdd = useCallback((task: string) => {
    onAdd(task);
    setRemaining((prev) => prev.filter((t) => t !== task));
  }, [onAdd]);

  const handleSkip = useCallback((task: string) => {
    fetch('/api/carryover/skip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskText: task }),
    }).catch(() => {});
    setRemaining((prev) => prev.filter((t) => t !== task));
  }, []);

  const handleAddAll = useCallback(() => {
    onAddAll(remaining);
    setRemaining([]);
  }, [remaining, onAddAll]);

  const handleSkipAll = useCallback(() => {
    const current = [...remaining];
    setRemaining([]);
    Promise.allSettled(
      current.map((task) =>
        fetch('/api/carryover/skip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskText: task }),
        })
      )
    );
  }, [remaining]);

  if (remaining.length === 0) return null;

  const actionBtnStyle: React.CSSProperties = {
    padding: '4px 10px',
    fontSize: '0.72rem',
    fontWeight: 600,
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  };

  return (
    <div
      className="animate-slide-down"
      style={{
        margin: '12px 20px 0',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-elevated)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          padding: '8px 14px',
          fontSize: '0.7rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-tertiary)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="17 1 21 5 17 9" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <polyline points="7 23 3 19 7 15" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
        Yesterday&apos;s unfinished tasks
      </div>
      <div style={{ padding: '6px 10px' }}>
        {remaining.map((task) => (
          <div
            key={task}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              padding: '6px 4px',
              borderRadius: 'var(--radius-sm)',
              transition: 'background 0.1s ease',
            }}
          >
            <span
              style={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
              }}
            >
              {task}
            </span>
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <button
                onClick={() => handleAdd(task)}
                style={{
                  ...actionBtnStyle,
                  background: 'var(--success-soft)',
                  color: 'var(--success-text)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--success)';
                  (e.currentTarget as HTMLElement).style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--success-soft)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--success-text)';
                }}
              >
                + Add
              </button>
              <button
                onClick={() => handleSkip(task)}
                style={{
                  ...actionBtnStyle,
                  background: 'transparent',
                  color: 'var(--text-muted)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                }}
              >
                Skip
              </button>
            </div>
          </div>
        ))}
      </div>
      {remaining.length > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 6,
            padding: '8px 14px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <button
            onClick={handleAddAll}
            style={{
              ...actionBtnStyle,
              background: 'var(--success-soft)',
              color: 'var(--success-text)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--success)';
              (e.currentTarget as HTMLElement).style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--success-soft)';
              (e.currentTarget as HTMLElement).style.color = 'var(--success-text)';
            }}
          >
            Add all
          </button>
          <button
            onClick={handleSkipAll}
            style={{
              ...actionBtnStyle,
              background: 'transparent',
              color: 'var(--text-muted)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
            }}
          >
            Skip all
          </button>
        </div>
      )}
    </div>
  );
}
