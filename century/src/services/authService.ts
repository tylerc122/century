// No longer need UserProfileData import as we're using Supabase directly
import { supabase } from '../config/supabase';
import storageService from './storageService';

export interface SignupData {
  email: string;
  firstName: string;
  password: string;
  preferences?: {
    fontSize?: string;
    fontFamily?: string;
    themeName?: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  isAuthenticated: boolean;
}

// Supabase auth service
class AuthService {
  
  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data } = await supabase.auth.getSession();
      return !!data.session;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }
  
  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        // Get user profile data from database
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('user_id', data.user.id)
          .single();
          
        return {
          id: data.user.id,
          email: data.user.email || '',
          firstName: profileData?.username || data.user.email?.split('@')[0] || '',
          isAuthenticated: true
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
  
  // Sign up new user
  async signup(data: SignupData): Promise<AuthUser> {
    try {
      // Create auth user in Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');
      
      // Create user profile record
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          username: data.firstName,
          profile_picture: null,
          font_size: data.preferences?.fontSize || null,
          font_family: data.preferences?.fontFamily || null,
          theme_name: data.preferences?.themeName || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Continue anyway, as the auth user was created successfully
      }
      
      // Return the new user object
      const newUser: AuthUser = {
        id: authData.user.id,
        email: authData.user.email || '',
        firstName: data.firstName,
        isAuthenticated: true
      };
      
      return newUser;
    } catch (error) {
      console.error('Error during signup:', error);
      throw new Error('Failed to create account');
    }
  }
  
  // Login user
  async login(data: LoginData): Promise<AuthUser> {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });
      
      if (error) throw error;
      if (!authData.user) throw new Error('Login failed');
      
      // Get user profile data
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('user_id', authData.user.id)
        .single();
      
      // Create user object
      const user: AuthUser = {
        id: authData.user.id,
        email: authData.user.email || '',
        firstName: profileData?.username || authData.user.email?.split('@')[0] || '',
        isAuthenticated: true
      };
      
      return user;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }
  
  // Logout user
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all caches on logout
      storageService.clearAllCaches();
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }
  
  // No longer need email validation as Supabase handles this
}

// Create singleton instance
const authService = new AuthService();
export default authService;
