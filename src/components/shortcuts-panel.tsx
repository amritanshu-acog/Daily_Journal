'use client';

import { useState, useEffect, useCallback } from 'react';

const SHORTCUTS = [
  { keys: '⌘B', action: 'Bold selected text' },
  { keys: '⌘I', action: 'Italic selected text' },
  { keys: '⌘`', action: 'Inline code' },
  { keys: '⌘⇧C', action: 'Insert checkbox' },
  { keys: '⌘⇧T', action: 'Insert timestamp' },
  { keys: '⌘/', action: 'Toggle preview' },
  { keys: '⌘↵', action: 'Generate summary' },
  { keys: 'T', action: 'Jump to today' },
  { keys: '?', action: 'Open this panel' },
  { keys: 'Esc', action: 'Close any open panel' },
];

export default function ShortcutsPanel() {
  const [open, setOpen] = useState(false);

  const openPanel = useCallback(() => setOpen(true), []);
  const closePanel = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handleCustom = () => openPanel();
    window.addEventListener('open-shortcuts', handleCustom);
    return () => window.removeEventListener('open-shortcuts', handleCustom);
  }, [openPanel]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePanel();
        return;
      }
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === '?') {
        e.preventDefault();
        closePanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, closePanel]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDownOutside = (e: KeyboardEvent) => {
      if (e.key === '?') {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
          closePanel();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDownOutside);
    return () => window.removeEventListener('keydown', handleKeyDownOutside);
  }, [open, closePanel]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
      onClick={closePanel}
    >
      <div
        className="animate-scale-in"
        style={{
          background: 'var(--surface-elevated)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          maxWidth: 460,
          width: '100%',
          margin: '0 16px',
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 22px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Keyboard Shortcuts
          </h2>
          <button
            onClick={closePanel}
            style={{
              width: 30,
              height: 30,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div style={{ padding: '8px 14px' }}>
          {SHORTCUTS.map((s) => (
            <div
              key={s.keys}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 8px',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {s.action}
              </span>
              <kbd
                style={{
                  display: 'inline-block',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-muted)',
                  fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
                  fontSize: '0.72rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  minWidth: 28,
                  textAlign: 'center',
                  boxShadow: '0 1px 0 var(--border)',
                }}
              >
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 22px', borderTop: '1px solid var(--border-subtle)' }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Press <kbd style={{ padding: '1px 5px', borderRadius: 3, border: '1px solid var(--border)', background: 'var(--surface-muted)', fontSize: '0.68rem' }}>?</kbd> again to close
          </p>
        </div>
      </div>
    </div>
  );
}
