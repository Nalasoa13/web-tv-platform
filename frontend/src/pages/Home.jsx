import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [liveStreams, setLiveStreams] = useState([]);
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scheduleRes, vodRes] = await Promise.all([
          axios.get('/api/schedule'),
          axios.get('/api/vod?limit=6')
        ]);

        const now = new Date();
        const live = scheduleRes.data.filter(item => {
          const start = new Date(item.start_time);
          const end = new Date(item.end_time);
          return item.is_live && start <= now && now <= end;
        });

        setLiveStreams(live);
        setRecentVideos(vodRes.data);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div>
      {/* Section Live */}
      {liveStreams.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-accent">En Direct Maintenant</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveStreams.map(stream => (
              <Link key={stream.id} to={`/video/${stream.id}`}>
                <div className="bg-primary rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer">
                  <div className="relative">
                    <div className="w-full h-40 bg-gray-800 flex items-center justify-center">
                      <span className="text-4xl">📺</span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="badge bg-red-600">EN DIRECT</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{stream.title}</h3>
                    <p className="text-sm text-muted mb-2">{stream.channel}</p>
                    <p className="text-xs text-muted">{stream.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Section Vidéos Récentes */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-accent">Vidéos Récentes</h2>
          <Link to="/vod" className="text-accent hover:text-red-400 transition">
            Voir tout →
          </Link>
        </div>
        <div className="video-grid">
          {recentVideos.map(video => (
            <Link key={video.id} to={`/video/${video.id}`}>
              <div className="video-card">
                <img src={video.thumbnail || 'https://via.placeholder.com/250x140?text=Video'} alt={video.title} />
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
      </section>
    </div>
  );
}

export default Home;
