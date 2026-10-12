import { supabase } from '../lib/supabase';
import type { Content, Location, Screen, ContentSchedule } from '../types';

// Content queries
export const contentQueries = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('content')
      .select(`
        *,
        sizes:content_sizes (
          *,
          size:sizes (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  create: async (content: Content) => {
    const { data, error } = await supabase
      .from('content')
      .insert(content)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<Content>) => {
    const { data, error } = await supabase
      .from('content')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Location queries
export const locationQueries = {
  getAll: async () => {
    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .select(`
        *,
        screens:screens(*)
      `)
      .order('created_at', { ascending: false });

    if (locationsError) throw locationsError;
    return locations;
  },

  create: async (location: Omit<Location, 'id' | 'created_at' | 'screens'>) => {
    const { data, error } = await supabase
      .from('locations')
      .insert(location)
      .select(`
        *,
        screens:screens(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<Location>) => {
    const { data, error } = await supabase
      .from('locations')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        screens:screens(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Screen queries
export const screenQueries = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('screens')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  getByLocation: async (locationId: string) => {
    const { data, error } = await supabase
      .from('screens')
      .select(`
        *,
        content_schedule:content_schedule(
          *,
          content:content(*)
        )
      `)
      .eq('location_id', locationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  create: async (screen: Omit<Screen, 'id' | 'created_at' | 'content_schedule'>) => {
    const { data, error } = await supabase
      .from('screens')
      .insert(screen)
      .select(`
        *,
        content_schedule:content_schedule(
          *,
          content:content(*)
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<Screen>) => {
    const { data, error } = await supabase
      .from('screens')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        content_schedule:content_schedule(
          *,
          content:content(*)
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('screens')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Schedule queries
export const scheduleQueries = {
  getByScreen: async (screenId: string) => {
    const { data, error } = await supabase
      .from('content_schedule')
      .select(`
        *,
        content:content(*)
      `)
      .eq('screen_id', screenId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  create: async (schedule: Omit<ContentSchedule, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('content_schedule')
      .insert(schedule)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('content_schedule')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};