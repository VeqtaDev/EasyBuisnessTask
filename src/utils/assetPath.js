// Helper pour obtenir le bon chemin des assets avec le base path
export function getAssetPath(path) {
  // En production avec base path, Vite ajoute automatiquement le base path
  // Mais pour les assets dans public/, on doit utiliser le chemin relatif au base
  const base = import.meta.env.BASE_URL || '/';
  // Enlever le slash de début si présent et le rajouter avec le base
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${cleanPath}`;
}

