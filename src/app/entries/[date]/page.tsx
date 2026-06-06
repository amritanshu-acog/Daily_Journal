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
    <div className="flex flex-col h-full">
      <DateNav date={date} streak={streak} />
      {!isToday(date) && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-sm text-amber-800 dark:text-amber-200">
          Viewing {formatDisplay(date)} · edits will update that day&apos;s entry
        </div>
      )}
      {isPastNoEntry ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-zinc-400 dark:text-zinc-500 text-lg">
            No entry for this day.
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
