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
      className="animate-scale-in"
      style={{
        position: 'fixed',
        zIndex: 50,
        minWidth: 180,
        background: 'var(--surface-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
        ...style,
      }}
    >
      <ul style={{ padding: '4px', maxHeight: 200, overflowY: 'auto', listStyle: 'none', margin: 0 }}>
        {filtered.map((tag, i) => (
          <li key={tag}>
            <button
              type="button"
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '7px 12px',
                fontSize: '0.82rem',
                fontWeight: i === selectedIndex ? 500 : 400,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.1s ease',
                background: i === selectedIndex ? 'var(--accent-soft)' : 'transparent',
                color: i === selectedIndex ? 'var(--accent-text)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(tag);
              }}
            >
              <span style={{ color: i === selectedIndex ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.75rem' }}>#</span>
              {tag}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
