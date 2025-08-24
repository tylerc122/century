import { DiaryEntry } from '../types';

// Import these from diaryService where they're defined
interface UserProfileData {
  username: string;
  profilePicture: string | null;
}

interface UserStats {
  totalEntries: number;
  totalWords: number;
  currentStreak: number;
  activityCalendar: boolean[];
  retroactiveActivity: boolean[];
  mostFrequentWord: string;
  totalMediaUploaded: number;
  favoriteEntries: DiaryEntry[];
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  profileExpiry: number; // 24 hours in milliseconds
  entriesExpiry: number; // 1 hour in milliseconds
  statsExpiry: number; // 1 hour in milliseconds
  authExpiry: number; // 24 hours in milliseconds
  maxEntries: number; // Maximum number of entries to cache
}

class LocalStorageService {
  private config: CacheConfig = {
    profileExpiry: 24 * 60 * 60 * 1000, // 24 hours
    entriesExpiry: 60 * 60 * 1000, // 1 hour
    statsExpiry: 60 * 60 * 1000, // 1 hour
    authExpiry: 24 * 60 * 60 * 1000, // 24 hours
    maxEntries: 1000 // Maximum entries to cache
  };

  private readonly KEYS = {
    PROFILE: 'century_profile_cache',
    ENTRIES: 'century_entries_cache',
    STATS: 'century_stats_cache',
    AUTH: 'century_auth_cache',
    LAST_SYNC: 'century_last_sync'
  };

  // Profile caching methods
  cacheProfile(profile: UserProfileData): void {
    try {
      const cacheItem: CacheItem<UserProfileData> = {
        data: profile,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.config.profileExpiry
      };
      localStorage.setItem(this.KEYS.PROFILE, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Failed to cache profile:', error);
    }
  }

  getCachedProfile(): UserProfileData | null {
    try {
      const cached = localStorage.getItem(this.KEYS.PROFILE);
      if (!cached) return null;

      const cacheItem: CacheItem<UserProfileData> = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() > cacheItem.expiresAt) {
        this.clearProfileCache();
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('Failed to get cached profile:', error);
      this.clearProfileCache();
      return null;
    }
  }

  clearProfileCache(): void {
    try {
      localStorage.removeItem(this.KEYS.PROFILE);
    } catch (error) {
      console.warn('Failed to clear profile cache:', error);
    }
  }

  // Entries caching methods
  cacheEntries(entries: DiaryEntry[]): void {
    try {
      // Limit the number of entries we cache to prevent localStorage from getting too large
      const entriesToCache = entries.slice(0, this.config.maxEntries);
      
      const cacheItem: CacheItem<DiaryEntry[]> = {
        data: entriesToCache,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.config.entriesExpiry
      };
      localStorage.setItem(this.KEYS.ENTRIES, JSON.stringify(cacheItem));
      
      // Update last sync timestamp
      localStorage.setItem(this.KEYS.LAST_SYNC, Date.now().toString());
    } catch (error) {
      console.warn('Failed to cache entries:', error);
    }
  }

  getCachedEntries(): DiaryEntry[] | null {
    try {
      const cached = localStorage.getItem(this.KEYS.ENTRIES);
      if (!cached) return null;

      const cacheItem: CacheItem<DiaryEntry[]> = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() > cacheItem.expiresAt) {
        this.clearEntriesCache();
        return null;
      }

      // Convert date strings back to Date objects
      const entriesWithDates = cacheItem.data.map(entry => ({
        ...entry,
        date: new Date(entry.date),
        createdAt: new Date(entry.createdAt)
      }));

      return entriesWithDates;
    } catch (error) {
      console.warn('Failed to get cached entries:', error);
      this.clearEntriesCache();
      return null;
    }
  }

  clearEntriesCache(): void {
    try {
      localStorage.removeItem(this.KEYS.ENTRIES);
      localStorage.removeItem(this.KEYS.LAST_SYNC);
    } catch (error) {
      console.warn('Failed to clear entries cache:', error);
    }
  }

  // Check if we have fresh cache
  hasFreshCache(): boolean {
    try {
      const lastSync = localStorage.getItem(this.KEYS.LAST_SYNC);
      if (!lastSync) return false;

      const lastSyncTime = parseInt(lastSync);
      const timeSinceSync = Date.now() - lastSyncTime;
      
      // Consider cache fresh if it's less than 5 minutes old
      return timeSinceSync < 5 * 60 * 1000;
    } catch (error) {
      return false;
    }
  }



  // Update cache when entries change
  updateEntriesCache(updatedEntries: DiaryEntry[]): void {
    try {
      const cached = this.getCachedEntries();
      if (cached) {
        // Merge updated entries with cached ones, replacing by ID
        const merged = [...cached];
        updatedEntries.forEach(updatedEntry => {
          const index = merged.findIndex(entry => entry.id === updatedEntry.id);
          if (index !== -1) {
            merged[index] = updatedEntry;
          } else {
            merged.push(updatedEntry);
          }
        });
        
        // Sort by date (newest first) and cache
        const sorted = merged.sort((a, b) => b.date.getTime() - a.date.getTime());
        this.cacheEntries(sorted);
      }
    } catch (error) {
      console.warn('Failed to update entries cache:', error);
    }
  }

  // Remove entry from cache
  removeEntryFromCache(entryId: string): void {
    try {
      const cached = this.getCachedEntries();
      if (cached) {
        const filtered = cached.filter(entry => entry.id !== entryId);
        this.cacheEntries(filtered);
      }
    } catch (error) {
      console.warn('Failed to remove entry from cache:', error);
    }
  }

  // Stats caching methods
  cacheStats(stats: UserStats): void {
    try {
      const cacheItem: CacheItem<UserStats> = {
        data: stats,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.config.statsExpiry
      };
      localStorage.setItem(this.KEYS.STATS, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Failed to cache stats:', error);
    }
  }

  getCachedStats(): UserStats | null {
    try {
      const cached = localStorage.getItem(this.KEYS.STATS);
      if (!cached) return null;

      const cacheItem: CacheItem<UserStats> = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() > cacheItem.expiresAt) {
        this.clearStatsCache();
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('Failed to get cached stats:', error);
      this.clearStatsCache();
      return null;
    }
  }

  clearStatsCache(): void {
    try {
      localStorage.removeItem(this.KEYS.STATS);
    } catch (error) {
      console.warn('Failed to clear stats cache:', error);
    }
  }

  // Auth data caching methods
  cacheAuthData(authData: { userId: string; createdAt: string }): void {
    try {
      const cacheItem: CacheItem<{ userId: string; createdAt: string }> = {
        data: authData,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.config.authExpiry
      };
      localStorage.setItem(this.KEYS.AUTH, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Failed to cache auth data:', error);
    }
  }

  getCachedAuthData(): { userId: string; createdAt: string } | null {
    try {
      const cached = localStorage.getItem(this.KEYS.AUTH);
      if (!cached) return null;

      const cacheItem: CacheItem<{ userId: string; createdAt: string }> = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() > cacheItem.expiresAt) {
        this.clearAuthCache();
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('Failed to get cached auth data:', error);
      this.clearAuthCache();
      return null;
    }
  }

  clearAuthCache(): void {
    try {
      localStorage.removeItem(this.KEYS.AUTH);
    } catch (error) {
      console.warn('Failed to clear auth cache:', error);
    }
  }

  // Clear all caches (useful for logout)
  clearAllCaches(): void {
    this.clearProfileCache();
    this.clearEntriesCache();
    this.clearStatsCache();
    this.clearAuthCache();
  }
}

export const storageService = new LocalStorageService();
export default storageService;
