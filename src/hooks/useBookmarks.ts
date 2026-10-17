import { useState, useCallback } from "react";

export interface Bookmark {
  id: string;
  label: string;
  text: string;
  pattern: string;
  savedAt: string;
}

const KEY = "algo-arcade:bookmarks";

function loadBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveBookmarks(bm: Bookmark[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(bm));
  } catch { /* quota */ }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(loadBookmarks);

  const add = useCallback((text: string, pattern: string) => {
    const bm: Bookmark = {
      id: Date.now().toString(36),
      label: `${text.slice(0, 8)}… / ${pattern}`,
      text,
      pattern,
      savedAt: new Date().toISOString(),
    };
    setBookmarks((prev) => {
      const next = [bm, ...prev].slice(0, 10);
      saveBookmarks(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      saveBookmarks(next);
      return next;
    });
  }, []);

  return { bookmarks, add, remove };
}
