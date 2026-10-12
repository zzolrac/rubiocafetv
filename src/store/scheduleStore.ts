import { create } from 'zustand';
import { scheduleQueries } from './db';
import type { ContentSchedule } from '../types';

interface ScheduleState {
  schedules: ContentSchedule[];
  isLoading: boolean;
  error: string | null;
  fetchSchedulesByScreen: (screenId: string) => Promise<void>;
  addSchedule: (schedule: {
    screen_id: string;
    content_id: string;
    start_time: string;
    end_time: string;
    days_of_week: number[];
  }) => Promise<void>;
  removeSchedule: (scheduleId: string) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  schedules: [],
  isLoading: false,
  error: null,

  fetchSchedulesByScreen: async (screenId) => {
    set({ isLoading: true, error: null });
    try {
      const schedules = await scheduleQueries.getByScreen(screenId);
      set({ schedules });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  addSchedule: async (schedule) => {
    set({ isLoading: true, error: null });
    try {
      const newSchedule = await scheduleQueries.create({
        ...schedule,
        is_active: true
      });
      set((state) => ({
        schedules: [...state.schedules, newSchedule],
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeSchedule: async (scheduleId) => {
    set({ isLoading: true, error: null });
    try {
      await scheduleQueries.delete(scheduleId);
      set((state) => ({
        schedules: state.schedules.filter((s) => s.id !== scheduleId),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
}));