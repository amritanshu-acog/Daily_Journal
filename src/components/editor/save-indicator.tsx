'use client';

import { useEffect, useState } from 'react';

export default function SaveIndicator({
  status,
  savedTime,
}: {
  status: 'idle' | 'saving' | 'saved' | 'retrying' | 'error';
  savedTime: Date | null;
}) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (status !== 'saved' || !savedTime) {
      setDisplayText('');
      return;
    }
    const update = () => {
      const diff = Math.floor((Date.now() - savedTime.getTime()) / 1000);
      if (diff < 10) setDisplayText('just now');
      else if (diff < 60) setDisplayText(`${diff} seconds ago`);
      else setDisplayText(`${Math.floor(diff / 60)} min ago`);
    };
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [status, savedTime]);

  const dotColors: Record<string, string> = {
    idle: 'bg-gray-400',
    saving: 'bg-amber-500',
    saved: 'bg-green-500',
    retrying: 'bg-amber-500',
    error: 'bg-red-500',
  };

  const labels: Record<string, string> = {
    idle: '\u2014',
    saving: 'Saving\u2026',
    saved: displayText ? `Saved ${displayText}` : 'Saved just now',
    retrying: 'Retrying\u2026',
    error: 'Save failed \u2014 check your connection',
  };

  return (
    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
      <span className={`h-1.5 w-1.5 rounded-full ${dotColors[status]}`} />
      <span>{labels[status]}</span>
    </div>
  );
}
