/**
 * ExoTv local persistence layer.
 *
 * Replaces the former Supabase-backed user data (watch/read history, list status,
 * favorites) with browser localStorage. There are no accounts — "the user" is
 * implicitly this browser. All helpers are SSR-safe (no-op / fallback on the server).
 */

export type WatchStatus = "WATCHING" | "COMPLETED" | "PLANNING";
export type ReadStatus = "READING" | "COMPLETED" | "PLANNING";
export type ListFilter = "ALL" | WatchStatus | ReadStatus;
export type FavoriteType = "anime" | "manga";

/** Latest watched episode for a given anime (everything needed to resume + display). */
export interface WatchedEntry {
  mediaId: number;
  episodeId: string;
  sourceEpisodeId?: string;
  episodeName?: string;
  sourceId?: string;
  watchedTime?: number;
  episodeNumber?: number;
  updatedAt: number;
}

/** Latest read chapter for a given manga. */
export interface ReadEntry {
  mediaId: number;
  chapterId: string;
  sourceChapterId?: string;
  chapterName?: string;
  sourceId?: string;
  updatedAt: number;
}

const PREFIX = "exotv";
const isBrowser = typeof window !== "undefined";

function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(`${PREFIX}:${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(`${PREFIX}:${key}`, JSON.stringify(value));
  } catch {
    /* quota / private mode — ignore */
  }
}

/* ----------------------------- Anime: watched ----------------------------- */

export const watchedStore = {
  all: (): Record<number, WatchedEntry> => readJSON("watched", {}),
  get: (mediaId: number): WatchedEntry | undefined => watchedStore.all()[mediaId],
  set: (entry: Omit<WatchedEntry, "updatedAt">): void => {
    const all = watchedStore.all();
    all[entry.mediaId] = { ...entry, updatedAt: Date.now() };
    writeJSON("watched", all);
  },
  recent: (limit = 10): WatchedEntry[] =>
    Object.values(watchedStore.all())
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit),
};

export const watchStatusStore = {
  all: (): Record<number, WatchStatus> => readJSON("watch_status", {}),
  get: (mediaId: number): WatchStatus | undefined => watchStatusStore.all()[mediaId],
  set: (mediaId: number, status: WatchStatus): void => {
    const all = watchStatusStore.all();
    all[mediaId] = status;
    writeJSON("watch_status", all);
  },
  byStatus: (filter: ListFilter): number[] =>
    Object.entries(watchStatusStore.all())
      .filter(([, status]) => filter === "ALL" || status === filter)
      .map(([mediaId]) => Number(mediaId)),
};

/* ------------------------------ Manga: read ------------------------------- */

export const readStore = {
  all: (): Record<number, ReadEntry> => readJSON("read", {}),
  get: (mediaId: number): ReadEntry | undefined => readStore.all()[mediaId],
  set: (entry: Omit<ReadEntry, "updatedAt">): void => {
    const all = readStore.all();
    all[entry.mediaId] = { ...entry, updatedAt: Date.now() };
    writeJSON("read", all);
  },
  recent: (limit = 10): ReadEntry[] =>
    Object.values(readStore.all())
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit),
};

export const readStatusStore = {
  all: (): Record<number, ReadStatus> => readJSON("read_status", {}),
  get: (mediaId: number): ReadStatus | undefined => readStatusStore.all()[mediaId],
  set: (mediaId: number, status: ReadStatus): void => {
    const all = readStatusStore.all();
    all[mediaId] = status;
    writeJSON("read_status", all);
  },
  byStatus: (filter: ListFilter): number[] =>
    Object.entries(readStatusStore.all())
      .filter(([, status]) => filter === "ALL" || status === filter)
      .map(([mediaId]) => Number(mediaId)),
};

/* ------------------------------- Favorites -------------------------------- */
/** Replaces the old per-user anime/manga "subscriptions". */

export const favoritesStore = {
  list: (type: FavoriteType): number[] => readJSON(`favorites:${type}`, []),
  has: (type: FavoriteType, mediaId: number): boolean =>
    favoritesStore.list(type).includes(mediaId),
  add: (type: FavoriteType, mediaId: number): void => {
    const list = favoritesStore.list(type);
    if (!list.includes(mediaId)) writeJSON(`favorites:${type}`, [mediaId, ...list]);
  },
  remove: (type: FavoriteType, mediaId: number): void => {
    writeJSON(
      `favorites:${type}`,
      favoritesStore.list(type).filter((id) => id !== mediaId)
    );
  },
};
