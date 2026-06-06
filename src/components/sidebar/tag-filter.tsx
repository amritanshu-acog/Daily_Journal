'use client';

interface Props {
  tags: { tag: string; count: number }[];
  activeTags: string[];
  onToggle: (tag: string) => void;
}

export default function TagFilter({ tags, activeTags, onToggle }: Props) {
  if (tags.length === 0) {
    return (
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
        No tags yet — type # in your entry
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {tags.map((t) => {
        const isActive = activeTags.includes(t.tag);
        return (
          <button
            key={t.tag}
            onClick={() => onToggle(t.tag)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem',
              fontWeight: 500,
              border: isActive ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
              background: isActive ? 'var(--accent-soft)' : 'var(--surface)',
              color: isActive ? 'var(--accent-text)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.background = 'var(--surface)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
              }
            }}
          >
            <span style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}>#</span>
            {t.tag}
            <span
              style={{
                fontSize: '0.65rem',
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                opacity: 0.8,
              }}
            >
              {t.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
