'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  format,
  parseISO,
  subMonths,
  startOfYear,
  startOfWeek,
  endOfWeek,
  isToday,
  getDay,
} from 'date-fns';
import { calculateStreak } from '@/lib/dates';

interface EntryInfo {
  date: string;
  hasSummary: boolean;
  tags: string[];
}

interface Props {
  entries: EntryInfo[];
  activeTags: string[];
}

type Range = '3months' | 'year';

interface DayCell {
  date: string;
  dayOfWeek: number;
  entry: EntryInfo | null;
  inRange: boolean;
}

export default function CalendarHeatmap({ entries, activeTags }: Props) {
  const router = useRouter();
  const [range, setRange] = useState<Range>('3months');
  const [tooltip, setTooltip] = useState<{
    date: string;
    x: number;
    y: number;
    entry: EntryInfo | null;
  } | null>(null);

  const entryMap = useMemo(() => {
    const map = new Map<string, EntryInfo>();
    for (const e of entries) map.set(e.date, e);
    return map;
  }, [entries]);

  const noData = entries.length === 0;

  const { weeks, monthLabels, entryDates } = useMemo(() => {
    const today = new Date();
    const endDate = today;
    const startDate = range === '3months' ? subMonths(today, 3) : startOfYear(today);

    const gridStart = startOfWeek(startDate, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(endDate, { weekStartsOn: 1 });

    const days: Date[] = [];
    const cur = new Date(gridStart);
    while (cur <= gridEnd) {
      days.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }

    const weeks: DayCell[][] = [];
    let currentWeek: DayCell[] = [];
    const entryDates: string[] = [];

    for (const day of days) {
      const ds = format(day, 'yyyy-MM-dd');
      const entry = entryMap.get(ds) ?? null;
      if (entry) entryDates.push(ds);

      const cell: DayCell = {
        date: ds,
        dayOfWeek: getDay(day),
        entry,
        inRange: day >= startDate && day <= endDate,
      };

      currentWeek.push(cell);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    const monthLabels: { index: number; label: string }[] = [];
    let lastMonth = -1;
    for (let w = 0; w < weeks.length; w++) {
      for (const day of weeks[w]) {
        if (!day.inRange) continue;
        const m = parseISO(day.date).getMonth();
        if (m !== lastMonth) {
          lastMonth = m;
          monthLabels.push({ index: w, label: format(new Date(2024, m, 1), 'MMM') });
          break;
        }
      }
    }

    return { weeks, monthLabels, entryDates };
  }, [range, entryMap]);

  const streak = useMemo(() => calculateStreak(entryDates), [entryDates]);

  const isFiltered = useCallback(
    (cell: DayCell) => {
      if (activeTags.length === 0 || !cell.entry) return false;
      return !activeTags.every((tag) => cell.entry!.tags.includes(tag));
    },
    [activeTags]
  );

  const getCellStyle = useCallback(
    (cell: DayCell): React.CSSProperties => {
      const base: React.CSSProperties = {
        width: 12,
        height: 12,
        borderRadius: 3,
        border: 'none',
        cursor: cell.inRange ? 'pointer' : 'default',
        transition: 'all 0.1s ease',
        padding: 0,
      };

      if (!cell.inRange) return { ...base, background: 'transparent' };

      const filtered = isFiltered(cell);
      if (filtered) return { ...base, background: 'var(--surface-muted)', opacity: 0.15 };

      if (noData) return { ...base, background: 'var(--surface-muted)' };

      const isWeekend = cell.dayOfWeek === 0 || cell.dayOfWeek === 6;

      let bg = 'var(--surface-muted)';
      if (cell.entry) {
        bg = cell.entry.hasSummary ? '#22c55e' : '#86efac';
      }

      const isTodayCell = isToday(parseISO(cell.date));

      return {
        ...base,
        background: bg,
        opacity: isWeekend ? 0.6 : 1,
        outline: isTodayCell ? '2px solid var(--accent)' : 'none',
        outlineOffset: 1,
      };
    },
    [isFiltered, noData]
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent, cell: DayCell) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const parent = (e.currentTarget as HTMLElement)
        .closest('[data-heatmap]')
        ?.getBoundingClientRect();
      const x = rect.left - (parent?.left ?? 0) + rect.width / 2;
      const y = rect.bottom - (parent?.top ?? 0) + 4;
      setTooltip({ date: cell.date, x, y, entry: cell.entry });
    },
    []
  );

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  const tooltipText = useCallback((date: string, entry: EntryInfo | null) => {
    const d = format(parseISO(date), 'MMMM d');
    if (!entry) return `${d} · no entry`;
    return `${d} · ${entry.hasSummary ? 'summary generated' : 'notes only'}`;
  }, []);

  return (
    <div data-heatmap style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2
          style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-tertiary)',
          }}
        >
          Activity
        </h2>
        <button
          onClick={() => setRange((r) => (r === '3months' ? 'year' : '3months'))}
          style={{
            fontSize: '0.7rem',
            fontWeight: 500,
            color: 'var(--accent-text)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'var(--accent-soft)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          {range === '3months' ? 'This year' : 'Last 3 months'}
        </button>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: 1, marginBottom: 2 }}>
          {monthLabels.map((m) => (
            <div
              key={m.label}
              style={{
                fontSize: '9px',
                color: 'var(--text-muted)',
                fontWeight: 500,
                width: `${m.index * 16}px`,
                marginLeft: m.index === 0 ? 0 : undefined,
              }}
            >
              {m.label}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {week.map((cell) => (
                <button
                  key={cell.date}
                  style={getCellStyle(cell)}
                  onMouseEnter={(e) => handleMouseEnter(e, cell)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => cell.inRange && router.push(`/entries/${cell.date}`)}
                  aria-label={cell.date}
                />
              ))}
            </div>
          ))}
        </div>

        {tooltip && (
          <div
            className="animate-fade-in"
            style={{
              position: 'absolute',
              zIndex: 50,
              padding: '5px 10px',
              fontSize: '0.7rem',
              fontWeight: 500,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--text-primary)',
              color: 'var(--background)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              boxShadow: 'var(--shadow-lg)',
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translateX(-50%)',
            }}
          >
            {tooltipText(tooltip.date, tooltip.entry)}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.82rem',
          fontWeight: 600,
        }}
      >
        {streak > 0 ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--warning-text)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 23c-3.866 0-7-2.686-7-6 0-2.418 1.466-4.505 3-6.282V8c0-.552.448-1 1-1s1 .448 1 1v1.5c.624-.538 1.3-.998 2-1.37V4c0-.552.448-1 1-1s1 .448 1 1v3.313c.363-.072.69-.129 1-.184V2c0-.552.448-1 1-1s1 .448 1 1v5.5c.69.318 1.376.778 2 1.316V7c0-.552.448-1 1-1s1 .448 1 1v3.718C21.534 12.495 23 14.582 23 17c0 3.314-3.134 6-7 6h-4z" />
            </svg>
            {streak}-day streak
          </span>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>
            {noData ? 'Your streak starts today' : 'Start your streak today'}
          </span>
        )}
      </div>
    </div>
  );
}
