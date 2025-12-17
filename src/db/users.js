import { getDB } from './indexedDB';

export { getDB };

export async function createUser(username, email, password) {
  const db = await getDB();
  const tx = db.transaction('users', 'readwrite');
  
  // Vérifier si l'email existe déjà
  const existing = await tx.store.index('email').get(email);
  if (existing) {
    throw new Error('Cet email est déjà utilisé');
  }

  // Vérifier si le username existe déjà
  const existingUsername = await tx.store.index('username').get(username);
  if (existingUsername) {
    throw new Error('Ce nom d\'utilisateur est déjà utilisé');
  }

  const user = {
    username,
    email,
    password, // En production, hash le mot de passe
    createdAt: new Date().toISOString(),
  };

  const id = await tx.store.add(user);
  await tx.done;
  
  return { ...user, id };
}

export async function getUserByEmail(email) {
  const db = await getDB();
  const tx = db.transaction('users', 'readonly');
  const user = await tx.store.index('email').get(email);
  await tx.done;
  return user;
}

export async function getUserById(id) {
  const db = await getDB();
  const tx = db.transaction('users', 'readonly');
  const user = await tx.store.get(id);
  await tx.done;
  return user;
}

export async function verifyUser(email, password) {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error('Email ou mot de passe incorrect');
  }
  if (user.password !== password) {
    throw new Error('Email ou mot de passe incorrect');
  }
  return user;
}

export async function updateUserPassword(userId, newPassword) {
  const db = await getDB();
  const tx = db.transaction('users', 'readwrite');
  const user = await tx.store.get(userId);
  
  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  user.password = newPassword;
  await tx.store.put(user);
  await tx.done;
  
  return user;
}

