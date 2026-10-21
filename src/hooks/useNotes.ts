import { useCallback, useEffect, useState } from "react";
import { createSampleNotes } from "../lib/sample";
import type { Note } from "../lib/types";

const KEY = "notes:items";

function load(): Note[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === null) return createSampleNotes();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return createSampleNotes();
    return parsed.filter(
      (note): note is Note => note && typeof note.id === "string" && typeof note.content === "string",
    );
  } catch {
    return createSampleNotes();
  }
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `note-${crypto.randomUUID()}`;
  return `note-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(notes));
    } catch {
      return;
    }
  }, [notes]);

  const create = useCallback((content = "# ") => {
    const now = new Date().toISOString();
    const note: Note = { id: createId(), content, pinned: false, createdAt: now, updatedAt: now };
    setNotes((items) => [note, ...items]);
    return note;
  }, []);

  const update = useCallback((id: string, content: string) => {
    setNotes((items) =>
      items.map((note) => (note.id === id ? { ...note, content, updatedAt: new Date().toISOString() } : note)),
    );
  }, []);

  const togglePin = useCallback((id: string) => {
    setNotes((items) => items.map((note) => (note.id === id ? { ...note, pinned: !note.pinned } : note)));
  }, []);

  const remove = useCallback((id: string) => {
    setNotes((items) => items.filter((note) => note.id !== id));
  }, []);

  const restore = useCallback((note: Note) => {
    setNotes((items) => (items.some((item) => item.id === note.id) ? items : [note, ...items]));
  }, []);

  return { notes, create, update, togglePin, remove, restore };
}
