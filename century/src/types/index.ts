export interface DiaryEntry {
  id: string;
  date: Date;
  createdAt: Date; // When the entry was actually created
  title: string;
  content: string;
  images: string[]; // Array of image URLs or paths (base64 encoded)
  isLocked: boolean; // Whether the entry is locked/private
  isFavorite: boolean; // Whether the entry is marked as favorite
  isRetroactive: boolean; // Whether the entry was added after the date it represents
}

export interface UserProfile {
  username: string;
  joinedDate: Date;
  totalEntries: number;
  totalWords: number;
  currentStreak: number;
  activityCalendar: boolean[]; // Array of booleans representing activity for each day
  mostFrequentWord: string; // Most frequently used non-filler word
  totalMediaUploaded: number; // Total number of media/images uploaded
  favoriteEntries: DiaryEntry[]; // Array of favorite entries
}




