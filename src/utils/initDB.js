// Initialiser la base de données au démarrage
import { initDB } from '../db/indexedDB';

let dbInitialized = false;

export async function ensureDBInitialized() {
  if (dbInitialized) return;
  
  try {
    await initDB();
    dbInitialized = true;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    // Ne pas bloquer l'application si la DB échoue
  }
}

// Initialiser immédiatement
ensureDBInitialized();

