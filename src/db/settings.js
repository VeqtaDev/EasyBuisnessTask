import { getDB } from './indexedDB';

function generateApiKey() {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'ebt-';
  for (let i = 0; i < 36; i++) {
    key += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return key;
}

export async function getSettings(userId) {
  const db = await getDB();
  const tx = db.transaction('settings', 'readonly');
  const settings = await tx.store.get(userId);
  await tx.done;
  return settings || { userId, discordWebhookUrl: null, apiKey: null, apiEnabled: false };
}

export async function updateSettings(userId, updates) {
  const db = await getDB();
  const tx = db.transaction('settings', 'readwrite');
  const existing = await tx.store.get(userId);
  
  const settings = {
    userId,
    ...(existing || {}),
    ...updates,
  };

  await tx.store.put(settings);
  await tx.done;
  
  return settings;
}

export async function generateApiKeyForUser(userId) {
  const apiKey = generateApiKey();
  await updateSettings(userId, { apiKey, apiEnabled: true });
  return apiKey;
}

export async function verifyApiKey(apiKey) {
  if (!apiKey || !apiKey.startsWith('ebt-')) {
    return null;
  }

  const db = await getDB();
  const tx = db.transaction('settings', 'readonly');
  const allSettings = await tx.store.getAll();
  await tx.done;

  const settings = allSettings.find(s => s.apiKey === apiKey && s.apiEnabled);
  return settings ? settings.userId : null;
}

