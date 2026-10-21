import { forwardRef } from "react";
import { Moon, Pin, Plus, Search, Sun, X } from "lucide-react";
import { noteExcerpt, noteTitle, relativeTime } from "../lib/note-text";
import type { Note } from "../lib/types";

interface SidebarProps {
  notes: Note[];
  totalCount: number;
  selectedId: string | null;
  query: string;
  tags: { tag: string; count: number }[];
  activeTag: string | null;
  theme: "light" | "dark";
  onQueryChange: (value: string) => void;
  onTagChange: (tag: string | null) => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onToggleTheme: () => void;
}

export const Sidebar = forwardRef<HTMLInputElement, SidebarProps>(function Sidebar(
  {
    notes,
    totalCount,
    selectedId,
    query,
    tags,
    activeTag,
    theme,
    onQueryChange,
    onTagChange,
    onSelect,
    onCreate,
    onToggleTheme,
  },
  searchRef,
) {
  const filtering = query.trim() !== "" || activeTag !== null;

  return (
    <aside aria-label="Notes" className="flex min-h-0 flex-col border-line bg-sidebar md:border-r">
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
        <h1 className="text-xl font-bold tracking-tight">
          Notes <span className="font-medium text-muted tabular-nums">{totalCount}</span>
        </h1>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleTheme}
            className="icon-button"
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={theme === "dark" ? "Light theme" : "Dark theme"}
          >
            {theme === "dark" ? <Sun aria-hidden="true" className="size-[18px]" /> : <Moon aria-hidden="true" className="size-[18px]" />}
          </button>
          <button type="button" onClick={onCreate} className="button-ink" title="New note (Alt + N)">
            <Plus aria-hidden="true" className="size-4" />
            New note
          </button>
        </div>
      </div>

      <div className="px-4">
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") onQueryChange("");
            }}
            placeholder="Search notes"
            aria-label="Search notes"
            className="field h-10 w-full pr-9 pl-9"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-1.5 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted hover:text-ink"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          )}
        </div>
      </div>

      {tags.length > 0 && (
        <div role="group" aria-label="Filter by tag" className="flex flex-wrap gap-1.5 px-4 pt-3">
          {tags.map(({ tag, count }) => (
            <button
              key={tag}
              type="button"
              aria-pressed={activeTag === tag}
              onClick={() => onTagChange(activeTag === tag ? null : tag)}
              className="tag-chip"
            >
              #{tag}
              <span className="text-muted tabular-nums">{count}</span>
            </button>
          ))}
        </div>
      )}

      {filtering && (
        <p aria-live="polite" className="px-4 pt-3 text-sm text-muted">
          {notes.length} of {totalCount} {totalCount === 1 ? "note" : "notes"}
          <button
            type="button"
            onClick={() => {
              onQueryChange("");
              onTagChange(null);
            }}
            className="ml-2 font-semibold text-ink underline underline-offset-2"
          >
            Clear
          </button>
        </p>
      )}

      <nav aria-label="Note list" className="mt-3 min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {notes.length === 0 ? (
          <p className="px-2 py-6 text-sm text-muted">
            {totalCount === 0 ? "No notes yet. Create one to get started." : "No notes match. Try another word or tag."}
          </p>
        ) : (
          <ul className="space-y-0.5">
            {notes.map((note) => {
              const selected = note.id === selectedId;
              const excerpt = noteExcerpt(note.content);
              return (
                <li key={note.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(note.id)}
                    aria-current={selected ? "true" : undefined}
                    className="note-item"
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="note-item-title">{noteTitle(note.content)}</span>
                      {note.pinned && (
                        <Pin aria-label="Pinned" className="mt-0.5 size-3.5 shrink-0 rotate-45 text-muted" fill="currentColor" />
                      )}
                    </span>
                    {excerpt && <span className="mt-0.5 line-clamp-2 text-sm text-muted">{excerpt}</span>}
                    <span className="mt-1 text-xs text-muted">{relativeTime(note.updatedAt)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </aside>
  );
});
