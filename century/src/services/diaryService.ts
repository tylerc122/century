import { DiaryEntry } from '../types';
import { supabase } from '../config/supabase';

// Supabase storage implementation
class DiaryStorage {
  private cachedEntries: DiaryEntry[] | null = null;
  
  constructor() {
    // No need to preload data, we'll fetch from Supabase when needed
  }
  
  // Get current user ID
  private async getUserId(): Promise<string> {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) {
      throw new Error('User not authenticated');
    }
    return data.user.id;
  }
  
  // Convert Supabase entry to DiaryEntry
  private convertToDiaryEntry(entry: any): DiaryEntry {
    // Parse the date string and create a local date object
    const [year, month, day] = entry.date.split('-').map((num: string) => parseInt(num, 10));
    const localDate = new Date(year, month - 1, day); // month is 0-indexed
    
    return {
      id: entry.id,
      title: entry.title,
      content: entry.content,
      date: localDate,
      createdAt: new Date(entry.created_at),
      isLocked: entry.is_locked,
      isFavorite: entry.is_favorite,
      isRetroactive: entry.is_retroactive,
      images: entry.images || []
    };
  }
  
  // Get all entries
  async getAllEntries(): Promise<DiaryEntry[]> {
    try {
      const userId = await this.getUserId();
      
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      // Convert and cache entries
      const entries = (data || []).map(entry => this.convertToDiaryEntry(entry));
      this.cachedEntries = entries;
      return entries;
    } catch (error) {
      console.error('Error getting all entries:', error);
      return [];
    }
  }
  
  // Search entries by query
  async searchEntries(query: string): Promise<DiaryEntry[]> {
    try {
      // If no query, return all entries
      if (!query.trim()) {
        return this.getAllEntries();
      }
      
      const userId = await this.getUserId();
      const lowercaseQuery = query.toLowerCase();
      
      // Get all entries first (Supabase doesn't have full text search in free tier)
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('is_locked', false);
      
      if (error) throw error;
      
      // Filter entries client-side
      const entries = (data || []).map((entry: any) => this.convertToDiaryEntry(entry));
      return entries.filter((entry: DiaryEntry) => {
        return entry.title.toLowerCase().includes(lowercaseQuery) ||
              entry.content.toLowerCase().includes(lowercaseQuery);
      });
    } catch (error) {
      console.error('Error searching entries:', error);
      return [];
    }
  }
  
  // Sort entries by criteria
  async sortEntries(entries: DiaryEntry[], criteria: 'date' | 'title' | 'favorite', ascending: boolean = true): Promise<DiaryEntry[]> {
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
  async getFavoriteEntries(): Promise<DiaryEntry[]> {
    try {
      const userId = await this.getUserId();
      
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('is_favorite', true);
      
      if (error) throw error;
      
      return (data || []).map(entry => this.convertToDiaryEntry(entry));
    } catch (error) {
      console.error('Error getting favorite entries:', error);
      return [];
    }
  }
  
  // Add a new entry
  async addEntry(entry: Omit<DiaryEntry, 'id'>): Promise<DiaryEntry> {
    try {
      const userId = await this.getUserId();
      
      // Create a date object from the entry date and set it to local midnight
      const entryDate = new Date(entry.date);
      // Set to local midnight to avoid timezone issues
      const localDate = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Check if the entry date is before today (retroactive entry)
      const isRetroactive = localDate.getTime() < today.getTime();
      
      // Format date as YYYY-MM-DD in local timezone
      const dateString = localDate.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
      
      // Insert entry into Supabase
      const { data, error } = await supabase
        .from('diary_entries')
        .insert({
          user_id: userId,
          title: entry.title,
          content: entry.content,
          date: dateString,
          created_at: now.toISOString(),
          is_locked: entry.isLocked || false,
          is_favorite: entry.isFavorite || false,
          is_retroactive: isRetroactive,
          images: entry.images || []
        })
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Failed to create entry');
      
      // Convert to DiaryEntry format
      const newEntry = this.convertToDiaryEntry(data);
      
      // Update cache if we have one
      if (this.cachedEntries) {
        this.cachedEntries = [newEntry, ...this.cachedEntries];
      }
      
      return newEntry;
    } catch (error) {
      console.error('Error adding entry:', error);
      throw error;
    }
  }
  
  // Update an existing entry
  async updateEntry(updatedEntry: DiaryEntry): Promise<DiaryEntry> {
    try {
      const userId = await this.getUserId();
      
      // Create a date object from the entry date and set it to local midnight
      const entryDate = new Date(updatedEntry.date);
      // Set to local midnight to avoid timezone issues
      const localDate = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());
      
      // Format date as YYYY-MM-DD in local timezone
      const dateString = localDate.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
      
      // Update entry in Supabase
      const { error } = await supabase
        .from('diary_entries')
        .update({
          title: updatedEntry.title,
          content: updatedEntry.content,
          date: dateString,
          is_locked: updatedEntry.isLocked,
          is_favorite: updatedEntry.isFavorite,
          is_retroactive: updatedEntry.isRetroactive,
          images: updatedEntry.images
        })
        .eq('id', updatedEntry.id)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Update cache if we have one
      if (this.cachedEntries) {
        this.cachedEntries = this.cachedEntries.map(entry => 
          entry.id === updatedEntry.id ? updatedEntry : entry
        );
      }
      
      return updatedEntry;
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  }
  
  // Delete an entry
  async deleteEntry(entryId: string): Promise<void> {
    try {
      const userId = await this.getUserId();
      
      // Delete entry from Supabase
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Update cache if we have one
      if (this.cachedEntries) {
        this.cachedEntries = this.cachedEntries.filter(entry => entry.id !== entryId);
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  }
  
  // Calculate user statistics
  async getUserStats(): Promise<UserStats> {
    // Make sure we have entries loaded
    let entries: DiaryEntry[];
    if (this.cachedEntries) {
      entries = this.cachedEntries;
    } else {
      entries = await this.getAllEntries();
    }
    
    // Calculate total entries
    const totalEntries = entries.length;
    
    // Calculate total words
    const totalWords = entries.reduce(
      (sum, entry) => sum + entry.content.split(/\s+/).filter(Boolean).length, 
      0
    );
    
    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Sort entries by date (newest first)
    const sortedEntries = [...entries].sort(
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
    
    entries.forEach((entry: DiaryEntry) => {
      const words = entry.content.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((word: string) => word.length > 2 && !fillerWords.has(word));
        
      words.forEach((word: string) => {
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
    const totalMediaUploaded = entries.reduce(
      (sum, entry) => sum + (entry.images ? entry.images.length : 0), 
      0
    );
    
    // Get favorite entries
    const favoriteEntries = entries.filter(entry => entry.isFavorite);
    
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

// User profile related methods
export interface UserProfileData {
  username: string;
  profilePicture: string | null;
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
  
  getEntriesByDate: async (date: Date): Promise<DiaryEntry[]> => {
    const entries = await storage.getAllEntries();
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return entries.filter((entry: DiaryEntry) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === targetDate.getTime();
    });
  },
  
  // Keep the original method for backward compatibility
  getEntryByDate: async (date: Date): Promise<DiaryEntry | undefined> => {
    const entries = await diaryService.getEntriesByDate(date);
    return entries.length > 0 ? entries[0] : undefined;
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
  },

  // User profile methods
  getUserProfile: async (): Promise<UserProfileData> => {
    try {
      // Get current user
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        throw new Error('User not authenticated');
      }
      
      // Get profile from database
      const { data, error } = await supabase
        .from('user_profiles')
        .select('username, profile_picture')
        .eq('user_id', authData.user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return { username: 'User', profilePicture: null };
      }
      
      return { 
        username: data.username, 
        profilePicture: data.profile_picture 
      };
    } catch (error) {
      console.error('Error loading user profile:', error);
      return { username: 'User', profilePicture: null };
    }
  },

  updateUserProfile: async (profile: UserProfileData): Promise<UserProfileData> => {
    try {
      // Get current user
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        throw new Error('User not authenticated');
      }
      
      // First check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', authData.user.id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error checking existing profile:', checkError);
        throw checkError;
      }
      
      if (existingProfile) {
        // Profile exists, update it
        const { error } = await supabase
          .from('user_profiles')
          .update({
            username: profile.username,
            profile_picture: profile.profilePicture,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', authData.user.id);
        
        if (error) {
          console.error('Error updating profile:', error);
          throw error;
        }
      } else {
        // Profile doesn't exist, create it
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authData.user.id,
            username: profile.username,
            profile_picture: profile.profilePicture,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          console.error('Error creating profile:', error);
          throw error;
        }
      }
      return profile;
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  }
};

export default diaryService;