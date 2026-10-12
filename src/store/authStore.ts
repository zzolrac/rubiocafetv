import { create } from 'zustand';
import { authQueries } from './db';
import bcrypt from 'bcryptjs';

interface AuthState {
  session: { user: { id: string; email: string } } | null;
  isLoading: boolean;
  error: string | null;
  initializeAuth: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: true,
  error: null,

  initializeAuth: async () => {
    try {
      const storedSession = localStorage.getItem('session');
      if (storedSession) {
        set({ session: JSON.parse(storedSession), isLoading: false });
      } else {
        set({ session: null, isLoading: false });
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authQueries.getUserByEmail(email);
      const isValid = await bcrypt.compare(password, user.password);
      
      if (!isValid) {
        throw new Error('Credenciales incorrectas');
      }

      const session = { user: { id: user.id, email: user.email } };
      localStorage.setItem('session', JSON.stringify(session));
      set({ session, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      localStorage.removeItem('session');
      set({ session: null, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
}));