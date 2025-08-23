import { UserProfileData } from "./diaryService";

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
  email: string;
  firstName: string;
  isAuthenticated: boolean;
}

// Simulated auth service for local storage (will be replaced with Supabase)
class AuthService {
  private readonly AUTH_USER_KEY = 'century_auth_user';
  private readonly USER_SETTINGS_KEY = 'century_user_settings';
  
  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = localStorage.getItem(this.AUTH_USER_KEY);
      return !!user;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }
  
  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const userData = localStorage.getItem(this.AUTH_USER_KEY);
      if (userData) {
        return JSON.parse(userData);
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
      // In a real app, this would be an API call to create a user
      const newUser: AuthUser = {
        email: data.email,
        firstName: data.firstName,
        isAuthenticated: true
      };
      
      // Save user auth data
      localStorage.setItem(this.AUTH_USER_KEY, JSON.stringify(newUser));
      
      // Save user profile data
      const userProfile: UserProfileData = {
        username: data.firstName, // Using firstName as the display name
        profilePicture: null
      };
      localStorage.setItem('century_user_profile', JSON.stringify(userProfile));
      
      // Save user preferences if provided
      if (data.preferences) {
        const currentSettings = localStorage.getItem(this.USER_SETTINGS_KEY);
        const settings = currentSettings ? JSON.parse(currentSettings) : {};
        
        // Merge with provided preferences
        if (data.preferences.fontSize) settings.fontSize = data.preferences.fontSize;
        if (data.preferences.fontFamily) settings.fontFamily = data.preferences.fontFamily;
        if (data.preferences.themeName) settings.themeName = data.preferences.themeName;
        
        localStorage.setItem(this.USER_SETTINGS_KEY, JSON.stringify(settings));
      }
      
      return newUser;
    } catch (error) {
      console.error('Error during signup:', error);
      throw new Error('Failed to create account');
    }
  }
  
  // Login user
  async login(data: LoginData): Promise<AuthUser> {
    try {
      // In a real app, this would validate credentials against a database
      // For this mock version, we'll just check if the email is valid format
      if (!this.validateEmail(data.email)) {
        throw new Error('Invalid email format');
      }
      
      if (data.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // Create user object
      const user: AuthUser = {
        email: data.email,
        firstName: data.email.split('@')[0], // Use part of email as first name
        isAuthenticated: true
      };
      
      // Save to localStorage
      localStorage.setItem(this.AUTH_USER_KEY, JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }
  
  // Logout user
  async logout(): Promise<void> {
    try {
      localStorage.removeItem(this.AUTH_USER_KEY);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }
  
  // Helper to validate email format
  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
}

// Create singleton instance
const authService = new AuthService();
export default authService;
