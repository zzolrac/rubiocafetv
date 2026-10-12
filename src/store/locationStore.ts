import { create } from 'zustand';
import { locationQueries } from './db';
import type { Location } from '../types';

interface LocationState {
  locations: Location[];
  isLoading: boolean;
  error: string | null;
  fetchLocations: () => Promise<void>;
  addLocation: (location: Omit<Location, 'id' | 'created_at' | 'screens'>) => Promise<void>;
  updateLocation: (id: string, updates: Partial<Location>) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
}

export const useLocationStore = create<LocationState>((set) => ({
  locations: [],
  isLoading: false,
  error: null,

  fetchLocations: async () => {
    set({ isLoading: true, error: null });
    try {
      const locations = await locationQueries.getAll();
      set({ locations });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  addLocation: async (location) => {
    set({ isLoading: true, error: null });
    try {
      const newLocation = await locationQueries.create(location);
      set((state) => ({
        locations: [newLocation, ...state.locations],
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateLocation: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedLocation = await locationQueries.update(id, updates);
      set((state) => ({
        locations: state.locations.map((location) =>
          location.id === id ? { ...location, ...updatedLocation } : location
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteLocation: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await locationQueries.delete(id);
      set((state) => ({
        locations: state.locations.filter((location) => location.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));