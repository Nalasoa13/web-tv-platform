import React from 'react';

function Error({ message, onRetry }) {
  return (
    <div className="bg-red-900 border border-red-700 rounded-lg p-6 text-center">
      <p className="text-red-100 mb-4">{message || 'Une erreur est survenue'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary">
          Réessayer
        </button>
      )}
    </div>
  );
}

export default Error;
