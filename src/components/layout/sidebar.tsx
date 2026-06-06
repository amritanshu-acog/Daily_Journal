'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import CalendarHeatmap from '../sidebar/calendar-heatmap';
import TagFilter from '../sidebar/tag-filter';
import { getMondayOfWeek } from '@/lib/dates';

interface EntryInfo {
  date: string;
  hasSummary: boolean;
  tags: string[];
}

export default function Sidebar({ todayDate }: { todayDate: string }) {
  const [entries, setEntries] = useState<EntryInfo[]>([]);
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [entriesRes, tagsRes] = await Promise.all([
          fetch('/api/entries'),
          fetch('/api/tags'),
        ]);
        if (!entriesRes.ok || !tagsRes.ok) return;
        const entriesData = await entriesRes.json();
        const tagsData = await tagsRes.json();
        if (!cancelled) {
          setEntries(entriesData.dates ?? []);
          setTags(tagsData.tags ?? []);
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleToggleTag = useCallback((tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  if (loading) {
    return (
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-700 p-4 hidden lg:block shrink-0">
        <div className="space-y-6 animate-pulse">
          <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-24 rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-4 w-12 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="space-y-2">
            <div className="h-5 w-20 rounded-full bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-5 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-700 p-4 hidden lg:block shrink-0 overflow-y-auto">
      <div className="space-y-6">
        <CalendarHeatmap entries={entries} activeTags={activeTags} />

        <div>
          <h2 className="text-sm font-medium text-zinc-500 mb-2">Tags</h2>
          <TagFilter tags={tags} activeTags={activeTags} onToggle={handleToggleTag} />
        </div>

        <div>
          <Link
            href={`/weekly/${getMondayOfWeek(todayDate)}`}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            → This week&apos;s digest
          </Link>
        </div>
      </div>
    </aside>
  );
}
