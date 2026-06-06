'use client';

import { useCallback, useState, useEffect } from 'react';

interface ToolbarProps {
  content: string;
  onChange: (v: string) => void;
  onTogglePreview: () => void;
  isPreview: boolean;
  editorRef: React.RefObject<HTMLTextAreaElement | null>;
}

function ToolbarButton({
  onClick,
  title,
  children,
  active = false,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        fontSize: '0.78rem',
        fontWeight: active ? 600 : 500,
        color: active ? 'var(--accent-text)' : 'var(--text-secondary)',
        border: '1px solid transparent',
        borderColor: active ? 'var(--accent)' : 'transparent',
        borderRadius: 'var(--radius-sm)',
        background: active ? 'var(--accent-soft)' : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
          (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
          (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
        }
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return (
    <div
      style={{
        width: 1,
        height: 16,
        background: 'var(--border-subtle)',
        margin: '0 8px',
      }}
    />
  );
}

export default function Toolbar({
  content,
  onChange,
  onTogglePreview,
  isPreview,
  editorRef,
}: ToolbarProps) {
  const [zenMode, setZenMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const active = localStorage.getItem('zen-mode') === 'true';
      setZenMode(active);
    }
  }, []);

  const toggleZenMode = useCallback(() => {
    const next = !zenMode;
    setZenMode(next);
    localStorage.setItem('zen-mode', String(next));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('toggle-zen-mode', { detail: { active: next } }));
      window.dispatchEvent(new CustomEvent('toggle-sidebar', { detail: { active: next } }));
    }, 0);
  }, [zenMode]);

  const wrapSelection = useCallback(
    (before: string, after: string, fallback: string) => {
      const el = editorRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const selected = content.slice(start, end);
      const replacement = selected ? `${before}${selected}${after}` : fallback;
      const newContent =
        content.slice(0, start) + replacement + content.slice(end);
      onChange(newContent);
      requestAnimationFrame(() => {
        el.focus();
        const cursor = start + replacement.length;
        el.setSelectionRange(cursor, cursor);
      });
    },
    [content, onChange, editorRef]
  );

  const insertAtCursor = useCallback(
    (text: string) => {
      const el = editorRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newContent = content.slice(0, start) + text + content.slice(end);
      onChange(newContent);
      requestAnimationFrame(() => {
        el.focus();
        const cursor = start + text.length;
        el.setSelectionRange(cursor, cursor);
      });
    },
    [content, onChange, editorRef]
  );

  const insertTime = useCallback(() => {
    const now = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    insertAtCursor(`**${now}**`);
  }, [insertAtCursor]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderBottom: '1px solid var(--border-subtle)',
        padding: '6px 12px',
        background: 'var(--surface)',
        overflowX: 'auto',
      }}
    >
      <ToolbarButton onClick={() => wrapSelection('**', '**', '**bold**')} title="Bold (⌘B)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.5 15.5H10v-3h3.5a1.5 1.5 0 0 1 0 3zm-3.5-9h3a1.5 1.5 0 0 1 0 3h-3V6.5zm5.6 4.29c.97-.73 1.4-1.74 1.4-2.79 0-2.21-1.79-4-4-4H8v14h5.5c2.07 0 3.75-1.68 3.75-3.75 0-1.42-.78-2.65-1.92-3.3l-.23-.16z"/>
        </svg>
      </ToolbarButton>
      <ToolbarButton onClick={() => wrapSelection('_', '_', '_italic_')} title="Italic (⌘I)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 5v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V5z"/>
        </svg>
      </ToolbarButton>
      <ToolbarButton onClick={() => wrapSelection('`', '`', '`code`')} title="Code (⌘`)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </ToolbarButton>

      <Divider />

      <ToolbarButton onClick={() => insertAtCursor('- [ ] ')} title="Task (⌘⇧C)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        <span>Task</span>
      </ToolbarButton>
      <ToolbarButton onClick={() => insertAtCursor('\n---\n')} title="Horizontal Rule">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="12" x2="21" y2="12" />
        </svg>
        <span>Rule</span>
      </ToolbarButton>
      <ToolbarButton onClick={insertTime} title="Timestamp (⌘⇧T)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>Time</span>
      </ToolbarButton>

      <div style={{ flex: 1 }} />

      <ToolbarButton onClick={toggleZenMode} title="Zen Mode (Distraction-free)" active={zenMode}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3" />
          <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
          <path d="M3 16v3a2 2 0 0 0 2 2h3" />
          <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
        </svg>
        <span>Zen Mode</span>
      </ToolbarButton>

      <ToolbarButton onClick={onTogglePreview} title="Preview (⌘/)" active={isPreview}>
        {isPreview ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span>Edit</span>
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Preview</span>
          </>
        )}
      </ToolbarButton>
    </div>
  );
}
