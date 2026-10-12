import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Suggestion } from '../types';

interface SuggestionState {
  suggestions: Suggestion[];
  isLoading: boolean;
  error: string | null;
  fetchSuggestions: () => Promise<void>;
  updateStatus: (id: string, status: Suggestion['status']) => Promise<void>;
  deleteSuggestion: (id: string) => Promise<void>;
}

export const useSuggestionStore = create<SuggestionState>((set) => ({
  suggestions: [],
  isLoading: false,
  error: null,

  fetchSuggestions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ suggestions: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        suggestions: state.suggestions.map((s) =>
          s.id === id ? { ...s, ...data } : s
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSuggestion: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('suggestions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        suggestions: state.suggestions.filter((s) => s.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
