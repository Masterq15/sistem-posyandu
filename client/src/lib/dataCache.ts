/**
 * Client-Side In-Memory Data Cache
 * Stores fetched datasets across page / module switches to prevent
 * jarring skeleton loading flashes when data has already been downloaded.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

class ClientDataCache {
  private store = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes fresh window

  public get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    return entry.data as T;
  }

  public set<T>(key: string, data: T) {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      key,
    });
  }

  public has(key: string): boolean {
    return this.store.has(key);
  }

  public invalidate(prefix?: string) {
    if (!prefix) {
      this.store.clear();
      return;
    }
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }
}

export const clientDataCache = new ClientDataCache();
