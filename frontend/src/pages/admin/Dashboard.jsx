import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [pendingComments, setPendingComments] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    category: '',
    thumbnail: ''
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchData();
  }, [token, navigate]);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, commentsRes] = await Promise.all([
        axios.get('/api/admin/stats', { headers }),
        axios.get('/api/admin/comments/pending', { headers })
      ]);

      setStats(statsRes.data);
      setPendingComments(commentsRes.data);
    } catch (error) {
      console.error('Erreur:', error);
      if (error.response?.status === 403) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post('/api/admin/vod', formData, { headers });
      alert('Vidéo créée avec succès');
      setFormData({ title: '', description: '', videoUrl: '', category: '', thumbnail: '' });
      fetchData();
    } catch (error) {
      alert('Erreur lors de la création de la vidéo');
    }
  };

  const handleApproveComment = async (commentId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`/api/admin/comments/${commentId}/approve`, {}, { headers });
      setPendingComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`/api/admin/comments/${commentId}`, { headers });
      setPendingComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-accent">Tableau de Bord Admin</h1>

      {/* Onglets */}
      <div className="flex gap-4 mb-8 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 font-semibold ${activeTab === 'stats' ? 'text-accent border-b-2 border-accent' : 'text-muted'}`}
        >
          Statistiques
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 font-semibold ${activeTab === 'videos' ? 'text-accent border-b-2 border-accent' : 'text-muted'}`}
        >
          Ajouter Vidéo
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 font-semibold ${activeTab === 'comments' ? 'text-accent border-b-2 border-accent' : 'text-muted'}`}
        >
          Modération ({pendingComments.length})
        </button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-primary rounded-lg p-6 border border-gray-700">
            <p className="text-muted text-sm mb-2">Total Vues</p>
            <p className="text-3xl font-bold text-accent">{stats.totalViews}</p>
          </div>
          <div className="bg-primary rounded-lg p-6 border border-gray-700">
            <p className="text-muted text-sm mb-2">Total Likes</p>
            <p className="text-3xl font-bold text-accent">{stats.totalLikes}</p>
          </div>
          <div className="bg-primary rounded-lg p-6 border border-gray-700">
            <p className="text-muted text-sm mb-2">Total Commentaires</p>
            <p className="text-3xl font-bold text-accent">{stats.totalComments}</p>
          </div>
          <div className="bg-primary rounded-lg p-6 border border-gray-700">
            <p className="text-muted text-sm mb-2">Total Vidéos</p>
            <p className="text-3xl font-bold text-accent">{stats.totalVideos}</p>
          </div>
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="bg-primary rounded-lg p-8 border border-gray-700 max-w-2xl">
          <h2 className="text-xl font-bold mb-6">Ajouter une Nouvelle Vidéo</h2>
          <form onSubmit={handleAddVideo} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Titre</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-secondary border border-gray-600 rounded-lg text-text focus:outline-none focus:border-accent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-secondary border border-gray-600 rounded-lg text-text focus:outline-none focus:border-accent"
                rows="4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">URL de la Vidéo (HLS)</label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleInputChange}
                placeholder="http://exemple.com/video.m3u8"
                className="w-full px-4 py-2 bg-secondary border border-gray-600 rounded-lg text-text focus:outline-none focus:border-accent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Catégorie</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Ex: Film, Série, Documentaire"
                className="w-full px-4 py-2 bg-secondary border border-gray-600 rounded-lg text-text focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">URL Miniature</label>
              <input
                type="url"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleInputChange}
                placeholder="http://exemple.com/thumbnail.jpg"
                className="w-full px-4 py-2 bg-secondary border border-gray-600 rounded-lg text-text focus:outline-none focus:border-accent"
              />
            </div>

            <button type="submit" className="w-full btn btn-primary py-3 font-bold">
              Ajouter la Vidéo
            </button>
          </form>
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="space-y-4">
          {pendingComments.length === 0 ? (
            <p className="text-muted text-center py-8">Aucun commentaire en attente</p>
          ) : (
            pendingComments.map(comment => (
              <div key={comment.id} className="bg-primary rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-accent">{comment.username}</p>
                    <p className="text-sm text-muted">
                      {new Date(comment.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
                <p className="mb-4">{comment.content}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveComment(comment.id)}
                    className="btn btn-primary text-sm"
                  >
                    Approuver
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="btn btn-secondary text-sm"
                  >
                    Rejeter
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
