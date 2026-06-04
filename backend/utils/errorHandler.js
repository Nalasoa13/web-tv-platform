// Gestionnaire d'erreurs centralisé

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Erreur serveur interne';

  // Erreur de validation
  if (err.statusCode === 400) {
    return res.status(400).json({
      success: false,
      message: err.message,
      error: 'Erreur de validation'
    });
  }

  // Non authentifié
  if (err.statusCode === 401) {
    return res.status(401).json({
      success: false,
      message: err.message,
      error: 'Non authentifié'
    });
  }

  // Non autorisé
  if (err.statusCode === 403) {
    return res.status(403).json({
      success: false,
      message: err.message,
      error: 'Non autorisé'
    });
  }

  // Non trouvé
  if (err.statusCode === 404) {
    return res.status(404).json({
      success: false,
      message: err.message,
      error: 'Ressource non trouvée'
    });
  }

  // Erreur générique
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: 'Erreur serveur'
  });
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
