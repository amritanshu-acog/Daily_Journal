'use client';

import { useRef } from 'react';
import Editor from './editor';
import CarryoverBanner from '../carryover-banner';
import WelcomeBanner from '../welcome-banner';

export default function EntryEditor({
  date,
  initialContent,
  carryOver,
  carryOverAllDone = false,
  onWordCountChange,
}: {
  date: string;
  initialContent: string;
  carryOver: string[];
  carryOverAllDone?: boolean;
  onWordCountChange?: (count: number) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const appendTask = (task: string) => {
    const ta = wrapperRef.current?.querySelector<HTMLTextAreaElement>('textarea');
    if (!ta) return;
    const text = `- [ ] ${task}\n`;
    const setter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype, 'value'
    )!.set!;
    setter.call(ta, ta.value + text);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const appendTasks = (tasks: string[]) => {
    const ta = wrapperRef.current?.querySelector<HTMLTextAreaElement>('textarea');
    if (!ta) return;
    const text = tasks.map((t) => `- [ ] ${t}`).join('\n') + '\n';
    const setter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype, 'value'
    )!.set!;
    setter.call(ta, ta.value + text);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  };

  return (
    <div ref={wrapperRef} className="flex flex-col flex-1 min-h-0">
      <WelcomeBanner />
      <CarryoverBanner
        tasks={carryOver}
        allDone={carryOverAllDone}
        onAdd={appendTask}
        onAddAll={appendTasks}
      />
      <Editor date={date} initialContent={initialContent} onWordCountChange={onWordCountChange} />
    </div>
  );
}
