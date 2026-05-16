/**
 * Simple in-memory cache for service calls
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const DEFAULT_TTL = 1000 * 60 * 5; // 5 minutes

/**
 * Wraps a fetcher function with caching logic
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && (now - cached.timestamp < ttl)) {
    return cached.data;
  }

  const data = await fetcher();
  cache.set(key, { data, timestamp: now });
  return data;
}

/**
 * Invalidates cache by key or prefix
 */
export function invalidateCache(keyOrPrefix: string, isPrefix: boolean = false) {
  if (!isPrefix) {
    cache.delete(keyOrPrefix);
  } else {
    for (const key of cache.keys()) {
      if (key.startsWith(keyOrPrefix)) {
        cache.delete(key);
      }
    }
  }
}

/**
 * Clears all cache
 */
export function clearAllCache() {
  cache.clear();
}
