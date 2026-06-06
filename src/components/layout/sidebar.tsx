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
  const [collapsed, setCollapsed] = useState(false);

  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const [entriesRes, tagsRes] = await Promise.all([
        fetch('/api/entries'),
        fetch('/api/tags'),
      ]);
      if (!entriesRes.ok || !tagsRes.ok) return;
      const entriesData = await entriesRes.json();
      const tagsData = await tagsRes.json();
      setEntries(entriesData.dates ?? []);
      setTags(tagsData.tags ?? []);
    } catch {
      // silently fail
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  useEffect(() => {
    const handleSaved = () => {
      loadData(false);
    };
    window.addEventListener('entry-saved', handleSaved);
    return () => window.removeEventListener('entry-saved', handleSaved);
  }, [loadData]);

  // Sync collapsed state with localStorage and handle CustomEvent
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
      setCollapsed(isCollapsed);
    }
  }, []);

  const handleToggleSidebar = useCallback((e: Event) => {
    const detailActive = (e as CustomEvent).detail?.active;
    if (typeof detailActive === 'boolean') {
      setCollapsed(detailActive);
      localStorage.setItem('sidebar-collapsed', String(detailActive));
    } else {
      setCollapsed((prev) => {
        const next = !prev;
        localStorage.setItem('sidebar-collapsed', String(next));
        return next;
      });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('toggle-sidebar', handleToggleSidebar);
    return () => window.removeEventListener('toggle-sidebar', handleToggleSidebar);
  }, [handleToggleSidebar]);

  const handleToggleTag = useCallback((tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const sidebarStyle: React.CSSProperties = {
    width: collapsed ? 0 : 280,
    borderRight: collapsed ? '0px solid transparent' : '1px solid var(--sidebar-border)',
    background: 'var(--sidebar-bg)',
    padding: collapsed ? '20px 0' : '20px 16px',
    overflow: 'hidden',
    overflowY: collapsed ? 'hidden' : 'auto',
    flexShrink: 0,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: collapsed ? 0 : 1,
  };

  if (loading) {
    return (
      <aside className="hidden lg:block" style={sidebarStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 248 }}>
          {/* Heatmap skeleton */}
          <div>
            <div className="animate-shimmer" style={{ height: 14, width: 80, borderRadius: 'var(--radius-sm)', marginBottom: 12 }} />
            <div className="animate-shimmer" style={{ height: 80, borderRadius: 'var(--radius-md)' }} />
          </div>
          {/* Tags skeleton */}
          <div>
            <div className="animate-shimmer" style={{ height: 14, width: 50, borderRadius: 'var(--radius-sm)', marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 6 }}>
              <div className="animate-shimmer" style={{ height: 24, width: 70, borderRadius: 'var(--radius-full)' }} />
              <div className="animate-shimmer" style={{ height: 24, width: 55, borderRadius: 'var(--radius-full)' }} />
              <div className="animate-shimmer" style={{ height: 24, width: 60, borderRadius: 'var(--radius-full)' }} />
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:block animate-fade-in" style={sidebarStyle}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, width: 248 }}>
        <CalendarHeatmap entries={entries} activeTags={activeTags} />

        <div>
          <h2
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-tertiary)',
              marginBottom: 10,
            }}
          >
            Tags
          </h2>
          <TagFilter tags={tags} activeTags={activeTags} onToggle={handleToggleTag} />
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 16,
          }}
        >
          <Link
            href={`/weekly/${getMondayOfWeek(todayDate)}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.85rem',
              fontWeight: 500,
              color: 'var(--accent-text)',
              textDecoration: 'none',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              transition: 'all 0.15s ease',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--accent-soft)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Weekly Digest
          </Link>
        </div>
      </div>
    </aside>
  );
}
