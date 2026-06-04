import React from 'react';
import { Link } from 'react-router-dom';

function VideoGrid({ videos, loading, error, onRetry }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-primary rounded-lg overflow-hidden animate-pulse">
            <div className="w-full h-40 bg-gray-700"></div>
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn btn-primary">
            Réessayer
          </button>
        )}
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-12 text-muted">
        Aucune vidéo disponible
      </div>
    );
  }

  return (
    <div className="video-grid">
      {videos.map(video => (
        <Link key={video.id} to={`/video/${video.id}`}>
          <div className="video-card">
            <img
              src={video.thumbnail || 'https://via.placeholder.com/250x140?text=Video'}
              alt={video.title}
              loading="lazy"
            />
            <div className="video-card-content">
              <h3>{video.title}</h3>
              <p>{video.category}</p>
              <div className="flex justify-between text-xs text-muted mt-2">
                <span>👁️ {video.views || 0}</span>
                <span>❤️ {video.likes || 0}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default VideoGrid;
