import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for handling file uploads and management using Supabase Storage
 */
class StorageService {
  private readonly BUCKET_NAME = 'diary-images';
  
  /**
   * Initialize storage buckets if they don't exist
   */
  async initStorage(): Promise<void> {
    try {
      // Check if the bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === this.BUCKET_NAME);
      
      // Create bucket if it doesn't exist
      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: false,
          fileSizeLimit: 5 * 1024 * 1024 // 5MB limit
        });
        
        if (error) {
          console.error('Error creating storage bucket:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
      throw error;
    }
  }
  
  /**
   * Upload a file to Supabase Storage
   * @param file - The file to upload (either File object or base64 string)
   * @param folderPath - Optional folder path within the bucket
   * @returns URL of the uploaded file
   */
  async uploadFile(file: File | string, folderPath: string = ''): Promise<string> {
    try {
      await this.initStorage();
      
      // Generate a unique file name
      const fileName = `${uuidv4()}.${this.getFileExtension(file)}`;
      const fullPath = folderPath ? `${folderPath}/${fileName}` : fileName;
      
      // Handle different input types (File or base64)
      let fileData: File | Blob | ArrayBuffer | string = file;
      
      // If it's a base64 string, convert it to a Blob
      if (typeof file === 'string' && file.startsWith('data:')) {
        const response = await fetch(file);
        fileData = await response.blob();
      }
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fullPath, fileData, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
      
      if (!data?.path) {
        throw new Error('File upload failed, no path returned');
      }
      
      // Get public URL for the file
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(data.path);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in file upload:', error);
      throw error;
    }
  }
  
  /**
   * Delete a file from Supabase Storage
   * @param fileUrl - The URL of the file to delete
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract the file path from the URL
      const pathMatch = fileUrl.match(/\/storage\/v1\/object\/public\/diary-images\/(.+)$/);
      if (!pathMatch || !pathMatch[1]) {
        throw new Error('Invalid file URL format');
      }
      
      const filePath = decodeURIComponent(pathMatch[1]);
      
      // Delete the file from storage
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);
      
      if (error) {
        console.error('Error deleting file:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in file deletion:', error);
      throw error;
    }
  }
  
  /**
   * Check if a URL is from Supabase Storage
   * @param url - The URL to check
   */
  isSupabaseUrl(url: string): boolean {
    return url.includes('/storage/v1/object/public/');
  }
  
  /**
   * Convert a base64 image to a file object
   * @param dataUrl - The base64 data URL
   * @param fileName - Optional file name
   */
  async base64ToFile(dataUrl: string, fileName: string = 'image'): Promise<File> {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type });
  }
  
  /**
   * Get the file extension from a File object or base64 string
   * @param file - The file to get the extension for
   */
  private getFileExtension(file: File | string): string {
    if (typeof file === 'string') {
      // Handle base64 string
      if (file.startsWith('data:image/jpeg')) return 'jpg';
      if (file.startsWith('data:image/png')) return 'png';
      if (file.startsWith('data:image/gif')) return 'gif';
      if (file.startsWith('data:image/webp')) return 'webp';
      return 'jpg'; // Default to jpg
    } else {
      // Handle File object
      const nameParts = file.name.split('.');
      return nameParts.length > 1 ? nameParts.pop() || 'jpg' : 'jpg';
    }
  }
}

// Create singleton instance
export const storageService = new StorageService();
export default storageService;
