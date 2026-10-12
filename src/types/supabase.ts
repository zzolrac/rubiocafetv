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
      content: {
        Row: {
          id: string
          type: 'image' | 'video' | 'promotion'
          url: string
          title: string
          description: string | null
          category: 'breakfast' | 'main' | 'drinks' | 'promotion'
          price: number
          created_at: string
          media_provider: string
          mux_asset_id: string | null
          mux_playback_id: string | null
        }
        Insert: {
          id?: string
          type: 'image' | 'video' | 'promotion'
          url: string
          title: string
          description?: string | null
          category: 'breakfast' | 'main' | 'drinks' | 'promotion'
          price?: number
          created_at?: string
          media_provider?: string
          mux_asset_id?: string | null
          mux_playback_id?: string | null
        }
        Update: {
          id?: string
          type?: 'image' | 'video' | 'promotion'
          url?: string
          title?: string
          description?: string | null
          category?: 'breakfast' | 'main' | 'drinks' | 'promotion'
          price?: number
          created_at?: string
          media_provider?: string
          mux_asset_id?: string | null
          mux_playback_id?: string | null
        }
      }
      locations: {
        Row: {
          id: string
          name: string
          address: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          created_at?: string
        }
      }
      screens: {
        Row: {
          id: string
          name: string
          location_id: string
          layout_type: 'full_text' | 'full_image' | 'split' | 'video_fullscreen'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          location_id: string
          layout_type?: 'full_text' | 'full_image' | 'split' | 'video_fullscreen'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          location_id?: string
          layout_type?: 'full_text' | 'full_image' | 'split' | 'video_fullscreen'
          created_at?: string
        }
      }
      content_schedule: {
        Row: {
          id: string
          screen_id: string
          content_id: string
          start_time: string
          end_time: string
          days_of_week: number[]
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          screen_id: string
          content_id: string
          start_time: string
          end_time: string
          days_of_week: number[]
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          screen_id?: string
          content_id?: string
          start_time?: string
          end_time?: string
          days_of_week?: number[]
          is_active?: boolean
          created_at?: string
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