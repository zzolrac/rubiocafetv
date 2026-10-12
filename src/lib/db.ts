import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface CafeDB extends DBSchema {
  content: {
    key: string;
    value: {
      id: string;
      type: 'image' | 'video' | 'promotion';
      url: string;
      title: string;
      description?: string;
      category: 'breakfast' | 'main' | 'drinks' | 'promotion';
      price: number;
      created_at: string;
    };
    indexes: { 'by-category': string };
  };
  locations: {
    key: string;
    value: {
      id: string;
      name: string;
      address: string;
      created_at: string;
    };
  };
  screens: {
    key: string;
    value: {
      id: string;
      name: string;
      location_id: string;
      layout_type: 'full_text' | 'full_image' | 'split' | 'video_fullscreen';
      created_at: string;
    };
    indexes: { 'by-location': string };
  };
  content_schedule: {
    key: string;
    value: {
      id: string;
      screen_id: string;
      content_id: string;
      start_time: string;
      end_time: string;
      days_of_week: number[];
      is_active: boolean;
      created_at: string;
    };
    indexes: { 'by-screen': string };
  };
}

let dbPromise: Promise<IDBPDatabase<CafeDB>>;

export const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB<CafeDB>('cafe-db', 1, {
      upgrade(db) {
        // Content store
        const contentStore = db.createObjectStore('content', { keyPath: 'id' });
        contentStore.createIndex('by-category', 'category');

        // Locations store
        db.createObjectStore('locations', { keyPath: 'id' });

        // Screens store
        const screensStore = db.createObjectStore('screens', { keyPath: 'id' });
        screensStore.createIndex('by-location', 'location_id');

        // Content schedule store
        const scheduleStore = db.createObjectStore('content_schedule', { keyPath: 'id' });
        scheduleStore.createIndex('by-screen', 'screen_id');
      }
    });
  }
  return dbPromise;
};

export const getDB = () => {
  if (!dbPromise) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return dbPromise;
};