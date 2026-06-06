'use client';

import { useState, useEffect, useCallback } from 'react';

const SHORTCUTS = [
  { keys: 'Ctrl+B', action: 'Bold selected text' },
  { keys: 'Ctrl+I', action: 'Italic selected text' },
  { keys: 'Ctrl+`', action: 'Inline code' },
  { keys: 'Ctrl+Shift+C', action: 'Insert checkbox' },
  { keys: 'Ctrl+Shift+T', action: 'Insert timestamp' },
  { keys: 'Ctrl+/', action: 'Toggle preview' },
  { keys: 'Ctrl+Enter', action: 'Generate summary' },
  { keys: 'T', action: 'Jump to today' },
  { keys: '?', action: 'Open this panel' },
  { keys: 'Escape', action: 'Close any open panel' },
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={closePanel}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          <button
            onClick={closePanel}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xl leading-none"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4">
          <table className="w-full text-sm">
            <tbody>
              {SHORTCUTS.map((s) => (
                <tr key={s.keys} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                  <td className="py-2 pr-4">
                    <kbd className="inline-block rounded border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-xs">
                      {s.keys}
                    </kbd>
                  </td>
                  <td className="py-2 text-zinc-600 dark:text-zinc-400">{s.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
