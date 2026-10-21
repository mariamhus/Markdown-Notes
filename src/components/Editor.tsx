import { useEffect, useRef, type KeyboardEvent } from "react";
import { ArrowLeft, Columns2, Download, Eye, PenLine, Pin, PinOff, Trash2 } from "lucide-react";
import { Preview } from "./Preview";
import { Toolbar, type FormatAction } from "./Toolbar";
import { continueList, insertLink, prefixLines, wrap, type EditResult } from "../lib/editing";
import { relativeTime, toggleTask, wordCount } from "../lib/note-text";
import type { Note, ViewMode } from "../lib/types";

interface EditorProps {
  note: Note;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onChange: (content: string) => void;
  onTogglePin: () => void;
  onExport: () => void;
  onDelete: () => void;
  onBack: () => void;
  autoFocus: boolean;
}

const VIEWS: { id: ViewMode; label: string; icon: typeof Eye }[] = [
  { id: "write", label: "Write", icon: PenLine },
  { id: "split", label: "Split", icon: Columns2 },
  { id: "preview", label: "Preview", icon: Eye },
];

export function Editor({ note, view, onViewChange, onChange, onTogglePin, onExport, onDelete, onBack, autoFocus }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingSelection = useRef<[number, number] | null>(null);
  const words = wordCount(note.content);

  useEffect(() => {
    if (autoFocus && view !== "preview") {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }
    }
  }, [note.id, autoFocus, view]);

  useEffect(() => {
    const selection = pendingSelection.current;
    if (selection && textareaRef.current) {
      textareaRef.current.setSelectionRange(selection[0], selection[1]);
      pendingSelection.current = null;
    }
  }, [note.content]);

  function apply(result: EditResult | null) {
    if (!result) return false;
    pendingSelection.current = [result.selectionStart, result.selectionEnd];
    onChange(result.value);
    textareaRef.current?.focus();
    return true;
  }

  function format(action: FormatAction) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const selection = { value: textarea.value, start: textarea.selectionStart, end: textarea.selectionEnd };
    const results: Record<FormatAction, () => EditResult> = {
      bold: () => wrap(selection, "**", "bold text"),
      italic: () => wrap(selection, "_", "italic text"),
      code: () => wrap(selection, "`", "code"),
      heading: () => prefixLines(selection, "## "),
      list: () => prefixLines(selection, "- "),
      task: () => prefixLines(selection, "- [ ] "),
      quote: () => prefixLines(selection, "> "),
      link: () => insertLink(selection),
    };
    apply(results[action]());
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const modifier = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();
    if (modifier && !event.altKey && ["b", "i", "k"].includes(key)) {
      event.preventDefault();
      format(key === "b" ? "bold" : key === "i" ? "italic" : "link");
      return;
    }
    if (event.key === "Enter" && !event.shiftKey && !modifier) {
      const target = event.currentTarget;
      const handled = apply(continueList({ value: target.value, start: target.selectionStart, end: target.selectionEnd }));
      if (handled) event.preventDefault();
    }
  }

  return (
    <section aria-label="Editor" className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-3 py-2 sm:px-4">
        <button type="button" onClick={onBack} className="icon-button md:hidden" aria-label="Back to notes">
          <ArrowLeft aria-hidden="true" className="size-5" />
        </button>
        <Toolbar onAction={format} disabled={view === "preview"} />
        <div className="ml-auto flex items-center gap-2">
          <div role="group" aria-label="Layout" className="segmented">
            {VIEWS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={view === id}
                onClick={() => onViewChange(id)}
                className={`segment ${id === "split" ? "hidden lg:inline-flex" : ""}`}
                title={label}
              >
                <Icon aria-hidden="true" className="size-4" />
                <span className="hidden xl:inline">{label}</span>
                <span className="sr-only xl:hidden">{label}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onTogglePin}
            aria-pressed={note.pinned}
            className="icon-button"
            aria-label={note.pinned ? "Unpin note" : "Pin note"}
            title={note.pinned ? "Unpin" : "Pin to top"}
          >
            {note.pinned ? <PinOff aria-hidden="true" className="size-[18px]" /> : <Pin aria-hidden="true" className="size-[18px]" />}
          </button>
          <button type="button" onClick={onExport} className="icon-button" aria-label="Download as Markdown" title="Download .md">
            <Download aria-hidden="true" className="size-[18px]" />
          </button>
          <button type="button" onClick={onDelete} className="icon-button hover:text-danger" aria-label="Delete note" title="Delete">
            <Trash2 aria-hidden="true" className="size-[18px]" />
          </button>
        </div>
      </header>

      <div className={`grid min-h-0 flex-1 ${view === "split" ? "lg:grid-cols-2" : ""}`}>
        {view !== "preview" && (
          <div className={`min-h-0 ${view === "split" ? "lg:border-r lg:border-line" : ""}`}>
            <label htmlFor="note-editor" className="sr-only">
              Note content in Markdown
            </label>
            <textarea
              ref={textareaRef}
              id="note-editor"
              value={note.content}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck
              className="editor-textarea"
              placeholder="Start writing. Use # for a title, - for lists, and #tags anywhere."
            />
          </div>
        )}
        {view !== "write" && (
          <div className={`min-h-0 bg-paper ${view === "split" ? "hidden lg:block" : ""}`}>
            <Preview content={note.content} onToggleTask={(index) => onChange(toggleTask(note.content, index))} />
          </div>
        )}
      </div>

      <footer className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line px-4 py-2 text-xs text-muted">
        <span>Edited {relativeTime(note.updatedAt).toLowerCase()}</span>
        <span>
          {words.toLocaleString()} {words === 1 ? "word" : "words"}
        </span>
        <span>{Math.max(1, Math.round(words / 220))} min read</span>
        <span className="ml-auto hidden sm:inline">Saved in this browser</span>
      </footer>
    </section>
  );
}
