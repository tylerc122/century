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
  
  // Add a new entry
  addEntry(entry: Omit<DiaryEntry, 'id'>): DiaryEntry {
    const newEntry: DiaryEntry = {
      ...entry,
      id: Date.now().toString()
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
  getUserStats(): {
    totalEntries: number;
    totalWords: number;
    currentStreak: number;
    activityCalendar: boolean[];
  } {
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
    
    // Check if there's an entry for today
    const hasEntryToday = sortedEntries.some(entry => {
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
        const hasEntryForDate = sortedEntries.some(entry => {
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
    
    for (let i = 0; i < 28; i++) {
      const checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);
      checkDate.setDate(checkDate.getDate() - i);
      
      activityCalendar[i] = sortedEntries.some(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === checkDate.getTime();
      });
    }
    
    return {
      totalEntries,
      totalWords,
      currentStreak,
      activityCalendar
    };
  }
}

// Create a singleton instance
const storage = new DiaryStorage();

// Export diary service methods
export const diaryService = {
  getAllEntries: async (): Promise<DiaryEntry[]> => {
    return storage.getAllEntries();
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
  
  getUserStats: async () => {
    return storage.getUserStats();
  }
};

export default diaryService;