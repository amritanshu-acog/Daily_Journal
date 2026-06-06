import { format, parseISO } from 'date-fns';
import type { Metadata } from 'next';
import { getWeeklyDigest, getEntriesForWeek, getEntry } from '@/lib/db';
import { getMondayOfWeek, getWeekDays } from '@/lib/dates';
import WeeklyDigest from '@/components/weekly-digest';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  const weekStart = getMondayOfWeek(date);
  const weekDays = getWeekDays(weekStart);
  const title = `Week of ${format(parseISO(weekDays[0]), 'MMMM d')} – ${format(parseISO(weekDays[4]), 'MMMM d, yyyy')}`;
  return { title: `Journal — ${title}` };
}

export default async function WeeklyPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const weekStart = getMondayOfWeek(date);
  const weekDays = getWeekDays(weekStart);

  const digest = getWeeklyDigest(weekStart);
  const days = weekDays.map((d) => ({
    date: d,
    hasEntry: (getEntry(d)?.content.trim().length ?? 0) > 0,
  }));

  return (
    <div className="flex flex-col h-full">
      <WeeklyDigest
        weekStart={weekStart}
        initialDigest={digest?.content ?? null}
        days={days}
      />
    </div>
  );
}
