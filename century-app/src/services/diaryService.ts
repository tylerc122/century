import { DiaryEntry } from '../types';
import { Store } from '@tauri-apps/plugin-store';

// Initialize the store for diary entries using the async pattern
// The store needs to be initialized before use
let store: Store;

async function initStore() {
  store = await Store.create('.diary-entries.json');
  return store;
}

// Initialize the store right away
const storePromise = initStore();

// Service for managing diary entries
export const diaryService = {
  // Get all diary entries
  getAllEntries: async (): Promise<DiaryEntry[]> => {
    try {
      // Ensure store is initialized
      await storePromise;
      
      // Load entries from store
      await store.load();
      const entries = await store.get<DiaryEntry[]>('entries');
      
      if (!entries) {
        return [];
      }
      
      // Convert date strings back to Date objects
      return entries.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date)
      }));
    } catch (error) {
      console.error('Error loading entries:', error);
      return [];
    }
  },
  
  // Add a new diary entry
  addEntry: async (entry: Omit<DiaryEntry, 'id'>): Promise<DiaryEntry> => {
    try {
      // Ensure store is initialized
      await storePromise;
      
      // Generate ID for new entry
      const newEntry: DiaryEntry = {
        ...entry,
        id: Date.now().toString()
      };
      
      // Load existing entries
      await store.load();
      const existingEntries = await store.get<DiaryEntry[]>('entries') || [];
      
      // Add new entry
      const updatedEntries = [newEntry, ...existingEntries];
      
      // Save updated entries
      await store.set('entries', updatedEntries);
      await store.save();
      
      return newEntry;
    } catch (error) {
      console.error('Error adding entry:', error);
      throw error;
    }
  },
  
  // Update an existing diary entry
  updateEntry: async (updatedEntry: DiaryEntry): Promise<DiaryEntry> => {
    try {
      // Ensure store is initialized
      await storePromise;
      
      // Load existing entries
      await store.load();
      const entries = await store.get<DiaryEntry[]>('entries') || [];
      
      // Find and update the entry
      const updatedEntries = entries.map((entry: DiaryEntry) => 
        entry.id === updatedEntry.id ? updatedEntry : entry
      );
      
      // Save updated entries
      await store.set('entries', updatedEntries);
      await store.save();
      
      return updatedEntry;
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  },
  
  // Delete a diary entry
  deleteEntry: async (entryId: string): Promise<void> => {
    try {
      // Ensure store is initialized
      await storePromise;
      
      // Load existing entries
      await store.load();
      const entries = await store.get<DiaryEntry[]>('entries') || [];
      
      // Filter out the entry to delete
      const updatedEntries = entries.filter((entry: DiaryEntry) => entry.id !== entryId);
      
      // Save updated entries
      await store.set('entries', updatedEntries);
      await store.save();
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  }
};

export default diaryService;