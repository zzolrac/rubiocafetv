export interface Content {
  id: string;
  type: 'image' | 'video' | 'promotion';
  url: string;
  title: string;
  description?: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'hot_drinks' | 'cold_drinks' | 'frappes' | 'others' | 'promotion';
  price: number;
  created_at: string;
  has_sizes?: boolean;
  media_provider?: 'supabase' | 'mux';
  mux_asset_id?: string | null;
  mux_playback_id?: string | null;
  sizes?: ContentSize[];
}

export interface Size {
  id: string;
  name: string;
  value: string;
  created_at: string;
}

export interface ContentSize {
  id: string;
  content_id: string;
  size_id: string;
  price: number;
  created_at: string;
  size: Size;
}

export interface Screen {
  id: string;
  name: string;
  location_id: string;
  layout_type: 'full_text' | 'full_image' | 'split' | 'video_fullscreen';
  created_at: string;
  short_url?: string;
  locations?: {
    id: string;
    name: string;
    address: string;
  };
}

export interface Location {
  id: string;
  name: string;
  address: string;
  created_at: string;
  screens: Screen[];
}

export interface ContentSchedule {
  id: string;
  screen_id: string;
  content_id: string;
  start_time: string;
  end_time: string;
  days_of_week: number[];
  is_active: boolean;
  created_at: string;
  content?: Content;
}

export interface Suggestion {
  id: string;
  name: string | null;
  email: string | null;
  type: 'complaint' | 'suggestion';
  subject: string;
  message: string;
  location_id: string | null;
  status: 'new' | 'read' | 'resolved';
  created_at: string;
}