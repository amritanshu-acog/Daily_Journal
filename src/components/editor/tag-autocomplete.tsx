'use client';

import { useMemo } from 'react';

interface Props {
  existingTags: string[];
  searchText: string;
  selectedIndex: number;
  onSelect: (tag: string) => void;
  style?: React.CSSProperties;
}

export default function TagAutocomplete({
  existingTags,
  searchText,
  selectedIndex,
  onSelect,
  style,
}: Props) {
  const filtered = useMemo(
    () =>
      existingTags.filter((t) =>
        t.toLowerCase().includes(searchText.toLowerCase())
      ),
    [existingTags, searchText]
  );

  if (filtered.length === 0 || !searchText) return null;

  return (
    <div
      className="fixed z-50 min-w-[160px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl overflow-hidden"
      style={style}
    >
      <ul className="py-1 max-h-48 overflow-y-auto">
        {filtered.map((tag, i) => (
          <li key={tag}>
            <button
              type="button"
              className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                i === selectedIndex
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(tag);
              }}
            >
              #{tag}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
