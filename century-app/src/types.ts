export interface DiaryEntry {
  id: string;
  date: Date;
  title: string;
  content: string;
  images: string[]; // Array of image URLs or paths
}

export interface UserProfile {
  username: string;
  joinedDate: Date;
  totalEntries: number;
  totalWords: number;
  currentStreak: number;
  activityCalendar: boolean[]; // Array of booleans representing activity for each day
}