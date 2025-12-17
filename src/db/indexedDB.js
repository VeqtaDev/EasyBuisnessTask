import { openDB } from 'idb';

const DB_NAME = 'ebt-database';
const DB_VERSION = 1;

export async function initDB() {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store pour les utilisateurs
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        userStore.createIndex('email', 'email', { unique: true });
        userStore.createIndex('username', 'username', { unique: true });
      }

      // Store pour les tâches
      if (!db.objectStoreNames.contains('tasks')) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
        taskStore.createIndex('userId', 'userId');
        taskStore.createIndex('completed', 'completed');
        taskStore.createIndex('deadline', 'deadline');
        taskStore.createIndex('completedAt', 'completedAt');
      }

      // Store pour les paramètres utilisateur
      if (!db.objectStoreNames.contains('settings')) {
        const settingsStore = db.createObjectStore('settings', { keyPath: 'userId' });
      }
    },
  });
  return db;
}

export async function getDB() {
  return await initDB();
}

