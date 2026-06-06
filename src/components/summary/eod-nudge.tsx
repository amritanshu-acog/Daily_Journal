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
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--warning)',
        background: 'var(--warning-soft)',
        padding: '12px 16px',
        fontSize: '0.85rem',
        fontWeight: 500,
        color: 'var(--warning-text)',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
      It&apos;s after 4 PM — ready to wrap up?
    </div>
  );
}
