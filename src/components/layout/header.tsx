'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 px-4 py-3">
      <h1 className="text-lg font-semibold">Daily Journal</h1>
      <div className="flex items-center gap-2">
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        )}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-shortcuts'))}
          aria-label="Help"
        >
          ?
        </button>
      </div>
    </header>
  );
}
