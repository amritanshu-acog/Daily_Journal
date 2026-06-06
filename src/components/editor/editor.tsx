'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Toolbar from './toolbar';
import SaveIndicator from './save-indicator';
import TagAutocomplete from './tag-autocomplete';
import { getWordAtCursor, replacePartialTag } from '@/lib/markdown';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function measureCursorPosition(ta: HTMLTextAreaElement) {
  const pos = ta.selectionStart;
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

function toggleCheckboxInMarkdown(markdown: string, targetIndex: number): string {
  const lines = markdown.split('\n');
  let checkboxCount = 0;
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```') || line.trim().startsWith('~~~')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) {
      continue;
    }

    const match = line.match(/^([ \t]*(?:>\s*)*\s*(?:[-*+]|\d+\.)\s+\[)([ xX])(\])/);
    if (match) {
      if (checkboxCount === targetIndex) {
        const checked = match[2];
        const isChecked = checked.toLowerCase() === 'x';
        const newChecked = isChecked ? ' ' : 'x';

        const bracketIndex = line.indexOf('[');
        if (bracketIndex !== -1) {
          lines[i] = line.substring(0, bracketIndex + 1) + newChecked + line.substring(bracketIndex + 2);
        }
        break;
      }
      checkboxCount++;
    }
  }
  return lines.join('\n');
}

export default function Editor({
  date,
  initialContent,
  loading = false,
  onWordCountChange,
}: {
  date: string;
  initialContent: string;
  loading?: boolean;
  onWordCountChange?: (count: number) => void;
}) {
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

  // Undo/Redo history stack management
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);

  useEffect(() => {
    historyRef.current = [initialContent || ''];
    historyIndexRef.current = 0;
    setContent(initialContent || '');
  }, [initialContent]);

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
        window.dispatchEvent(new CustomEvent('entry-saved', { detail: { date, content: text } }));
      } catch {
        setSaveStatus('error');
      }
    },
    [date]
  );

  const pushHistory = useCallback((newContent: string) => {
    const nextHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    if (nextHistory[nextHistory.length - 1] === newContent) return;
    nextHistory.push(newContent);
    if (nextHistory.length > 100) nextHistory.shift();
    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistory.length - 1;
  }, []);

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      const prevContent = historyRef.current[historyIndexRef.current];
      setContent(prevContent);
      save(prevContent);
      const wc = prevContent.trim() ? prevContent.trim().split(/\s+/).length : 0;
      onWordCountChange?.(wc);
    }
  }, [save, onWordCountChange]);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      const nextContent = historyRef.current[historyIndexRef.current];
      setContent(nextContent);
      save(nextContent);
      const wc = nextContent.trim() ? nextContent.trim().split(/\s+/).length : 0;
      onWordCountChange?.(wc);
    }
  }, [save, onWordCountChange]);

  const handleChange = useCallback(
    (value: string, isProgrammatic = false) => {
      setContent(value);
      const wc = value.trim() ? value.trim().split(/\s+/).length : 0;
      onWordCountChange?.(wc);
      
      if (isProgrammatic) {
        pushHistory(value);
      }
      
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        save(value);
        pushHistory(value);
      }, 1500);
    },
    [save, onWordCountChange, pushHistory]
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
      handleChange(newContent, true);
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
        handleChange(newContent, true);
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
        handleChange(newContent, true);
        requestAnimationFrame(() => {
          el.focus();
          const cursor = start + text.length;
          el.setSelectionRange(cursor, cursor);
        });
      };

      if (isCtrl && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (isCtrl && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (isCtrl && e.key === '/') {
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
      handleUndo,
      handleRedo,
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
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid var(--border-subtle)', padding: '6px 12px' }}>
          {[32, 28, 28, 1, 60, 48, 56].map((w, i) => (
            <div key={i} className="animate-shimmer" style={{ height: 28, width: w, borderRadius: 'var(--radius-sm)' }} />
          ))}
          <div style={{ flex: 1 }} />
          <div className="animate-shimmer" style={{ height: 28, width: 72, borderRadius: 'var(--radius-sm)' }} />
        </div>
        <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[75, 50, 85, 60, 70].map((w, i) => (
            <div key={i} className="animate-shimmer" style={{ height: 14, width: `${w}%`, borderRadius: 'var(--radius-sm)' }} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px' }}>
          <div className="animate-shimmer" style={{ height: 12, width: 100, borderRadius: 'var(--radius-sm)' }} />
          <div className="animate-shimmer" style={{ height: 12, width: 60, borderRadius: 'var(--radius-sm)' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <Toolbar
        editorRef={textareaRef}
        content={content}
        onChange={(val) => handleChange(val, true)}
        onTogglePreview={() => setIsPreview((p) => !p)}
        isPreview={isPreview}
      />
      {isPreview ? (
        <div
          className="prose dark:prose-invert animate-fade-in"
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px 28px',
            maxWidth: 'none',
            fontSize: '0.95rem',
            lineHeight: 1.7,
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              input: ({ disabled, ...props }) => {
                if (props.type === 'checkbox') {
                  return (
                    <input
                      type="checkbox"
                      checked={props.checked}
                      onChange={(e) => {
                        const container = (e.currentTarget.closest('.prose') ||
                          e.currentTarget.parentElement) as HTMLElement | null;
                        if (!container) return;
                        const all = container.querySelectorAll<HTMLInputElement>(
                          'input[type="checkbox"]'
                        );
                        const clickIndex = Array.from(all).indexOf(e.currentTarget);
                        if (clickIndex === -1) return;
                        const newContent = toggleCheckboxInMarkdown(content, clickIndex);
                        handleChange(newContent, true);
                      }}
                      style={{
                        cursor: 'pointer',
                        accentColor: 'var(--accent)',
                        marginRight: 6,
                        verticalAlign: 'middle',
                      }}
                    />
                  );
                }
                return <input {...props} disabled={disabled} />;
              }
            }}
          >
            {content || '*No content yet*'}
          </ReactMarkdown>
        </div>
      ) : (
        <div style={{ flex: 1, position: 'relative' }}>
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
            style={{
              width: '100%',
              height: '100%',
              resize: 'none',
              border: 'none',
              padding: '20px 28px',
              outline: 'none',
              fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
              fontSize: '0.88rem',
              lineHeight: 1.75,
              background: 'transparent',
              color: 'var(--text-primary)',
              caretColor: 'var(--accent)',
            }}
            placeholder={`What did you work on today?\n\n- [ ] Add a todo like this\n- [x] Check off a completed task\n#tag a project with a hashtag\n\nOr just write freely — notes, decisions, blockers, wins.`}
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
                  className="animate-fade-in"
                  style={{
                    position: 'fixed',
                    zIndex: 50,
                    padding: '8px 14px',
                    fontSize: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent)',
                    color: '#ffffff',
                    boxShadow: 'var(--shadow-lg)',
                    pointerEvents: 'none',
                    left: tagPosition ? tagPosition.left + 8 : 0,
                    top: tagPosition ? tagPosition.top + 24 : 0,
                  }}
                >
                  Tagging a project &mdash; it&apos;ll appear in your sidebar.
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -4,
                      left: 16,
                      width: 8,
                      height: 8,
                      background: 'var(--accent)',
                      transform: 'rotate(45deg)',
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 20px 10px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--surface)',
        }}
      >
        <SaveIndicator status={saveStatus} savedTime={savedTime} />
        {!isPreview && (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.02em' }}>
            {wordCount} word{wordCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}
