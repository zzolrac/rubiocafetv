import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js/2.39.7',
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  },
  db: {
    schema: 'public'
  }
});

// Configure fetch retries with exponential backoff
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const maxRetries = 3;
  let lastError: Error | null = null;
  let delay = 1000; // Start with 1 second delay

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Create URL object to check if this is a Supabase request
      const url = input instanceof URL ? input : new URL(input.toString());
      
      // Only add headers for Supabase requests
      if (url.origin === supabaseUrl) {
        const headers = new Headers(init?.headers);
        headers.set('apikey', supabaseAnonKey);
        headers.set('Authorization', `Bearer ${supabaseAnonKey}`);
        headers.set('X-Client-Info', 'supabase-js/2.39.7');

        const response = await originalFetch(input, {
          ...init,
          headers,
          mode: 'cors',
          credentials: 'omit'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response;
      }

      // For non-Supabase requests, use original fetch
      return await originalFetch(input, init);
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxRetries) {
        throw new Error(`Failed to fetch after ${maxRetries} attempts: ${lastError.message}`);
      }
      // Exponential backoff with jitter
      await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 200));
      delay *= 2; // Double the delay for next attempt
    }
  }

  throw lastError;
};