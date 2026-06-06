'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  format,
  parseISO,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isFuture,
  isToday as isTodayDateFns,
} from 'date-fns';
import { todayString, prevDay, nextDay, formatDisplay } from '@/lib/dates';

export default function DateNav({
  date,
  streak,
}: {
  date: string;
  streak: number;
}) {
  const router = useRouter();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => parseISO(date));
  const pickerRef = useRef<HTMLDivElement>(null);
  const dateButtonRef = useRef<HTMLButtonElement>(null);

  const today = todayString();
  const isOnToday = date === today;

  const goToPrev = useCallback(() => {
    router.push(`/entries/${prevDay(date)}`);
  }, [date, router]);

  const goToNext = useCallback(() => {
    if (!isOnToday) {
      router.push(`/entries/${nextDay(date)}`);
    }
  }, [date, isOnToday, router]);

  const goToToday = useCallback(() => {
    router.push(`/entries/${today}`);
  }, [router, today]);

  const navigateToDate = useCallback(
    (target: string) => {
      setIsPickerOpen(false);
      router.push(`/entries/${target}`);
    },
    [router]
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (!isOnToday) goToNext();
      } else if (e.key === 'Escape') {
        setIsPickerOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrev, goToNext, isOnToday]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        dateButtonRef.current &&
        !dateButtonRef.current.contains(e.target as Node)
      ) {
        setIsPickerOpen(false);
      }
    }

    if (isPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPickerOpen]);

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const currentDate = parseISO(date);

  const navBtnStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    flexShrink: 0,
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: '14px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--surface)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={goToPrev}
            aria-label="Previous day"
            style={navBtnStyle}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div style={{ position: 'relative' }}>
            <button
              ref={dateButtonRef}
              onClick={() => {
                setViewMonth(parseISO(date));
                setIsPickerOpen(!isPickerOpen);
              }}
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.15s ease',
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              {formatDisplay(date)}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {isPickerOpen && (
              <div
                ref={pickerRef}
                className="animate-scale-in"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 6,
                  zIndex: 50,
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  padding: 16,
                  width: 300,
                  maxWidth: 'calc(100vw - 2rem)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <button
                    onClick={() => setViewMonth(subMonths(viewMonth, 1))}
                    aria-label="Previous month"
                    style={{
                      ...navBtnStyle,
                      width: 28,
                      height: 28,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)';
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {format(viewMonth, 'MMMM yyyy')}
                  </span>
                  <button
                    onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                    aria-label="Next month"
                    style={{
                      ...navBtnStyle,
                      width: 28,
                      height: 28,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)';
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
                  {dayLabels.map((label) => (
                    <div
                      key={label}
                      style={{
                        textAlign: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        color: 'var(--text-muted)',
                        padding: '4px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                  {days.map((day) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const isCurrentMonth = isSameMonth(day, viewMonth);
                    const isFutureDate = isFuture(day) && !isSameDay(day, new Date());
                    const isSelectedDay = isSameDay(day, currentDate);
                    const isToday2 = isTodayDateFns(day);
                    const isDisabled = isFutureDate;

                    let bg = 'transparent';
                    let color = isCurrentMonth ? 'var(--text-primary)' : 'var(--text-muted)';
                    let fontWeight = '400';
                    let border = 'none';
                    let opacity = 1;

                    if (isSelectedDay) {
                      bg = 'var(--accent)';
                      color = '#ffffff';
                      fontWeight = '600';
                    } else if (isToday2) {
                      border = '1.5px solid var(--accent)';
                      color = 'var(--accent-text)';
                      fontWeight = '600';
                    }

                    if (isDisabled) {
                      opacity = 0.25;
                    }

                    return (
                      <button
                        key={dayStr}
                        disabled={isDisabled}
                        onClick={() => !isDisabled && navigateToDate(dayStr)}
                        style={{
                          textAlign: 'center',
                          fontSize: '0.8rem',
                          padding: '6px 0',
                          borderRadius: 'var(--radius-sm)',
                          transition: 'all 0.1s ease',
                          background: bg,
                          color,
                          fontWeight,
                          border,
                          opacity,
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelectedDay && !isDisabled) {
                            (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelectedDay && !isDisabled) {
                            (e.currentTarget as HTMLElement).style.background = bg;
                          }
                        }}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={goToNext}
            disabled={isOnToday}
            aria-label="Next day"
            style={{
              ...navBtnStyle,
              opacity: isOnToday ? 0.3 : 1,
              cursor: isOnToday ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isOnToday) {
                (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {!isOnToday && (
            <button
              onClick={goToToday}
              style={{
                fontSize: '0.78rem',
                fontWeight: 500,
                color: 'var(--accent-text)',
                background: 'var(--accent-soft)',
                border: 'none',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                marginLeft: 4,
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
              Today
            </button>
          )}

          {streak > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '0.8rem',
                fontWeight: 500,
                color: 'var(--warning-text)',
                background: 'var(--warning-soft)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                marginLeft: 6,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 23c-3.866 0-7-2.686-7-6 0-2.418 1.466-4.505 3-6.282V8c0-.552.448-1 1-1s1 .448 1 1v1.5c.624-.538 1.3-.998 2-1.37V4c0-.552.448-1 1-1s1 .448 1 1v3.313c.363-.072.69-.129 1-.184V2c0-.552.448-1 1-1s1 .448 1 1v5.5c.69.318 1.376.778 2 1.316V7c0-.552.448-1 1-1s1 .448 1 1v3.718C21.534 12.495 23 14.582 23 17c0 3.314-3.134 6-7 6h-4z" />
              </svg>
              <span>
                {streak} day{streak !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
