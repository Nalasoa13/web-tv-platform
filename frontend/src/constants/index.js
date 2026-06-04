// Catégories vidéo
export const VIDEO_CATEGORIES = [
  'Film',
  'Série',
  'Documentaire',
  'Éducation',
  'Musique',
  'Sport',
  'Divertissement',
  'Actualités',
  'Autre'
];

// Qualités vidéo
export const VIDEO_QUALITIES = [
  { label: 'SD (480p)', value: '480p' },
  { label: 'HD (720p)', value: '720p' },
  { label: 'Full HD (1080p)', value: '1080p' }
];

// Messages d'erreur
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur réseau. Veuillez réessayer.',
  INVALID_CREDENTIALS: 'Identifiants invalides.',
  UNAUTHORIZED: 'Vous n\'êtes pas autorisé à effectuer cette action.',
  NOT_FOUND: 'La ressource demandée n\'a pas été trouvée.',
  SERVER_ERROR: 'Erreur serveur. Veuillez réessayer plus tard.',
  VALIDATION_ERROR: 'Veuillez vérifier vos données.'
};

// Durées de cache
export const CACHE_DURATIONS = {
  SHORT: 5 * 60 * 1000,      // 5 minutes
  MEDIUM: 30 * 60 * 1000,    // 30 minutes
  LONG: 24 * 60 * 60 * 1000  // 24 heures
};

// Limites
export const LIMITS = {
  MAX_COMMENT_LENGTH: 500,
  MAX_USERNAME_LENGTH: 30,
  MIN_USERNAME_LENGTH: 2,
  MAX_TITLE_LENGTH: 255,
  MAX_DESCRIPTION_LENGTH: 1000,
  VIDEOS_PER_PAGE: 20,
  COMMENTS_PER_PAGE: 50
};

// Statuts
export const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};
