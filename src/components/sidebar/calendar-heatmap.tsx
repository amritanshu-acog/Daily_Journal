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

  const cellClass = useCallback(
    (cell: DayCell) => {
      const filtered = isFiltered(cell);
      if (!cell.inRange) return 'bg-transparent w-3 h-3';
      if (filtered) return 'bg-zinc-200 dark:bg-zinc-700 opacity-[0.15] w-3 h-3 rounded-sm';

      const cls = ['w-3 h-3 rounded-sm'];
      if (noData) {
        cls.push('bg-gray-200 dark:bg-gray-700 animate-pulse');
      } else {
        const isWeekend = cell.dayOfWeek === 0 || cell.dayOfWeek === 6;
        if (!cell.entry) {
          cls.push('bg-gray-100 dark:bg-gray-800');
        } else if (cell.entry.hasSummary) {
          cls.push('bg-green-500 dark:bg-green-500');
        } else {
          cls.push('bg-green-300 dark:bg-green-700');
        }
        if (isWeekend) cls.push('opacity-70');
      }
      if (isToday(parseISO(cell.date))) cls.push('ring-2 ring-blue-400');

      return cls.join(' ');
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
    <div className="space-y-2" data-heatmap>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-500">Heatmap</h2>
        <button
          onClick={() => setRange((r) => (r === '3months' ? 'year' : '3months'))}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          {range === '3months' ? 'This year' : 'Last 3 months'}
        </button>
      </div>

      <div className="relative">
        <div className="flex gap-px">
          {monthLabels.map((m) => (
            <div
              key={m.label}
              className="text-[10px] text-zinc-400 leading-tight"
              style={{ width: `${m.index * 16}px`, marginLeft: m.index === 0 ? 0 : undefined }}
            >
              {m.label}
            </div>
          ))}
        </div>
        <div className="flex gap-px mt-0.5">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-px">
              {week.map((cell) => (
                <button
                  key={cell.date}
                  className={cellClass(cell)}
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
            className="absolute z-50 px-2 py-1 text-xs rounded bg-zinc-800 text-white whitespace-nowrap pointer-events-none shadow-lg"
            style={{ left: tooltip.x, top: tooltip.y, transform: 'translateX(-50%)' }}
          >
            {tooltipText(tooltip.date, tooltip.entry)}
          </div>
        )}
      </div>

      <div className="text-sm font-medium">
        {streak > 0 ? (
          <span>🔥 {streak}-day streak</span>
        ) : (
          <span className="text-zinc-400">
            {noData ? 'Your streak starts today' : 'Start your streak today'}
          </span>
        )}
      </div>
    </div>
  );
}
