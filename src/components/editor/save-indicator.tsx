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
      else if (diff < 60) setDisplayText(`${diff}s ago`);
      else setDisplayText(`${Math.floor(diff / 60)}m ago`);
    };
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [status, savedTime]);

  const configs: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
    idle: {
      color: 'var(--text-muted)',
      bg: 'transparent',
      label: '—',
      icon: null,
    },
    saving: {
      color: 'var(--warning-text)',
      bg: 'var(--warning-soft)',
      label: 'Saving…',
      icon: (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
      ),
    },
    saved: {
      color: 'var(--success-text)',
      bg: 'var(--success-soft)',
      label: displayText ? `Saved ${displayText}` : 'Saved',
      icon: (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    retrying: {
      color: 'var(--warning-text)',
      bg: 'var(--warning-soft)',
      label: 'Retrying…',
      icon: (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
      ),
    },
    error: {
      color: 'var(--danger-text)',
      bg: 'var(--danger-soft)',
      label: 'Save failed',
      icon: (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
    },
  };

  const config = configs[status];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: '0.72rem',
        fontWeight: 500,
        color: config.color,
        background: status !== 'idle' ? config.bg : 'transparent',
        padding: status !== 'idle' ? '3px 10px' : '3px 0',
        borderRadius: 'var(--radius-full)',
        transition: 'all 0.2s ease',
      }}
    >
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
}
