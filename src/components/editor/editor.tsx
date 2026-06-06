'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Toolbar from './toolbar';
import SaveIndicator from './save-indicator';
import TagAutocomplete from './tag-autocomplete';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'retrying' | 'error';

function getWordAtCursor(text: string, cursor: number): string | null {
  const beforeCursor = text.slice(0, cursor);
  const match = beforeCursor.match(/(?:^|\s)(#([a-zA-Z0-9_-]*))$/);
  return match ? match[2] : null;
}

function replacePartialTag(text: string, cursor: number, fullTag: string): string {
  const beforeCursor = text.slice(0, cursor);
  const afterCursor = text.slice(cursor);
  const match = beforeCursor.match(/(^|\s)(#[a-zA-Z0-9_-]*)$/);
  if (!match) return text;
  const replaceStart = match.index! + match[1]!.length;
  return text.slice(0, replaceStart) + `#${fullTag} ` + afterCursor;
}

function measureCursorPosition(ta: HTMLTextAreaElement): { left: number; top: number } | undefined {
  const pos = ta.selectionStart;
  if (pos === undefined) return undefined;
  const textBefore = ta.value.slice(0, pos);
  const mirror = document.createElement('div');
  const cs = window.getComputedStyle(ta);
  mirror.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'visibility:hidden',
    'white-space:pre-wrap',
    'overflow-wrap:break-word',
    `font-size:${cs.fontSize}`,
    `font-family:${cs.fontFamily}`,
    `line-height:${cs.lineHeight}`,
    `padding:${cs.padding}`,
    `width:${ta.clientWidth}px`,
    `border:${cs.border}`,
  ].join(';');
  mirror.textContent = textBefore;
  document.body.appendChild(mirror);
  const mirrorRect = mirror.getBoundingClientRect();
  const taRect = ta.getBoundingClientRect();
  document.body.removeChild(mirror);
  return {
    left: Math.max(0, mirrorRect.left - taRect.left),
    top: mirrorRect.bottom - taRect.top + 4,
  };
}

export default function Editor({ date, initialContent, loading = false, onWordCountChange }: { date: string; initialContent: string; loading?: boolean; onWordCountChange?: (count: number) => void }) {
  const [content, setContent] = useState(initialContent);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isPreview, setIsPreview] = useState(false);
  const [savedTime, setSavedTime] = useState<Date | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [tagAutocompleteOpen, setTagAutocompleteOpen] = useState(false);
  const [tagSearchText, setTagSearchText] = useState('');
  const [tagSelectedIndex, setTagSelectedIndex] = useState(0);
  const [tagPosition, setTagPosition] = useState<{ left: number; top: number } | undefined>(undefined);
  const [showFirstTagTip, setShowFirstTagTip] = useState(false);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  useEffect(() => {
    fetch('/api/tags')
      .then((r) => r.json())
      .then((d) => setExistingTags(d.tags?.map((t: { tag: string }) => t.tag) ?? []))
      .catch(() => {});
  }, []);

  const save = useCallback(
    async (text: string) => {
      setSaveStatus('saving');
      try {
        const res = await fetch(`/api/entries/${date}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text }),
        });
        if (!res.ok) throw new Error('Save failed');
        setSaveStatus('saved');
        setSavedTime(new Date());
      } catch {
        setSaveStatus('error');
      }
    },
    [date]
  );

  const handleChange = useCallback(
    (value: string) => {
      setContent(value);
      const wc = value.trim() ? value.trim().split(/\s+/).length : 0;
      onWordCountChange?.(wc);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => save(value), 1500);
    },
    [save, onWordCountChange]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (saveStatus !== 'saved') return;
    const timer = setTimeout(() => setSaveStatus('idle'), 3000);
    return () => clearTimeout(timer);
  }, [saveStatus]);

  const filteredTags = useMemo(
    () =>
      existingTags.filter((t) =>
        t.toLowerCase().includes(tagSearchText.toLowerCase())
      ),
    [existingTags, tagSearchText]
  );

  const detectTagAutocomplete = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta || document.activeElement !== ta) {
      setTagAutocompleteOpen(false);
      setShowFirstTagTip(false);
      return;
    }
    const cursor = ta.selectionStart;
    const searchText = getWordAtCursor(ta.value, cursor);
    if (searchText !== null) {
      setTagSearchText(searchText);
      setTagAutocompleteOpen(true);
      const pos = measureCursorPosition(ta);
      if (pos) setTagPosition(pos);
      if (typeof window !== 'undefined') {
        const shown = localStorage.getItem('tag-tip-shown');
        if (!shown) {
          setShowFirstTagTip(true);
          localStorage.setItem('tag-tip-shown', 'true');
        }
      }
    } else {
      if (tagAutocompleteOpen) {
        setTagAutocompleteOpen(false);
        setShowFirstTagTip(false);
      }
    }
  }, [tagAutocompleteOpen]);

  const selectTag = useCallback(
    (tag: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const cursor = ta.selectionStart;
      const newContent = replacePartialTag(content, cursor, tag);
      handleChange(newContent);
      setTagAutocompleteOpen(false);
      setShowFirstTagTip(false);
      requestAnimationFrame(() => {
        ta.focus();
        const idx = newContent.indexOf(`#${tag} `, Math.max(0, cursor - 20));
        if (idx !== -1) {
          const newCursor = idx + tag.length + 2;
          ta.setSelectionRange(newCursor, newCursor);
        }
      });
    },
    [content, handleChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (tagAutocompleteOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setTagSelectedIndex((prev) =>
            Math.min(prev + 1, filteredTags.length - 1)
          );
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setTagSelectedIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && filteredTags[tagSelectedIndex]) {
          e.preventDefault();
          selectTag(filteredTags[tagSelectedIndex]);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setTagAutocompleteOpen(false);
          setShowFirstTagTip(false);
        }
        return;
      }

      const isCtrl = e.ctrlKey || e.metaKey;
      const el = textareaRef.current;
      if (!el) return;

      const start = el.selectionStart;
      const end = el.selectionEnd;
      const selected = content.slice(start, end);

      const wrap = (before: string, after: string, fallback: string) => {
        e.preventDefault();
        const replacement = selected
          ? `${before}${selected}${after}`
          : fallback;
        const newContent =
          content.slice(0, start) + replacement + content.slice(end);
        handleChange(newContent);
        requestAnimationFrame(() => {
          el.focus();
          const cursor = start + replacement.length;
          el.setSelectionRange(cursor, cursor);
        });
      };

      const insert = (text: string) => {
        e.preventDefault();
        const newContent =
          content.slice(0, start) + text + content.slice(end);
        handleChange(newContent);
        requestAnimationFrame(() => {
          el.focus();
          const cursor = start + text.length;
          el.setSelectionRange(cursor, cursor);
        });
      };

      if (isCtrl && e.key === '/') {
        e.preventDefault();
        setIsPreview((p) => !p);
      } else if (isCtrl && e.key === 'b') {
        wrap('**', '**', '**bold**');
      } else if (isCtrl && e.key === 'i') {
        wrap('_', '_', '_italic_');
      } else if (isCtrl && e.key === '`') {
        wrap('`', '`', '`code`');
      } else if (isCtrl && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        insert('- [ ] ');
      } else if (isCtrl && e.shiftKey && (e.key === 'T' || e.key === 't')) {
        const now = new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
        insert(`**${now}**`);
      }
    },
    [
      content,
      handleChange,
      tagAutocompleteOpen,
      filteredTags,
      tagSelectedIndex,
      selectTag,
    ]
  );

  const handleInput = useCallback(
    () => {
      detectTagAutocomplete();
    },
    [detectTagAutocomplete]
  );

  const handleTextareaClick = useCallback(() => {
    detectTagAutocomplete();
  }, [detectTagAutocomplete]);

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        detectTagAutocomplete();
      }
    },
    [detectTagAutocomplete]
  );

  const handleFocus = useCallback(() => {
    detectTagAutocomplete();
  }, [detectTagAutocomplete]);

  const handleBlur = useCallback(() => {
    setTagAutocompleteOpen(false);
    setShowFirstTagTip(false);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-full relative animate-pulse">
        <div className="flex items-center gap-1 border-b px-2 py-1">
          <div className="h-6 w-8 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-6 w-6 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-6 w-6 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-6 w-12 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-6 w-12 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-6 w-12 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex-1" />
          <div className="h-6 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="flex-1 p-4 space-y-3">
          <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-5/6 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-4/5 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="flex items-center justify-between px-4 pb-2">
          <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      <Toolbar
        editorRef={textareaRef}
        content={content}
        onChange={handleChange}
        onTogglePreview={() => setIsPreview((p) => !p)}
        isPreview={isPreview}
      />
      {isPreview ? (
        <div className="flex-1 overflow-auto p-4 prose dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content || '*No content yet*'}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onClick={handleTextareaClick}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="w-full h-full resize-y border-0 p-4 outline-none font-mono text-sm bg-transparent dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            placeholder={`What did you work on today?\n\n- [ ] Add a todo like this\n- [x] Check off a completed task like this\nTag a project with a hashtag: #project-name\n\nOr just write freely — notes, decisions, blockers, wins.`}
          />
          {tagAutocompleteOpen && (
            <>
              <TagAutocomplete
                existingTags={existingTags}
                searchText={tagSearchText}
                selectedIndex={tagSelectedIndex}
                onSelect={selectTag}
                style={{
                  left: tagPosition?.left ?? 0,
                  top: (tagPosition?.top ?? 0) + 32,
                }}
              />
              {showFirstTagTip && (
                <div
                  className="fixed z-50 px-3 py-2 text-xs rounded-lg bg-blue-600 text-white shadow-lg pointer-events-none"
                  style={{
                    left: tagPosition ? tagPosition.left + 8 : 0,
                    top: tagPosition ? tagPosition.top + 24 : 0,
                  }}
                >
                  Tagging a project &mdash; it&apos;ll appear in your sidebar.
                  <div className="absolute -bottom-1 left-4 w-2 h-2 bg-blue-600 rotate-45" />
                </div>
              )}
            </>
          )}
        </div>
      )}
      <div className="flex items-center justify-between px-4 pb-2">
        <SaveIndicator status={saveStatus} savedTime={savedTime} />
        {!isPreview && (
          <span className="text-xs text-zinc-400">
            {wordCount} word{wordCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}
