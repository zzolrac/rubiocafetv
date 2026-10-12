import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface MasterKeyState {
  isUnlocked: boolean;
  isLoading: boolean;
  error: string | null;
  verifyPin: (pin: string) => Promise<boolean>;
  changePin: (currentPin: string, newPin: string) => Promise<boolean>;
  lock: () => void;
}

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const useMasterKeyStore = create<MasterKeyState>((set, get) => ({
  isUnlocked: sessionStorage.getItem('master_unlocked') === 'true',
  isLoading: false,
  error: null,

  verifyPin: async (pin: string) => {
    set({ isLoading: true, error: null });
    try {
      const inputHash = await sha256(pin);
      const { data, error } = await supabase
        .from('master_key')
        .select('pin_hash')
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        set({ isLoading: false, error: 'No se encontró la clave maestra' });
        return false;
      }

      if (inputHash === data.pin_hash) {
        sessionStorage.setItem('master_unlocked', 'true');
        set({ isUnlocked: true, isLoading: false, error: null });
        return true;
      }

      set({ isLoading: false, error: 'Clave incorrecta' });
      return false;
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
      return false;
    }
  },

  changePin: async (currentPin: string, newPin: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: existing, error: fetchError } = await supabase
        .from('master_key')
        .select('id, pin_hash')
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!existing) {
        set({ isLoading: false, error: 'No se encontró la clave maestra' });
        return false;
      }

      const currentHash = await sha256(currentPin);
      if (currentHash !== existing.pin_hash) {
        set({ isLoading: false, error: 'Clave actual incorrecta' });
        return false;
      }

      if (newPin.length < 4) {
        set({ isLoading: false, error: 'La nueva clave debe tener al menos 4 caracteres' });
        return false;
      }

      const newHash = await sha256(newPin);
      const { error: updateError } = await supabase
        .from('master_key')
        .update({ pin_hash: newHash, updated_at: new Date().toISOString() })
        .eq('id', existing.id);

      if (updateError) throw updateError;

      set({ isLoading: false, error: null });
      return true;
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
      return false;
    }
  },

  lock: () => {
    sessionStorage.removeItem('master_unlocked');
    set({ isUnlocked: false, error: null });
  },
}));
