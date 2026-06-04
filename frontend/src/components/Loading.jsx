import React from 'react';

function Loading({ message = 'Chargement...' }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="inline-block">
          <div className="w-12 h-12 border-4 border-gray-600 border-t-accent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-muted">{message}</p>
      </div>
    </div>
  );
}

export default Loading;
