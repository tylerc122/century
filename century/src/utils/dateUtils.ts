import { DiaryEntry } from '../types';

/**
 * Check if a date is today
 * @param date Date to check
 * @returns boolean True if the date is today
 */
export const isToday = (date: Date | string): boolean => {
  const today = new Date();
  const compareDate = new Date(date);
  
  return compareDate.getFullYear() === today.getFullYear() &&
         compareDate.getMonth() === today.getMonth() &&
         compareDate.getDate() === today.getDate();
};

/**
 * Check if a diary entry is from today
 * @param entry DiaryEntry to check
 * @returns boolean True if the entry is from today
 */
export const isEntryFromToday = (entry: DiaryEntry): boolean => {
  return isToday(entry.date);
};

/**
 * Format a date for display
 * @param date Date to format
 * @param format Format style ('short', 'medium', 'long')
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  format: 'short' | 'medium' | 'long' = 'medium'
): string => {
  const dateObj = new Date(date);
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit'
      });
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'medium':
    default:
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
  }
};
