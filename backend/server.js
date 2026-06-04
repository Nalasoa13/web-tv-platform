import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Configuration PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'webtv'
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Trop de requêtes, veuillez réessayer plus tard'
});

const commentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Trop de commentaires, veuillez attendre'
});

app.use('/api/', limiter);

// Authentification JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token invalide' });
  }
};

// ==================== ROUTES PUBLIQUES ====================

// Récupérer la grille TV
app.get('/api/schedule', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, description, start_time, end_time, channel, video_url, is_live 
       FROM schedule ORDER BY start_time ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les vidéos VOD
app.get('/api/vod', async (req, res) => {
  try {
    const category = req.query.category;
    let query = 'SELECT id, title, description, thumbnail, video_url, duration, category, likes, views FROM vod WHERE published = true';
    const params = [];
    
    if (category) {
      query += ' AND category = $1';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC LIMIT 50';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer une vidéo spécifique
app.get('/api/video/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, title, description, thumbnail, video_url, duration, category, likes, views, created_at 
       FROM vod WHERE id = $1 AND published = true`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vidéo non trouvée' });
    }
    
    // Incrémenter les vues
    await pool.query('UPDATE vod SET views = views + 1 WHERE id = $1', [id]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Rechercher des programmes
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Requête trop courte' });
    }
    
    const searchTerm = `%${q}%`;
    const result = await pool.query(
      `SELECT id, title, description, thumbnail, video_url, duration, category, 'vod' as type FROM vod 
       WHERE title ILIKE $1 OR description ILIKE $1 AND published = true
       UNION
       SELECT id, title, description, NULL, video_url, NULL, NULL, 'schedule' as type FROM schedule
       WHERE title ILIKE $1 OR description ILIKE $1
       LIMIT 20`,
      [searchTerm]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les commentaires d'une vidéo
app.get('/api/comments/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const result = await pool.query(
      `SELECT id, username, content, created_at, likes FROM comments 
       WHERE video_id = $1 AND approved = true
       ORDER BY created_at DESC LIMIT 50`,
      [videoId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Ajouter un commentaire (sans compte)
app.post('/api/comments/:videoId', commentLimiter, async (req, res) => {
  try {
    const { videoId } = req.params;
    const { content, username } = req.body;
    
    if (!content || content.length < 1 || content.length > 500) {
      return res.status(400).json({ error: 'Commentaire invalide' });
    }
    
    if (!username || username.length < 2 || username.length > 30) {
      return res.status(400).json({ error: 'Pseudonyme invalide' });
    }
    
    const id = uuidv4();
    await pool.query(
      `INSERT INTO comments (id, video_id, username, content, approved) 
       VALUES ($1, $2, $3, $4, $5)`,
      [id, videoId, username, content, false]
    );
    
    res.status(201).json({ id, message: 'Commentaire en attente de modération' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Aimer une vidéo
app.post('/api/like/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const clientId = req.body.clientId || uuidv4();
    
    // Vérifier si l'utilisateur a déjà aimé
    const existing = await pool.query(
      'SELECT id FROM likes WHERE video_id = $1 AND client_id = $2',
      [videoId, clientId]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Vous avez déjà aimé cette vidéo' });
    }
    
    const id = uuidv4();
    await pool.query(
      'INSERT INTO likes (id, video_id, client_id) VALUES ($1, $2, $3)',
      [id, videoId, clientId]
    );
    
    const result = await pool.query(
      'UPDATE vod SET likes = likes + 1 WHERE id = $1 RETURNING likes',
      [videoId]
    );
    
    res.json({ likes: result.rows[0].likes, clientId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Générer un pseudonyme aléatoire
app.get('/api/generate-username', (req, res) => {
  const adjectives = ['Rapide', 'Heureux', 'Brave', 'Sage', 'Drôle', 'Brillant', 'Dynamique', 'Créatif'];
  const nouns = ['Panda', 'Aigle', 'Tigre', 'Phénix', 'Dragon', 'Loup', 'Renard', 'Ours'];
  const number = Math.floor(Math.random() * 1000);
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  res.json({ username: `${adjective}${noun}${number}` });
});

// ==================== ROUTES ADMINISTRATEUR ====================

// Authentification admin
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query(
      'SELECT id, email, password FROM admin_users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer/modifier une émission
app.post('/api/admin/schedule', verifyToken, async (req, res) => {
  try {
    const { title, description, startTime, endTime, channel, videoUrl, isLive } = req.body;
    const id = uuidv4();
    
    await pool.query(
      `INSERT INTO schedule (id, title, description, start_time, end_time, channel, video_url, is_live)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, title, description, startTime, endTime, channel, videoUrl, isLive]
    );
    
    res.status(201).json({ id, message: 'Émission créée' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer/modifier une vidéo VOD
app.post('/api/admin/vod', verifyToken, async (req, res) => {
  try {
    const { title, description, thumbnail, videoUrl, duration, category } = req.body;
    const id = uuidv4();
    
    await pool.query(
      `INSERT INTO vod (id, title, description, thumbnail, video_url, duration, category, published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, title, description, thumbnail, videoUrl, duration, category, false]
    );
    
    res.status(201).json({ id, message: 'Vidéo créée (en attente de publication)' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Publier une vidéo
app.put('/api/admin/vod/:id/publish', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE vod SET published = true WHERE id = $1', [id]);
    res.json({ message: 'Vidéo publiée' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Modérer les commentaires
app.get('/api/admin/comments/pending', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, video_id, username, content, created_at FROM comments 
       WHERE approved = false ORDER BY created_at ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Approuver un commentaire
app.put('/api/admin/comments/:id/approve', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE comments SET approved = true WHERE id = $1', [id]);
    res.json({ message: 'Commentaire approuvé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Rejeter un commentaire
app.delete('/api/admin/comments/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM comments WHERE id = $1', [id]);
    res.json({ message: 'Commentaire supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Statistiques
app.get('/api/admin/stats', verifyToken, async (req, res) => {
  try {
    const views = await pool.query('SELECT SUM(views) as total_views FROM vod');
    const likes = await pool.query('SELECT SUM(likes) as total_likes FROM vod');
    const comments = await pool.query('SELECT COUNT(*) as total_comments FROM comments WHERE approved = true');
    const videos = await pool.query('SELECT COUNT(*) as total_videos FROM vod WHERE published = true');
    
    res.json({
      totalViews: views.rows[0].total_views || 0,
      totalLikes: likes.rows[0].total_likes || 0,
      totalComments: comments.rows[0].total_comments || 0,
      totalVideos: videos.rows[0].total_videos || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ==================== SOCKET.IO (Temps réel) ====================

io.on('connection', (socket) => {
  console.log('Utilisateur connecté:', socket.id);
  
  // Rejoindre une salle de vidéo
  socket.on('join-video', (videoId) => {
    socket.join(`video-${videoId}`);
    socket.emit('connected', { message: 'Connecté à la vidéo' });
  });
  
  // Envoyer un like en temps réel
  socket.on('like', (videoId) => {
    io.to(`video-${videoId}`).emit('like-update', { videoId });
  });
  
  // Envoyer un commentaire en temps réel
  socket.on('new-comment', (data) => {
    io.to(`video-${data.videoId}`).emit('comment-update', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Utilisateur déconnecté:', socket.id);
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
