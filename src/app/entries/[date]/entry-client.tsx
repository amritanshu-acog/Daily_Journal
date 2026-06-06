'use client';

import { useState } from 'react';
import EntryEditor from '@/components/editor/entry-editor';
import CheckinSection from '@/components/checkin-section';
import SummarySection from '@/components/summary/summary-section';
import { isToday } from '@/lib/dates';

export default function EntryClient({
  date,
  initialContent,
  initialSummary,
  initialFormat,
  initialCheckin,
  carryOver,
  carryOverAllDone = false,
}: {
  date: string;
  initialContent: string;
  initialSummary: string | null;
  initialFormat: string | null;
  initialCheckin: string | null;
  carryOver: string[];
  carryOverAllDone?: boolean;
}) {
  const [wordCount, setWordCount] = useState(
    initialContent.trim() ? initialContent.trim().split(/\s+/).length : 0
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <EntryEditor
        date={date}
        initialContent={initialContent}
        carryOver={carryOver}
        carryOverAllDone={carryOverAllDone}
        onWordCountChange={setWordCount}
      />
      <CheckinSection
        date={date}
        initialCheckin={initialCheckin}
      />
      <SummarySection
        date={date}
        initialSummary={initialSummary}
        initialFormat={initialFormat}
        wordCount={wordCount}
        isToday={isToday(date)}
      />
    </div>
  );
}
