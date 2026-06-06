import { format, parseISO } from 'date-fns';
import type { Metadata } from 'next';
import { getEntry, getAllEntryDates, getSkippedTasks } from '@/lib/db';
import { calculateStreak, isToday, formatDisplay, prevDay, todayString } from '@/lib/dates';
import { extractUncheckedTasks, extractAllTasks } from '@/lib/markdown';
import EntryClient from './entry-client';
import DateNav from '@/components/date-nav';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  const display = format(parseISO(date), 'EEEE, MMMM d');
  return { title: `Journal — ${display}` };
}

export default async function EntryPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const entry = getEntry(date);
  const allDates = getAllEntryDates().map((d) => d.date);
  const streak = calculateStreak(allDates);

  const prevDate = prevDay(date);
  const prevEntry = getEntry(prevDate);
  const skippedTasks = new Set(getSkippedTasks());
  let carryOver: string[] = [];
  let carryOverAllDone = false;
  if (prevEntry) {
    const { checked, unchecked } = extractAllTasks(prevEntry.content);
    carryOver = unchecked.filter((t) => !skippedTasks.has(t));
    carryOverAllDone = checked.length > 0 && unchecked.length === 0;
  }

  const isPastNoEntry = date < todayString() && !entry;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <DateNav date={date} streak={streak} />
      {!isToday(date) && (
        <div
          className="animate-fade-in"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--warning-soft)',
            borderBottom: '1px solid var(--warning)',
            padding: '10px 20px',
            fontSize: '0.82rem',
            fontWeight: 500,
            color: 'var(--warning-text)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Viewing {formatDisplay(date)} · edits will update that day&apos;s entry
        </div>
      )}
      {isPastNoEntry ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 500 }}>
            No entry for this day
          </p>
        </div>
      ) : (
        <EntryClient
          date={date}
          initialContent={entry?.content ?? ''}
          initialSummary={entry?.summary ?? null}
          initialFormat={entry?.summary_format ?? null}
          initialCheckin={entry?.checkin ?? null}
          carryOver={carryOver}
          carryOverAllDone={carryOverAllDone}
        />
      )}
    </div>
  );
}
