// Validateurs pour les entrées utilisateur

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateUsername = (username) => {
  return username && username.length >= 2 && username.length <= 30;
};

export const validateVideoUrl = (url) => {
  try {
    new URL(url);
    return url.includes('.m3u8') || url.includes('.mp4');
  } catch {
    return false;
  }
};

export const validateComment = (content) => {
  return content && content.length > 0 && content.length <= 500;
};

export const sanitizeComment = (content) => {
  // Supprimer les balises HTML
  return content
    .replace(/<[^>]*>/g, '')
    .trim()
    .substring(0, 500);
};

export const validateCategory = (category) => {
  const validCategories = [
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
  return validCategories.includes(category);
};
