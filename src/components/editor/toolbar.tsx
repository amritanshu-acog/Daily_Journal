'use client';

import { useCallback } from 'react';

interface ToolbarProps {
  content: string;
  onChange: (v: string) => void;
  onTogglePreview: () => void;
  isPreview: boolean;
  editorRef: React.RefObject<HTMLTextAreaElement | null>;
}

export default function Toolbar({ content, onChange, onTogglePreview, isPreview, editorRef }: ToolbarProps) {
  const wrapSelection = useCallback(
    (before: string, after: string, fallback: string) => {
      const el = editorRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const selected = content.slice(start, end);
      const replacement = selected ? `${before}${selected}${after}` : fallback;
      const newContent = content.slice(0, start) + replacement + content.slice(end);
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
    <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-700 px-2 py-1">
      <button
        onClick={() => wrapSelection('**', '**', '**bold**')}
        className="rounded px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </button>
      <button
        onClick={() => wrapSelection('_', '_', '_italic_')}
        className="rounded px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </button>
      <button
        onClick={() => wrapSelection('`', '`', '`code`')}
        className="rounded px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
        title="Code (Ctrl+`)"
      >
        <code>`</code>
      </button>
      <button
        onClick={() => insertAtCursor('- [ ] ')}
        className="rounded px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
        title="Task (Ctrl+Shift+C)"
      >
        ☑ Task
      </button>
      <button
        onClick={() => insertAtCursor('\n---\n')}
        className="rounded px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
        title="Rule"
      >
        — Rule
      </button>
      <button
        onClick={insertTime}
        className="rounded px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
        title="Time (Ctrl+Shift+T)"
      >
        ⏱ Time
      </button>
      <div className="flex-1" />
      <button
        onClick={onTogglePreview}
        className="rounded px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
        title="Preview (Ctrl+/)"
      >
        {isPreview ? '✏ Edit' : '👁 Preview'}
      </button>
    </div>
  );
}
