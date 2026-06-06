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
      <div className="border border-green-200 dark:border-green-800 rounded-lg mx-4 mt-2 mb-0 bg-green-50 dark:bg-green-900/20 transition-opacity duration-500 opacity-100">
        <div className="px-3 py-2 text-sm text-green-700 dark:text-green-300 font-medium text-center">
          All done yesterday 🎉
        </div>
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

  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg mx-4 mt-2 mb-0 bg-white dark:bg-zinc-900">
      <div className="px-3 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
        Yesterday&apos;s unfinished tasks
      </div>
      <div className="px-3 py-1.5 space-y-1">
        {remaining.map((task) => (
          <div key={task} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex-1 truncate">{task}</span>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => handleAdd(task)}
                className="px-1.5 py-0.5 text-xs rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
              >
                + Add
              </button>
              <button
                onClick={() => handleSkip(task)}
                className="px-1.5 py-0.5 text-xs rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800"
              >
                ✕ Skip
              </button>
            </div>
          </div>
        ))}
      </div>
      {remaining.length > 1 && (
        <div className="flex justify-end gap-2 px-3 py-1.5 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={handleAddAll}
            className="px-2 py-0.5 text-xs rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
          >
            Add all
          </button>
          <button
            onClick={handleSkipAll}
            className="px-2 py-0.5 text-xs rounded text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Skip all
          </button>
        </div>
      )}
    </div>
  );
}
