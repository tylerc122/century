import { supabase } from '../config/supabase';

/**
 * A service to validate user passwords and handle password-related functionality
 */
class PasswordService {
  /**
   * Validates a user's password by attempting a login with their current session email
   * @param password The password to validate
   * @returns Promise resolving to true if password is valid, false otherwise
   */
  async validatePassword(password: string): Promise<boolean> {
    try {
      // Get current user's email
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.email) {
        console.error('No authenticated user found');
        return false;
      }
      
      // Attempt to sign in with the provided password and current email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: password
      });
      
      // If there's no error and we get session data, the password is correct
      return !error && !!data?.session;
    } catch (error) {
      console.error('Error validating password:', error);
      return false;
    }
  }
  
  /**
   * Retrieves the current user's email
   * Useful for UX to show which password needs to be entered
   * @returns Promise resolving to the user's email or null if not found
   */
  async getCurrentUserEmail(): Promise<string | null> {
    try {
      const { data } = await supabase.auth.getUser();
      return data?.user?.email || null;
    } catch (error) {
      console.error('Error getting user email:', error);
      return null;
    }
  }
}

// Create singleton instance
const passwordService = new PasswordService();
export default passwordService;
