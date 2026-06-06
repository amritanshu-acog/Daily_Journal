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
    <div className="mx-4 mt-2 mb-0 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
      <p className="mb-2">
        👋 Welcome to your Daily Journal.
        <br />
        Write throughout the day. Generate a summary when you&apos;re done.
        <br />
        Unfinished tasks carry forward automatically.
      </p>
      <button
        onClick={dismiss}
        className="font-medium text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
      >
        Got it →
      </button>
    </div>
  );
}
