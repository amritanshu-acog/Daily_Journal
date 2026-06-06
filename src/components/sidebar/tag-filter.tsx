'use client';

interface Props {
  tags: { tag: string; count: number }[];
  activeTags: string[];
  onToggle: (tag: string) => void;
}

export default function TagFilter({ tags, activeTags, onToggle }: Props) {
  if (tags.length === 0) {
    return <p className="text-xs text-zinc-400">No tags yet</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => {
        const isActive = activeTags.includes(t.tag);
        return (
          <button
            key={t.tag}
            onClick={() => onToggle(t.tag)}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
              isActive
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            #{t.tag}
            <span className={isActive ? 'text-blue-600 dark:text-blue-300' : 'text-zinc-400'}>
              ×{t.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
