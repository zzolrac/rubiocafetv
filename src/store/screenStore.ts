import { create } from 'zustand';
import { screenQueries } from './db';
import type { Screen } from '../types';

interface ScreenState {
  screens: Screen[];
  isLoading: boolean;
  error: string | null;
  addScreen: (locationId: string, screen: {
    name: string;
    layout_type: 'full_text' | 'full_image' | 'split';
  }) => Promise<void>;
  fetchScreens: () => Promise<void>;
  fetchScreensByLocation: (locationId: string) => Promise<void>;
  updateScreen: (screenId: string, updates: Partial<Screen>) => Promise<void>;
  deleteScreen: (screenId: string) => Promise<void>;
}

export const useScreenStore = create<ScreenState>((set) => ({
  screens: [],
  isLoading: false,
  error: null,

  addScreen: async (locationId, screen) => {
    set({ isLoading: true, error: null });
    try {
      const newScreen = await screenQueries.create({
        ...screen,
        location_id: locationId
      });
      set((state) => ({
        screens: [...state.screens, newScreen],
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchScreens: async () => {
    set({ isLoading: true, error: null });
    try {
      const screens = await screenQueries.getAll();
      set({ screens });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchScreensByLocation: async (locationId) => {
    set({ isLoading: true, error: null });
    try {
      const screens = await screenQueries.getByLocation(locationId);
      set({ screens });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateScreen: async (screenId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedScreen = await screenQueries.update(screenId, updates);
      set((state) => ({
        screens: state.screens.map((screen) =>
          screen.id === screenId ? { ...screen, ...updatedScreen } : screen
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteScreen: async (screenId) => {
    set({ isLoading: true, error: null });
    try {
      await screenQueries.delete(screenId);
      set((state) => ({
        screens: state.screens.filter((screen) => screen.id !== screenId),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));