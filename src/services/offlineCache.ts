const CACHE_PREFIX = 'zocalo_cache_';
const DEFAULT_EXPIRY_HOURS = 24;

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const getCacheKey = (key: string) => `${CACHE_PREFIX}${key}`;

const isExpired = (timestamp: number, hours: number = DEFAULT_EXPIRY_HOURS): boolean => {
  const now = Date.now();
  const hoursPassed = (now - timestamp) / (1000 * 60 * 60);
  return hoursPassed > hours;
};

export const saveToCache = async <T>(key: string, data: T): Promise<void> => {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    };
    const storageKey = getCacheKey(key);
    
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(storageKey, JSON.stringify(cacheItem));
    }
  } catch (error) {
    console.error(`Error saving cache for ${key}:`, error);
  }
};

export const getFromCache = async <T>(key: string, expiryHours: number = DEFAULT_EXPIRY_HOURS): Promise<T | null> => {
  try {
    const storageKey = getCacheKey(key);
    
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;
      
      const cacheItem: CacheItem<T> = JSON.parse(stored);
      if (isExpired(cacheItem.timestamp, expiryHours)) {
        localStorage.removeItem(storageKey);
        return null;
      }
      return cacheItem.data;
    }
    return null;
  } catch (error) {
    console.error(`Error getting cache for ${key}:`, error);
    return null;
  }
};

export const removeFromCache = async (key: string): Promise<void> => {
  try {
    const storageKey = getCacheKey(key);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(storageKey);
    }
  } catch (error) {
    console.error(`Error removing cache for ${key}:`, error);
  }
};

export const clearAllCache = async (): Promise<void> => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

export const saveCacheWithExpiry = async <T>(key: string, data: T, hours: number): Promise<void> => {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    };
    const storageKey = getCacheKey(key);
    
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(storageKey, JSON.stringify(cacheItem));
      localStorage.setItem(`${storageKey}_expiry`, String(hours));
    }
  } catch (error) {
    console.error(`Error saving cache with expiry for ${key}:`, error);
  }
};

export const getCacheWithExpiry = async <T>(key: string): Promise<T | null> => {
  try {
    const storageKey = getCacheKey(key);
    
    if (typeof window !== 'undefined' && window.localStorage) {
      const expiryStr = localStorage.getItem(`${storageKey}_expiry`);
      const expiry = expiryStr ? parseInt(expiryStr, 10) : DEFAULT_EXPIRY_HOURS;
      
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;
      
      const cacheItem: CacheItem<T> = JSON.parse(stored);
      if (isExpired(cacheItem.timestamp, expiry)) {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(`${storageKey}_expiry`);
        return null;
      }
      return cacheItem.data;
    }
    return null;
  } catch (error) {
    console.error(`Error getting cache with expiry for ${key}:`, error);
    return null;
  }
};
