import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NotebookPen, Plus } from "lucide-react";
import { Editor } from "./components/Editor";
import { Sidebar } from "./components/Sidebar";
import { Toast } from "./components/Toast";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { useNotes } from "./hooks/useNotes";
import { useTheme } from "./hooks/useTheme";
import { fileName, noteTags, noteTitle } from "./lib/note-text";
import type { Note, ViewMode } from "./lib/types";

interface ToastState {
  message: string;
  undo?: Note;
}

function isViewMode(value: unknown): value is ViewMode {
  return value === "write" || value === "split" || value === "preview";
}

function byRecent(a: Note, b: Note) {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  return b.updatedAt.localeCompare(a.updatedAt);
}

export default function App() {
  const { notes, create, update, togglePin, remove, restore } = useNotes();
  const { theme, toggle: toggleTheme } = useTheme();
  const [view, setView] = useLocalStorage<ViewMode>("notes:view", "split", isViewMode);
  const wide = useMediaQuery("(min-width: 1024px)");
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(() => notes.slice().sort(byRecent)[0]?.id ?? null);
  const [pane, setPane] = useState<"list" | "editor">("list");
  const [focusId, setFocusId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const sorted = useMemo(() => notes.slice().sort(byRecent), [notes]);

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const note of notes) for (const tag of noteTags(note.content)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    return [...counts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [notes]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return sorted.filter(
      (note) =>
        (!activeTag || noteTags(note.content).includes(activeTag)) &&
        (!term || note.content.toLowerCase().includes(term)),
    );
  }, [sorted, query, activeTag]);

  const effectiveTag = activeTag && tags.some((item) => item.tag === activeTag) ? activeTag : null;
  const selected = notes.find((note) => note.id === selectedId) ?? null;
  const effectiveView: ViewMode = view === "split" && !wide ? "write" : view;

  const createNote = useCallback(() => {
    const note = create();
    setSelectedId(note.id);
    setFocusId(note.id);
    setPane("editor");
    setQuery("");
    setActiveTag(null);
    if (view === "preview") setView("write");
  }, [create, view, setView]);

  function selectNote(id: string) {
    setSelectedId(id);
    setFocusId(null);
    setPane("editor");
  }

  function deleteNote(note: Note) {
    const index = sorted.findIndex((item) => item.id === note.id);
    const next = sorted[index + 1] ?? sorted[index - 1] ?? null;
    remove(note.id);
    setSelectedId(next?.id ?? null);
    setPane(next && wide ? "editor" : "list");
    setToast({ message: `Deleted “${noteTitle(note.content)}”`, undo: note });
  }

  function exportNote(note: Note) {
    const url = URL.createObjectURL(new Blob([note.content], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName(note.content);
    link.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    document.title = selected ? `${noteTitle(selected.content)} | Notes` : "Notes";
  }, [selected]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.altKey && event.key.toLowerCase() === "n") {
        event.preventDefault();
        createNote();
        return;
      }
      const target = event.target as HTMLElement;
      if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
        event.preventDefault();
        setPane("list");
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [createNote]);

  const dismissToast = useCallback(() => setToast(null), []);

  return (
    <div className="grid h-dvh md:grid-cols-[20rem_minmax(0,1fr)]">
      <div className={`min-h-0 ${pane === "list" ? "flex" : "hidden"} flex-col md:flex [&>aside]:flex-1`}>
        <Sidebar
          ref={searchRef}
          notes={visible}
          totalCount={notes.length}
          selectedId={selected?.id ?? null}
          query={query}
          tags={tags}
          activeTag={effectiveTag}
          theme={theme}
          onQueryChange={setQuery}
          onTagChange={setActiveTag}
          onSelect={selectNote}
          onCreate={createNote}
          onToggleTheme={toggleTheme}
        />
      </div>

      <main className={`min-h-0 bg-bg ${pane === "editor" ? "block" : "hidden"} md:block`}>
        {selected ? (
          <Editor
            key={selected.id}
            note={selected}
            view={effectiveView}
            onViewChange={setView}
            onChange={(content) => update(selected.id, content)}
            onTogglePin={() => togglePin(selected.id)}
            onExport={() => exportNote(selected)}
            onDelete={() => deleteNote(selected)}
            onBack={() => setPane("list")}
            autoFocus={focusId === selected.id}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
            <NotebookPen aria-hidden="true" className="size-10 text-muted" strokeWidth={1.4} />
            <div>
              <h2 className="text-lg font-semibold">{notes.length === 0 ? "Start your first note" : "Pick a note to open it"}</h2>
              <p className="mt-1 text-muted">Write in Markdown and see it formatted as you type.</p>
            </div>
            <button type="button" onClick={createNote} className="button-ink">
              <Plus aria-hidden="true" className="size-4" />
              New note
            </button>
          </div>
        )}
      </main>

      {toast && (
        <Toast
          key={toast.message + (toast.undo?.id ?? "")}
          message={toast.message}
          actionLabel={toast.undo ? "Undo" : undefined}
          onAction={() => {
            if (toast.undo) {
              restore(toast.undo);
              setSelectedId(toast.undo.id);
            }
            setToast(null);
          }}
          onDismiss={dismissToast}
        />
      )}
    </div>
  );
}
