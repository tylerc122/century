export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      diary_entries: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          date: string
          created_at: string
          is_locked: boolean
          is_favorite: boolean
          is_retroactive: boolean
          images: string[] | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          date: string
          created_at?: string
          is_locked?: boolean
          is_favorite?: boolean
          is_retroactive?: boolean
          images?: string[] | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          date?: string
          created_at?: string
          is_locked?: boolean
          is_favorite?: boolean
          is_retroactive?: boolean
          images?: string[] | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          username: string
          profile_picture: string | null
          font_size: string | null
          font_family: string | null
          theme_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          profile_picture?: string | null
          font_size?: string | null
          font_family?: string | null
          theme_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          profile_picture?: string | null
          font_size?: string | null
          font_family?: string | null
          theme_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}