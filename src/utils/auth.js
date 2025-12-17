const AUTH_KEY = 'ebt_current_user';

export function setCurrentUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function getCurrentUser() {
  const userStr = localStorage.getItem(AUTH_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

export function clearCurrentUser() {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated() {
  return getCurrentUser() !== null;
}

