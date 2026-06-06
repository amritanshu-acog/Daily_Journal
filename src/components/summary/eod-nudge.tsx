'use client';

import { useState, useEffect } from 'react';

export default function EodNudge({
  wordCount,
  hasSummary,
  isToday,
}: {
  wordCount: number;
  hasSummary: boolean;
  isToday: boolean;
}) {
  const [hour, setHour] = useState(new Date().getHours());

  useEffect(() => {
    const interval = setInterval(() => {
      setHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!(isToday && wordCount >= 50 && !hasSummary && hour >= 16)) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
      It&apos;s after 4 PM — ready to wrap up? ✨
    </div>
  );
}
