/**
 * Tiny in-process TTL cache for source lookups (episode/chapter lists).
 * Avoids re-scraping providers on every SSR request. Stream URLs are NOT cached
 * here — they carry expiring tokens and are fetched fresh each time.
 */
type Entry<T> = { value: T; expires: number };

const store = new Map<string, Entry<unknown>>();

export async function cached<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
  shouldCache: (value: T) => boolean = () => true
): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;

  const value = await fn();
  if (shouldCache(value)) {
    store.set(key, { value, expires: Date.now() + ttlMs });
  }
  return value;
}
