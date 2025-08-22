import { DiaryEntry } from '../types';

// Simple in-memory storage with localStorage persistence
class DiaryStorage {
  private entries: DiaryEntry[] = [];
  private readonly STORAGE_KEY = 'century_diary_entries';
  
  constructor() {
    this.loadFromStorage();
  }
  
  // Load entries from localStorage
  private loadFromStorage(): void {
    try {
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        this.entries = Array.isArray(parsed) ? 
          parsed.map(entry => ({
            ...entry,
            date: new Date(entry.date)
          })) : [];
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
      this.entries = [];
    }
  }
  
  // Save entries to localStorage
  private saveToStorage(): void {
    try {
      const serialized = JSON.stringify(this.entries.map(entry => ({
        ...entry,
        date: entry.date.toISOString()
      })));
      localStorage.setItem(this.STORAGE_KEY, serialized);
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }
  
  // Get all entries
  getAllEntries(): DiaryEntry[] {
    return [...this.entries];
  }
  
  // Search entries by query
  searchEntries(query: string): DiaryEntry[] {
    if (!query.trim()) {
      return [...this.entries];
    }
    
    const lowercaseQuery = query.toLowerCase();
    return this.entries.filter(entry => 
      entry.title.toLowerCase().includes(lowercaseQuery) ||
      entry.content.toLowerCase().includes(lowercaseQuery)
    );
  }
  
  // Sort entries by criteria
  sortEntries(entries: DiaryEntry[], criteria: 'date' | 'title' | 'favorite', ascending: boolean = true): DiaryEntry[] {
    return [...entries].sort((a, b) => {
      let comparison = 0;
      
      switch (criteria) {
        case 'date':
          comparison = a.date.getTime() - b.date.getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'favorite':
          comparison = (a.isFavorite === b.isFavorite) ? 0 : a.isFavorite ? -1 : 1;
          break;
      }
      
      return ascending ? comparison : -comparison;
    });
  }
  
  // Get favorite entries
  getFavoriteEntries(): DiaryEntry[] {
    return this.entries.filter(entry => entry.isFavorite);
  }
  
  // Add a new entry
  addEntry(entry: Omit<DiaryEntry, 'id'>): DiaryEntry {
    // Check if an entry already exists for this date
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    
    const existingEntry = this.entries.find(e => {
      const eDate = new Date(e.date);
      eDate.setHours(0, 0, 0, 0);
      return eDate.getTime() === entryDate.getTime();
    });
    
    // If entry exists for this date, update it instead of adding a new one
    if (existingEntry) {
      const updatedEntry: DiaryEntry = {
        ...entry,
        id: existingEntry.id,
        createdAt: existingEntry.createdAt,
        isLocked: entry.isLocked || existingEntry.isLocked || false,
        isFavorite: entry.isFavorite || existingEntry.isFavorite || false,
        isRetroactive: existingEntry.isRetroactive
      };
      
      this.entries = this.entries.map(e => 
        e.id === existingEntry.id ? updatedEntry : e
      );
      
      this.saveToStorage();
      return updatedEntry;
    }
    
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    // Check if the entry date is before today (retroactive entry)
    const isRetroactive = entryDate.getTime() < today.getTime();
    
    // Add a new entry
    const newEntry: DiaryEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: now,
      isLocked: entry.isLocked || false,
      isFavorite: entry.isFavorite || false,
      isRetroactive: isRetroactive
    };
    
    this.entries = [newEntry, ...this.entries];
    this.saveToStorage();
    
    return newEntry;
  }
  
  // Update an existing entry
  updateEntry(updatedEntry: DiaryEntry): DiaryEntry {
    this.entries = this.entries.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    );
    this.saveToStorage();
    
    return updatedEntry;
  }
  
  // Delete an entry
  deleteEntry(entryId: string): void {
    this.entries = this.entries.filter(entry => entry.id !== entryId);
    this.saveToStorage();
  }
  
  // Calculate user statistics
  getUserStats(): UserStats {
    // Calculate total entries
    const totalEntries = this.entries.length;
    
    // Calculate total words
    const totalWords = this.entries.reduce(
      (sum, entry) => sum + entry.content.split(/\s+/).filter(Boolean).length, 
      0
    );
    
    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Sort entries by date (newest first)
    const sortedEntries = [...this.entries].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
    
    // Filter out retroactive entries for streak calculation
    const validStreakEntries = sortedEntries.filter(entry => !entry.isRetroactive);
    
    // Check if there's an entry for today
    const hasEntryToday = validStreakEntries.some(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });
    
    if (hasEntryToday) {
      currentStreak = 1;
      const oneDayMs = 24 * 60 * 60 * 1000;
      let prevDate = new Date(today.getTime() - oneDayMs);
      
      // Check consecutive days
      while (true) {
        const hasEntryForDate = validStreakEntries.some(entry => {
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === prevDate.getTime();
        });
        
        if (hasEntryForDate) {
          currentStreak++;
          prevDate = new Date(prevDate.getTime() - oneDayMs);
        } else {
          break;
        }
      }
    }
    
    // Create activity calendar for last 28 days
    const activityCalendar: boolean[] = Array(28).fill(false);
    
    // Track retroactive entries separately to render them differently
    const retroactiveActivity: boolean[] = Array(28).fill(false);
    
    for (let i = 0; i < 28; i++) {
      const checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);
      checkDate.setDate(checkDate.getDate() - i);
      
      // Check for any entry on this date
      activityCalendar[i] = sortedEntries.some(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === checkDate.getTime();
      });
      
      // Check if there's a retroactive entry on this date
      retroactiveActivity[i] = sortedEntries.some(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === checkDate.getTime() && entry.isRetroactive;
      });
    }
    
    // Calculate most frequent word (excluding common filler words)
    const fillerWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
      'by', 'about', 'as', 'into', 'like', 'through', 'after', 'over', 'between',
      'out', 'of', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'i', 'you', 'he', 'she', 'it',
      'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this',
      'that', 'these', 'those', 'am', 'will', 'would', 'shall', 'should', 'can',
      'could', 'not', 'very'
    ]);
    
    const wordCounts: Record<string, number> = {};
    
    this.entries.forEach(entry => {
      const words = entry.content.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !fillerWords.has(word));
        
      words.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
    });
    
    let mostFrequentWord = 'None';
    let highestCount = 0;
    
    Object.entries(wordCounts).forEach(([word, count]) => {
      if (count > highestCount) {
        mostFrequentWord = word;
        highestCount = count;
      }
    });
    
    // Calculate total media uploaded
    const totalMediaUploaded = this.entries.reduce(
      (sum, entry) => sum + (entry.images ? entry.images.length : 0), 
      0
    );
    
    // Get favorite entries
    const favoriteEntries = this.entries.filter(entry => entry.isFavorite);
    
    return {
      totalEntries,
      totalWords,
      currentStreak,
      activityCalendar,
      retroactiveActivity,
      mostFrequentWord,
      totalMediaUploaded,
      favoriteEntries: favoriteEntries.slice(0, 5) // Limit to top 5 favorites
    };
  }
}

// Create a singleton instance
const storage = new DiaryStorage();

// Export diary service methods
// Export the user stats interface to make it available elsewhere
export interface UserStats {
  totalEntries: number;
  totalWords: number;
  currentStreak: number;
  activityCalendar: boolean[];
  retroactiveActivity: boolean[];
  mostFrequentWord: string;
  totalMediaUploaded: number;
  favoriteEntries: DiaryEntry[];
}

export const diaryService = {
  getAllEntries: async (): Promise<DiaryEntry[]> => {
    return storage.getAllEntries();
  },
  
  searchEntries: async (query: string): Promise<DiaryEntry[]> => {
    return storage.searchEntries(query);
  },
  
  sortEntries: async (entries: DiaryEntry[], criteria: 'date' | 'title' | 'favorite', ascending: boolean = true): Promise<DiaryEntry[]> => {
    return storage.sortEntries(entries, criteria, ascending);
  },
  
  getFavoriteEntries: async (): Promise<DiaryEntry[]> => {
    return storage.getFavoriteEntries();
  },
  
  getEntryByDate: async (date: Date): Promise<DiaryEntry | undefined> => {
    const entries = storage.getAllEntries();
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return entries.find(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === targetDate.getTime();
    });
  },
  
  addEntry: async (entry: Omit<DiaryEntry, 'id'>): Promise<DiaryEntry> => {
    return storage.addEntry(entry);
  },
  
  updateEntry: async (updatedEntry: DiaryEntry): Promise<DiaryEntry> => {
    return storage.updateEntry(updatedEntry);
  },
  
  deleteEntry: async (entryId: string): Promise<void> => {
    storage.deleteEntry(entryId);
  },
  
  getUserStats: async (): Promise<UserStats> => {
    return storage.getUserStats();
  }
};

export default diaryService;