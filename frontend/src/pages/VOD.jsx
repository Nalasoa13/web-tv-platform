import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function VOD() {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get(`/api/vod${selectedCategory ? `?category=${selectedCategory}` : ''}`);
        setVideos(res.data);

        // Extraire les catégories uniques
        const cats = [...new Set(res.data.map(v => v.category).filter(Boolean))];
        setCategories(cats);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [selectedCategory]);

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-accent">Vidéo à la Demande</h1>

      {/* Filtre par catégorie */}
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`btn ${selectedCategory === '' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Toutes
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grille vidéos */}
      {videos.length === 0 ? (
        <div className="text-center py-12 text-muted">
          Aucune vidéo disponible
        </div>
      ) : (
        <div className="video-grid">
          {videos.map(video => (
            <Link key={video.id} to={`/video/${video.id}`}>
              <div className="video-card">
                <img
                  src={video.thumbnail || 'https://via.placeholder.com/250x140?text=Video'}
                  alt={video.title}
                />
                <div className="video-card-content">
                  <h3>{video.title}</h3>
                  <p>{video.category}</p>
                  <div className="flex justify-between text-xs text-muted mt-2">
                    <span>👁️ {video.views}</span>
                    <span>❤️ {video.likes}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default VOD;
