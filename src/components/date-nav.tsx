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

  return (
    <div className="flex flex-col gap-1 py-3 px-4 border-b border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={goToPrev}
            aria-label="Previous day"
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors text-lg leading-none px-1"
          >
            ←
          </button>

          <div className="relative">
            <button
              ref={dateButtonRef}
              onClick={() => {
                setViewMonth(parseISO(date));
                setIsPickerOpen(!isPickerOpen);
              }}
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {formatDisplay(date)}
            </button>

            {isPickerOpen && (
              <div
                ref={pickerRef}
                className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl p-3 w-72 max-w-[calc(100vw-2rem)]"
              >
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setViewMonth(subMonths(viewMonth, 1))}
                    aria-label="Previous month"
                    className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-sm px-2 py-1"
                  >
                    ←
                  </button>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {format(viewMonth, 'MMMM yyyy')}
                  </span>
                  <button
                    onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                    aria-label="Next month"
                    className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-sm px-2 py-1"
                  >
                    →
                  </button>
                </div>

                <div className="grid grid-cols-7 mb-1">
                  {dayLabels.map((label) => (
                    <div
                      key={label}
                      className="text-center text-xs font-medium text-zinc-400 dark:text-zinc-500 py-1"
                    >
                      {label}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7">
                  {days.map((day) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const isCurrentMonth = isSameMonth(day, viewMonth);
                    const isFutureDate = isFuture(day) && !isSameDay(day, new Date());
                    const isSelectedDay = isSameDay(day, currentDate);
                    const isToday2 = isTodayDateFns(day);
                    const isDisabled = isFutureDate;

                    return (
                      <button
                        key={dayStr}
                        disabled={isDisabled}
                        onClick={() => !isDisabled && navigateToDate(dayStr)}
                        className={`text-center text-sm py-1.5 rounded transition-colors
                          ${!isCurrentMonth ? 'text-zinc-300 dark:text-zinc-600' : ''}
                          ${isSelectedDay ? 'bg-blue-600 text-white font-semibold' : ''}
                          ${isToday2 && !isSelectedDay ? 'border border-blue-500 text-blue-600 dark:text-blue-400 font-semibold' : ''}
                          ${!isSelectedDay && !isToday2 && isCurrentMonth ? 'text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700' : ''}
                          ${isDisabled ? 'opacity-30 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent' : 'cursor-pointer'}
                        `}
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
            className={`text-lg leading-none px-1 transition-colors ${
              isOnToday
                ? 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            →
          </button>

          {!isOnToday && (
            <button
              onClick={goToToday}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline ml-1"
            >
              → Today
            </button>
          )}

          <span className="text-sm text-zinc-500 dark:text-zinc-400 ml-2 flex items-center gap-1">
            <span>🔥</span>
            <span>
              Streak: {streak} weekday{streak !== 1 ? 's' : ''}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
