import { getDB } from '../lib/db';
import { contentQueries, locationQueries, screenQueries, scheduleQueries } from '../store/db';
import { menuData } from '../data/menuData';
import { v4 as uuidv4 } from 'uuid';

const INIT_KEY = 'db_initialized';

export const initializeMenuData = async () => {
  try {
    // Check if database has already been initialized
    const initialized = localStorage.getItem(INIT_KEY);
    if (initialized === 'true') {
      console.log('Database already initialized, skipping initialization');
      return;
    }

    // Clear existing data to avoid duplicates
    const db = await getDB();
    const tx = db.transaction(['content', 'locations', 'screens', 'content_schedule'], 'readwrite');
    await Promise.all([
      tx.objectStore('content').clear(),
      tx.objectStore('locations').clear(),
      tx.objectStore('screens').clear(),
      tx.objectStore('content_schedule').clear()
    ]);
    await tx.done;

    // Add all menu items
    for (const item of menuData) {
      await contentQueries.create(item);
    }
    console.log('Menu data initialized successfully');

    // Create Santa Rosa de Lima location
    const santaRosa = await locationQueries.create({
      name: 'Santa Rosa de Lima',
      address: 'Barrio El Convento, Santa Rosa de Lima'
    });

    // Create Anamoros location
    const anamoros = await locationQueries.create({
      name: 'Anamoros',
      address: 'Barrio El Centro, Anamoros'
    });

    // Create screens for Santa Rosa
    const santaRosaScreens = await Promise.all([
      screenQueries.create({
        name: 'Pantalla Principal',
        location_id: santaRosa.id,
        layout_type: 'split'
      }),
      screenQueries.create({
        name: 'Pantalla de Bebidas',
        location_id: santaRosa.id,
        layout_type: 'full_text'
      }),
      screenQueries.create({
        name: 'Pantalla de Comidas',
        location_id: santaRosa.id,
        layout_type: 'full_image'
      })
    ]);

    // Create screens for Anamoros
    const anamorosScreens = await Promise.all([
      screenQueries.create({
        name: 'Pantalla Principal',
        location_id: anamoros.id,
        layout_type: 'split'
      }),
      screenQueries.create({
        name: 'Pantalla de Bebidas',
        location_id: anamoros.id,
        layout_type: 'full_text'
      }),
      screenQueries.create({
        name: 'Pantalla de Promociones',
        location_id: anamoros.id,
        layout_type: 'full_image'
      })
    ]);

    // Get all content
    const allContent = await contentQueries.getAll();

    // Schedule content for each screen
    for (const screen of [...santaRosaScreens, ...anamorosScreens]) {
      let contentToSchedule = [];

      switch (screen.layout_type) {
        case 'full_text':
          contentToSchedule = allContent.filter(c => 
            c.category === 'drinks' || c.category === 'main'
          );
          break;
        case 'full_image':
          contentToSchedule = allContent.filter(c => 
            c.category === 'main' || c.category === 'breakfast'
          );
          break;
        case 'split':
          contentToSchedule = allContent.filter(c => 
            c.category === 'promotion' || c.category === 'main' || c.category === 'drinks'
          ).slice(0, 10);
          break;
      }

      // Create regular schedules for the content
      for (const content of contentToSchedule) {
        await scheduleQueries.create({
          screen_id: screen.id,
          content_id: content.id,
          start_time: '07:00',
          end_time: '22:00',
          days_of_week: [0,1,2,3,4,5,6],
          is_active: true
        });
      }

      // Create evening schedules (9 PM onwards) for testing
      const eveningContent = contentToSchedule.slice(0, 3); // Take first 3 items for evening display
      for (const content of eveningContent) {
        await scheduleQueries.create({
          screen_id: screen.id,
          content_id: content.id,
          start_time: '21:00',
          end_time: '23:59',
          days_of_week: [0,1,2,3,4,5,6],
          is_active: true
        });
      }
    }

    // Mark database as initialized
    localStorage.setItem(INIT_KEY, 'true');
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing data:', error);
    throw error;
  }
};