'use client';

import { useState, useEffect } from 'react';

export default function WelcomeBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const welcomed = localStorage.getItem('welcomed');
    if (!welcomed) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem('welcomed', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="animate-slide-down"
      style={{
        margin: '12px 20px 0',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        background: 'linear-gradient(135deg, var(--accent-soft), rgba(168, 85, 247, 0.06))',
        padding: '16px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative gradient orb */}
      <div
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'var(--accent-glow)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative' }}>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 12 }}>
          <span style={{ fontSize: '1.1rem', marginRight: 6 }}>👋</span>
          <strong>Welcome to your Daily Journal.</strong>
          <br />
          <span style={{ color: 'var(--text-secondary)' }}>
            Write throughout the day. Generate a summary when you&apos;re done.
            Unfinished tasks carry forward automatically.
          </span>
        </p>
        <button
          onClick={dismiss}
          style={{
            fontSize: '0.82rem',
            fontWeight: 600,
            color: 'var(--accent-text)',
            background: 'var(--accent-soft)',
            border: '1px solid var(--accent)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 14px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'var(--accent)';
            (e.currentTarget as HTMLElement).style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'var(--accent-soft)';
            (e.currentTarget as HTMLElement).style.color = 'var(--accent-text)';
          }}
        >
          Got it →
        </button>
      </div>
    </div>
  );
}
