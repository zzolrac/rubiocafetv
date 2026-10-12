import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface TemporaryMessage {
  id: string;
  message: string;
  screen_ids: string[];
  user_id: string | null;
  created_at: string;
  expires_at: string;
  is_active: boolean;
}

interface MessageStore {
  messages: TemporaryMessage[];
  realtimeChannel: RealtimeChannel | null;
  fetchActiveMessages: (screenId?: string) => Promise<void>;
  createMessage: (message: string, screenIds: string[], durationMinutes?: number) => Promise<void>;
  deactivateMessage: (id: string) => Promise<void>;
  subscribeToMessages: (screenId?: string) => void;
  unsubscribeFromMessages: () => void;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: [],
  realtimeChannel: null,

  fetchActiveMessages: async (screenId?: string) => {
    try {
      let query = supabase
        .from('temporary_messages')
        .select('*')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      let messages = data || [];

      if (screenId) {
        messages = messages.filter(msg => msg.screen_ids.includes(screenId));
      }

      set({ messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  },

  createMessage: async (message: string, screenIds: string[], durationMinutes: number = 10) => {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);

      const { data, error } = await supabase
        .from('temporary_messages')
        .insert({
          message,
          screen_ids: screenIds,
          user_id: null,
          expires_at: expiresAt.toISOString(),
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      const messages = get().messages;
      set({ messages: [data, ...messages] });
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  },

  deactivateMessage: async (id: string) => {
    try {
      const { error } = await supabase
        .from('temporary_messages')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      const messages = get().messages.filter(msg => msg.id !== id);
      set({ messages });
    } catch (error) {
      console.error('Error deactivating message:', error);
      throw error;
    }
  },

  subscribeToMessages: (screenId?: string) => {
    const channel = supabase
      .channel('temporary_messages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'temporary_messages'
        },
        (payload) => {
          console.log('Realtime message change:', payload);

          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as TemporaryMessage;
            if (newMessage.is_active && new Date(newMessage.expires_at) > new Date()) {
              if (!screenId || newMessage.screen_ids.includes(screenId)) {
                const messages = get().messages;
                const exists = messages.some(m => m.id === newMessage.id);
                if (!exists) {
                  set({ messages: [newMessage, ...messages] });
                }
              }
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedMessage = payload.new as TemporaryMessage;
            const messages = get().messages;

            if (!updatedMessage.is_active || new Date(updatedMessage.expires_at) <= new Date()) {
              set({ messages: messages.filter(m => m.id !== updatedMessage.id) });
            } else {
              const index = messages.findIndex(m => m.id === updatedMessage.id);
              if (index !== -1) {
                const newMessages = [...messages];
                newMessages[index] = updatedMessage;
                set({ messages: newMessages });
              }
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            const messages = get().messages.filter(m => m.id !== deletedId);
            set({ messages });
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    set({ realtimeChannel: channel });
  },

  unsubscribeFromMessages: () => {
    const channel = get().realtimeChannel;
    if (channel) {
      supabase.removeChannel(channel);
      set({ realtimeChannel: null });
    }
  }
}));
