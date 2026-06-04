import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import VideoPlayer from '../components/VideoPlayer';

function VideoPlayerPage() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [username, setUsername] = useState('');
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [clientId] = useState(localStorage.getItem('clientId') || generateClientId());

  function generateClientId() {
    const id = Math.random().toString(36).substr(2, 9);
    localStorage.setItem('clientId', id);
    return id;
  }

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await axios.get(`/api/video/${id}`);
        setVideo(res.data);
        setLikes(res.data.likes);
        fetchComments();
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/api/comments/${id}`);
      setComments(res.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  useEffect(() => {
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join-video', id);
    });

    newSocket.on('like-update', () => {
      setLikes(prev => prev + 1);
    });

    newSocket.on('comment-update', (data) => {
      setComments(prev => [data, ...prev]);
    });

    return () => newSocket.disconnect();
  }, [id]);

  const handleLike = async () => {
    if (liked) return;

    try {
      const res = await axios.post(`/api/like/${id}`, { clientId });
      setLikes(res.data.likes);
      setLiked(true);
      if (socket) socket.emit('like', id);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleGenerateUsername = async () => {
    try {
      const res = await axios.get('/api/generate-username');
      setUsername(res.data.username);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!username || !commentText) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      await axios.post(`/api/comments/${id}`, {
        username,
        content: commentText
      });

      setCommentText('');
      fetchComments();
      if (socket) socket.emit('new-comment', { videoId: id, username, content: commentText });
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi du commentaire');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  if (!video) {
    return <div className="text-center py-12">Vidéo non trouvée</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <VideoPlayer videoUrl={video.video_url} videoId={id} />

        <div className="mt-6">
          <h1 className="text-3xl font-bold mb-4">{video.title}</h1>
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleLike}
              disabled={liked}
              className={`btn ${liked ? 'btn-secondary' : 'btn-primary'}`}
            >
              ❤️ {likes}
            </button>
            <div className="text-muted">
              👁️ {video.views} vues
            </div>
          </div>
          <p className="text-muted mb-4">{video.description}</p>
          <div className="flex gap-4 text-sm">
            <span className="badge">{video.category}</span>
            <span className="text-muted">
              {new Date(video.created_at).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>

        {/* Section Commentaires */}
        <div className="comment-section">
          <h2 className="text-xl font-bold mb-6">Commentaires</h2>

          <form onSubmit={handleCommentSubmit} className="comment-form">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Votre pseudonyme"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1"
              />
              <button
                type="button"
                onClick={handleGenerateUsername}
                className="btn btn-secondary"
              >
                Générer
              </button>
            </div>
            <textarea
              placeholder="Votre commentaire..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={500}
            />
            <button type="submit" className="btn btn-primary">
              Envoyer
            </button>
          </form>

          <div>
            {comments.length === 0 ? (
              <p className="text-muted text-center py-8">Aucun commentaire pour le moment</p>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-username">{comment.username}</span>
                    <span className="comment-time">
                      {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="comment-content">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-primary rounded-lg p-6">
          <h3 className="font-bold mb-4">À propos</h3>
          <div className="space-y-4 text-sm text-muted">
            <div>
              <p className="font-semibold text-text">Catégorie</p>
              <p>{video.category}</p>
            </div>
            <div>
              <p className="font-semibold text-text">Durée</p>
              <p>{video.duration ? `${Math.floor(video.duration / 60)}:${video.duration % 60}` : 'N/A'}</p>
            </div>
            <div>
              <p className="font-semibold text-text">Vues</p>
              <p>{video.views}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayerPage;
